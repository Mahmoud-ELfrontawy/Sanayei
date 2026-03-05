/* ─────────────────────────────────────────────
   useAddNotification.ts
   Core hook that builds a new Notification object,
   deduplicates it, appends it to state, plays sound,
   and fires the appropriate toast.
───────────────────────────────────────────── */

import { useCallback, type MutableRefObject } from "react";
import { toast } from "react-toastify";
import React from "react";
import NotificationToast from "../../components/ui/NotificationToast";
import type { Notification, NewNotificationPayload } from "./notification.types";
import {
    MAX_NOTIFICATIONS,
    NOTIF_SOUND_URL,
} from "./notification.types";
import {
    normalizeRole,
    playNotificationSound,
} from "./notification.utils";

interface UseAddNotificationProps {
    user: { id: number } | null;
    userType: string | null;
    isMountedRef: MutableRefObject<boolean>;
    unreadChatCountRef: MutableRefObject<number>;
    handleActionRef: MutableRefObject<
        ((orderId: number, status: "accepted" | "rejected") => Promise<void>) | null
    >;
    setAllNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export function useAddNotification({
    user,
    userType,
    isMountedRef,
    unreadChatCountRef,
    handleActionRef,
    setAllNotifications,
}: UseAddNotificationProps) {
    const addNotification = useCallback(
        (notif: NewNotificationPayload) => {
            if (!isMountedRef.current || !user) return;

            // ── Guard: only accept notifications meant for this user/role ──
            const currentRole = normalizeRole(userType || "");
            const targetRole  = normalizeRole(notif.recipientType);

            if (
                currentRole !== targetRole ||
                String(notif.recipientId) !== String(user.id)
            ) {
                return;
            }

            const eventId =
                notif.eventId ||
                `loc_${Date.now()}_${notif.orderId || Math.random()}`;

            setAllNotifications((prev) => {
                // ── Deduplication ──
                if (prev.some((n) => n.eventId === eventId)) return prev;

                const newNotif: Notification = {
                    ...notif,
                    id:            Math.random().toString(36).substring(2, 9),
                    eventId,
                    status:        "unread",
                    timestamp:     new Date().toISOString(),
                    recipientType: targetRole,
                };

                // ── Sound ──
                playNotificationSound(NOTIF_SOUND_URL);

                // ── Toast ──
                _showToast(notif, eventId, targetRole, unreadChatCountRef, handleActionRef);

                return [newNotif, ...prev].slice(0, MAX_NOTIFICATIONS);
            });
        },
        [user, userType, isMountedRef, unreadChatCountRef, handleActionRef, setAllNotifications]
    );

    return addNotification;
}

/* ─────────────────────────────────────────────
   Private: Toast dispatcher
───────────────────────────────────────────── */
function _showToast(
    notif: NewNotificationPayload,
    eventId: string,
    targetRole: Notification["recipientType"],
    unreadChatCountRef: MutableRefObject<number>,
    handleActionRef: MutableRefObject<
        ((orderId: number, status: "accepted" | "rejected") => Promise<void>) | null
    >
) {
    switch (notif.type) {
        case "chat": {
            unreadChatCountRef.current += 1;
            const count   = unreadChatCountRef.current;
            const toastId = "chat-notification-toast";
            toast.info(
                count > 1
                    ? `لديك ${count} رسائل جديدة`
                    : `${notif.title}: ${notif.message}`,
                { toastId, position: "top-right", autoClose: 7000 }
            );
            break;
        }

        case "order_request": {
            if (targetRole !== "craftsman") break;
            toast(
                ({ closeToast }) =>
                    React.createElement(NotificationToast, {
                        title:       notif.title,
                        message:     notif.message,
                        type:        notif.type as any,
                        onAccept:    () => handleActionRef.current?.(notif.orderId, "accepted"),
                        onReject:    () => handleActionRef.current?.(notif.orderId, "rejected"),
                        closeToast,
                    }),
                { position: "top-right", autoClose: 10000, toastId: eventId }
            );
            break;
        }

        case "store_order": {
            toast.info(`🛒 ${notif.title}: ${notif.message}`, {
                position: "top-right",
                autoClose: 12000,
                toastId:   eventId,
            });
            break;
        }

        default: {
            const variant     = notif.variant || "info";
            const toastMethod = (toast as any)[variant] ?? toast.info;
            toastMethod(`${notif.title}: ${notif.message}`, {
                position: "top-right",
                autoClose: 7000,
                toastId:   eventId,
            });
        }
    }
}