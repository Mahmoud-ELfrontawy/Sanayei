import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { getEcho } from "../utils/echo";

const NOTIF_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
const MAX_ADMIN_NOTIFS = 100;

// ── Types ──────────────────────────────────────────────────
export interface AdminNotification {
    id: string;
    eventId: string; // for deduplication
    title: string;
    message: string;
    type:
        | "new_registration"
        | "new_review"
        | "profile_update"
        | "new_product"
        | "new_request"
        | "account_status_audit"
        | "system_alert"
        | "store_order"
        | "new_complaint"
        | "wallet_payment";
    status: "unread" | "read";
    timestamp: string;
    link?: string;
    variant?: "info" | "success" | "warning" | "error";
}

type NewAdminNotif = Omit<AdminNotification, "id" | "status" | "timestamp"> & { eventId?: string };

interface AdminNotificationContextType {
    notifications: AdminNotification[];
    unreadCount: number;
    addNotification: (notification: NewAdminNotif) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
}

// ── Context ────────────────────────────────────────────────
const AdminNotificationContext = createContext<AdminNotificationContextType | undefined>(undefined);

// ── Sound ──────────────────────────────────────────────────
let _audioInstance: HTMLAudioElement | null = null;
function playSound() {
    try {
        if (!_audioInstance) _audioInstance = new Audio(NOTIF_SOUND_URL);
        _audioInstance.currentTime = 0;
        _audioInstance.volume = 0.4;
        _audioInstance.play().catch(() => {});
    } catch { /* silent */ }
}

