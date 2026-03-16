/* ─────────────────────────────────────────────
   notification.utils.ts
   Pure helper functions — no React, no side-effects.
───────────────────────────────────────────── */

import type { Notification } from "./notification.types";
import {
    MAX_NOTIFICATIONS,
    NOTIFICATION_TTL_DAYS,
} from "./notification.types";

// ── Role normalisation ─────────────────────────
/**
 * Normalises any backend role string to the three
 * canonical recipientType values used throughout the app.
 *
 *   "worker" | "craftsman"  →  "craftsman"
 *   "company"               →  "company"
 *   everything else         →  "user"
 */
export const normalizeRole = (
    role: string
): Notification["recipientType"] => {
    const r = String(role);
    
    // Handle Laravel Model Class Names
    if (r.includes('Craftsman') || r.includes('Worker') || r === 'worker' || r === 'craftsman') return "craftsman";
    if (r.includes('Company') || r === 'company') return "company";
    
    return "user";
};

// ── LocalStorage helpers ───────────────────────
/**
 * Reads persisted notifications from localStorage and
 * drops any that are older than NOTIFICATION_TTL_DAYS.
 */
export function loadPersistedNotifications(): Notification[] {
    try {
        const raw = localStorage.getItem("app_notifications");
        if (!raw) return [];
        const parsed: Notification[] = JSON.parse(raw);
        const cutoff = Date.now() - NOTIFICATION_TTL_DAYS * 86_400_000;
        return parsed.filter(
            (n) => new Date(n.timestamp).getTime() > cutoff
        );
    } catch {
        return [];
    }
}

/**
 * Writes notifications to localStorage.
 * Trims to MAX_NOTIFICATIONS; silently clears on quota error.
 */
export function persistNotifications(list: Notification[]): void {
    try {
        localStorage.setItem(
            "app_notifications",
            JSON.stringify(list.slice(0, MAX_NOTIFICATIONS))
        );
    } catch {
        // Storage quota exceeded — start fresh
        localStorage.removeItem("app_notifications");
    }
}

// ── Notification sound ─────────────────────────
let _audioInstance: HTMLAudioElement | null = null;

/** Plays the notification ping. Fails silently (autoplay policy, etc.). */
export function playNotificationSound(url: string): void {
    try {
        // Reuse instance to avoid creating dozens of Audio nodes
        if (!_audioInstance) _audioInstance = new Audio(url);
        _audioInstance.currentTime = 0;
        _audioInstance.volume = 0.5;
        _audioInstance.play().catch(() => { /* autoplay blocked */ });
    } catch { /* silent */ }
}