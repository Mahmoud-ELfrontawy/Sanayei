/* ─────────────────────────────────────────────
   useNotificationActions.ts
   Provides markAsRead / markAllAsRead / markTypeAsRead
   actions that update the shared notifications state.
───────────────────────────────────────────── */

import React, { useCallback, type MutableRefObject } from "react";
import { toast } from "react-toastify";
import type { Notification } from "./notification.types";
import { normalizeRole } from "./notification.utils";
import { markNotificationAsRead, markAllNotificationsAsRead } from "../../Api/notifications/notifications.api";

interface UseNotificationActionsProps {
    user: { id: number } | null;
    userType: string | null;
    unreadChatCountRef: MutableRefObject<number>;
    setAllNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
}

export function useNotificationActions({
    user,
    userType,
    unreadChatCountRef,
    setAllNotifications,
}: UseNotificationActionsProps) {
    const markAsRead = useCallback(
        (id: string) => {
            // Optimistic update
            setAllNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, status: "read" } : n))
            );
            
            // Only strike the API if it looks like a DB-persisted notification (numeric ID)
            // Or if it starts with strings, let's try calling it anyway
            markNotificationAsRead(id).catch(err => console.error(err));
        },
        [setAllNotifications]
    );

    const markAllAsRead = useCallback(() => {
        if (!user || !userType) return;
        const role = normalizeRole(userType);

        setAllNotifications((prev) =>
            prev.map((n) =>
                String(n.recipientId) === String(user.id) &&
                n.recipientType === role &&
                n.status === "unread"
                    ? { ...n, status: "read" }
                    : n
            )
        );

        markAllNotificationsAsRead().catch(err => console.error(err));
    }, [user?.id, userType, setAllNotifications]);

    const markTypeAsRead = useCallback(
        (type: Notification["type"]) => {
            if (!user || !userType) return;
            const role = normalizeRole(userType);

            if (type === "chat") {
                unreadChatCountRef.current = 0;
                toast.dismiss("chat-notification-toast");
            }

            setAllNotifications((prev) =>
                prev.map((n) =>
                    n.type === type &&
                    String(n.recipientId) === String(user.id) &&
                    n.recipientType === role &&
                    n.status === "unread"
                        ? { ...n, status: "read" }
                        : n
                )
            );
        },
        [user?.id, userType, unreadChatCountRef, setAllNotifications]
    );

    return { markAsRead, markAllAsRead, markTypeAsRead };
}