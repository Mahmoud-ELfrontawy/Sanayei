import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { getMyServiceRequests, getIncomingServiceRequests, updateServiceRequestStatus } from "../Api/serviceRequest/serviceRequests.api";
import { getEcho } from "../utils/echo";
import NotificationToast from "../components/ui/NotificationToast";
import "../assets/styles/notifications.css";

const NOTIF_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "order_request" | "order_status" | "chat" | "store_order";
    status: "unread" | "read";
    timestamp: string;
    orderId: number;
    recipientId: number;
    recipientType: "user" | "craftsman" | "company";
    variant?: "info" | "success" | "warning" | "error";
}

interface NotificationContextType {
    notifications: Notification[];
    userNotifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, "id" | "status" | "timestamp">) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    markTypeAsRead: (type: "chat" | "order_status" | "order_request") => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, userType } = useAuth();

    const [allNotifications, setAllNotifications] = useState<Notification[]>(() => {
        const saved = localStorage.getItem("app_notifications");
        return saved ? JSON.parse(saved) : [];
    });

    const prevRequestsRef = useRef<any[]>([]);
    const isFirstFetch = useRef(true);
    const addNotificationRef = useRef<any>(null);
    const unreadChatCountRef = useRef(0);

    /* ================= LocalStorage Sync ================= */

    useEffect(() => {
        const syncNotifications = (e: StorageEvent) => {
            if (e.key === "app_notifications" && e.newValue) {
                setAllNotifications(JSON.parse(e.newValue));
            }
        };

        window.addEventListener("storage", syncNotifications);
        return () => window.removeEventListener("storage", syncNotifications);
    }, []);

    useEffect(() => {
        localStorage.setItem("app_notifications", JSON.stringify(allNotifications));
    }, [allNotifications]);

    /* ================= Helpers ================= */

    const playNotificationSound = React.useCallback(() => {
        try {
            const audio = new Audio(NOTIF_SOUND_URL);
            audio.volume = 0.5;
            audio.play();
        } catch (err) {
            console.warn("🔇 Notification sound failed to play:", err);
        }
    }, []);

    const fetchServiceStatus = React.useCallback(async () => {
        if (!user || !userType) return;

        try {
            let currentRequests: any[] = [];

            if (userType === "craftsman") {
                const response = await getIncomingServiceRequests();
                currentRequests = response?.data || response || [];
            } else {
                const response = await getMyServiceRequests();
                currentRequests = response?.data || response || [];
            }

            if (!Array.isArray(currentRequests)) return;

            if (isFirstFetch.current) {
                prevRequestsRef.current = currentRequests;
                isFirstFetch.current = false;
                return;
            }

            currentRequests.forEach(current => {
                const prev = prevRequestsRef.current.find(p => String(p.id) === String(current.id));

                if (!prev && userType === "craftsman") {
                    addNotificationRef.current?.({
                        title: "طلب خدمة جديد",
                        message: `لديك طلب خدمة جديد من ${current.user?.name || "عميل"}`,
                        type: "order_request",
                        orderId: current.id,
                        recipientId: user.id,
                        recipientType: "craftsman",
                    });
                } else if (prev && prev.status !== current.status) {
                    // ONLY Users (Clients) should get status update notifications
                    if (userType !== "craftsman") {
                        const statusMap: Record<string, string> = {
                            accepted: "مقبول",
                            rejected: "مرفوض",
                            completed: "مكتمل",
                            pending: "قيد الانتظار",
                        };

                        let customMessage = `تم تحديث حالة طلب الخدمة الخاص بك إلى ${statusMap[current.status] || current.status} ✅`;

                        if (current.status === "accepted") {
                            customMessage = `تم قبول طلبك للخدمة بنجاح ✅`;
                        } else if (current.status === "rejected") {
                            customMessage = `نعتذر، تم رفض طلب الخدمة الخاص بك ❌`;
                        } else if (current.status === "completed") {
                            customMessage = `تم إتمام الخدمة بنجاح ✨، يمكنك الآن تقييم الصنايعي.`;
                        }

                        const variant = current.status === "rejected" ? "error" : "success";

                        addNotificationRef.current?.({
                            title: "تحديث طلب الخدمة",
                            message: customMessage,
                            type: "order_status",
                            orderId: current.id,
                            recipientId: user.id,
                            recipientType: userType as any,
                            variant,
                        });
                    }
                }
            });

            prevRequestsRef.current = currentRequests;
        } catch {
            // silent fail
        }
    }, [user, userType]);

    const fetchCompanyOrders = React.useCallback(async () => {
        if (!user || userType !== "company") return;

        try {
            const { getStoreOrders } = await import("../Api/auth/Company/storeManagement.api");
            const currentOrders = await getStoreOrders();

            if (!Array.isArray(currentOrders)) return;

            // For companies, we check for 'pending' orders that might be new
            if (isFirstFetch.current) {
                // we reuse the same ref logic if needed, but for now just update ref
                return;
            }

            // Simple logic: if count increased, notify (or check status changes)
            // For now, let's keep it simple as real-time is the main goal
        } catch (err) {
            console.warn("⚠️ [Polling] Failed to fetch company orders:", err);
        }
    }, [user, userType]);

    const handleAction = React.useCallback(async (orderId: number, status: "accepted" | "rejected") => {
        try {
            const actionText = status === "accepted" ? "قبول" : "رفض";
            console.log(`🚀 Professional Notif: ${actionText} request #${orderId}`);

            await updateServiceRequestStatus(orderId, status);
            toast.success(`تم ${actionText} الطلب بنجاح`);

            // Refresh local data
            fetchServiceStatus();
        } catch (err: any) {
            toast.error(err.message || "حدث خطأ أثناء تنفيذ العملية");
        }
    }, [fetchServiceStatus]);

    /* ================= Add Notification ================= */

    const addNotification = React.useCallback((notif: Omit<Notification, "id" | "status" | "timestamp">) => {
        // GUARD: recipientType must match current userType.
        // Special: 'company' maps to itself (not 'user')
        const normalise = (t: string) => t; // keep 'company' as-is
        const currentUserType = normalise(userType as string);
        const targetRecipientType = normalise(notif.recipientType as string);

        if (currentUserType !== targetRecipientType) {
            console.log(`🛡️ Guard: Blocked notification for ${notif.recipientType} (current user role: ${userType})`);
            return;
        }

        console.log(`📢 [NOTIF] Adding to state: ${notif.type} | ${notif.title}`);

        const newNotif: Notification = {
            ...notif,
            id: Math.random().toString(36).substring(2, 9),
            status: "unread",
            timestamp: new Date().toISOString(),
        };

        setAllNotifications(prev => [newNotif, ...prev]);
        playNotificationSound();

        // Show toast
        if (notif.type === "chat") {
            unreadChatCountRef.current += 1;
            const count = unreadChatCountRef.current;
            const toastId = "chat-notification-toast";

            if (count > 1) {
                toast.info(`لديك ${count} رسائل جديدة`, {
                    toastId,
                    position: "top-right",
                    autoClose: 7000,
                });
            } else {
                toast.info(`${notif.title}: ${notif.message}`, {
                    toastId,
                    position: "top-right",
                    autoClose: 7000,
                });
            }
        } else if (notif.type === "order_request" && userType === "craftsman") {
            toast(
                ({ closeToast }) => (
                    <NotificationToast
                        title={notif.title}
                        message={notif.message}
                        type={notif.type as any}
                        onAccept={() => handleAction(notif.orderId, "accepted")}
                        onReject={() => handleAction(notif.orderId, "rejected")}
                        closeToast={closeToast}
                    />
                ),
                {
                    position: "top-right",
                    autoClose: 10000,
                }
            );
        } else if (notif.type === "store_order") {
            // Rich toast for company when a new store order arrives
            toast.info(`🛒 ${notif.title}: ${notif.message}`, {
                position: "top-right",
                autoClose: 12000,
            });
        } else {
            const variant = notif.variant || "info";
            const toastMethod = (toast as any)[variant] || toast.info;
            toastMethod(`${notif.title}: ${notif.message}`, {
                position: "top-right",
                autoClose: 7000,
            });
        }
    }, [playNotificationSound, handleAction, userType]);

    // Keep the ref in sync
    useEffect(() => {
        addNotificationRef.current = addNotification;
    }, [addNotification]);

    /* ================= Polling Fallback ================= */

    useEffect(() => {
        if (!user) return;

        fetchServiceStatus();
        if (userType === "company") fetchCompanyOrders();

        // Robust polling interval
        const intervalId = setInterval(() => {
            fetchServiceStatus();
            if (userType === "company") fetchCompanyOrders();
        }, 30000);

        return () => clearInterval(intervalId);
    }, [user, userType, fetchServiceStatus, fetchCompanyOrders]);

    /* ================= Real-Time via Laravel Echo ================= */

    useEffect(() => {
        if (!user || !userType) return;

        const echo = getEcho() as any;
        if (!echo) return;

        const notifType = userType === "craftsman" ? "worker" : (userType === "company" ? "user" : "user");
        const primaryChannelName = `notifications.${notifType}.${user.id}`;

        console.log(`🔌 [Echo] PRIMARY: ${primaryChannelName} | Role: ${userType}`);
        const primaryChannel = echo.private(primaryChannelName);

        let fallbackChannel: any = null;
        let clientFallbackChannel: any = null;
        let companyChannel: any = null;
        let companyUserChannel: any = null;

        if (userType === "craftsman") {
            fallbackChannel = echo.private(`notifications.craftsman.${user.id}`);
        } else if (userType === "user") {
            clientFallbackChannel = echo.private(`notifications.client.${user.id}`);
        } else if (userType === "company") {
            companyChannel = echo.private(`notifications.company.${user.id}`);
            // Often companies use their base user_id for notifications too
            companyUserChannel = echo.private(`notifications.user.${user.id}`);
            console.log(`🏢 [Echo] COMPANY specific: notifications.company.${user.id}`);
        }

        const handleNewMessage = (event: any) => {
            console.log('📨 [RealTime] .new-message', event);
            addNotification({
                title: "رسالة جديدة",
                message: event.notification_text || (event.sender_name ? `رسالة جديدة من ${event.sender_name}` : "لديك رسالة جديدة"),
                type: "chat",
                orderId: event.message_id || event.id || 0,
                recipientId: user.id,
                recipientType: userType as any,
            });
        };

        const handleRequestCreated = (event: any) => {
            console.log('👷 Service Request Created:', event);
            addNotification({
                title: "طلب خدمة جديد",
                message: event.notification_text || `طلب خدمة جديد من ${event.user_name || "عميل"}`,
                type: "order_request",
                orderId: event.request_id || event.id,
                recipientId: user.id,
                recipientType: "craftsman",
            });
        };

        const handleRequestUpdated = (event: any) => {
            if (userType === "craftsman") return;
            const statusMap: Record<string, string> = {
                accepted: "مقبول", rejected: "مرفوض", completed: "مكتمل", pending: "قيد الانتظار",
            };
            const status = event.new_status || event.status;
            const arabicStatus = statusMap[status] || status;
            let msg = `تم تحديث حالة طلبك إلى ${arabicStatus} ✅`;
            if (status === "accepted") msg = "تم قبول طلبك للخدمة بنجاح ✅";
            else if (status === "rejected") msg = "نعتذر، تم رفض طلب الخدمة الخاص بك ❌";
            else if (status === "completed") msg = "تم إتمام الخدمة بنجاح ✨";
            addNotification({
                title: "تحديث طلب الخدمة",
                message: event.notification_text || msg,
                type: "order_status",
                orderId: event.request_id || event.id,
                recipientId: user.id,
                recipientType: userType as any,
                variant: status === "rejected" ? "error" : "success",
            });
        };

        const handleNewReview = (event: any) => {
            addNotification({
                title: "تقييم جديد",
                message: event.notification_text || `تقييم جديد: ${event.rating} نجوم`,
                type: "order_status",
                orderId: event.review_id || event.id,
                recipientId: user.id,
                recipientType: "craftsman",
            });
        };

        const handleNewStoreOrder = (event: any) => {
            console.log('🛒 [Echo] New Store Order Arrival:', event);
            addNotification({
                title: "طلب منتج جديد",
                message: event.notification_text || `طلب جديد من ${event.customer_name || "عميل"} – الإجمالي: ${event.total_amount ? Number(event.total_amount).toLocaleString() + ' ج.م' : 'غير محدد'}`,
                type: "store_order",
                orderId: event.order_id || event.id || 0,
                recipientId: user.id,
                recipientType: "company",
                variant: "success",
            });
        };

        const handleStoreOrderStatusUpdated = (event: any) => {
            console.log('📦 [Echo] Store Order Status Change:', event);
            const statusMap: Record<string, string> = {
                pending: "قيد الانتظار",
                processing: "قيد التنفيذ",
                shipped: "تم الشحن",
                delivered: "تم التوصيل",
                cancelled: "تم الإلغاء",
            };
            const status = event.status || event.new_status;
            const arabicStatus = statusMap[status] || status;

            addNotification({
                title: "تحديث حالة الطلب",
                message: event.notification_text || `تم تحديث حالة طلبك رقم #${event.order_id || event.id} إلى ${arabicStatus} ✨`,
                type: "order_status",
                orderId: event.order_id || event.id || 0,
                recipientId: user.id,
                recipientType: userType as any,
                variant: status === "cancelled" ? "error" : (status === "delivered" ? "success" : "info"),
            });
        };

        // ── Bind listeners ──
        const activeChannels = [primaryChannel, fallbackChannel, clientFallbackChannel, companyChannel, companyUserChannel].filter(Boolean);

        activeChannels.forEach(c => {
            console.log(`📡 [Echo] Binding listeners to channel: ${c.name || 'private channel'}`);
            ['.new-message', 'NewMessage', '.NewMessage', 'App\\Events\\NewMessage', '.new_message', 'new_message'].forEach(evt => c.listen(evt, handleNewMessage));

            // Any user (Client or Craftsman) can be a buyer
            ['.store-order.updated', 'StoreOrderUpdated', '.StoreOrderUpdated'].forEach(evt => c.listen(evt, handleStoreOrderStatusUpdated));

            if (userType === "craftsman") {
                ['.service-request.created', 'ServiceRequestCreated', '.ServiceRequestCreated', '.new-service-request'].forEach(evt => c.listen(evt, handleRequestCreated));
                ['.new-review', 'NewReview', 'App\\Events\\NewReview'].forEach(evt => c.listen(evt, handleNewReview));
            } else if (userType === "user") {
                ['.service-request.updated', 'ServiceRequestUpdated', '.ServiceRequestUpdated', '.service-status-updated', '.request-status-updated'].forEach(evt => c.listen(evt, handleRequestUpdated));
                c.listen(".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated", (e: any) => {
                    if (e.type?.includes('ServiceRequest') || e.message?.includes('طلب')) {
                        addNotification({
                            title: e.title || "تنبيه جديد",
                            message: e.message || e.notification_text || "تم تحديث حالة طلبك",
                            type: "order_status",
                            orderId: e.request_id || e.id || 0,
                            recipientId: user.id,
                            recipientType: userType as any,
                        });
                    } else if (e.type?.includes('StoreOrder') || e.message?.includes('المنتج') || e.message?.includes('حالة')) {
                        handleStoreOrderStatusUpdated(e);
                    }
                });
            } else if (userType === "company") {
                // Listen for store orders on ALL company-related channels
                [
                    '.store-order.created',
                    'StoreOrderCreated',
                    '.StoreOrderCreated',
                    '.new-store-order',
                    'NewStoreOrder',
                    'store_order_created',
                    '.store_order_created',
                    'StoreOrderNotification'
                ].forEach(evt => c.listen(evt, handleNewStoreOrder));
            }
        });

        // Company-specific channel exhaustive logging
        if (companyChannel) {
            console.log(`🔍 [Echo] Exhaustive logging enabled for Company Channel...`);

            // Re-listen for core events just in case
            ['.new-message', 'NewMessage', '.NewMessage'].forEach(evt => companyChannel.listen(evt, handleNewMessage));

            [
                '.store-order.created',
                'StoreOrderCreated',
                '.StoreOrderCreated',
                '.new-store-order',
                'NewStoreOrder',
            ].forEach(evt => companyChannel.listen(evt, handleNewStoreOrder));

            // Catch-all for basic broadcasting
            companyChannel.listen(".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated", (e: any) => {
                console.log('🔔 [Echo] Received Generic Broadcast:', e);
                if (e.type?.includes('Order') || e.message?.includes('طلب') || e.type?.includes('Store')) {
                    handleNewStoreOrder(e);
                }
            });
        }

        return () => {
            console.log(`🔌 Leaving channels for user: ${user.id}`);
            activeChannels.forEach(c => {
                ['.new-message', 'NewMessage', '.NewMessage', 'App\\Events\\NewMessage'].forEach(evt => c.stopListening(evt));
                if (userType === "craftsman") {
                    ['.service-request.created', 'ServiceRequestCreated', '.ServiceRequestCreated', '.new-service-request'].forEach(evt => c.stopListening(evt));
                    ['.new-review', 'NewReview', 'App\\Events\\NewReview'].forEach(evt => c.stopListening(evt));
                } else if (userType === "user") {
                    ['.service-request.updated', 'ServiceRequestUpdated', '.ServiceRequestUpdated', '.service-status-updated', '.request-status-updated'].forEach(evt => c.stopListening(evt));
                    c.stopListening(".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated");
                }
            });
            if (companyChannel) {
                ['.store-order.created', 'StoreOrderCreated', '.StoreOrderCreated', '.new-store-order', 'NewStoreOrder'].forEach(evt => companyChannel.stopListening(evt));
                companyChannel.stopListening(".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated");
                echo.leave(`notifications.company.${user.id}`);
            }
            echo.leave(primaryChannelName);
            if (fallbackChannel) echo.leave(`notifications.craftsman.${user.id}`);
            if (clientFallbackChannel) echo.leave(`notifications.client.${user.id}`);
        };
    }, [user?.id, userType, addNotification]);

    /* ================= Derived Data ================= */

    const userNotifications = React.useMemo(() => {
        if (!user || !userType) return [];
        return allNotifications.filter(
            n => String(n.recipientId) === String(user.id) && n.recipientType === userType
        );
    }, [allNotifications, user, userType]);

    // Track unread messages for toast notification


    /* ================= Effects ================= */
    // Chat toasts are now handled in addNotification for better reliability


    const unreadCount = userNotifications.filter(n => n.status === "unread").length;

    const markAsRead = React.useCallback((id: string) => {
        setAllNotifications(prev => prev.map(n => (n.id === id ? { ...n, status: "read" } : n)));
    }, []);

    const markAllAsRead = React.useCallback(() => {
        if (!user || !userType) return;

        setAllNotifications(prev =>
            prev.map(n =>
                String(n.recipientId) === String(user.id) &&
                    n.recipientType === userType &&
                    n.status === "unread"
                    ? { ...n, status: "read" }
                    : n
            )
        );
    }, [user, userType]);

    const markTypeAsRead = React.useCallback((type: "chat" | "order_status" | "order_request") => {
        if (!user || !userType) return;

        if (type === "chat") {
            unreadChatCountRef.current = 0;
            toast.dismiss("chat-notification-toast");
        }

        setAllNotifications(prev =>
            prev.map(n =>
                n.type === type &&
                    String(n.recipientId) === String(user.id) &&
                    n.recipientType === userType &&
                    n.status === "unread"
                    ? { ...n, status: "read" }
                    : n
            )
        );
    }, [user, userType]);

    const contextValue = React.useMemo(
        () => ({
            notifications: allNotifications,
            userNotifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            markTypeAsRead
        }),
        [allNotifications, userNotifications, unreadCount, addNotification, markAsRead, markAllAsRead, markTypeAsRead]
    );

    return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
    return context;
};