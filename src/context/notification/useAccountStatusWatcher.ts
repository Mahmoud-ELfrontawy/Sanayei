/* ─────────────────────────────────────────────
   useAccountStatusWatcher.ts
   Watches user.status for changes (pending→approved,
   any→rejected) and fires the appropriate notification
   + toast. Resets when user identity changes.
───────────────────────────────────────────── */

import { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import type { NewNotificationPayload } from "./notification.types";
import { normalizeRole } from "./notification.utils";

interface UseAccountStatusWatcherProps {
    user:            { id: number; status?: string } | null;
    userType:        string | null;
    addNotification: (n: NewNotificationPayload) => void;
}

export function useAccountStatusWatcher({
    user,
    userType,
    addNotification,
}: UseAccountStatusWatcherProps) {
    const prevStatusRef = useRef<string | undefined>(undefined);

    // Reset when user identity changes
    useEffect(() => {
        prevStatusRef.current = undefined;
    }, [user?.id, userType]);

    useEffect(() => {
        if (!user) {
            prevStatusRef.current = undefined;
            return;
        }

        // First time — just record current status, don't fire
        if (prevStatusRef.current === undefined) {
            prevStatusRef.current = user.status;
            return;
        }

        // No change
        if (prevStatusRef.current === user.status) return;

        const oldStatus = prevStatusRef.current;
        const role      = normalizeRole(userType || "");

        if (user.status === "approved" && oldStatus === "pending") {
            const title   = "تهانينا! تم اعتماد حسابك 🎉";
            const message =
                role === "company"
                    ? "تمت مراجعة بيانات متجرك والموافقة عليها. يمكنك الآن البدء في إضافة منتجاتك."
                    : role === "craftsman"
                    ? "تمت مراجعة بياناتك المهنية والموافقة عليها. يمكنك الآن استقبال طلبات العملاء."
                    : "تم تفعيل حسابك بنجاح.";

            addNotification({
                title,
                message,
                type:          "order_status",
                orderId:       0,
                recipientId:   user.id,
                recipientType: role,
                variant:       "success",
                eventId:       `acc_app_${user.id}_${Date.now()}`,
            });
            toast.success(title, { autoClose: 10000, position: "top-center" });

        } else if (user.status === "rejected") {
            const message =
                "تم حظر حسابك من قبل الإدارة. يرجى التواصل مع الدعم الفني لمزيد من التفاصيل.";

            addNotification({
                title:         "تنبيه: تم حظر الحساب ⚠️",
                message,
                type:          "order_status",
                orderId:       0,
                recipientId:   user.id,
                recipientType: role,
                variant:       "error",
                eventId:       `acc_rej_${user.id}_${Date.now()}`,
            });
            toast.error(message, {
                autoClose:    false,
                position:     "top-center",
                closeOnClick: false,
                draggable:    false,
            });
        }

        prevStatusRef.current = user.status;
    }, [user?.status, user?.id, userType, addNotification]);
}