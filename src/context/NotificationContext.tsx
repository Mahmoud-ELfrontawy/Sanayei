import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { getMyServiceRequests, getIncomingServiceRequests, updateServiceRequestStatus } from "../Api/serviceRequest/serviceRequests.api";
import { getEcho } from "../utils/echo";
import NotificationToast from "../components/ui/NotificationToast";
import "../assets/styles/notifications.css";

const NOTIF_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: "order_request" | "order_status" | "chat" | "store_order";
    status: "unread" | "read";
    timestamp: string;
    orderId: number;
    recipientId: number;
    recipientType: "user" | "craftsman" | "company";
    variant?: "info" | "success" | "warning" | "error";
}

interface NotificationContextType {
    notifications: Notification[];
    userNotifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, "id" | "status" | "timestamp">) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    markTypeAsRead: (type: "chat" | "order_status" | "order_request") => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, userType, refreshUser } = useAuth();

    const [allNotifications, setAllNotifications] = useState<Notification[]>(() => {
        const saved = localStorage.getItem("app_notifications");
        return saved ? JSON.parse(saved) : [];
    });

    const prevRequestsRef = useRef<any[]>([]);
    const isFirstFetch = useRef(true);
    const addNotificationRef = useRef<any>(null);
    const unreadChatCountRef = useRef(0);
    // ── Store order polling refs ──
    const prevCompanyOrderCountRef = useRef<number>(-1);   // -1 = not initialized
    const isFirstCompanyFetch = useRef(true);
    const prevUserOrdersRef = useRef<Record<number, string>>({}); // { orderId: status } — User only
    const isFirstUserOrdersFetch = useRef(true);
    const prevCraftsmanOrdersRef = useRef<Record<number, string>>({}); // { orderId: status } — Craftsman only
    const isFirstCraftsmanOrdersFetch = useRef(true);
    const prevStatusRef = useRef<string | undefined>(undefined);

    /* ================= LocalStorage Sync ================= */

    useEffect(() => {
        const syncNotifications = (e: StorageEvent) => {
            if (e.key === "app_notifications" && e.newValue) {
                setAllNotifications(JSON.parse(e.newValue));
            }
        };

        window.addEventListener("storage", syncNotifications);
        return () => window.removeEventListener("storage", syncNotifications);
    }, []);

    useEffect(() => {
        localStorage.setItem("app_notifications", JSON.stringify(allNotifications));
    }, [allNotifications]);

    /* ================= Helpers ================= */

    const playNotificationSound = React.useCallback(() => {
        try {
            const audio = new Audio(NOTIF_SOUND_URL);
            audio.volume = 0.5;
            audio.play();
        } catch (err) {
            console.warn("🔇 Notification sound failed to play:", err);
        }
    }, []);

    const fetchServiceStatus = React.useCallback(async () => {
        if (!user || !userType) return;

        try {
            let currentRequests: any[] = [];

            if (userType === "craftsman") {
                const response = await getIncomingServiceRequests();
                currentRequests = response?.data || response || [];
            } else {
                const response = await getMyServiceRequests();
                currentRequests = response?.data || response || [];
            }

            if (!Array.isArray(currentRequests)) return;

            if (isFirstFetch.current) {
                prevRequestsRef.current = currentRequests;
                isFirstFetch.current = false;
                return;
            }

            currentRequests.forEach(current => {
                const prev = prevRequestsRef.current.find(p => String(p.id) === String(current.id));

                if (!prev && userType === "craftsman") {
                    addNotificationRef.current?.({
                        title: "طلب خدمة جديد 🛠️",
                        message: `لديك طلب خدمة جديد من ${current.user?.name || "عميل"}`,
                        type: "order_request",
                        orderId: current.id,
                        recipientId: user.id,
                        recipientType: "craftsman",
                    });
                } else if (prev && prev.status !== current.status) {
                    // ONLY Users (Clients) should get status update notifications
                    if (userType !== "craftsman") {
                        const statusMap: Record<string, string> = {
                            accepted: "مقبول",
                            rejected: "مرفوض",
                            completed: "مكتمل",
                            pending: "قيد الانتظار",
                        };

                        let customMessage = `تم تحديث حالة طلب الخدمة الخاص بك إلى ${statusMap[current.status] || current.status} ✅`;

                        if (current.status === "accepted") {
                            customMessage = `تم قبول طلبك للخدمة بنجاح ✅ وهو الآن قيد التنفيذ.`;
                        } else if (current.status === "rejected") {
                            customMessage = `نعتذر، تم رفض طلب الخدمة الخاص بك ❌`;
                        } else if (current.status === "completed") {
                            customMessage = `تم إتمام الخدمة بنجاح ✨، يمكنك الآن تقييم الصنايعي.`;
                        }

                        const variant = current.status === "rejected" ? "error" : "success";

                        addNotificationRef.current?.({
                            title: "تحديث طلب الخدمة",
                            message: customMessage,
                            type: "order_status",
                            orderId: current.id,
                            recipientId: user.id,
                            recipientType: userType as any,
                            variant,
                        });
                    }
                }
            });

            prevRequestsRef.current = currentRequests;
        } catch {
            // silent fail
        }
    }, [user, userType]);

    const fetchCompanyOrders = React.useCallback(async () => {
        if (!user || userType !== "company") return;

        try {
            const { getStoreOrders } = await import("../Api/auth/Company/storeManagement.api");
            const currentOrders = await getStoreOrders();
            if (!Array.isArray(currentOrders)) return;

            const currentCount = currentOrders.length;

            if (isFirstCompanyFetch.current) {
                prevCompanyOrderCountRef.current = currentCount;
                isFirstCompanyFetch.current = false;
                return;
            }

            // Detect new orders (count increased)
            if (currentCount > prevCompanyOrderCountRef.current) {
                const newCount = currentCount - prevCompanyOrderCountRef.current;
                const newestOrder = currentOrders[0]; // API returns latest first

                // Backend returns user_type as full class name: e.g. "App\\Models\\Craftsman"
                const isCraftsmanOrder = newestOrder?.user_type?.includes('Craftsman');
                const emoji = isCraftsmanOrder ? "🛠️" : "🛒";
                const buyerLabel = isCraftsmanOrder ? "صنايعي" : "عميل";
                const title = isCraftsmanOrder ? "طلب من صنايعي" : "طلب منتج جديد";

                addNotificationRef.current?.({
                    title: `${title} ${emoji}`,
                    message: `وصل ${newCount > 1 ? newCount + ' طلبات جديدة' : 'طلب جديد'} من ${newestOrder?.user_name || buyerLabel} – الإجمالي: ${newestOrder?.total_amount ? Number(newestOrder.total_amount).toLocaleString() + ' ج.م' : 'غير محدد'}`,
                    type: "store_order",
                    orderId: newestOrder?.id || 0,
                    recipientId: user.id,
                    recipientType: "company",
                    variant: "success",
                });
            }

            prevCompanyOrderCountRef.current = currentCount;
        } catch (err) {
            console.warn("⚠️ [Polling] Failed to fetch company orders:", err);
        }
    }, [user, userType]);

    const fetchUserStoreOrders = React.useCallback(async () => {
        // ⚠️ User ONLY — craftsmen have their own separate function below
        if (!user || userType !== "user") return;

        try {
            const { getUserOrders } = await import("../Api/store/orders.api");
            const currentOrders = await getUserOrders();
            if (!Array.isArray(currentOrders)) return;

            if (isFirstUserOrdersFetch.current) {
                const snapshot: Record<number, string> = {};
                currentOrders.forEach((o: any) => { snapshot[o.id] = o.status; });
                prevUserOrdersRef.current = snapshot;
                isFirstUserOrdersFetch.current = false;
                return;
            }

            const statusMap: Record<string, string> = {
                pending: "قيد الانتظار",
                processing: "جاري التجهيز",
                shipped: "تم الشحن",
                delivered: "تم التوصيل",
                cancelled: "تم الإلغاء",
            };

            currentOrders.forEach((order: any) => {
                const prevStatus = prevUserOrdersRef.current[order.id];
                if (prevStatus !== undefined && prevStatus !== order.status) {
                    const arabicStatus = statusMap[order.status] || order.status;
                    addNotificationRef.current?.({
                        title: "تحديث حالة طلبك ✅",
                        message: `تم تحديث حالة طلبك رقم #${order.id} إلى ${arabicStatus}`,
                        type: "order_status",
                        orderId: order.id,
                        recipientId: user.id,
                        recipientType: "user",
                        variant: order.status === "cancelled" ? "error" : (order.status === "delivered" ? "success" : "info"),
                    });
                }
            });

            const newSnapshot: Record<number, string> = {};
            currentOrders.forEach((o: any) => { newSnapshot[o.id] = o.status; });
            prevUserOrdersRef.current = newSnapshot;
        } catch {
            // silent
        }
    }, [user, userType]);

    /* ── Craftsman Store Orders (separate from user) ──────────────────── */
    const fetchCraftsmanStoreOrders = React.useCallback(async () => {
        // ⚠️ Craftsman ONLY — do NOT call for regular users
        if (!user || userType !== "craftsman") return;

        try {
            const { getUserOrders } = await import("../Api/store/orders.api");
            const currentOrders = await getUserOrders();
            if (!Array.isArray(currentOrders)) return;

            if (isFirstCraftsmanOrdersFetch.current) {
                const snapshot: Record<number, string> = {};
                currentOrders.forEach((o: any) => { snapshot[o.id] = o.status; });
                prevCraftsmanOrdersRef.current = snapshot;
                isFirstCraftsmanOrdersFetch.current = false;
                return;
            }

            const statusMap: Record<string, string> = {
                pending: "قيد الانتظار",
                processing: "جاري التجهيز",
                shipped: "تم الشحن",
                delivered: "تم التوصيل",
                cancelled: "تم الإلغاء",
            };

            currentOrders.forEach((order: any) => {
                const prevStatus = prevCraftsmanOrdersRef.current[order.id];
                if (prevStatus && prevStatus !== order.status) {
                    const arabicStatus = statusMap[order.status] || order.status;
                    addNotificationRef.current?.({
                        title: "تحديث طلبك (صنايعي) 🛠️",
                        message: `تم تحديث حالة طلبك رقم #${order.id} إلى ${arabicStatus}`,
                        type: "order_status",
                        orderId: order.id,
                        recipientId: user.id,
                        recipientType: "craftsman",
                        variant: order.status === "cancelled" ? "error" : (order.status === "delivered" ? "success" : "info"),
                    });
                }
            });

            const newSnapshot: Record<number, string> = {};
            currentOrders.forEach((o: any) => { newSnapshot[o.id] = o.status; });
            prevCraftsmanOrdersRef.current = newSnapshot;
        } catch {
            // silent
        }
    }, [user, userType]);

    const handleAction = React.useCallback(async (orderId: number, status: "accepted" | "rejected") => {
        try {
            const actionText = status === "accepted" ? "قبول" : "رفض";
            console.log(`🚀 Professional Notif: ${actionText} request #${orderId}`);

            await updateServiceRequestStatus(orderId, status);
            toast.success(`تم ${actionText} الطلب بنجاح`);

            // Refresh local data
            fetchServiceStatus();
        } catch (err: any) {
            toast.error(err.message || "حدث خطأ أثناء تنفيذ العملية");
        }
    }, [fetchServiceStatus]);

    /* ================= Add Notification ================= */

    const addNotification = React.useCallback((notif: Omit<Notification, "id" | "status" | "timestamp">) => {
        // GUARD: allow if recipientType matches userType OR if recipientId === current user's id (self-notification)
        const typeMatches = (notif.recipientType as string) === (userType as string);
        const idMatches = user && String(notif.recipientId) === String(user.id);

        if (!typeMatches && !idMatches) {
            console.log(`🛡️ Guard: Blocked | target=${notif.recipientType}/${notif.recipientId} | current=${userType}/${user?.id}`);
            return;
        }

        console.log(`📢 [NOTIF] Adding to state: ${notif.type} | ${notif.title}`);

        const newNotif: Notification = {
            ...notif,
            id: Math.random().toString(36).substring(2, 9),
            status: "unread",
            timestamp: new Date().toISOString(),
        };

        setAllNotifications(prev => [newNotif, ...prev]);
        playNotificationSound();

        // Show toast
        if (notif.type === "chat") {
            unreadChatCountRef.current += 1;
            const count = unreadChatCountRef.current;
            const toastId = "chat-notification-toast";

            if (count > 1) {
                toast.info(`لديك ${count} رسائل جديدة`, {
                    toastId,
                    position: "top-right",
                    autoClose: 7000,
                });
            } else {
                toast.info(`${notif.title}: ${notif.message}`, {
                    toastId,
                    position: "top-right",
                    autoClose: 7000,
                });
            }
        } else if (notif.type === "order_request" && userType === "craftsman") {
            toast(
                ({ closeToast }) => (
                    <NotificationToast
                        title={notif.title}
                        message={notif.message}
                        type={notif.type as any}
                        onAccept={() => handleAction(notif.orderId, "accepted")}
                        onReject={() => handleAction(notif.orderId, "rejected")}
                        closeToast={closeToast}
                    />
                ),
                {
                    position: "top-right",
                    autoClose: 10000,
                }
            );
        } else if (notif.type === "store_order") {
            // Rich toast for company when a new store order arrives
            toast.info(`🛒 ${notif.title}: ${notif.message}`, {
                position: "top-right",
                autoClose: 12000,
            });
        } else {
            const variant = notif.variant || "info";
            const toastMethod = (toast as any)[variant] || toast.info;
            toastMethod(`${notif.title}: ${notif.message}`, {
                position: "top-right",
                autoClose: 7000,
            });
        }
    }, [playNotificationSound, handleAction, userType]);

    // Keep the ref in sync
    useEffect(() => {
        addNotificationRef.current = addNotification;
    }, [addNotification]);

    /* ================= Polling Fallback ================= */

    // ── Update Logic Watcher (Detect Status Change) ──
    useEffect(() => {
        if (!user) {
            prevStatusRef.current = undefined;
            return;
        }

        if (prevStatusRef.current === undefined) {
            prevStatusRef.current = user.status;
            return;
        }

        // Detect Status Change
        if (prevStatusRef.current !== user.status) {
            const isApproved = user.status === 'approved';
            const isRejected = user.status === 'rejected';
            const oldStatus = prevStatusRef.current;

            if (isApproved && oldStatus === 'pending') {
                const title = "تهانينا! تم اعتماد حسابك 🎉";
                const message = userType === 'company'
                    ? "تمت مراجعة بيانات متجرك والموافقة عليها. يمكنك الآن البدء في إضافة منتجاتك."
                    : (userType === 'craftsman' ? "تمت مراجعة بياناتك المهنية والموافقة عليها. يمكنك الآن استقبال طلبات العملاء." : "تم تفعيل حسابك بنجاح.");

                addNotification({
                    title,
                    message,
                    type: "order_status",
                    orderId: 0,
                    recipientId: user.id,
                    recipientType: userType as any,
                    variant: "success",
                });
                toast.success(title, { autoClose: 10000, position: "top-center" });
            }
            else if (isRejected) {
                const title = "تنبيه: تم حظر الحساب ⚠️";
                const message = "تم حظر حسابك من قبل الإدارة. يرجى التواصل مع الدعم الفني لمزيد من التفاصيل.";

                addNotification({
                    title,
                    message,
                    type: "order_status",
                    orderId: 0,
                    recipientId: user.id,
                    recipientType: userType as any,
                    variant: "error",
                });
                toast.error(message, { autoClose: false, position: "top-center", closeOnClick: false, draggable: false });
            }
        }

        prevStatusRef.current = user.status;
    }, [user, userType, addNotification]);

    useEffect(() => {
        if (!user) return;

        fetchServiceStatus();
        if (userType === "company") {
            fetchCompanyOrders();
        } else if (userType === "user") {
            fetchUserStoreOrders();
        } else if (userType === "craftsman") {
            fetchCraftsmanStoreOrders();
        }
    }, [user, userType, fetchServiceStatus, fetchCompanyOrders, fetchUserStoreOrders, fetchCraftsmanStoreOrders]);

    /* ================= Real-Time via Laravel Echo ================= */

    useEffect(() => {
        // ── 1. AGGRESSIVE EXCLUSION (Admins have AdminNotificationContext) ──
        if (!user || !userType || userType === 'admin') {
            if (userType === 'admin') console.log("🛡️ [Echo] Skipping NotificationContext for Admin role");
            return;
        }

        const echo = getEcho() as any;
        if (!echo) return;

        // ── 2. Channel Selection ──
        let notifPrefix = "user";
        if (userType === "craftsman") notifPrefix = "worker";
        else if (userType === "company") notifPrefix = "company";

        const primaryChannelName = `notifications.${notifPrefix}.${user.id}`;
        console.log(`🔌 [Echo] PRIMARY: ${primaryChannelName} | Role: ${userType}`);
        const c = echo.private(primaryChannelName);

        // ── 3. Role-Specific Generic Listeners ──
        const listenerMap: Record<string, string> = {
            user: '.UserNotification',
            craftsman: '.CraftsmanNotification',
            company: '.CompanyNotification'
        };

        const genericEvent = listenerMap[userType];
        if (genericEvent) {
            c.listen(genericEvent, (e: any) => {
                console.log(`📡 [Echo] ${userType} Generic Notification:`, e);
                addNotification({
                    title: e.title || "تنبيه جديد",
                    message: e.message || "لديك إشعار جديد في حسابك",
                    type: userType === 'craftsman' ? "order_request" : (userType === 'company' ? "store_order" : "order_status"),
                    orderId: e.id || e.order_id || 0,
                    recipientId: user.id,
                    recipientType: userType as any
                });
            });
        }

        // ── 4. Shared Functional Listeners ──
        const handleNewMessage = (e: any) => {
            addNotification({
                title: "رسالة جديدة",
                message: e.notification_text || "لديك رسالة جديدة",
                type: "chat",
                orderId: e.message_id || 0,
                recipientId: user.id,
                recipientType: userType as any,
            });
        };

        ['.new-message', 'NewMessage', '.NewMessage'].forEach(evt => c.listen(evt, handleNewMessage));

        // Account status refresh (for all roles)
        [
            '.company.approved', '.company.rejected', '.company.status.updated',
            '.user.approved', '.user.rejected', '.user.status.updated',
            '.worker.approved', '.worker.rejected', '.worker.status.updated',
            'CompanyApproved', 'CompanyStatusUpdated',
            'UserApproved', 'UserStatusUpdated',
            'WorkerApproved', 'WorkerStatusUpdated',
            'UserStatusUpdated', '.UserStatusUpdated'
        ].forEach(evt => c.listen(evt, () => refreshUser()));

        // ── 5. User/Craftsman Store Order Status Listeners ──
        if (userType === "user") {
            c.listen('.UserRequestStatusUpdated', (e: any) => {
                console.log("📡 [Echo] User Store Order Status Updated:", e);
                addNotification({
                    title: "تحديث حالة طلبك ✅",
                    message: e.notification_text || `تم تحديث طلبك إلى ${e.status_arabic} من قبل ${e.company_name}`,
                    type: "order_status",
                    orderId: e.request_id || 0,
                    recipientId: user.id,
                    recipientType: "user",
                    variant: e.status_arabic?.includes("ملغي") ? "error" : "success"
                });
            });
        }

        if (userType === "craftsman") {
            c.listen('.CraftsmanRequestStatusUpdated', (e: any) => {
                console.log("📡 [Echo] Craftsman Store Order Status Updated:", e);
                addNotification({
                    title: "تحديث طلبك (صنايعي) 🛠️",
                    message: e.notification_text || `تم تحديث طلبك إلى ${e.status_arabic} من قبل ${e.company_name}`,
                    type: "order_status",
                    orderId: e.request_id || 0,
                    recipientId: user.id,
                    recipientType: "craftsman",
                    variant: e.status_arabic?.includes("ملغي") ? "error" : "success"
                });
            });
        }

        // ── 6. Company-Specific Functional Listeners (Order Receiving) ──
        if (userType === "company") {
            const companyChannel = echo.private(`company.notifications.${user.id}`);
            console.log(`🔌 [Echo] Company Dedicated Channel: company.notifications.${user.id}`);

            const processCompanyEvent = (callback: (data: any) => void) => (e: any) => {
                const actualData = e.data || e;
                callback(actualData);
            };

            // New Request from User or Craftsman
            companyChannel.listen('.CompanyNewRequest', processCompanyEvent((data: any) => {
                console.log("📡 [Echo] Company New Request:", data);
                addNotification({
                    title: "طلب جديد للمنتجات 🛒",
                    message: data.message || `قام ${data.user_name} بطلب منتجات من شركتكم`,
                    type: "store_order",
                    orderId: data.request_id || 0,
                    recipientId: user.id,
                    recipientType: "company"
                });
            }));

            // Order Status Updated
            companyChannel.listen('.CompanyStatusUpdated', processCompanyEvent((data: any) => {
                addNotification({
                    title: "تحديث حالة الطلب 📈",
                    message: data.message || `تم تحديث حالة الطلب #${data.request_id} إلى ${data.status_arabic}`,
                    type: "store_order",
                    orderId: data.request_id || 0,
                    recipientId: user.id,
                    recipientType: "company"
                });
            }));
        }

        return () => {
            console.log(`🔌 [Echo] Leaving ${primaryChannelName}`);
            echo.leave(primaryChannelName);
            if (userType === "company") {
                echo.leave(`company.notifications.${user.id}`);
            }
        };
    }, [user?.id, userType, addNotification, refreshUser]);

    /* ================= Derived Data ================= */

    const userNotifications = React.useMemo(() => {
        if (!user || !userType) return [];
        return allNotifications.filter(
            n => String(n.recipientId) === String(user.id) && n.recipientType === userType
        );
    }, [allNotifications, user, userType]);

    // Track unread messages for toast notification


    /* ================= Effects ================= */
    // Chat toasts are now handled in addNotification for better reliability


    const unreadCount = userNotifications.filter(n => n.status === "unread").length;

    const markAsRead = React.useCallback((id: string) => {
        setAllNotifications(prev => prev.map(n => (n.id === id ? { ...n, status: "read" } : n)));
    }, []);

    const markAllAsRead = React.useCallback(() => {
        if (!user || !userType) return;

        setAllNotifications(prev =>
            prev.map(n =>
                String(n.recipientId) === String(user.id) &&
                    n.recipientType === userType &&
                    n.status === "unread"
                    ? { ...n, status: "read" }
                    : n
            )
        );
    }, [user, userType]);

    const markTypeAsRead = React.useCallback((type: "chat" | "order_status" | "order_request") => {
        if (!user || !userType) return;

        if (type === "chat") {
            unreadChatCountRef.current = 0;
            toast.dismiss("chat-notification-toast");
        }

        setAllNotifications(prev =>
            prev.map(n =>
                n.type === type &&
                    String(n.recipientId) === String(user.id) &&
                    n.recipientType === userType &&
                    n.status === "unread"
                    ? { ...n, status: "read" }
                    : n
            )
        );
    }, [user, userType]);

    const contextValue = React.useMemo(
        () => ({
            notifications: allNotifications,
            userNotifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead,
            markTypeAsRead
        }),
        [allNotifications, userNotifications, unreadCount, addNotification, markAsRead, markAllAsRead, markTypeAsRead]
    );

    return <NotificationContext.Provider value={contextValue}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotifications must be used within a NotificationProvider");
    return context;
};