import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardSkeleton from "../DashboardSkeleton";
import StatCardComp from "../../../components/dashboard/StatCard/StatCard";
import {
    FaDollarSign,
    FaCheckCircle,
    FaUsers,
    FaClock,
    FaArrowLeft,
    FaEnvelope,
    FaUser,
    FaCommentDots,
} from "react-icons/fa";

import { useAuth } from "../../../hooks/useAuth";
import { useNotifications } from "../../../context/NotificationContext";
import { useCraftsmanChat } from "../../../context/CraftsmanChatProvider"; // ✅ بدل ChatContext
import { toast } from "react-toastify";

import {
    getIncomingServiceRequests,
    updateServiceRequestStatus,
} from "../../../Api/serviceRequest/serviceRequests.api";

import "../User/Dashboard.css";
import "./CraftsmanDashboard.css";

const CraftsmanDashboard: React.FC = () => {
    const { user } = useAuth();
    const isApproved = user?.status === 'approved';
    const isBlocked = user?.status === 'rejected';
    const navigate = useNavigate();

    // ✅ الشات الخاص بالصنايعي
    const { setActiveChat, contacts } = useCraftsmanChat();

    const { addNotification, markAllAsRead } = useNotifications();

    const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    /* ================= LOAD DATA ================= */

    useEffect(() => {
        markAllAsRead();

        const loadRequests = async () => {
            try {
                setLoading(true);
                const response = await getIncomingServiceRequests();

                let requests: any[] = [];

                if (Array.isArray(response)) {
                    requests = response;
                } else if (response && typeof response === "object") {
                    const d = response as any;
                    requests = Array.isArray(d.data) ? d.data : [];

                    if (requests.length === 0 && d.data?.data && Array.isArray(d.data.data)) {
                        requests = d.data.data;
                    }
                }

                // أول 5 طلبات فقط
                setIncomingRequests(requests.slice(0, 5));
            } catch (err) {
                console.error("Failed to load incoming requests", err);
            } finally {
                setLoading(false);
            }
        };

        loadRequests();
    }, [markAllAsRead]);

    /* ================= ACTIONS ================= */

    const handleAction = async (orderId: number, status: "accepted" | "rejected") => {
        if (isBlocked) {
            toast.error("حسابك محظور من قبل الإدارة. يرجى التواصل مع الدعم الفني.");
            return;
        }

        try {
            await updateServiceRequestStatus(orderId, status);

            setIncomingRequests((prev) =>
                prev.map((o) => (o.id === orderId ? { ...o, status } : o))
            );

            const statusText = status === "accepted" ? "تم قبول الطلب ✅" : "تم رفض الطلب ❌";
            toast.success(statusText);

            addNotification({
                title: statusText,
                message:
                    status === "accepted"
                        ? `لقد وافق الصنايعي ${user?.name || ""} على طلب الخدمة`
                        : "نعتذر، تم رفض الطلب حالياً",
                type: "order_status",
                orderId: orderId,
                recipientId: 0,
                recipientType: "user",
            });
        } catch (err) {
            console.error("Failed to perform order action", err);
            toast.error("حدث خطأ أثناء تحديث حالة الطلب");
        }
    };

    const handleStartChat = (order: any) => {
        setActiveChat({
            id: order.user_id,
            name: order.name || "عميل",
            unread_count: 0,
            avatar: order.avatar,
        });

        navigate("/dashboard/messages");
    };

    /* ================= UI ================= */

    return (
        <div className="dashboard-page bg-[#F8FAFC]">
            {/* Header */}
            {/* Header */}
            <header className="dashboard-header-premium" dir="rtl">
                <div className="header-blobs">
                    <div className="blob-1"></div>
                    <div className="blob-2"></div>
                </div>

                <div className="header-content">
                    <div className="status-badge-premium">
                        <span className="pulse-indicator">
                            <span className="pulse-ring"></span>
                            <span className="pulse-dot"></span>
                        </span>
                        لوحة إدارة أعمالك
                    </div>

                    <h1>لوحة تحكم الصنايعي</h1>
                    <p>
                        أهلاً بك، {user?.name || "صنايعي"}! تابع إحصائيات عملك وطلباتك الجديدة.
                    </p>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
                {isBlocked && (
                    <div className="approval-warning-banner blocked" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaClock />
                        <span>حسابك محظور من قبل الإدارة. لا يمكنك قبول طلبات جديدة أو التواصل مع العملاء حتى يتم حل المشكلة. <Link to="/contact" style={{ textDecoration: 'underline' }}>تواصل مع الدعم</Link></span>
                    </div>
                )}

                {!isApproved && !isBlocked && (
                    <div className="approval-warning-banner" style={{ background: '#fffbeb', border: '1px solid #fef3c7', color: '#92400e', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaClock />
                        <span>حسابك قيد المراجعة حالياً. سيتم تفعيل كامل الصلاحيات فور اعتماد حسابك من قبل الإدارة.</span>
                    </div>
                )}

                {/* Stats */}
                <div className="stats-grid mb-12">
                    <StatCardComp title="إجمالي الأرباح" value="$8,670" change="24%" isPositive icon={<FaDollarSign size={20} />} />
                    <StatCardComp
                        title="الطلبات المكتملة"
                        value={incomingRequests.filter(r => r.status === 'accepted').length.toString()}
                        icon={<FaCheckCircle size={20} />}
                    />
                    <StatCardComp
                        title="العملاء الجدد"
                        value={new Set(incomingRequests.map(r => r.user_id)).size.toString()}
                        change="5%"
                        isPositive
                        icon={<FaUsers size={20} />}
                    />
                    <StatCardComp
                        title="إجمالي الرسائل"
                        value={contacts.length.toString()}
                        icon={<FaEnvelope size={20} />}
                    />
                </div>

                {/* Requests */}
                <section className="dashboard-section incoming-requests-section">
                    <div className="section-header">
                        <h2>طلباتي الأخيرة</h2>
                        <button
                            onClick={() => navigate("/orders")}
                            className="view-all"
                        >
                            عرض الكل <FaArrowLeft size={14} />
                        </button>
                    </div>

                    {loading ? (
                        <DashboardSkeleton withSidebar={false} />
                    ) : incomingRequests.length > 0 ? (
                        <div className="requests-list">
                            {incomingRequests.map((req) => (
                                <div key={req.id} className="order-card-premium">
                                    <div className="order-info-area">
                                        <div className="order-icon-box">
                                            <FaClock size={22} />
                                        </div>

                                        <div className="order-details">
                                            <h4>{req.service?.name || req.service_name || req.service_type || "خدمة صيانة"}</h4>
                                            <p dir="rtl">
                                                <span className="client-label">العميل:</span> {req.name || "مجهول"}
                                                <span className="location-divider">|</span>
                                                {req.province || req.city || "غير محدد"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="order-actions-area">
                                        {/* Status Badge */}
                                        <span className={`status-badge-mini ${req.status}`}>
                                            {req.status === "pending" && "قيد الانتظار"}
                                            {req.status === "accepted" && "مقبول ✅"}
                                            {req.status === "completed" && "مكتملة ✨"}
                                            {req.status === "rejected" && "مرفوض ❌"}
                                        </span>

                                        <div className="order-card-buttons">
                                            {req.status === "pending" && (
                                                <>
                                                    <button
                                                        className="btn-accept-mini"
                                                        onClick={() => handleAction(req.id, "accepted")}
                                                    >
                                                        قـبول
                                                    </button>
                                                    <button
                                                        className="btn-reject-mini"
                                                        onClick={() => handleAction(req.id, "rejected")}
                                                    >
                                                        رفـض
                                                    </button>
                                                </>
                                            )}

                                            {req.status === "accepted" && (
                                                <button
                                                    onClick={() => handleStartChat(req)}
                                                    className="btn-chat-mini"
                                                >
                                                    <FaEnvelope size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-data-premium">
                            <p>لا توجد طلبات جديدة حالياً</p>
                        </div>
                    )}
                </section>

                {/* Customers Interactions */}
                <section className="dashboard-section recent-craftsmen mt-12 mb-12">
                    <div className="section-header">
                        <h2>مستخدمين تعاملت معهم</h2>
                        <Link to="/dashboard/messages" className="view-all">
                            عرض الكل <FaArrowLeft size={14} />
                        </Link>
                    </div>

                    <div className="craftsmen-list">
                        {(() => {
                            const uniqueUsers = Array.from(new Set(incomingRequests.map(r => r.user_id)))
                                .map(id => incomingRequests.find(r => r.user_id === id))
                                .filter(Boolean)
                                .slice(0, 3);

                            return uniqueUsers.length > 0 ? (
                                uniqueUsers.map((u, idx) => (
                                    <div key={idx} className="craftsman-mini-card">
                                        <div className="c-info">
                                            <div className="c-avatar text-gray-400">
                                                <FaUser size={20} />
                                            </div>
                                            <div className="c-meta">
                                                <h4>{u.name || "عميل"}</h4>
                                                <div className="c-status-row">
                                                    <span>{u.service_name || "طلب خدمة"}</span>
                                                    <span className={`status-badge ${u.status}`}>
                                                        {u.status === "pending" && "قيد الانتظار"}
                                                        {u.status === "accepted" && "مقبول"}
                                                        {u.status === "rejected" && "مرفوض"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="c-actions">
                                            <button
                                                onClick={() => handleStartChat(u)}
                                                className="chat-btn-mini"
                                            >
                                                <FaCommentDots size={16} />
                                                تواصل
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data-premium">
                                    <p>لم تتعامل مع عملاء بعد</p>
                                </div>
                            );
                        })()}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CraftsmanDashboard;