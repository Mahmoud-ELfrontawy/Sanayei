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
    type: "order_request" | "order_status" | "chat";
    status: "unread" | "read";
    timestamp: string;
    orderId: number;
    recipientId: number;
    recipientType: "user" | "craftsman";
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
        // STRICT GUARD: Match recipientType with current userType
        // Backends might broadcast to a channel but the payload might be generic.
        // We filter here to be 100% sure.
        const currentUserType = (userType as string) === "company" ? "user" : userType;
        const targetRecipientType = (notif.recipientType as string) === "company" ? "user" : notif.recipientType;

        if (currentUserType !== targetRecipientType) {
            console.log(`🛡️ Guard: Blocked notification for ${notif.recipientType} as current user is a ${userType}`);
            return;
        }

        console.log(`📢 Adding Notification [${notif.type}]: ${notif.title} - ${notif.message}`);

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
        } else {
            // Standard toasts for other notifications (e.g. order_status)
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
        // Reduced polling interval to 30 seconds as a robust fallback
        const intervalId = setInterval(fetchServiceStatus, 30000);

        return () => clearInterval(intervalId);
    }, [user, fetchServiceStatus]);

    /* ================= Real-Time via Laravel Echo ================= */

    useEffect(() => {
        if (!user || !userType) return;

        const echo = getEcho() as any;
        if (!echo) return;

        const notifType = userType === "craftsman" ? "worker" : "user";
        const primaryChannelName = `notifications.${notifType}.${user.id}`;

        console.log(`🔌 Subscribing to primary channel: ${primaryChannelName}`);
        const primaryChannel = echo.private(primaryChannelName);

        // EXTRA: Fallback channels
        let fallbackChannel: any = null;
        let clientFallbackChannel: any = null;

        if (userType === "craftsman") {
            const fallbackChannelName = `notifications.craftsman.${user.id}`;
            console.log(`🔌 Subscribing to fallback channel: ${fallbackChannelName}`);
            fallbackChannel = echo.private(fallbackChannelName);
        } else if (userType === "user" || userType === "company") {
            // Some backends use 'client' instead of 'user'
            const clientFallbackChannelName = `notifications.client.${user.id}`;
            console.log(`🔌 Subscribing to user fallback channel: ${clientFallbackChannelName}`);
            clientFallbackChannel = echo.private(clientFallbackChannelName);
        }

        const handleNewMessage = (event: any) => {
            console.log('📨 [RealTime] Event Received: .new-message', event);
            addNotification({
                title: "رسالة جديدة",
                message: event.notification_text || (event.sender_name ? `رسالة جديدة من ${event.sender_name}` : "لديك رسالة جديدة"),
                type: "chat",
                orderId: event.message_id || event.id || 0,
                recipientId: user.id,
                recipientType: userType as any, // CHAT: Always for current user
            });
        };

        const handleRequestCreated = (event: any) => {
            console.log('👷 Event Received (Service Request):', event);
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
            console.log('✅ Event Received (Status Update):', event);

            // ONLY Users (Clients) should get status update notifications
            if (userType === "craftsman") return;

            const statusMap: Record<string, string> = {
                accepted: "مقبول",
                rejected: "مرفوض",
                completed: "مكتمل",
                pending: "قيد الانتظار",
            };

            const status = event.new_status || event.status;
            const arabicStatus = event.new_status_arabic || statusMap[status] || status;

            let customMessage = event.notification_text || `تم تحديث حالة طلبك إلى ${arabicStatus} ✅`;

            if (status === "accepted") {
                customMessage = `تم قبول طلبك للخدمة بنجاح ✅`;
            } else if (status === "rejected") {
                customMessage = `نعتذر، تم رفض طلب الخدمة الخاص بك ❌`;
            } else if (status === "completed") {
                customMessage = "تم إتمام الخدمة بنجاح ✨، يمكنك الآن تقييم الصنايعي.";
            }

            const variant = status === "rejected" ? "error" : "success";

            addNotification({
                title: "تحديث طلب الخدمة",
                message: customMessage,
                type: "order_status",
                orderId: event.request_id || event.id,
                recipientId: user.id,
                recipientType: userType as any,
                variant,
            });
        };

        const handleNewReview = (event: any) => {
            console.log('🌟 Event Received: .new-review', event);
            addNotification({
                title: "تقييم جديد",
                message: event.notification_text || `تقييم جديد: ${event.rating} نجوم`,
                type: "order_status",
                orderId: event.review_id || event.id,
                recipientId: user.id,
                recipientType: "craftsman",
            });
        };

        // Bind listeners to all active notification channels
        const activeChannels = [primaryChannel, fallbackChannel, clientFallbackChannel].filter(Boolean);

        activeChannels.forEach(c => {
            // Chat Messages
            ['.new-message', 'NewMessage', '.NewMessage', 'App\\Events\\NewMessage'].forEach(evt => {
                c.listen(evt, handleNewMessage);
            });

            if (userType === "craftsman") {
                // Service Created
                ['.service-request.created', 'ServiceRequestCreated', '.ServiceRequestCreated', '.new-service-request'].forEach(evt => {
                    c.listen(evt, handleRequestCreated);
                });

                // Reviews
                ['.new-review', 'NewReview', 'App\\Events\\NewReview'].forEach(evt => {
                    c.listen(evt, handleNewReview);
                });

            } else {
                // Service Updated
                ['.service-request.updated', 'ServiceRequestUpdated', '.ServiceRequestUpdated', '.service-status-updated', '.request-status-updated'].forEach(evt => {
                    c.listen(evt, handleRequestUpdated);
                });

                // Generic notification event
                c.listen(".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated", (e: any) => {
                    console.log('🔔 Notification Event:', e);
                    if (e.type?.includes('ServiceRequest') || e.message?.includes('طلب')) {
                        addNotification({
                            title: e.title || "تنبيه جديد",
                            message: e.message || e.notification_text || "تم تحديث حالة طلبك",
                            type: "order_status",
                            orderId: e.request_id || e.id || 0,
                            recipientId: user.id,
                            recipientType: userType as any,
                        });
                    }
                });
            }
        });

        return () => {
            console.log(`🔌 Leaving channels for: ${user.id}`);
            activeChannels.forEach(c => {
                ['.new-message', 'NewMessage', '.NewMessage', 'App\\Events\\NewMessage'].forEach(evt => c.stopListening(evt));

                if (userType === "craftsman") {
                    ['.service-request.created', 'ServiceRequestCreated', '.ServiceRequestCreated', '.new-service-request'].forEach(evt => c.stopListening(evt));
                    ['.new-review', 'NewReview', 'App\\Events\\NewReview'].forEach(evt => c.stopListening(evt));
                } else {
                    ['.service-request.updated', 'ServiceRequestUpdated', '.ServiceRequestUpdated', '.service-status-updated', '.request-status-updated'].forEach(evt => c.stopListening(evt));
                    c.stopListening(".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated");
                }
            });
            echo.leave(primaryChannelName);
            if (fallbackChannel) echo.leave(`notifications.craftsman.${user.id}`);
            if (clientFallbackChannel) echo.leave(`notifications.client.${user.id}`);
        };
    }, [user?.id, userType, addNotification]);

    /* ================= Derived Data ================= */

    const userNotifications = React.useMemo(() => {
        if (!user || !userType) return [];

        const checkType = (type: string) => (type === "company" ? "user" : type);

        return allNotifications.filter(
            n => String(n.recipientId) === String(user.id) && checkType(n.recipientType) === checkType(userType)
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

        const checkType = (type: string) => (type === "company" ? "user" : type);

        setAllNotifications(prev =>
            prev.map(n =>
                String(n.recipientId) === String(user.id) &&
                    checkType(n.recipientType) === checkType(userType) &&
                    n.status === "unread"
                    ? { ...n, status: "read" }
                    : n
            )
        );
    }, [user, userType]);

    const markTypeAsRead = React.useCallback((type: "chat" | "order_status" | "order_request") => {
        if (!user || !userType) return;
        const checkType = (t: string) => (t === "company" ? "user" : t);

        if (type === "chat") {
            unreadChatCountRef.current = 0;
            toast.dismiss("chat-notification-toast");
        }

        setAllNotifications(prev =>
            prev.map(n =>
                n.type === type &&
                    String(n.recipientId) === String(user.id) &&
                    checkType(n.recipientType) === checkType(userType) &&
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