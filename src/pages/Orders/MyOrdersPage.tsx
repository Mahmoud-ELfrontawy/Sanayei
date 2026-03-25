import React, { useState, useEffect, useMemo } from "react";
import ReviewModal from "../../components/ui/ReviewModal/ReviewModal";
import OrderTrackingMap from "../../components/common/OrderTrackingMap/OrderTrackingMap";
import { useNavigate, Link } from "react-router-dom";
import {
    getMyServiceRequests,
    getIncomingServiceRequests,
    updateServiceRequestStatus,
    completeServiceRequest,
    cancelServiceRequest,
    // deleteServiceRequest,
} from "../../Api/serviceRequest/serviceRequests.api";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../context/NotificationContext";
import { useUserChat } from "../../context/UserChatProvider";
import { useCraftsmanChat } from "../../context/CraftsmanChatProvider";
import type { ChatContact } from "../../context/UserChatProvider";

import { toast } from "react-toastify";
import {
    FaEnvelope,
    FaMapMarkerAlt,
    FaClock,
    FaCalendarAlt,
    FaWallet,
    FaMoneyBillWave,
    FaUser
} from "react-icons/fa";
import { formatArabicDate } from "../../utils/dateFormatter";
import "./MyOrders.css";

// ==========================================
// Shimmer/Skeleton Loading Component
// ==========================================
const OrderSkeleton = () => (
    <div className="loading-skeleton"></div>
);

