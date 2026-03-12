

import { useEffect, type MutableRefObject } from "react";
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
    useEffect(() => {
        // Admins have their own AdminNotificationContext
        if (!user || !userType || userType === "admin") return;

        const echo = getEcho() as any;
        if (!echo) return;

        const role = normalizeRole(userType);

        const prefixMap: Record<string, string> = {
            user:      "user",
            craftsman: "worker",
            company:   "company",
        };
        const primaryChannel = `notifications.${prefixMap[role] ?? "user"}.${user.id}`;
        
        // 🔍 DEBUG: Log channel info so we can diagnose company ID mismatch
        if (role === "company") {
            console.log("[Echo Debug] Company channel:", primaryChannel, "| user.id:", user.id);
        }
        
        const c = echo.private(primaryChannel);

        
        const genericEventMap: Record<string, string> = {
            user:      ".UserNotification",
            craftsman: ".CraftsmanNotification",
            company:   ".CompanyNotification",
        };

        if (genericEventMap[role]) {
            c.listen(genericEventMap[role], (e: any) => {
                const isAdminMsg = e.type === "admin_message";

                addNotificationRef.current?.({
                    title:         isAdminMsg
                                       ? "📢 رسالة من الإدارة"
                                       : "تنبيه جديد",
                    message:       e.message || e.notification_text || "لديك إشعار جديد في حسابك",
                    type:          isAdminMsg ? "admin_message" : (
                                       role === "craftsman" ? "order_request" :
                                       role === "company"   ? "store_order"   : "order_status"
                                   ),
                    orderId:       e.request_id || 0,
                    recipientId:   user.id,
                    recipientType: role,
                    variant:       isAdminMsg ? "info" : "success",
                    eventId:       `echo_${role}_${e.type || "notif"}_${Date.now()}`,
                });
            });
        }

        // ── 3. Chat messages ───────────────────────
        const handleNewMessage = (e: any) => {
            addNotificationRef.current?.({
                title:         "رسالة جديدة",
                message:       e.notification_text || "لديك رسالة جديدة",
                type:          "chat",
                orderId:       e.message_id || 0,
                recipientId:   user.id,
                recipientType: role,
                eventId:       `chat_${e.message_id || Date.now()}`,
            });
        };
        [".new-message", "NewMessage", ".NewMessage"].forEach((evt) =>
            c.listen(evt, handleNewMessage)
        );

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

            // 🌟 New: Notification when a product is reviewed
            c.listen(".ProductReviewed", (e: any) => {
                const data = e.data || e;
                addNotificationRef.current?.({
                    title:         "تقييم جديد للمنتج ⭐",
                    message:       data.message || `قام ${data.user_name} بتقييم ${data.product_name} بـ ${data.rating} نجوم`,
                    type:          "product_review",
                    orderId:       data.order_id || 0,
                    recipientId:   user.id,
                    recipientType: "company",
                    variant:       data.rating >= 4 ? "success" : "info",
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

