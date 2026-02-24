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
    const { user, userType } = useAuth();

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

        // Polling every 30s: reduced from 12s to mitigate 429 Too Many Requests
        const intervalId = setInterval(() => {
            fetchServiceStatus();
            if (userType === "company") {
                fetchCompanyOrders();
            } else if (userType === "user") {
                fetchUserStoreOrders();
            } else if (userType === "craftsman") {
                fetchCraftsmanStoreOrders();
            }
        }, 30000);

        return () => clearInterval(intervalId);
    }, [user, userType, fetchServiceStatus, fetchCompanyOrders, fetchUserStoreOrders, fetchCraftsmanStoreOrders]);

    /* ================= Real-Time via Laravel Echo ================= */

    useEffect(() => {
        if (!user || !userType) return;

        const echo = getEcho() as any;
        if (!echo) return;

        // ── Channel names per role ──
        // Company backend broadcasts to: notifications.user.{company_id} (via SBroadcastOn)
        // User/Craftsman: notifications.user.{id} or notifications.worker.{id}
        const notifPrefix = userType === "craftsman" ? "worker" : "user";
        const primaryChannelName = `notifications.${notifPrefix}.${user.id}`;

        console.log(`🔌 [Echo] PRIMARY: ${primaryChannelName} | Role: ${userType}`);
        const primaryChannel = echo.private(primaryChannelName);

        // Secondary fallback channels (extra aliases the backend might use)
        let fallbackChannel: any = null;      // craftsman: notifications.craftsman.{id}
        let clientFallbackChannel: any = null; // user: notifications.client.{id}
        let companyChannel: any = null;        // company: notifications.company.{id} (if backend supports)
        // NOTE: We do NOT open notifications.user.{id} AGAIN for company — it's already primaryChannel

        if (userType === "craftsman") {
            fallbackChannel = echo.private(`notifications.craftsman.${user.id}`);
        } else if (userType === "user") {
            clientFallbackChannel = echo.private(`notifications.client.${user.id}`);
        } else if (userType === "company") {
            // Secondary channel - only if backend also supports notifications.company.{id}
            companyChannel = echo.private(`notifications.company.${user.id}`);
            console.log(`🏢 [Echo] COMPANY secondary: notifications.company.${user.id}`);
        }

        const handleNewMessage = (event: any) => {
            console.log('📨 [RealTime] .new-message', event);
            addNotification({
                title: "رسالة جديدة",
                message: event.notification_text || (event.sender_name ? `رسالة جديدة من ${event.sender_name}` : "لديك رسالة جديدة"),
                type: "chat",
                orderId: event.message_id || event.id || 0,
                recipientId: user.id,
                recipientType: userType as any,
            });
        };

        const handleRequestCreated = (event: any) => {
            console.log('👷 Service Request Created:', event);
            addNotification({
                title: "طلب خدمة جديد",
                message: event.notification_text || `طلب خدمة جديد من ${event.user_name || "عميل"}`,
                type: "order_request",
                orderId: event.request_id || event.id,
                recipientId: user.id,
                recipientType: "craftsman",
            });
        };

        const handleRequestUpdated = (event: any) => {
            if (userType === "craftsman") return;
            const statusMap: Record<string, string> = {
                accepted: "مقبول", rejected: "مرفوض", completed: "مكتمل", pending: "قيد الانتظار",
            };
            const status = event.new_status || event.status;
            const arabicStatus = statusMap[status] || status;
            let msg = `تم تحديث حالة طلبك إلى ${arabicStatus} ✅`;
            if (status === "accepted") msg = "تم قبول طلبك للخدمة بنجاح ✅";
            else if (status === "rejected") msg = "نعتذر، تم رفض طلب الخدمة الخاص بك ❌";
            else if (status === "completed") msg = "تم إتمام الخدمة بنجاح ✨";
            addNotification({
                title: "تحديث طلب الخدمة",
                message: event.notification_text || msg,
                type: "order_status",
                orderId: event.request_id || event.id,
                recipientId: user.id,
                recipientType: userType as any,
                variant: status === "rejected" ? "error" : "success",
            });
        };

        const handleNewReview = (event: any) => {
            addNotification({
                title: "تقييم جديد",
                message: event.notification_text || `تقييم جديد: ${event.rating} نجوم`,
                type: "order_status",
                orderId: event.review_id || event.id,
                recipientId: user.id,
                recipientType: "craftsman",
            });
        };

        const handleNewStoreOrder = (event: any) => {
            console.log('🛒 [Echo] New Store Order Arrival:', event);
            // The event might be nested under 'order' or direct
            const orderData = event.order || event;
            const buyer = event.user || event.buyer || {};
            
            addNotification({
                title: "طلب منتج جديد 🛒",
                message: event.notification_text || `طلب جديد من ${orderData.customer_name || buyer.name || "عميل"} – الإجمالي: ${orderData.total_amount ? Number(orderData.total_amount).toLocaleString() + ' ج.م' : 'غير محدد'}`,
                type: "store_order",
                orderId: orderData.order_id || orderData.id || 0,
                recipientId: user.id,
                recipientType: "company",
                variant: "success",
            });
        };

        const handleStoreOrderStatusUpdated = (event: any) => {
            console.log('📦 [Echo] Store Order Status Change:', event);
            // This event is for the buyer (user/craftsman) — company does not need it
            if (userType === "company") return;

            const statusMap: Record<string, string> = {
                pending: "قيد الانتظار",
                processing: "جاري التجهيز",
                shipped: "تم الشحن",
                delivered: "تم التوصيل",
                cancelled: "تم الإلغاء",
            };
            const orderData = event.order || event;
            const status = orderData.status || orderData.new_status;
            const arabicStatus = statusMap[status] || status;

            // Set recipientType to actual role so the notification guard passes correctly
            const isCraftsman = userType === "craftsman";
            const notifTitle = isCraftsman ? "تحديث طلبك (صنايعي) 🛠️" : "تحديث حالة طلبك ✅";
            const notifRecipient = isCraftsman ? "craftsman" : "user";

            addNotification({
                title: notifTitle,
                message: event.notification_text || `تم تحديث حالة طلبك رقم #${orderData.order_id || orderData.id} إلى ${arabicStatus} ✨`,
                type: "order_status",
                orderId: orderData.order_id || orderData.id || 0,
                recipientId: user.id,
                recipientType: notifRecipient as any,
                variant: status === "cancelled" ? "error" : (status === "delivered" ? "success" : "info"),
            });
        };

        // ── Build the unique channels array ──
        // IMPORTANT: Avoid subscribing to the same channel twice (e.g. company primaryChannel IS notifications.user.{id})
        const activeChannels = [primaryChannel, fallbackChannel, clientFallbackChannel, companyChannel].filter(Boolean);

        activeChannels.forEach(c => {
            const channelName = (c as any).name || 'private channel';
            console.log(`📡 [Echo] Binding listeners to channel: ${channelName}`);

            // ── Chat messages (all roles) ──
            ['.new-message', 'NewMessage', '.NewMessage'].forEach(evt => c.listen(evt, handleNewMessage));

            // ── Store order status update (User / Craftsman who placed the order) ──
            if (userType === "user" || userType === "craftsman") {
                ['.store-order.updated', 'store-order.updated', 'StoreOrderStatusNotification'].forEach(evt => c.listen(evt, handleStoreOrderStatusUpdated));
                ['.service-request.updated', 'ServiceRequestUpdated', '.service-status-updated'].forEach(evt => c.listen(evt, handleRequestUpdated));
            }

            // ── Craftsman-specific events ──
            if (userType === "craftsman") {
                ['.service-request.created', 'ServiceRequestCreated', '.new-service-request'].forEach(evt => c.listen(evt, handleRequestCreated));
                ['.new-review', 'NewReview'].forEach(evt => c.listen(evt, handleNewReview));
            }

            // ── Company: new store orders ──
            if (userType === "company") {
                // The backend broadcasts 'store-order.created' via broadcastAs()
                // It goes to: private-notifications.user.{company_id}
                [
                    '.store-order.created',     // ← This is what broadcastAs() returns (with dot prefix)
                    'store-order.created',       // without dot
                    'StoreOrderNotification',    // class-based name
                    'App\\Events\\StoreOrderNotification',
                ].forEach(evt => c.listen(evt, handleNewStoreOrder));
            }

            // ── Generic Laravel Notification fallback ──
            c.listen(".Illuminate\\Notifications\\Events\\BroadcastNotificationCreated", (e: any) => {
                console.log('🔔 [Echo] Generic Broadcast:', e);
                if (e.type?.includes('ServiceRequest')) {
                    if (userType === "craftsman") handleRequestCreated(e);
                    else handleRequestUpdated(e);
                } else if (e.type?.includes('StoreOrder')) {
                    if (userType === "company") handleNewStoreOrder(e);
                    else handleStoreOrderStatusUpdated(e);
                }
            });
        });

        return () => {
            console.log(`🔌 [Echo] Leaving channels for user: ${user.id}`);
            echo.leave(primaryChannelName);
            if (fallbackChannel) echo.leave(`notifications.craftsman.${user.id}`);
            if (clientFallbackChannel) echo.leave(`notifications.client.${user.id}`);
            if (companyChannel) echo.leave(`notifications.company.${user.id}`);
        };
    }, [user?.id, userType, addNotification]);

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