// ── Provider ───────────────────────────────────────────────
export const AdminNotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { userType, isAuthenticated } = useAuth();
    const seenEventIds = useRef<Set<string>>(new Set());

    const [notifications, setNotifications] = useState<AdminNotification[]>(() => {
        try {
            const saved = localStorage.getItem("admin_notifications");
            return saved ? JSON.parse(saved) : [];
        } catch { return []; }
    });

    // Persist to localStorage
    useEffect(() => {
        if (userType === "admin") {
            try { localStorage.setItem("admin_notifications", JSON.stringify(notifications.slice(0, MAX_ADMIN_NOTIFS))); }
            catch { /* quota exceeded */ }
        }
    }, [notifications, userType]);

    // ── Core Add (with deduplication) ──────────────────────
    const addNotification = (notif: NewAdminNotif) => {
        const eventId = notif.eventId || `admin_${notif.type}_${Date.now()}`;

        // 🛡️ Deduplicate — skip if we've already processed this event
        if (seenEventIds.current.has(eventId)) return;
        seenEventIds.current.add(eventId);

        const newNotif: AdminNotification = {
            ...notif,
            eventId,
            id:        Math.random().toString(36).substring(2, 9),
            status:    "unread",
            timestamp: new Date().toISOString(),
        };

        setNotifications(prev => [newNotif, ...prev].slice(0, MAX_ADMIN_NOTIFS));
        playSound();

        // Toast with stable toastId to prevent visual duplicates
        const variantMap: Record<string, typeof toast.info> = {
            success: toast.success,
            warning: toast.warning,
            error:   toast.error,
        };
        const toastFn = (notif.variant && variantMap[notif.variant]) || toast.info;
        toastFn(`${notif.title}: ${notif.message}`, {
            position:  "top-right",
            autoClose: 10000,
            toastId:   eventId, // Prevents duplicate toasts
        });
    };

    // ── Echo Listeners ─────────────────────────────────────
    useEffect(() => {
        if (!isAuthenticated || userType !== "admin") {
            if (notifications.length > 0) setNotifications([]);
            return;
        }

        const echo = getEcho() as any;
        if (!echo) return;

        const ch = echo.private("admin.notifications");

        ch.on("pusher:subscription_succeeded", () => {
            console.log("✅ [Admin Echo] Subscribed to admin.notifications");
        });

        // Helper to extract data from Laravel's event payload
        const d = (e: any) => e.data ?? e;

        // ── 1. New Registration ─────────────────────────────
        ch.listen(".AdminNewRegistration", (e: any) => {
            const data = d(e);
            const roleLinks: Record<string, string> = { craftsman: "/admin/craftsmen", company: "/admin/companies" };
            addNotification({
                title:   "تسجيل جديد 👤",
                message: `${data.role_arabic || "مستخدم"} جديد: ${data.name || "مجهول"}`,
                type:    "new_registration",
                link:    roleLinks[data.role] || "/admin/users",
                variant: "info",
                eventId: `reg_${data.id || Date.now()}`,
            });
        });

        // ── 2. New Review (Craftsman or Product) ────────────
        ch.listen(".AdminNewReview", (e: any) => {
            const data = d(e);
            addNotification({
                title:   "تقييم جديد ⭐",
                message: data.message || `قام ${data.user_name || "عميل"} بتقييم ${data.craftsman_name || data.product_name || "منتج"} بـ ${data.rating} نجوم`,
                type:    "new_review",
                link:    "/admin/reviews",
                variant: "success",
                eventId: `rev_${data.id || Date.now()}`,
            });
        });

        // ── 3. Profile Update ────────────────────────────────
        ch.listen(".AdminProfileUpdated", (e: any) => {
            const data = d(e);
            addNotification({
                title:   "تحديث ملف شخصي 📝",
                message: `قام ${data.name || "مستخدم"} (${data.role_arabic || ""}) بتحديث بياناته`,
                type:    "profile_update",
                variant: "info",
                eventId: `profile_${data.id}_${Date.now()}`,
            });
        });

        // ── 4. New Product ───────────────────────────────────
        ch.listen(".AdminNewProduct", (e: any) => {
            const data = d(e);
            addNotification({
                title:   "منتج جديد 🛒",
                message: `شركة ${data.company_name || "شركة"} أضافت: ${data.product_name || "منتج جديد"}`,
                type:    "new_product",
                link:    "/admin/products",
                variant: "info",
                eventId: `prod_${data.product_id || Date.now()}`,
            });
        });

        // ── 5. New Service Request ────────────────────────────
        ch.listen(".AdminNewRequest", (e: any) => {
            const data = d(e);
            addNotification({
                title:   "طلب خدمة جديد 🛠️",
                message: `طلب من ${data.user_name || "عميل"} إلى ${data.craftsman_name || "صنايعي"}`,
                type:    "new_request",
                link:    "/admin/requests",
                variant: "info",
                eventId: `req_${data.request_id || Date.now()}`,
            });
        });

        // ── 6. New Store Order ────────────────────────────────
        ch.listen(".AdminNewStoreOrder", (e: any) => {
            const data = d(e);
            addNotification({
                title:   "طلب متجر جديد 📦",
                message: `طلب جديد من ${data.user_name || "عميل"} بقيمة ${data.total || ""} ج.م`,
                type:    "store_order",
                link:    "/admin/orders",
                variant: "success",
                eventId: `store_ord_${data.order_id || Date.now()}`,
            });
        });

        // ── 7. New Complaint ──────────────────────────────────
        ch.listen(".AdminNewComplaint", (e: any) => {
            const data = d(e);
            addNotification({
                title:   "شكوى جديدة ⚠️",
                message: `شكوى من ${data.user_name || "مستخدم"}: ${data.subject || "يرجى المراجعة"}`,
                type:    "new_complaint",
                link:    "/admin/complaints",
                variant: "warning",
                eventId: `complaint_${data.id || Date.now()}`,
            });
        });

        // ── 8. Wallet Payment ─────────────────────────────────
        ch.listen(".AdminWalletPayment", (e: any) => {
            const data = d(e);
            addNotification({
                title:   "دفع بالمحفظة 💳",
                message: `${data.user_name || "مستخدم"} أجرى دفعة بقيمة ${data.amount || ""} ج.م`,
                type:    "wallet_payment",
                link:    "/admin/payments",
                variant: "success",
                eventId: `wallet_${data.transaction_id || Date.now()}`,
            });
        });

        // ── 9. Account Status Change ──────────────────────────
        ch.listen(".AdminUserStatusChanged", (e: any) => {
            const data = d(e);
            addNotification({
                title:   "تحديث حالة حساب 🛡️",
                message: `تم تغيير حالة ${data.name || "مستخدم"} إلى ${data.status_arabic || data.status}`,
                type:    "account_status_audit",
                variant: data.status === "rejected" ? "error" : "success",
                eventId: `status_${data.id}_${data.status}`,
            });
        });

        return () => {
            console.log("🔌 [Admin Echo] Leaving admin.notifications");
            echo.leave("admin.notifications");
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, userType]);

    // ── Actions ────────────────────────────────────────────
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

// ── Hook ───────────────────────────────────────────────────
export const useAdminNotifications = () => {
    const context = useContext(AdminNotificationContext);
    if (!context) throw new Error("useAdminNotifications must be used within AdminNotificationProvider");
    return context;
};
