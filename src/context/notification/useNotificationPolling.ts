/* ─────────────────────────────────────────────
   useNotificationPolling.ts
   Manages all HTTP-based polling for:
     • Service requests  (all roles)
     • Company store orders
     • User store orders
     • Craftsman store orders
   Runs on a POLLING_INTERVAL_MS ticker and
   resets all state refs when the user changes.
───────────────────────────────────────────── */

import { useEffect, useRef, useCallback, type MutableRefObject } from "react";
import {
    getMyServiceRequests,
    getIncomingServiceRequests,
    updateServiceRequestStatus,
} from "../../Api/serviceRequest/serviceRequests.api";
import { getStoreOrders } from "../../Api/auth/Company/storeManagement.api";
import { getUserOrders }   from "../../Api/store/orders.api";
import { getMyNotifications } from "../../Api/notifications/notifications.api";
import { toast }           from "react-toastify";
import type { NewNotificationPayload } from "./notification.types";
import {
    POLLING_INTERVAL_MS,
    STATUS_MAP_ARABIC,
} from "./notification.types";
import { normalizeRole } from "./notification.utils";

interface UseNotificationPollingProps {
    user:                 { id: number } | null;
    userType:             string | null;
    isMountedRef:         MutableRefObject<boolean>;
    addNotificationRef:   MutableRefObject<((n: NewNotificationPayload) => void) | null>;
}