// ==========================================
// Main Component
// ==========================================
function MyOrdersPage() {
    const { user, loading: authLoading } = useAuth();
    const { addNotification } = useNotifications();
    const userType = localStorage.getItem("userType");
    const isCraftsman = userType === "craftsman";

    const userChat = useUserChat();
    const craftsmanChat = useCraftsmanChat();

    const setActiveChat = isCraftsman
        ? craftsmanChat.setActiveChat
        : userChat.setActiveChat;

    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("all");
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);


    useEffect(() => {
        let isMounted = true;
        const fetchOrders = async (showLoading = true) => {
            if (authLoading) return;

            if (!user) {
                if (isMounted) setError("يجب تسجيل الدخول لعرض الطلبات");
                if (isMounted && showLoading) setLoading(false);
                return;
            }

            try {
                if (showLoading && isMounted) setLoading(true);
                let result;
                
                // التأكد من جلب الطلبات الواردة لو كان الحساب "صنايعي"
                if (userType === "craftsman") {
                    result = await getIncomingServiceRequests();
                } else {
                    result = await getMyServiceRequests();
                }

                if (!isMounted) return;

                const fetchedOrders = Array.isArray(result)
                    ? result
                    : result.data || result.orders || [];

                const finalOrders = Array.isArray(fetchedOrders) ? fetchedOrders : (fetchedOrders.data || []);

                // ✅ Merge payment_method from localStorage since API doesn't return it
                const paymentMap: Record<string, string> = JSON.parse(
                    localStorage.getItem("orderPaymentMethods") || "{}"
                );
                const ordersWithPayment = finalOrders.map((o: any) => ({
                    ...o,
                    payment_method: o.payment_method || paymentMap[String(o.id)] || "cash",
                }));

                setOrders(ordersWithPayment);
                setError(null);
            } catch (err: any) {
                if (isMounted && showLoading) {
                    setError(err.message || "تعذر جلب قائمة الطلبات");
                    toast.error("فشل تحميل الطلبات");
                }
            } finally {
                if (isMounted && showLoading) {
                    setTimeout(() => {
                        if (isMounted) setLoading(false);
                    }, 500);
                }
            }
        };

        fetchOrders(true);

        // 🔄 Background refresh every 20s (reduced from 30s)
        const intervalId = setInterval(() => {
            fetchOrders(false);
        }, 20_000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [user, isCraftsman, authLoading]);

    // ⚡ Instant refresh when Echo delivers a status change notification
    const { userNotifications } = useNotifications();
    const lastNotifRef = React.useRef<string | null>(null);
    useEffect(() => {
        const latest = userNotifications.find(
            n => n.type === "order_status" || n.type === "order_request"
        );
        if (latest && latest.id !== lastNotifRef.current) {
            lastNotifRef.current = latest.id;
            // Silent re-fetch without showing skeleton
            (async () => {
                try {
                    const result = isCraftsman
                        ? await getIncomingServiceRequests()
                        : await getMyServiceRequests();
                    const raw = Array.isArray(result) ? result : result.data || result.orders || [];
                    const final = Array.isArray(raw) ? raw : raw.data || [];
                    if (final.length > 0) setOrders(final);
                } catch { /* silent */ }
            })();
        }
    }, [userNotifications, isCraftsman]);

    // للصنايعي - قبول أو رفض الطلب فقط
    const handleStatusUpdate = async (orderId: number, newStatus: "accepted" | "rejected") => {
        const order = orders.find(o => o.id === orderId);
        const serviceName = order?.service?.name || order?.service_name || "خدمة صيانة";

        try {
            await updateServiceRequestStatus(orderId, newStatus);

            // Trigger Notification for the User
            addNotification({
                title: newStatus === "accepted" ? "تم قبول طلبك ✅" : "تم رفض الطلب ❌",
                message:
                    newStatus === "accepted"
                        ? `تم قبول طلبك لخدمة ${serviceName} بنجاح.`
                        : `نعتذر، تم رفض طلبك لخدمة ${serviceName}.`,
                recipientId: order.user_id,
                recipientType: "user",
                type: "order_status",
                orderId: orderId,
                variant: newStatus === "rejected" ? "error" : "success",
            });

            toast.success(
                newStatus === "accepted" ? "تم قبول الطلب بنجاح ✅" : "تم رفض الطلب ❌"
            );

            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                )
            );
        } catch (err) {
            toast.error("فشل تحديث حالة الطلب");
        }
    };

    // لليوزر - تحديد اكتمال الخدمة
    const handleCompleteService = async (orderId: number) => {
        try {
            console.log('🚀 [Complete Service] Attempting to complete order:', orderId);

            const response = await completeServiceRequest(orderId);

            console.log('✅ [Complete Service] Response:', response);
            console.log('📊 [Complete Service] Returned data:', response?.data);

            toast.success("تم تحديد الخدمة كمكتملة بنجاح ✨");

            // Update user_confirmation instead of status
            setOrders((prev) => {
                const updated = prev.map((order) =>
                    order.id === orderId ? { ...order, user_confirmation: 'confirmed' } : order
                );
                console.log('🔄 [Complete Service] Updated orders:', updated.find(o => o.id === orderId));
                return updated;
            });
        } catch (err: any) {
            console.error('❌ [Complete Service] Error:', err);
            console.error('❌ [Complete Service] Error response:', err?.response?.data);
            toast.error("فشل تحديد اكتمال الخدمة");
        }
    };

    const handleCancelRequest = async (orderId: number) => {
        if (!window.confirm("هل أنت متأكد من إلغاء هذا الطلب؟")) return;

        try {
            await cancelServiceRequest(orderId);
            toast.success("تم إلغاء الطلب بنجاح ✅");

            // Updating local state to reflect cancellation (setting status to rejected or removing)
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId ? { ...order, status: 'rejected' } : order
                )
            );
        } catch (err: any) {
            toast.error(err.message || "فشل إلغاء الطلب");
        }
    };

    const handleStartChat = (order: any) => {
        let recipientId = null;
        let recipientType = "user";

        if (isCraftsman) {
            // Requester can be a Company, another Craftsman, or a User
            if (order.company_id || order.company?.id) {
                recipientId = order.company_id || order.company?.id;
                recipientType = "company";
            } else if (order.requester_craftsman_id || order.requester_craftsman?.id) {
                recipientId = order.requester_craftsman_id || order.requester_craftsman?.id;
                recipientType = "craftsman";
            } else {
                recipientId = order.user_id || order.user?.id;
                recipientType = "user";
            }
        } else {
            // Requester (User/Company) chatting with Craftsman
            recipientId = order.craftsman_id || order.craftsman?.id;
            recipientType = "craftsman";
        }

        if (!recipientId) {
            toast.error("تعذر العثور على بيانات الطرف الآخر لبدء المحادثة");
            return;
        }

        const contactInfo: ChatContact = {
            id: Number(recipientId),
            name: isCraftsman ? (order.name || order.user?.name || "عميل") : (order.craftsman?.name || "صنايعي"),
            type: recipientType,
            unread_count: 0
        };

        setActiveChat(contactInfo);
        navigate("/dashboard/messages");
    };


    const filteredOrders = useMemo(() => {
        if (activeTab === "all") return orders;
        return orders.filter((order) => order.status === activeTab);
    }, [orders, activeTab]);

    const stats = useMemo(
        () => ({
            all: orders.length,
            pending: orders.filter((o) => o.status === "pending").length,
            accepted: orders.filter((o) => o.status === "accepted").length,
            completed: orders.filter((o) => o.status === "completed").length,
            rejected: orders.filter((o) => o.status === "rejected").length,
        }),
        [orders]
    );

    const OrderCard = ({ order }: { order: any }) => {
        const serviceName = order.service?.name || order.service_name || order.service_type || "خدمة صيانة";
        const statusConfig: any = {
            pending: { label: "قيد الانتظار", className: "pending" },
            accepted: { label: "تم القبول", className: "accepted" },
            completed: { label: "مكتملة ✨", className: "completed" },
            rejected: { label: "تم الرفض", className: "rejected" },
        };
        const config = statusConfig[order.status] || statusConfig.pending;

        return (
            <div className="orders-card-item">
                {/* <button
                    onClick={() => handleDeleteRequest(order.id)}
                    className="trash-btn"
                    title="حذف الطلب"
                >
                    <FaTrash size={16} />
                </button> */}

                {/* Header: Service Name & Base Info */}
                <div className="orders-card-header">
                    <div className="orders-service-name-wrapper">
                        <h3 className="orders-service-name">{serviceName}</h3>
                        <span className="orders-date-label">
                            رقم الطلب: #{order.id}
                        </span>
                    </div>
                    <div className={`orders-status-badge ${config.className}`}>
                        {config.label}
                    </div>
                </div>

                {/* Body: Details */}
                <div className="orders-card-body">
                    <div className="orders-info-grid">
                        <div className="orders-info-item">
                            <span className="orders-info-label"><FaMapMarkerAlt /> الموقع</span>
                            <span className="orders-info-value" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <span style={{ fontWeight: 600 }}>{order.province || order.governorate || order.city || "الموقع غير محدد"}</span>
                                {order.address && (
                                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', opacity: 0.9 }}>
                                        {order.address}
                                    </span>
                                )}
                            </span>
                        </div>
                        <div className="orders-info-item">
                            <span className="orders-info-label"><FaClock /> التوقيت المطلوب</span>
                            <span className="orders-info-value">
                                {order.date || "اليوم"} ، الساعة {order.time || "غير محدد"}
                            </span>
                        </div>
                        <div className="orders-info-item">
                            <span className="orders-info-label"><FaCalendarAlt /> تاريخ الطلب</span>
                            <span className="orders-info-value">
                                {order.created_at ? formatArabicDate(order.created_at) : "غير متاح"}
                            </span>
                        </div>
                        <div className="orders-info-item">
                            <span className="orders-info-label"><FaWallet /> التكلفة المتوقعة</span>
                            <span className="orders-info-value">
                                {order.price
                                    ? `${order.price} جنيه`
                                    : (order.craftsman?.price_range
                                        ? `${order.craftsman.price_range} جنيه`
                                        : (order.craftsman?.price ? `${order.craftsman.price} جنيه` : "غير محدد")
                                    )
                                }
                            </span>
                        </div>
                        <div className="orders-info-item">
                            <span className="orders-info-label"><FaWallet /> طريقة الدفع</span>
                            <span className={`orders-payment-badge ${order.payment_method === 'wallet' ? 'wallet' : 'cash'}`}>
                                {order.payment_method === 'wallet' ? (
                                    <><FaWallet /> محفظة التطبيق</>
                                ) : (
                                    <><FaMoneyBillWave /> دفع عند الزيارة</>
                                )}
                            </span>
                        </div>
                        <div className="orders-info-item">
                            <span className="orders-info-label"><FaUser /> {isCraftsman ? "العميل" : "الصنايعي"}</span>
                            {!isCraftsman && order.craftsman_id ? (
                                <Link
                                    to={`/craftsman/${order.craftsman_id}`}
                                    className="orders-craftsman-link"
                                >
                                    {order.craftsman?.name || "صنايعي"}
                                </Link>
                            ) : (
                                <span className="orders-info-value">
                                    {isCraftsman ? (order.name || "عميل") : (order.craftsman?.name || "صنايعي")}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tracking Map for Active Orders */}
                {order.status === "accepted" && (
                    <div style={{ padding: '0 1.5rem 1rem' }}>
                        <OrderTrackingMap
                            userLat={order.latitude ?? order.user?.latitude}
                            userLng={order.longitude ?? order.user?.longitude}
                            craftsmanLat={order.craftsman?.latitude}
                            craftsmanLng={order.craftsman?.longitude}
                            userName={order.name || order.user?.name}
                            craftsmanName={order.craftsman?.name}
                        />
                    </div>
                )}

                {/* Footer: Actions */}
                <div className="orders-card-footer">
                    <div className="orders-card-actions">
                        {order.status === "accepted" && (
                            <>
                                <button onClick={() => handleStartChat(order)} className="btn-premium btn-chat">
                                    <FaEnvelope /> دردشة
                                </button>
                                {!isCraftsman && order.user_confirmation !== 'confirmed' && (
                                    <button
                                        onClick={() => handleCompleteService(order.id)}
                                        className="btn-premium btn-complete"
                                    >
                                        تحديد الخدمة كمكتملة
                                    </button>
                                )}
                            </>
                        )}

                        {!isCraftsman && (order.status === "completed" || order.user_confirmation === "confirmed") && (
                            <button
                                onClick={() => {
                                    if (order.review || order.is_reviewed) {
                                        toast.info("تم تقييم هذه الخدمة مسبقاً 🌟");
                                        return;
                                    }
                                    setSelectedOrder({
                                        id: order.id,
                                        craftsmanId: order.craftsman_id || order.craftsman?.id,
                                        craftsmanName: order.craftsman?.name || "الصنايعي"
                                    });
                                    setShowReviewModal(true);
                                }}
                                className="btn-premium btn-rate"
                            >
                                تقييم الخدمة
                            </button>
                        )}

                        {isCraftsman && order.status === "pending" && (
                            <div className="status-pending-actions">
                                <button
                                    onClick={() => handleStatusUpdate(order.id, "accepted")}
                                    className="btn-premium btn-accept"
                                >
                                    قبول الطلب
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(order.id, "rejected")}
                                    className="btn-premium btn-reject"
                                >
                                    رفض
                                </button>
                            </div>
                        )}

                        {!isCraftsman && order.status === "pending" && (
                            <button
                                onClick={() => handleCancelRequest(order.id)}
                                className="btn-premium btn-cancel"
                            >
                                إلغاء الطلب
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="orders-page-section">
            <div className="orders-page-container">
                <h1 className="orders-page-title">متابعة الطلبات</h1>

                <div className="orders-tabs-container">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`orders-tab-btn ${activeTab === "all" ? "active" : ""}`}
                    >
                        الكل ({stats.all})
                    </button>
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`orders-tab-btn ${activeTab === "pending" ? "active" : ""}`}
                    >
                        قيد الانتظار ({stats.pending})
                    </button>
                    <button
                        onClick={() => setActiveTab("accepted")}
                        className={`orders-tab-btn ${activeTab === "accepted" ? "active" : ""}`}
                    >
                        المقبولة ({stats.accepted})
                    </button>
                    <button
                        onClick={() => setActiveTab("completed")}
                        className={`orders-tab-btn ${activeTab === "completed" ? "active" : ""}`}
                    >
                        المكتملة ({stats.completed})
                    </button>
                    <button
                        onClick={() => setActiveTab("rejected")}
                        className={`orders-tab-btn ${activeTab === "rejected" ? "active" : ""}`}
                    >
                        الملغاة ({stats.rejected})
                    </button>
                </div>

                <div className="orders-page-list">
                    {loading ? (
                        <>
                            <OrderSkeleton />
                            <OrderSkeleton />
                            <OrderSkeleton />
                        </>
                    ) : error ? (
                        <div className="empty-state" style={{ borderColor: "var(--error-light)" }}>
                            <p className="empty-text" style={{ color: "var(--color-error)" }}>{error}</p>
                            <div style={{ marginTop: "20px" }}>
                                <button onClick={() => window.location.reload()} className="btn-premium btn-accept" style={{ width: "auto", display: "inline-flex" }}>تحميل مرة أخرى</button>
                            </div>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="empty-state">
                            <p className="empty-text">لا توجد طلبات هنا بعد</p>
                        </div>
                    ) : (
                        filteredOrders.map((order, index) => (
                            <OrderCard key={order.id || index} order={order} />
                        ))
                    )}
                </div>
            </div>

            {selectedOrder && (
                <ReviewModal
                    isOpen={showReviewModal}
                    onClose={() => {
                        setShowReviewModal(false);
                        setSelectedOrder(null);
                    }}
                    orderId={selectedOrder.id}
                    craftsmanId={selectedOrder.craftsmanId}
                    craftsmanName={selectedOrder.craftsmanName}
                    onSuccess={() => {
                        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, user_confirmation: 'confirmed', is_reviewed: true } : o));
                    }}
                />
            )}
        </section>
    );
}

export default MyOrdersPage;
