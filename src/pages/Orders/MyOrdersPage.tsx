import { useState, useEffect, useMemo } from "react";
import ReviewModal from "../../components/ui/ReviewModal/ReviewModal";
import { useNavigate } from "react-router-dom";
import {
    getMyServiceRequests,
    getIncomingServiceRequests,
    updateServiceRequestStatus,
    deleteServiceRequest,
} from "../../Api/serviceRequest/serviceRequests.api";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../context/NotificationContext";
import { useUserChat } from "../../context/UserChatProvider";
import { useCraftsmanChat } from "../../context/CraftsmanChatProvider";
import type { ChatContact } from "../../context/UserChatProvider";

import { toast } from "react-toastify";
import {
    FaPhone,
    FaTrash,
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
    const [orderToDelete, setOrderToDelete] = useState<number | null>(null);
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

    const handleStatusUpdate = async (orderId: number, newStatus: "accepted" | "rejected" | "completed") => {
        const order = orders.find(o => o.id === orderId);
        const serviceName = order?.service?.name || order?.service_name || "خدمة صيانة";

        const confirmMsg =
            newStatus === "accepted" ? "هل أنت متأكد من قبول الطلب؟" :
                newStatus === "completed" ? "هل تم إتمام المهمة بالفعل؟" :
                    "هل أنت متأكد من رفض الطلب؟";
        if (!window.confirm(confirmMsg)) return;

        try {
            await updateServiceRequestStatus(orderId, newStatus);

            // Trigger Notification for the User
            addNotification({
                title:
                    newStatus === "accepted" ? "تم قبول طلبك ✅" :
                        newStatus === "completed" ? "اكتملت الخدمة ✨" :
                            "تم رفض الطلب ❌",
                message:
                    newStatus === "accepted" ? `تم قبول طلبك لخدمة ${serviceName} بنجاح.` :
                        newStatus === "completed" ? `تم إتمام خدمة ${serviceName}، يمكنك الآن تقييم الصنايعي.` :
                            `نعتذر، تم رفض طلبك لخدمة ${serviceName}.`,
                recipientId: order.user_id,
                recipientType: "user",
                type: "order_status",
                orderId: orderId,
            });

            toast.success(
                newStatus === "accepted" ? "تم قبول الطلب بنجاح ✅" :
                    newStatus === "completed" ? "تم إتمام المهمة بنجاح ✨" :
                        "تم رفض الطلب ❌"
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

    const handleDeleteRequest = (orderId: number) => {
        setOrderToDelete(orderId);
    };

    const confirmDelete = async () => {
        if (!orderToDelete) return;

        try {
            await deleteServiceRequest(orderToDelete);
            toast.success("تم حذف الطلب بنجاح ✅");
            setOrders((prev) => prev.filter((order) => order.id !== orderToDelete));
        } catch (err) {
            toast.error("فشل حذف الطلب");
        } finally {
            setOrderToDelete(null);
        }
    };

    const cancelDelete = () => {
        setOrderToDelete(null);
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
            <div className="order-card">
                <button
                    onClick={() => handleDeleteRequest(order.id)}
                    className="trash-btn"
                    title="حذف الطلب"
                >
                    <FaTrash size={16} />
                </button>

                {/* Header: Service Name & Base Info */}
                <div className="card-header">
                    <div className="service-name-wrapper">
                        <h3 className="service-name">{serviceName}</h3>
                        <span className="order-date-label">
                            رقم الطلب: #{order.id}
                        </span>
                    </div>
                </div>

                {/* Body: Details & Status Side */}
                <div className="card-body">
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label"><FaMapMarkerAlt /> الموقع</span>
                            <span className="info-value">
                                {order.governorate || order.city || order.province || order.address || "غير محدد"}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label"><FaClock /> التوقيت المطلوب</span>
                            <span className="info-value">
                                {order.date || "اليوم"} ، الساعة {order.time || "غير محدد"}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label"><FaCalendarAlt /> تاريخ الطلب</span>
                            <span className="info-value">
                                {order.created_at ? formatArabicDate(order.created_at) : "غير متاح"}
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label"><FaWallet /> التكلفة المتوقعة</span>
                            <span className="info-value">
                                {order.price
                                    ? `${order.price} جنيه`
                                    : (order.craftsman?.price_range
                                        ? `${order.craftsman.price_range} جنيه`
                                        : (order.craftsman?.price ? `${order.craftsman.price} جنيه` : "غير محدد")
                                    )
                                }
                            </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label"><FaWallet /> طريقة الدفع</span>
                            <span className="info-value">كاش</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label"><FaPhone /> رقم التواصل</span>
                            <div className="phone-container">
                                {(() => {
                                    // If user is Craftsman -> Show Client Phone (order.phone)
                                    // If user is Regular User -> Show Craftsman Phone (order.craftsman?.phone)
                                    const phoneToShow = isCraftsman
                                        ? order.phone
                                        : (order.craftsman?.phone || order.phone);

                                    return (
                                        <a href={`tel:${phoneToShow}`} className="phone-link">
                                            <span className="phone-icon"><FaPhone /></span>
                                            {phoneToShow || "غير متاح"}
                                        </a>
                                    );
                                })()}
                            </div>
                        </div>
                        <div className="info-item">
                            <span className="info-label"><FaUser /> {isCraftsman ? "العميل" : "الصنايعي"}</span>
                            <span className="info-value">
                                {isCraftsman ? (order.name || "عميل") : (order.craftsman?.name || "صنايعي")}
                            </span>
                        </div>
                    </div>

                    <div className="order-side">
                        <div className={`order-status ${config.className}`}>
                            {config.label}
                        </div>

                        <div className="card-actions">
                            {order.status === "accepted" && (
                                <div className="flex flex-col gap-2 w-full">
                                    <button onClick={() => handleStartChat(order)} className="btn-premium btn-chat">
                                        <FaEnvelope /> دردشة
                                    </button>
                                    {isCraftsman && (
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, "completed")}
                                            className="btn-premium btn-accept"
                                            style={{ background: "#22c55e" }}
                                        >
                                            إتمام المهمة
                                        </button>
                                    )}
                                </div>
                            )}

                            {!isCraftsman && order.status === "completed" && (
                                <button
                                    onClick={() => {
                                        setSelectedOrder({
                                            id: order.id,
                                            craftsmanId: order.craftsman_id || order.craftsman?.id,
                                            craftsmanName: order.craftsman?.name || "الصنايعي"
                                        });
                                        setShowReviewModal(true);
                                    }}
                                    className="btn-premium"
                                    style={{ background: "#f97316" }}
                                >
                                    تقييم الخدمة
                                </button>
                            )}

                            {isCraftsman && order.status === "pending" && (
                                <>
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
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section className="orders-section">
            <div className="orders-container">
                <h1 className="orders-title">متابعة الطلبات</h1>

                <div className="tabs-container2">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`tab-btn ${activeTab === "all" ? "active" : ""}`}
                    >
                        الكل ({stats.all})
                    </button>
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`tab-btn ${activeTab === "pending" ? "active" : ""}`}
                    >
                        قيد الانتظار ({stats.pending})
                    </button>
                    <button
                        onClick={() => setActiveTab("accepted")}
                        className={`tab-btn ${activeTab === "accepted" ? "active" : ""}`}
                    >
                        المقبولة ({stats.accepted})
                    </button>
                    <button
                        onClick={() => setActiveTab("completed")}
                        className={`tab-btn ${activeTab === "completed" ? "active" : ""}`}
                    >
                        المكتملة ({stats.completed})
                    </button>
                    <button
                        onClick={() => setActiveTab("rejected")}
                        className={`tab-btn ${activeTab === "rejected" ? "active" : ""}`}
                    >
                        الملغاة ({stats.rejected})
                    </button>
                </div>

                <div className="orders-list">
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

            {/* Premium Delete Confirmation Popup */}
            {orderToDelete && (
                <div className="confirm-overlay" onClick={cancelDelete}>
                    <div className="confirm-box" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-icon">
                            <FaTrash />
                        </div>
                        <h4>تأكيد الحذف</h4>
                        <p>هل أنت متأكد من أنك تريد حذف هذا الطلب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.</p>
                        <div className="confirm-actions">
                            <button className="btn-confirm-delete" onClick={confirmDelete}>
                                حذف الطلب
                            </button>
                            <button className="btn-cancel-delete" onClick={cancelDelete}>
                                إلغاء
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'completed' } : o));
                    }}
                />
            )}
        </section>
    );
}

export default MyOrdersPage;