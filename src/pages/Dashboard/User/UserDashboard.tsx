import React, { useState, useEffect } from "react";
import StatCard from "../../../components/dashboard/StatCard/StatCard";
import { getMyServiceRequests } from "../../../Api/serviceRequest/getMyRequests.api";
import { Mail, Briefcase, Star, User, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

const UserDashboard: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
                console.warn("Dashboard sync failed - using local data:", err);
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
            <header className="dashboard-header">
                <h1>لوحة تحكم المستخدم</h1>
                <p>نظرة عامة على نشاطك وطلباتك</p>
            </header>

            {loading ? (
                <div className="dashboard-loading">جاري تحميل البيانات...</div>
            ) : (
                <>

                    <div className="stats-grid">
                        <StatCard
                            title="إجمالي الرسائل"
                            value="124"
                            change="12%"
                            isPositive={true}
                            icon={<Mail size={20} />}
                        />
                        <StatCard
                            title="الطلبات النشطة"
                            value={orders.filter(o => o.status === 'pending').length.toString()}
                            icon={<Briefcase size={20} />}
                        />
                        <StatCard
                            title="التقييمات"
                            value="4.8"
                            icon={<Star size={20} />}
                        />
                    </div>

                    <section className="dashboard-section recent-craftsmen">
                        <div className="section-header">
                            <h2>صنايعية تعاملت معهم</h2>
                            <Link to="/orders" className="view-all">عرض الكل</Link>
                        </div>

                        <div className="craftsmen-list">
                            {activeCraftsmen.length > 0 ? (
                                activeCraftsmen.map((c, idx) => (
                                    <div key={idx} className="craftsman-mini-card">
                                        <div className="c-info">
                                            <div className="c-avatar">
                                                <User size={20} />
                                            </div>
                                            <div className="c-meta">
                                                <h4>{c.craftsman?.name || c.industrial_name || c.craftsman_id || "صنايعي"}</h4>
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
                                            <Link
                                                to="/dashboard/messages"
                                                state={{ contact: { id: c.craftsman_id || c.industrial_type, name: c.craftsman?.name || c.industrial_name, type: 'craftsman' } }}
                                                className="chat-btn-mini"
                                            >
                                                <MessageCircle size={16} />
                                                تواصل
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">لم تقم بطلب خدمات بعد</p>
                            )}
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default UserDashboard;