export function useNotificationPolling({
    user,
    userType,
    isMountedRef,
    addNotificationRef,
}: UseNotificationPollingProps) {

    // ── Polling state refs ──────────────────────
    const prevRequestsRef              = useRef<any[]>([]);
    const isFirstServiceFetch          = useRef(true);
    const prevCompanyOrderCountRef     = useRef(-1);
    const isFirstCompanyFetch          = useRef(true);
    const prevUserOrdersRef            = useRef<Record<number, string>>({});
    const isFirstUserOrdersFetch       = useRef(true);
    const prevCraftsmanOrdersRef       = useRef<Record<number, string>>({});
    const isFirstCraftsmanOrdersFetch  = useRef(true);
    const isFirstBackendFetch          = useRef(true);

    // ── handleAction (accept/reject service request) ──
    // Exposed via ref so addNotification can call it without a dependency cycle
    const handleActionRef = useRef<
        ((orderId: number, status: "accepted" | "rejected") => Promise<void>) | null
    >(null);

    const handleAction = useCallback(
        async (orderId: number, status: "accepted" | "rejected") => {
            try {
                await updateServiceRequestStatus(orderId, status);
                toast.success(`تم ${status === "accepted" ? "قبول" : "رفض"} الطلب بنجاح`);
                // Force a fresh poll on next tick
                isFirstServiceFetch.current  = true;
                prevRequestsRef.current      = [];
            } catch (err: any) {
                toast.error(err?.message || "حدث خطأ أثناء تنفيذ العملية");
            }
        },
        []
    );

    useEffect(() => { handleActionRef.current = handleAction; }, [handleAction]);

    // ── Reset refs when user identity changes ──
    useEffect(() => {
        prevRequestsRef.current             = [];
        isFirstServiceFetch.current         = true;
        prevCompanyOrderCountRef.current    = -1;
        isFirstCompanyFetch.current         = true;
        prevUserOrdersRef.current           = {};
        isFirstUserOrdersFetch.current      = true;
        prevCraftsmanOrdersRef.current      = {};
        isFirstCraftsmanOrdersFetch.current = true;
        isFirstBackendFetch.current         = true;
    }, [user?.id, userType]);

    // ── Fetch helpers ───────────────────────────
    const fetchServiceStatus = useCallback(async () => {
        if (!user || !userType || !isMountedRef.current) return;
        const role = normalizeRole(userType);
        try {
            const response = role === "craftsman"
                ? await getIncomingServiceRequests()
                : await getMyServiceRequests();

            const current: any[] = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response) ? response : [];

            if (!isMountedRef.current) return;

            if (isFirstServiceFetch.current) {
                prevRequestsRef.current     = current;
                isFirstServiceFetch.current = false;
                return;
            }

            current.forEach((req) => {
                const prev = prevRequestsRef.current.find(
                    (p) => String(p.id) === String(req.id)
                );

                if (!prev && role === "craftsman") {
                    addNotificationRef.current?.({
                        title:         "طلب خدمة جديد 🛠️",
                        message:       `لديك طلب خدمة جديد من ${req.user?.name || "عميل"}`,
                        type:          "order_request",
                        orderId:       req.id,
                        recipientId:   user.id,
                        recipientType: "craftsman",
                        eventId:       `srv_new_${req.id}`,
                    });
                } else if (prev && prev.status !== req.status && role !== "craftsman") {
                    let message = `تم تحديث حالة طلب الخدمة إلى ${STATUS_MAP_ARABIC[req.status] || req.status} ✅`;
                    if (req.status === "accepted")  message = "تم قبول طلبك للخدمة بنجاح ✅ وهو الآن قيد التنفيذ.";
                    if (req.status === "rejected")  message = "نعتذر، تم رفض طلب الخدمة الخاص بك ❌";
                    if (req.status === "completed") message = "تم إتمام الخدمة بنجاح ✨، يمكنك الآن تقييم الصنايعي.";

                    addNotificationRef.current?.({
                        title:         "تحديث طلب الخدمة",
                        message,
                        type:          "order_status",
                        orderId:       req.id,
                        recipientId:   user.id,
                        recipientType: role,
                        variant:       req.status === "rejected" ? "error" : "success",
                        eventId:       `srv_st_${req.id}_${req.status}`,
                    });
                }
            });

            prevRequestsRef.current = current;
        } catch { /* silent */ }
    }, [user, userType, isMountedRef, addNotificationRef]);

    const fetchCompanyOrders = useCallback(async () => {
        if (!user || normalizeRole(userType || "") !== "company" || !isMountedRef.current) return;
        try {
            const orders = await getStoreOrders();
            if (!Array.isArray(orders) || !isMountedRef.current) return;

            const count = orders.length;

            if (isFirstCompanyFetch.current) {
                prevCompanyOrderCountRef.current = count;
                isFirstCompanyFetch.current = false;
                return;
            }

            if (count > prevCompanyOrderCountRef.current) {
                const diff     = count - prevCompanyOrderCountRef.current;
                const newest   = orders[0];
                const isCraft  = newest?.user_type?.toLowerCase().includes("craftsman") ||
                                 newest?.user_type?.toLowerCase().includes("worker");

                addNotificationRef.current?.({
                    title:         `${isCraft ? "طلب من صنايعي" : "طلب منتج جديد"} ${isCraft ? "🛠️" : "🛒"}`,
                    message:       `وصل ${diff > 1 ? `${diff} طلبات جديدة` : "طلب جديد"} من ${newest?.user_name || (isCraft ? "صنايعي" : "عميل")}`,
                    type:          "store_order",
                    orderId:       newest?.id || 0,
                    recipientId:   user.id,
                    recipientType: "company",
                    variant:       "success",
                    eventId:       `comp_order_${newest?.id || Date.now()}`,
                });
            }

            prevCompanyOrderCountRef.current = count;
        } catch { /* silent */ }
    }, [user, userType, isMountedRef, addNotificationRef]);

    const fetchUserStoreOrders = useCallback(async () => {
        if (!user || normalizeRole(userType || "") !== "user" || !isMountedRef.current) return;
        try {
            const orders = await getUserOrders();
            if (!Array.isArray(orders) || !isMountedRef.current) return;

            if (isFirstUserOrdersFetch.current) {
                const snap: Record<number, string> = {};
                orders.forEach((o: any) => { snap[o.id] = o.status; });
                prevUserOrdersRef.current     = snap;
                isFirstUserOrdersFetch.current = false;
                return;
            }

            orders.forEach((order: any) => {
                const prev = prevUserOrdersRef.current[order.id];
                if (prev !== undefined && prev !== order.status) {
                    addNotificationRef.current?.({
                        title:         "تحديث حالة طلبك ✅",
                        message:       `تم تحديث حالة طلبك رقم #${order.id} إلى ${STATUS_MAP_ARABIC[order.status] || order.status}`,
                        type:          "order_status",
                        orderId:       order.id,
                        recipientId:   user.id,
                        recipientType: "user",
                        variant:       order.status === "cancelled" ? "error" : order.status === "delivered" ? "success" : "info",
                        eventId:       `user_order_st_${order.id}_${order.status}`,
                    });
                }
            });

            const snap: Record<number, string> = {};
            orders.forEach((o: any) => { snap[o.id] = o.status; });
            prevUserOrdersRef.current = snap;
        } catch { /* silent */ }
    }, [user, userType, isMountedRef, addNotificationRef]);

    const fetchCraftsmanStoreOrders = useCallback(async () => {
        if (!user || normalizeRole(userType || "") !== "craftsman" || !isMountedRef.current) return;
        try {
            const orders = await getUserOrders();
            if (!Array.isArray(orders) || !isMountedRef.current) return;

            if (isFirstCraftsmanOrdersFetch.current) {
                const snap: Record<number, string> = {};
                orders.forEach((o: any) => { snap[o.id] = o.status; });
                prevCraftsmanOrdersRef.current         = snap;
                isFirstCraftsmanOrdersFetch.current    = false;
                return;
            }

            orders.forEach((order: any) => {
                const prev = prevCraftsmanOrdersRef.current[order.id];
                if (prev && prev !== order.status) {
                    addNotificationRef.current?.({
                        title:         "تحديث طلبك (صنايعي) 🛠️",
                        message:       `تم تحديث حالة طلبك رقم #${order.id} إلى ${STATUS_MAP_ARABIC[order.status] || order.status}`,
                        type:          "order_status",
                        orderId:       order.id,
                        recipientId:   user.id,
                        recipientType: "craftsman",
                        variant:       order.status === "cancelled" ? "error" : order.status === "delivered" ? "success" : "info",
                        eventId:       `cm_order_st_${order.id}_${order.status}`,
                    });
                }
            });

            const snap: Record<number, string> = {};
            orders.forEach((o: any) => { snap[o.id] = o.status; });
            prevCraftsmanOrdersRef.current = snap;
        } catch { /* silent */ }
    }, [user, userType, isMountedRef, addNotificationRef]);

    // ── Fetches historic notifications from backend database (e.g. while app was closed)
    const fetchBackendNotifications = useCallback(async () => {
        if (!user || !userType || !isMountedRef.current) return;
        const role = normalizeRole(userType);

        try {
            const dbNotifs = await getMyNotifications(role);
            if (!Array.isArray(dbNotifs) || !isMountedRef.current) return;

            dbNotifs.forEach((n: any) => {
                const isAdminMsg = n.type === "admin_message";
                
                // Usually notifications from laravel database have a JSON 'data' block
                const dataBlock = n.data || n;
                
                addNotificationRef.current?.({
                    title:         dataBlock.title || (isAdminMsg ? "📢 رسالة من الإدارة" : "تنبيه"),
                    message:       dataBlock.message || dataBlock.body || dataBlock.notification_text || "لديك إشعار",
                    type:          dataBlock.type || n.type || "admin_message",
                    orderId:       dataBlock.request_id || dataBlock.order_id || n.id || 0,
                    recipientId:   user.id,
                    recipientType: role,
                    variant:       isAdminMsg ? "info" : "success",
                    eventId:       `db_notif_${n.id || Date.now()}`,
                    // Don't unread historic ones unless marked 'unread' from DB (optional)
                    // You'll rely on the existing deduping logic based on eventId
                });
            });

        } catch { /* silent */ }
    }, [user, userType, isMountedRef, addNotificationRef]);

    // ── Unified polling interval ────────────────
    useEffect(() => {
        if (!user || !userType) return;

        const role = normalizeRole(userType);

        const runAll = () => {
            fetchServiceStatus();
            if (role === "company")   fetchCompanyOrders();
            if (role === "user")      fetchUserStoreOrders();
            if (role === "craftsman") fetchCraftsmanStoreOrders();

            if (isFirstBackendFetch.current) {
                fetchBackendNotifications();
                isFirstBackendFetch.current = false;
            }
        };

        runAll(); // immediate first run
        const id = setInterval(runAll, POLLING_INTERVAL_MS);
        return () => clearInterval(id);
    // Intentionally omit fetch callbacks — they are stable refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id, userType]);

    return { handleActionRef };
}