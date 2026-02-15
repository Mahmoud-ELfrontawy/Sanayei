import React, { useState, useEffect } from "react";
import StatCard from "../../../components/dashboard/StatCard/StatCard";
import { getMyServiceRequests } from "../../../Api/serviceRequest/getMyRequests.api";
import { FaArrowLeft, FaEnvelope, FaBriefcase, FaStar, FaUser, FaCommentDots } from "react-icons/fa";
import { Link } from "react-router-dom";
import DashboardSkeleton from "../DashboardSkeleton";
import { useUserChat } from "../../../context/UserChatProvider";
import ReviewModal from "../../../components/ui/ReviewModal/ReviewModal";
import "./Dashboard.css";

const UserDashboard: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const { contacts } = useUserChat();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await getMyServiceRequests();
                let ordersArray = [];
                if (Array.isArray(res)) {
                    ordersArray = res;
                } else if (res && typeof res === 'object') {
                    const d = (res as any);
                    ordersArray = Array.isArray(d.data) ? d.data : [];
                    if (ordersArray.length === 0 && d.data?.data && Array.isArray(d.data.data)) {
                        ordersArray = d.data.data;
                    }
                }
                setOrders(ordersArray);
                // ✅ Sync to localStorage for consistency
                localStorage.setItem("myOrders", JSON.stringify(ordersArray));
            } catch (err) {
                const stored = localStorage.getItem("myOrders");
                if (stored) setOrders(JSON.parse(stored));
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Get unique craftsmen from unique email or name
    const activeCraftsmen = Array.from(new Set(orders.map(o => o.industrial_name)))
        .map(name => orders.find(o => o.industrial_name === name))
        .filter(Boolean)
        .slice(0, 3);

    return (
        <div className="dashboard-page">
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
                        لوحة تحكم المستخدم
                    </div>

                    <h1>نظرة عامة على نشاطك</h1>
                    <p>تابع طلباتك، رسائلك، وإحصائيات استخدامك للمنصة بكل سهولة.</p>
                </div>
            </header>

            {loading ? (
                <DashboardSkeleton withSidebar={false} />
            ) : (
                <>

                    <div className="stats-grid">
                        <StatCard
                            title="إجمالي الرسائل"
                            value={contacts.length.toString()}
                            change="12%"
                            isPositive={true}
                            icon={<FaEnvelope size={20} />}
                        />
                        <StatCard
                            title="الطلبات النشطة"
                            value={orders.filter(o => o.status === 'pending').length.toString()}
                            icon={<FaBriefcase size={20} />}
                        />
                        <StatCard
                            title="التقييمات"
                            value="4.8"
                            icon={<FaStar size={20} />}
                        />
                    </div>

                    <section className="dashboard-section recent-craftsmen">
                        <div className="section-header">
                            <h2>صنايعية تعاملت معهم</h2>
                            <Link to="/orders" className="view-all">
                                عرض الكل <FaArrowLeft size={14} />
                            </Link>
                        </div>

                        <div className="craftsmen-list">
                            {activeCraftsmen.length > 0 ? (
                                activeCraftsmen.map((c, idx) => (
                                    <div key={idx} className="craftsman-mini-card">
                                        <div className="c-info">
                                            <div className="c-avatar">
                                                <FaUser size={20} />
                                            </div>
                                            <div className="c-meta">
                                                <Link to={`/craftsman/${c.craftsman_id || c.industrial_type}`} className="craftsman-profile-link">
                                                    <h4>{c.craftsman?.name || c.industrial_name || c.craftsman_id || "صنايعي"}</h4>
                                                </Link>
                                                <div className="c-status-row">
                                                    <span>{c.service?.name || c.service_name || c.service_type || "خدمة"}</span>
                                                    <span className={`status-badge ${c.status}`}>
                                                        {c.status === "pending" && "قيد الانتظار"}
                                                        {c.status === "accepted" && "مقبول"}
                                                        {c.status === "rejected" && "مرفوض"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="c-actions">
                                            {c.status === "completed" ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder({
                                                            id: c.id,
                                                            craftsmanId: c.craftsman_id || c.craftsman?.id,
                                                            craftsmanName: c.craftsman?.name || c.industrial_name
                                                        });
                                                        setShowReviewModal(true);
                                                    }}
                                                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                                                >
                                                    <FaStar size={12} color="white" />
                                                    تقييم
                                                </button>
                                            ) : (
                                                <Link
                                                    to="/dashboard/messages"
                                                    state={{ contact: { id: c.craftsman_id || c.industrial_type, name: c.craftsman?.name || c.industrial_name, type: 'craftsman' } }}
                                                    className="chat-btn-mini"
                                                >
                                                    <FaCommentDots size={16} />
                                                    تواصل
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data-premium">
                                    <p>لم تتعامل مع صنايعية بعد</p>
                                </div>
                            )}
                        </div>
                    </section>

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
                                // Update local state to show rated? 
                                // For now, just re-fetching or updating the order status locally works
                                setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, rated: true } : o));
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default UserDashboard;