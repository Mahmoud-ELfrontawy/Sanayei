import React, { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { getEcho } from "../utils/echo";

const NOTIF_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export interface AdminNotification {
    id: string;
    title: string;
    message: string;
    type: "new_registration" | "new_review" | "profile_update" | "new_product" | "new_request" | "account_status_audit" | "system_alert";
    status: "unread" | "read";
    timestamp: string;
    link?: string;
    variant?: "info" | "success" | "warning" | "error";
}

interface AdminNotificationContextType {
    notifications: AdminNotification[];
    unreadCount: number;
    addNotification: (notification: Omit<AdminNotification, "id" | "status" | "timestamp">) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
}

const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

export const AdminNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { userType, isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
        const saved = localStorage.getItem("admin_notifications");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        if (userType === 'admin') {
            localStorage.setItem("admin_notifications", JSON.stringify(notifications));
        }
    }, [notifications, userType]);

    const playSound = () => {
        try {
            const audio = new Audio(NOTIF_SOUND_URL);
            audio.volume = 0.4;
            // Handle browser restriction on autoplay (swallow exception to ignore console noise)
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    console.log("🔊 [Echo] Audio play blocked (User interaction needed)");
                });
            }
        } catch (e) {
            // Silently fail as this is expected browser behavior
        }
    };

    const addNotification = (notif: Omit<AdminNotification, "id" | "status" | "timestamp">) => {
        const newNotif: AdminNotification = {
            ...notif,
            id: Math.random().toString(36).substring(2, 9),
            status: "unread",
            timestamp: new Date().toISOString(),
        };

        setNotifications(prev => [newNotif, ...prev]);
        playSound();

        toast.info(notif.title + ": " + notif.message, {
            position: "top-left",
            autoClose: 8000
        });
    };

    useEffect(() => {
        if (!isAuthenticated || userType !== 'admin') {
            if (notifications.length > 0) setNotifications([]);
            return;
        }

        const echo = getEcho() as any;
        if (!echo) return;

        const adminChannel = echo.private(`admin.notifications`);

        console.log("🔌 [Admin Echo] Attempting subscription to admin.notifications");

        adminChannel.on('pusher:subscription_succeeded', () => {
            console.log("✅ [Admin Echo] Subscription CONFIRMED for admin.notifications");
        });

        // 1. Unified Event Handler (Fixes undefined data and duplicates)
        const processEvent = (callback: (data: any) => void) => (e: any) => {
            // Laravel often wraps event payload in a 'data' key
            const actualData = e.data || e;
            callback(actualData);
        };

        // --- Registration ---
        const handleRegistration = (data: any) => {
            let roleLink = "/admin/users";
            if (data.role === 'craftsman') roleLink = "/admin/craftsmen";
            if (data.role === 'company') roleLink = "/admin/companies";

            addNotification({
                title: "تسجيل جديد 👤",
                message: `تم تسجيل ${data.role_arabic || 'مستخدم'} جديد: ${data.name || 'مجهول'}`,
                type: "new_registration",
                link: roleLink
            });
        };
        adminChannel.listen('.AdminNewRegistration', processEvent(handleRegistration));

        // --- New Review ---
        adminChannel.listen('.AdminNewReview', processEvent((data: any) => {
            addNotification({
                title: "تقييم جديد ⭐",
                message: `قام ${data.user_name} بتقييم ${data.craftsman_name} بـ ${data.rating} نجوم`,
                type: "new_review",
                link: "/admin/reviews"
            });
        }));

        // --- Profile Update ---
        adminChannel.listen('.AdminProfileUpdated', processEvent((data: any) => {
            addNotification({
                title: "تحديث ملف شخصي 📝",
                message: `قام ${data.name} (${data.role_arabic}) بتحديث بيانات ملفه الشخصي`,
                type: "profile_update"
            });
        }));

        // --- New Product ---
        adminChannel.listen('.AdminNewProduct', processEvent((data: any) => {
            addNotification({
                title: "منتج جديد 🛒",
                message: `قامت شركة ${data.company_name} بإضافة منتج جديد: ${data.product_name}`,
                type: "new_product",
                link: "/admin/products"
            });
        }));

        // --- New Service Request ---
        adminChannel.listen('.AdminNewRequest', processEvent((data: any) => {
            addNotification({
                title: "طلب خدمة جديد 🛠️",
                message: `طلب خدمة جديد من ${data.user_name} إلى ${data.craftsman_name}`,
                type: "new_request",
                link: "/admin/requests"
            });
        }));

        // --- User Status Change ---
        adminChannel.listen('.AdminUserStatusChanged', processEvent((data: any) => {
            addNotification({
                title: "تحديث حالة حساب 🛡️",
                message: `تم تغيير حالة ${data.name} إلى ${data.status_arabic} بواسطة ${data.admin_name}`,
                type: "account_status_audit",
                variant: data.status === 'rejected' ? 'error' : 'success'
            });
        }));

        // 7. Generic Laravel Notification Fallback
        adminChannel.listen(".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated", (e: any) => {
            console.log('🔔 [Admin Echo] Generic Broadcast:', e);
            if (e.type?.includes('Registration')) {
                addNotification({
                    title: "تسجيل جديد (نظام) 🆕",
                    message: e.message || `مستخدم جديد قيد المراجعة: ${e.name}`,
                    type: "new_registration"
                });
            } else if (e.type?.includes('Status')) {
                addNotification({
                    title: "تنبيه حالة حساب ⚠️",
                    message: e.message || "حدث تغيير في حالة أحد الحسابات",
                    type: "account_status_audit"
                });
            }
        });

        return () => {
            echo.leave(`admin.notifications`);
        };
    }, [isAuthenticated, userType]);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: "read" } : n));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, status: "read" })));
    };

    const unreadCount = notifications.filter(n => n.status === "unread").length;

    return (
        <AdminNotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead }}>
            {children}
        </AdminNotificationContext.Provider>
    );
};

export const useAdminNotifications = () => {
    const context = useContext(AdminNotificationContext);
    if (!context) throw new Error("useAdminNotifications must be used within AdminNotificationProvider");
    return context;
};
