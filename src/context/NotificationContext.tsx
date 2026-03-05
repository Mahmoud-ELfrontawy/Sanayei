/* ─────────────────────────────────────────────
   NotificationContext.tsx
   Slim orchestrator — wires all hooks together
   and exposes the NotificationContext + provider.

   Dependency tree:
     NotificationContext
       ├── useAddNotification      (core add + toast)
       ├── useNotificationPolling  (HTTP polling + handleAction)
       ├── useEchoNotifications    (Laravel Echo real-time)
       ├── useAccountStatusWatcher (account status changes)
       ├── useNotificationActions  (markAsRead / markAllAsRead / markTypeAsRead)
       └── utils/notification.utils (persist, load, sound)
───────────────────────────────────────────── */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useRef,
    useMemo,
} from "react";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

import {
    loadPersistedNotifications,
    persistNotifications,
    normalizeRole,
} from "./notification/notification.utils";
import type {
    Notification,
    NotificationContextType
} from "./notification/notification.types";

// ── Sub-hooks ───────────────────────────────────
import { useAddNotification } from "./notification/useAddNotification";
import { useNotificationPolling } from "./notification/useNotificationPolling";
import { useEchoNotifications } from "./notification/useEchoNotifications";
import { useAccountStatusWatcher } from "./notification/useAccountStatusWatcher";
import { useNotificationActions } from "./notification/useNotificationActions";

import "../assets/styles/notifications.css";

/* ─────────────────────────────────────────────
   Context
───────────────────────────────────────────── */
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/* ─────────────────────────────────────────────
   Provider
───────────────────────────────────────────── */
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, userType, refreshUser } = useAuth();

    // ── Shared state ──────────────────────────────
    const [allNotifications, setAllNotifications] = useState<Notification[]>(
        loadPersistedNotifications
    );

    // ── Shared refs ───────────────────────────────
    const isMountedRef = useRef(true);
    const unreadChatCountRef = useRef(0);
    const addNotificationRef = useRef<((n: any) => void) | null>(null);

    // ── Mount/unmount guard ───────────────────────
    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    // ── Reset shared refs on user change ─────────
    useEffect(() => {
        unreadChatCountRef.current = 0;
    }, [user?.id, userType]);

    // ── Persist on every state change ────────────
    useEffect(() => {
        persistNotifications(allNotifications);
    }, [allNotifications]);

    // ── Cross-tab sync ────────────────────────────
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === "app_notifications" && e.newValue) {
                try { setAllNotifications(JSON.parse(e.newValue)); }
                catch { /* ignore corrupt data */ }
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    // ── Polling (needs handleActionRef before addNotification) ──
    const { handleActionRef } = useNotificationPolling({
        user,
        userType,
        isMountedRef,
        addNotificationRef,
    });

    // ── Core add + toast ──────────────────────────
    const addNotification = useAddNotification({
        user,
        userType,
        isMountedRef,
        unreadChatCountRef,
        handleActionRef,
        setAllNotifications,
    });

    // Keep ref in sync for polling & Echo hooks
    useEffect(() => { addNotificationRef.current = addNotification; }, [addNotification]);

    // ── Real-time Echo ────────────────────────────
    useEchoNotifications({ user, userType, addNotificationRef, refreshUser });

    // ── Account status watcher ────────────────────
    useAccountStatusWatcher({ user, userType, addNotification });

    // ── Mark-read actions ─────────────────────────
    const { markAsRead, markAllAsRead, markTypeAsRead } = useNotificationActions({
        user,
        userType,
        unreadChatCountRef,
        setAllNotifications,
    });

    // ── Derived data ──────────────────────────────
    const userNotifications = useMemo(() => {
        if (!user || !userType) return [];
        const role = normalizeRole(userType);
        return allNotifications.filter(
            (n) =>
                String(n.recipientId) === String(user.id) &&
                n.recipientType === role
        );
    }, [allNotifications, user?.id, userType]);

    const unreadCount = useMemo(
        () => userNotifications.filter((n) => n.status === "unread").length,
        [userNotifications]
    );

    // ── Context value (memoised) ──────────────────
    const contextValue = useMemo<NotificationContextType>(
        () => ({
            notifications: allNotifications,
            userNotifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            markTypeAsRead,
        }),
        [
            allNotifications,
            userNotifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            markTypeAsRead,
        ]
    );

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
        </NotificationContext.Provider>
    );
};

/* ─────────────────────────────────────────────
   Hook
───────────────────────────────────────────── */
export const useNotifications = (): NotificationContextType => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};