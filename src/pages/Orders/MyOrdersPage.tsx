import { useState, useEffect, useMemo } from "react";
import ReviewModal from "../../components/ui/ReviewModal/ReviewModal";
import { useNavigate, Link } from "react-router-dom";
import {
    getMyServiceRequests,
    getIncomingServiceRequests,
    updateServiceRequestStatus,
    completeServiceRequest,
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
        const fetchOrders = async () => {
            if (authLoading) return;

            if (!user) {
                setError("يجب تسجيل الدخول لعرض الطلبات");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                let result;
                if (isCraftsman) {
                    result = await getIncomingServiceRequests();
                } else {
                    result = await getMyServiceRequests();
                }

                const fetchedOrders = Array.isArray(result)
                    ? result
                    : result.data || result.orders || [];

                const finalOrders = Array.isArray(fetchedOrders) ? fetchedOrders : (fetchedOrders.data || []);

                setOrders(finalOrders);
                setError(null);
            } catch (err: any) {
                setError(err.message || "تعذر جلب قائمة الطلبات");
                toast.error("فشل تحميل الطلبات");
            } finally {
                setTimeout(() => setLoading(false), 500);
            }
        };

        fetchOrders();
    }, [user, isCraftsman, authLoading]);

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

    const handleStartChat = (order: any) => {
        const contactInfo: ChatContact = isCraftsman
            ? { id: order.user_id, name: order.name || "عميل", unread_count: 0 }
            : { id: order.craftsman_id, name: order.craftsman?.name || "صنايعي", unread_count: 0 };

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
                            <span className="orders-info-value">
                                {order.governorate || order.city || order.province || order.address || "غير محدد"}
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
                            <span className="orders-info-value">كاش</span>
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
                        <div className="empty-state" style={{ borderColor: "#fee2e2" }}>
                            <p className="empty-text" style={{ color: "#ef4444" }}>{error}</p>
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