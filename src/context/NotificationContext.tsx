import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { getMyServiceRequests, getIncomingServiceRequests } from "../Api/serviceRequest/serviceRequests.api";
import { getEcho } from "../utils/echo";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "order_request" | "order_status";
    status: "unread" | "read";
    timestamp: string;
    orderId: number;
    recipientId: number;
    recipientType: "user" | "craftsman";
}

interface NotificationContextType {
    notifications: Notification[];
    userNotifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, "id" | "status" | "timestamp">) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
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
    const lastNotifiedId = useRef<string | null>(null);

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

    /* ================= Add Notification ================= */

    const addNotification = React.useCallback((notif: Omit<Notification, "id" | "status" | "timestamp">) => {
        const newNotif: Notification = {
            ...notif,
            id: Math.random().toString(36).substring(2, 9),
            status: "unread",
            timestamp: new Date().toISOString(),
        };

        setAllNotifications(prev => [newNotif, ...prev]);
    }, []);

    /* ================= Polling Fallback ================= */

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
                    addNotification({
                        title: "طلب خدمة جديد",
                        message: `لديك طلب خدمة جديد من ${current.user?.name || "عميل"}`,
                        type: "order_request",
                        orderId: current.id,
                        recipientId: user.id,
                        recipientType: "craftsman",
                    });
                } else if (prev && prev.status !== current.status) {
                    const statusMap: Record<string, string> = {
                        accepted: "مقبول",
                        rejected: "مرفوض",
                        completed: "مكتمل",
                        pending: "قيد الانتظار",
                    };

                    addNotification({
                        title: "تحديث طلب الخدمة",
                        message: `تم تغيير حالة طلبك رقم #${current.id} إلى ${statusMap[current.status] || current.status}`,
                        type: "order_status",
                        orderId: current.id,
                        recipientId: user.id,
                        recipientType: userType as any,
                    });
                }
            });

            prevRequestsRef.current = currentRequests;
        } catch {
            // silent fail (fallback polling only)
        }
    }, [user, userType, addNotification]);

    useEffect(() => {
        if (!user) return;

        fetchServiceStatus();
        const intervalId = setInterval(fetchServiceStatus, 300000);

        return () => clearInterval(intervalId);
    }, [user, fetchServiceStatus]);

    /* ================= Real-Time via Laravel Echo ================= */

    useEffect(() => {
        if (!user || !userType) return;

        const echo = getEcho();
        if (!echo) return;

        const notifType = userType === "craftsman" ? "worker" : "user";
        const channel = echo.channel(`notifications.${notifType}.${user.id}`);

        channel.listen(".new-message", (event: any) => {
            addNotification({
                title: "رسالة جديدة",
                message: event.notification_text || `رسالة جديدة من ${event.sender_name}`,
                type: "order_request",
                orderId: event.message_id,
                recipientId: user.id,
                recipientType: userType as any,
            });
        });

        if (userType === "craftsman") {
            channel.listen(".service-request.created", (event: any) => {
                addNotification({
                    title: "طلب خدمة جديد",
                    message: event.notification_text || `طلب خدمة جديد من ${event.user_name}`,
                    type: "order_request",
                    orderId: event.request_id,
                    recipientId: user.id,
                    recipientType: "craftsman",
                });
            });
        }

        if (userType === "user" || userType === "company") {
            channel.listen(".service-request.updated", (event: any) => {
                addNotification({
                    title: "تحديث طلب الخدمة",
                    message: event.notification_text || `تم تحديث حالة طلبك إلى ${event.new_status_arabic}`,
                    type: "order_status",
                    orderId: event.request_id,
                    recipientId: user.id,
                    recipientType: userType as any,
                });
            });
        }

        if (userType === "craftsman") {
            channel.listen(".new-review", (event: any) => {
                addNotification({
                    title: "تقييم جديد",
                    message: event.notification_text || `تقييم جديد: ${event.rating} نجوم`,
                    type: "order_status",
                    orderId: event.review_id,
                    recipientId: user.id,
                    recipientType: "craftsman",
                });
            });
        }

        return () => {
            channel.stopListening(".new-message");
            channel.stopListening(".service-request.created");
            channel.stopListening(".service-request.updated");
            channel.stopListening(".new-review");
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

    useEffect(() => {
        if (!userNotifications.length) return;

        const newest = userNotifications[0];

        if (newest.status === "unread" && newest.id !== lastNotifiedId.current) {
            toast.info(`${newest.title}: ${newest.message}`, {
                position: "top-right",
                autoClose: 7000,
            });

            lastNotifiedId.current = newest.id;
        }
    }, [userNotifications]);

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

    const contextValue = React.useMemo(
        () => ({ notifications: allNotifications, userNotifications, unreadCount, addNotification, markAsRead, markAllAsRead }),
        [allNotifications, userNotifications, unreadCount, addNotification, markAsRead, markAllAsRead]
    );

    return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
    return context;
};