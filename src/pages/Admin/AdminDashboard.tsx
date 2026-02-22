import { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../Api/chat.api';
import { FaUsers, FaHardHat, FaRegFileAlt, FaChartLine, FaDollarSign } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import './AdminDashboard.css';

interface DashboardStats {
    total_users: number;
    total_craftsmen: number;
    total_requests: number;
    pending_craftsmen: number;
}

const AdminDashboard = () => {
    const { token } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/admin/dashboard`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Accept": "application/json"
                    }
                });
                setStats(response.data.stats);
            } catch (err) {
                setError("فشل تحميل الإحصائيات - جاري عرض بيانات تجريبية");
                // Mock Data Fallback
                setStats({
                    total_users: 1250,
                    total_craftsmen: 85,
                    total_requests: 340,
                    pending_craftsmen: 12
                });
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchStats();
        }
    }, [token]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard-container">
            <header className="dashboard-header">
                <h1 className="dashboard-title">لوحة التحكم</h1>
                <p className="dashboard-subtitle">نظرة عامة على أداء المنصة</p>
            </header>

            {error && (
                <div className="error-container">
                    ⚠️ {error} (مشكلة 500 في السيرفر)
                </div>
            )}

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-content">
                        <span className="stat-value">{stats?.total_users}</span>
                        <span className="stat-label">إجمالي المستخدمين</span>
                    </div>
                    <div className="stat-icon-wrapper users">
                        <FaUsers size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <span className="stat-value">{stats?.total_craftsmen}</span>
                        <span className="stat-label">إجمالي الصنايعية</span>
                    </div>
                    <div className="stat-icon-wrapper craftsmen">
                        <FaHardHat size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <span className="stat-value">{stats?.total_requests}</span>
                        <span className="stat-label">إجمالي الطلبات</span>
                    </div>
                    <div className="stat-icon-wrapper requests">
                        <FaRegFileAlt size={24} />
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-content">
                        <span className="stat-value">{stats?.pending_craftsmen}</span>
                        <span className="stat-label">صنايعية بانتظار الموافقة</span>
                    </div>
                    <div className="stat-icon-wrapper revenue">
                        <FaDollarSign size={24} />
                    </div>
                </div>
            </div>

            <div className="dashboard-sections">
                <div className="section-card">
                    <div className="section-header">
                        <h2 className="section-title">نشاطات حديثة</h2>
                        <a href="/admin/activity" className="view-all-btn">عرض الكل</a>
                    </div>
                    <ul className="activity-list">
                        <li className="activity-item">
                            <div className="activity-icon"><FaChartLine size={18} /></div>
                            <div className="activity-details">
                                <p className="activity-text">تم تسجيل صنايعي جديد: أحمد محمد</p>
                                <span className="activity-time">منذ 5 دقائق</span>
                            </div>
                        </li>
                        <li className="activity-item">
                            <div className="activity-icon"><FaChartLine size={18} /></div>
                            <div className="activity-details">
                                <p className="activity-text">طلب خدمة جديد #2034</p>
                                <span className="activity-time">منذ 15 دقيقة</span>
                            </div>
                        </li>
                    </ul>
                </div>

                <div className="section-card">
                    <div className="section-header">
                        <h2 className="section-title">إجراءات سريعة</h2>
                    </div>
                    {/* Quick Actions Buttons */}
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        <button className="btn-primary" style={{ padding: '0.75rem', borderRadius: '8px', background: '#3182ce', color: 'white', border: 'none', cursor: 'pointer' }}>مراجعة الصنايعية الجدد ({stats?.pending_craftsmen})</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;