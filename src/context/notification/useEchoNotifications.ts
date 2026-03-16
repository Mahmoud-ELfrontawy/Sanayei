

import { useEffect, type MutableRefObject } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getEcho } from "../../utils/echo";
import type { NewNotificationPayload } from "./notification.types";
import { normalizeRole } from "./notification.utils";

interface UseEchoNotificationsProps {
    user:               { id: number } | null;
    userType:           string | null;
    addNotificationRef: MutableRefObject<((n: NewNotificationPayload) => void) | null>;
    refreshUser:        () => void;
}

export function useEchoNotifications({
    user,
    userType,
    addNotificationRef,
    refreshUser,
}: UseEchoNotificationsProps) {
    const qc = useQueryClient();

    useEffect(() => {
        // Admins have their own AdminNotificationContext
        if (!user || !userType || userType === "admin") return;

        const echo = getEcho() as any;
        if (!echo) return;

        const role = normalizeRole(userType);

        const prefixMap: Record<string, string> = {
            user:      "user",
            craftsman: "worker", // Matches Broadcast::channel('notifications.worker.{id}')
            company:   "company",
        };
        const primaryChannel = `notifications.${prefixMap[role] ?? "user"}.${user.id}`;
        
        console.log(`📡 [Echo] Attempting to subscribe to: ${primaryChannel} for role: ${role}`);
        
        // 🔍 Subscribe to the primary channel authorized by backend
        const c = echo.private(primaryChannel);

        c.on('subscription_error', (status: any) => {
            console.error(`❌ [Echo] Subscription error for ${primaryChannel}:`, status);
        });

        c.on('subscribed', () => {
            console.log(`✅ [Echo] Successfully subscribed to ${primaryChannel}`);
        });

        // 🔬 Add global monitor to log any broadcasted event to the browser console for debugging
        if (echo.connector?.pusher?.bind_global) {
             const _window = window as any;
             if (!_window._hasPusherGlobalBind) {
                 echo.connector.pusher.bind_global((eventName: string, data: any) => {
                     // don't spam pusher internal events
                     if (!eventName.startsWith('pusher:')) {
                         console.log(`🚦 [Echo Global Monitor] Event: ${eventName}`, data);
                     }
                 });
                 _window._hasPusherGlobalBind = true;
             }
        }
        
        const genericEventMap: Record<string, string> = {
            user:      ".UserNotification",
            craftsman: ".CraftsmanNotification",
            company:   ".CompanyNotification",
        };

        // Extra fallback for craftsmen if the event is named WorkerNotification
        if (role === "craftsman") {
            c.listen(".WorkerNotification", (e: any) => {
                handleGenericNotification(e, role, user.id);
            });
        }

        const handleGenericNotification = (e: any, currentRole: string, userId: number) => {
            const isAdminMsg = e.type === "admin_message";
            const isReview   = e.type === "product_review" || e.type === "new_review";

            if (isReview) {
                addNotificationRef.current?.({
                    title:         "تقييم جديد للمنتج ⭐",
                    message:       e.message || `قام ${e.user_name || 'عميل'} بتقييم منتجك بـ ${e.rating || 5} نجوم`,
                    type:          "product_review",
                    orderId:       e.order_id || 0,
                    recipientId:   userId,
                    recipientType: currentRole as any,
                    variant:       "success",
                    eventId:       `echo_gen_rev_${e.id || Date.now()}`,
                });
                return;
            }

            addNotificationRef.current?.({
                title:         isAdminMsg ? "📢 رسالة من الإدارة" : "تنبيه جديد",
                message:       e.message || e.notification_text || "لديك إشعار جديد في حسابك",
                type:          isAdminMsg ? "admin_message" : (
                                   currentRole === "craftsman" ? "order_request" :
                                   currentRole === "company"   ? "store_order"   : "order_status"
                               ),
                orderId:       e.request_id || 0,
                recipientId:   userId,
                recipientType: currentRole as any,
                variant:       isAdminMsg ? "info" : "success",
                eventId:       `echo_${currentRole}_${e.type || "notif"}_${Date.now()}`,
            });
        };

        if (genericEventMap[role]) {
            c.listen(genericEventMap[role], (e: any) => handleGenericNotification(e, role, user.id));
        }

        // ── 2b. Standard Laravel Notifications & Admin broadcasts ────────
        // This catches notifications sent via Laravel's Notification::send() over the 'broadcast' channel
        c.notification((notification: any) => {
            console.log("🔔 [Echo Notification Received]", notification);
            const msgBody = notification.message || notification.body || notification.notification_text || notification.data?.message || "لديك تنبيه جديد";
            addNotificationRef.current?.({
                title: notification.title || (notification.type === "admin_message" ? "📢 رسالة من الإدارة" : "إشعار جديد"),
                message: msgBody,
                type: notification.type || "admin_message",
                orderId: notification.request_id || notification.id || 0,
                recipientId: user.id,
                recipientType: role,
                variant: "info",
                eventId: `echo_notification_${notification.id || Date.now()}`,
            });
        });

        // Some custom backends send explicit Custom broadcasting events
        c.listen(".AdminMessage", (e: any) => {
             console.log("📢 [Echo Admin Message]", e);
             addNotificationRef.current?.({
                 title: e.title || "📢 رسالة من الإدارة",
                 message: e.body || e.message || "رسالة إدارية جديدة",
                 type: "admin_message",
                 orderId: e.id || 0,
                 recipientId: user.id,
                 recipientType: role,
                 variant: "info",
                 eventId: `echo_admin_msg_${e.id || Date.now()}`
             });
        });

        // ── 3. Chat messages ───────────────────────
        const handleNewMessage = (e: any) => {
            console.log("📨 [Echo Chat Message]", e);
            
            // Invalidate chat queries to update UI in real-time
            qc.invalidateQueries({ queryKey: ["user-messages"] });
            qc.invalidateQueries({ queryKey: ["user-chats"] });
            qc.invalidateQueries({ queryKey: ["worker-messages"] });
            qc.invalidateQueries({ queryKey: ["worker-chats"] });

            addNotificationRef.current?.({
                title:         "رسالة جديدة",
                message:       e.message || e.notification_text || "لديك رسالة جديدة",
                type:          "chat",
                orderId:       e.message_id || e.id || 0,
                recipientId:   user.id,
                recipientType: role,
                eventId:       `chat_${e.message_id || e.id || Date.now()}`,
            });
        };
        
        const chatEvents = [
            ".new-message", 
            "NewMessage", 
            ".NewMessage", 
            "MessageSent", 
            ".MessageSent", 
            "message.sent", 
            ".message.sent"
        ];
        chatEvents.forEach((evt) => {
            c.listen(evt, handleNewMessage);
        });

        // ── 4. Account status changes (trigger refreshUser) ──
        [
            ".company.approved", ".company.rejected", ".company.status.updated",
            ".user.approved",    ".user.rejected",    ".user.status.updated",
            ".worker.approved",  ".worker.rejected",  ".worker.status.updated",
            "CompanyApproved",   "CompanyStatusUpdated",
            "UserApproved",      "UserStatusUpdated",
            "WorkerApproved",    "WorkerStatusUpdated",
            ".UserStatusUpdated",
        ].forEach((evt) => c.listen(evt, () => refreshUser()));

        // ── 5. User: specific order status ─────────
        if (role === "user") {
            c.listen(".UserRequestStatusUpdated", (e: any) => {
                addNotificationRef.current?.({
                    title:         "تحديث حالة طلبك ✅",
                    message:       e.notification_text || `تم تحديث طلبك إلى ${e.status_arabic} من قبل ${e.company_name}`,
                    type:          "order_status",
                    orderId:       e.request_id || 0,
                    recipientId:   user.id,
                    recipientType: "user",
                    variant:       e.status_arabic?.includes("ملغي") ? "error" : "success",
                    eventId:       `echo_us_st_${e.request_id}_${e.status_arabic}`,
                });
            });
        }

        // ── 6. Craftsman: specific order status ────
        if (role === "craftsman") {
            // 🚀 Real-time: New service request arrives instantly (no polling delay)
            const handleNewRequest = (e: any) => {
                const data = e.data || e;
                addNotificationRef.current?.({
                    title:         "طلب خدمة جديد 🛠️",
                    message:       data.message || `لديك طلب خدمة جديد من ${data.user_name || "عميل"}`,
                    type:          "order_request",
                    orderId:       data.request_id || data.id || 0,
                    recipientId:   user.id,
                    recipientType: "craftsman",
                    variant:       "success",
                    eventId:       `echo_cm_new_${data.request_id || data.id || Date.now()}`,
                });
            };
            c.listen(".CraftsmanNewRequest", handleNewRequest);

            c.listen(".CraftsmanRequestStatusUpdated", (e: any) => {
                addNotificationRef.current?.({
                    title:         "تحديث طلبك 🛠️",
                    message:       e.notification_text || `تم تحديث طلبك إلى ${e.status_arabic} من قبل ${e.company_name}`,
                    type:          "order_status",
                    orderId:       e.request_id || 0,
                    recipientId:   user.id,
                    recipientType: "craftsman",
                    variant:       e.status_arabic?.includes("ملغي") ? "error" : "success",
                    eventId:       `echo_cm_st_${e.request_id}_${e.status_arabic}`,
                });
            });

            // 🌟 New: Receive notifications when a user/company reviews the craftsman
            c.listen(".ServiceReviewReceived", (e: any) => {
                const data = e.data || e;
                console.log("⭐ [Echo] .ServiceReviewReceived received:", data);
                addNotificationRef.current?.({
                    title:         "تقييم جديد للخدمة ⭐",
                    message:       data.message || `قام ${data.user_name || 'عميل'} بتقييم خدمتك بـ ${data.rating || 5} نجوم - "${data.comment || 'بدون تعليق'}"`,
                    type:          "product_review", // Uses the review UI style
                    orderId:       data.request_id || 0,
                    recipientId:   user.id,
                    recipientType: "craftsman",
                    variant:       "success",
                    eventId:       `echo_service_rev_${data.request_id || Date.now()}`,
                });
            });
        }

        // ── 7. Company: specific order events ──────
        if (role === "company") {
            c.listen(".CompanyNewRequest", (e: any) => {
                const data = e.data || e;
                addNotificationRef.current?.({
                    title:         "طلب جديد للمنتجات 🛒",
                    message:       data.message || `قام ${data.user_name} بطلب منتجات من شركتكم`,
                    type:          "store_order",
                    orderId:       data.request_id || 0,
                    recipientId:   user.id,
                    recipientType: "company",
                    eventId:       `echo_comp_new_${data.request_id}`,
                });
            });

            c.listen(".CompanyStatusUpdated", (e: any) => {
                const data = e.data || e;
                addNotificationRef.current?.({
                    title:         "تحديث حالة الطلب 📈",
                    message:       data.notification_text || data.message || `تم تحديث حالة الطلب #${data.request_id} إلى ${data.status_arabic}`,
                    type:          "store_order",
                    orderId:       data.request_id || 0,
                    recipientId:   user.id,
                    recipientType: "company",
                    eventId:       `echo_comp_st_${data.request_id}_${data.status_arabic}`,
                });
            });

            // 🌟 Product Review — specific event from ProductReviewed class
            c.listen(".ProductReviewed", (e: any) => {
                // Backend wraps data in e.data when using public $data property
                const data = e.data ?? e;
                console.log("⭐ [Echo] .ProductReviewed received:", data);
                addNotificationRef.current?.({
                    title:         "تقييم جديد للمنتج ⭐",
                    message:       data.message || `قام ${data.user_name || 'عميل'} بتقييم ${data.product_name || 'منتجك'} بـ ${data.rating || 5} نجوم`,
                    type:          "product_review",
                    orderId:       data.order_id || 0,
                    recipientId:   user.id,
                    recipientType: "company",
                    variant:       "success",
                    eventId:       `echo_prod_rev_${data.id || Date.now()}`,
                });
            });
        }

        // ── Cleanup ────────────────────────────────
        return () => {
            echo.leave(primaryChannel);
        };

    // addNotificationRef is intentionally accessed via ref — not a dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, userType, refreshUser]);
}

