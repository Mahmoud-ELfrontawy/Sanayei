import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { getMyServiceRequests, getIncomingServiceRequests } from "../Api/serviceRequest/serviceRequests.api";

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
    notifications: Notification[]; // All notifications (for persistence)
    userNotifications: Notification[]; // Filtered for current user
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

    useEffect(() => {
        const syncNotifications = (e: StorageEvent) => {
            if (e.key === "app_notifications" && e.newValue) {
                console.log("%c 🔄 Cross-Tab Sync: Notifications updated from another tab. ", "color: #00bcd4; font-weight: bold;");
                setAllNotifications(JSON.parse(e.newValue));
            }
        };

        window.addEventListener("storage", syncNotifications);
        return () => window.removeEventListener("storage", syncNotifications);
    }, []);

    useEffect(() => {
        localStorage.setItem("app_notifications", JSON.stringify(allNotifications));
    }, [allNotifications]);

    const addNotification = React.useCallback((notif: Omit<Notification, "id" | "status" | "timestamp">) => {
        const newNotif: Notification = {
            ...notif,
            id: Math.random().toString(36).substr(2, 9),
            status: "unread",
            timestamp: new Date().toISOString(),
        };
        setAllNotifications(prev => [newNotif, ...prev]);
    }, []);

    const fetchServiceStatus = React.useCallback(async () => {
        if (!user || !userType) return;

        try {
            let currentRequests: any[] = [];
            if (userType === 'craftsman') {
                const response = await getIncomingServiceRequests();
                currentRequests = response?.data || response || [];
            } else {
                const response = await getMyServiceRequests();
                currentRequests = response?.data || response || [];
            }

            if (!Array.isArray(currentRequests)) return;

            // Don't notify on the very first fetch (avoids flooding with old entries)
            if (isFirstFetch.current) {
                prevRequestsRef.current = currentRequests;
                isFirstFetch.current = false;
                return;
            }

            currentRequests.forEach(current => {
                const prev = prevRequestsRef.current.find(p => String(p.id) === String(current.id));

                if (!prev) {
                    // New Request
                    if (userType === 'craftsman') {
                        addNotification({
                            title: "طلب خدمة جديد",
                            message: `لديك طلب خدمة جديد من ${current.user?.name || 'عميل'}`,
                            type: "order_request",
                            orderId: current.id,
                            recipientId: user.id,
                            recipientType: "craftsman"
                        });
                    }
                } else if (prev.status !== current.status) {
                    // Status Change
                    const statusMap: any = {
                        'accepted': 'مقبول',
                        'rejected': 'مرفوض',
                        'completed': 'مكتمل',
                        'pending': 'قيد الانتظار'
                    };

                    addNotification({
                        title: "تحديث طلب الخدمة",
                        message: `تم تغيير حالة طلبك رقم #${current.id} إلى ${statusMap[current.status] || current.status}`,
                        type: "order_status",
                        orderId: current.id,
                        recipientId: user.id,
                        recipientType: userType as any
                    });
                }
            });

            prevRequestsRef.current = currentRequests;
        } catch (error) {
            console.error("Failed to fetch service status updates:", error);
        }
    }, [user, userType, addNotification]);

    useEffect(() => {
        if (!user) return;

        fetchServiceStatus();
        const intervalId = setInterval(fetchServiceStatus, 30000); // Poll every 30s

        return () => clearInterval(intervalId);
    }, [user, fetchServiceStatus]);


    // Filtered notifications for the current logged-in user
    const userNotifications = React.useMemo(() => {
        if (!user || !userType) return [];

        return allNotifications.filter(n => {
            // Treat company like user for recipient matching
            const checkType = (type: string) => type === "company" ? "user" : type;
            return String(n.recipientId) === String(user.id) && checkType(n.recipientType) === checkType(userType);
        });
    }, [allNotifications, user, userType]);

    // Real-time Toast Alert for new notifications
    useEffect(() => {
        if (userNotifications.length > 0) {
            const newest = userNotifications[0];
            if (newest.status === 'unread' && newest.id !== lastNotifiedId.current) {
                console.log("%c 🔥 Triggering REAL-TIME Toast for: ", "color: #ff9800; font-weight: bold;", newest);
                toast.info(`${newest.title}: ${newest.message}`, {
                    position: "top-right",
                    autoClose: 7000, // Slightly longer
                });
                lastNotifiedId.current = newest.id;
            }
        }
    }, [userNotifications]);

    const unreadCount = userNotifications.filter(n => n.status === "unread").length;

    const markAsRead = React.useCallback((id: string) => {
        setAllNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "read" } : n));
    }, []);

    const markAllAsRead = React.useCallback(() => {
        if (!user || !userType) return;
        setAllNotifications(prev => {
            const checkType = (type: string) => type === "company" ? "user" : type;
            return prev.map(n =>
                (String(n.recipientId) === String(user.id) &&
                    checkType(n.recipientType) === checkType(userType) &&
                    n.status === "unread")
                    ? { ...n, status: "read" }
                    : n
            );
        });
    }, [user, userType]);

    const contextValue = React.useMemo(() => ({
        notifications: allNotifications,
        userNotifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead
    }), [allNotifications, userNotifications, unreadCount, addNotification, markAsRead, markAllAsRead]);

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};
