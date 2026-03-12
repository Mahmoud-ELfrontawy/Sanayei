/* ─────────────────────────────────────────────
   notification.types.ts
   All shared TypeScript types & constants for
   the notification system.
───────────────────────────────────────────── */

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "order_request" | "order_status" | "chat" | "store_order" | "admin_message" | "product_review";
    status: "unread" | "read";
    timestamp: string;
    orderId: number;
    recipientId: number;
    recipientType: "user" | "craftsman" | "company";
    variant?: "info" | "success" | "warning" | "error";
    eventId?: string; // used for deduplication
}

export type NewNotificationPayload = Omit<Notification, "id" | "status" | "timestamp"> & {
    eventId?: string;
};

export interface NotificationContextType {
    notifications: Notification[];
    userNotifications: Notification[];
    unreadCount: number;
    addNotification: (notification: NewNotificationPayload) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    markTypeAsRead: (type: "chat" | "order_status" | "order_request" | "product_review" | "store_order") => void;
}

// ── Constants ──────────────────────────────────
export const NOTIF_SOUND_URL      = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
export const POLLING_INTERVAL_MS  = 10_000;  // 10 seconds
export const MAX_NOTIFICATIONS    = 100;     // cap per user in localStorage
export const NOTIFICATION_TTL_DAYS = 14;     // auto-purge after N days

export const STATUS_MAP_ARABIC: Record<string, string> = {
    accepted:   "مقبول",
    rejected:   "مرفوض",
    completed:  "مكتمل",
    pending:    "قيد الانتظار",
    processing: "جاري التجهيز",
    shipped:    "تم الشحن",
    delivered:  "تم التوصيل",
    cancelled:  "تم الإلغاء",
};