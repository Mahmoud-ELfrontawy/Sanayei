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
import { sendNotification } from "../../Api/notifications/notifications.api";

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
                // This is an OUTGOING notification intended for another user.
                // We must send it to the DB so it is persisted and broadcasted via Echo.
                if (notif.eventId?.startsWith("echo_")) {
                    // Do not echo back if it's already from Echo, though usually Echo won't send other users' data.
                    return;
                }
                
                sendNotification({
                    title: notif.title,
                    message: notif.message,
                    recipientId: notif.recipientId,
                    recipientType: notif.recipientType,
                    type: notif.type || "info",
                    orderId: notif.orderId,
                }).catch((err) => console.error("Failed to send DB notification:", err));

                return;
            }

            const eventId =
                notif.eventId ||
                `loc_${Date.now()}_${notif.orderId || Math.random()}`;

            setAllNotifications((prev) => {
                // ── Deduplication ── (STOPS THE LOOP)
                if (prev.some((n) => n.eventId === eventId)) return prev;

                // ── Side Effects ──
                // Firing sound and toast inside the updater is usually safe for toastify,
                // but to be 100% compliant with React concurrent mode and avoid warnings,
                // we wrap them in a microtask or a simple check.
                playNotificationSound(NOTIF_SOUND_URL);
                _showToast(notif, eventId, targetRole, unreadChatCountRef, handleActionRef);

                const newNotif: Notification = {
                    ...notif,
                    id:            notif.id ? String(notif.id) : Math.random().toString(36).substring(2, 9),
                    eventId,
                    status:        notif.status || "unread",
                    timestamp:     new Date().toISOString(),
                    recipientType: targetRole,
                };

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

        case "product_review": {
            toast.success(`⭐ ${notif.title}: ${notif.message}`, {
                position:     "top-right",
                autoClose:    15000,
                closeOnClick: false,
                toastId:      `prod_rev_${notif.orderId}`, // Stable ID to prevent duplicates
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