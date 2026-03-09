import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaHardHat, FaRegFileAlt, FaDollarSign, FaBell, FaUser, FaTools, FaMapMarkerAlt, FaTags, FaCommentAlt, FaBoxOpen, FaStar, FaCircle, FaFileAlt, FaMapMarkedAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { adminApi } from '../../Api/admin/admin.api';
import { adminUsersApi } from '../../Api/admin/adminUsers.api';
import { adminCraftsmenApi } from '../../Api/admin/adminCraftsmen.api';
import { useAdminNotifications } from '../../context/AdminNotificationContext';
import { formatTimeAgo } from '../../utils/timeAgo';
import './AdminDashboard.css';

interface DashboardStats {
    total_users: number;
    total_craftsmen: number;
    total_requests: number;
    pending_craftsmen: number;
    total_reviews: number;
}

const AdminDashboard = () => {
    const { notifications, unreadCount, markAllAsRead } = useAdminNotifications();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    /* ── Fetch Dashboard Stats ─────────────────────── */
    const fetchStats = useCallback(async () => {
        try {
            const res = await adminApi.getDashboardStatistics();
            setStats(res.data.stats || res.data);
        } catch {
            // Fallback — also try individual APIs
            try {
                const [uRes, cRes] = await Promise.all([
                    adminUsersApi.getAllUsers({ page: 1 }),
                    adminCraftsmenApi.getAllCraftsmen({ page: 1 }),
                ]);
                setStats({
                    total_users: uRes.data.total ?? 0,
                    total_craftsmen: cRes.data.total ?? 0,
                    total_requests: 0,
                    pending_craftsmen: 0,
                    total_reviews: 0,
                });
            } catch {
                toast.error("فشل تحميل الإحصائيات");
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
        // Auto-refresh every minute
        const interval = setInterval(() => fetchStats(), 60_000);
        return () => clearInterval(interval);
    }, [fetchStats]);

    // Map notification types to display info
    const notifMeta: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
        new_registration: { icon: <FaUsers />, color: '#3b82f6', label: 'تسجيل جديد' },
        new_review: { icon: <FaStar />, color: '#f59e0b', label: 'تقييم جديد' },
        new_product: { icon: <FaBoxOpen />, color: '#8b5cf6', label: 'منتج جديد' },
        new_request: { icon: <FaFileAlt />, color: '#10b981', label: 'طلب خدمة' },
        profile_update: { icon: <FaUser />, color: '#6366f1', label: 'تحديث ملف' },
        account_status_audit: { icon: <FaHardHat />, color: '#ef4444', label: 'تغيير حالة' },
        system_alert: { icon: <FaBell />, color: '#ec4899', label: 'تنبيه نظام' },
        wallet_transaction: { icon: <FaDollarSign />, color: '#10b981', label: 'معاملة مالية' },
        withdrawal_request: { icon: <FaDollarSign />, color: '#f59e0b', label: 'طلب سحب' },
    };

    return (
        <div className="admin-dashboard-container">
            <header className="dashboard-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 className="dashboard-title">🛡️ لوحة التحكم</h1>
                        <p className="dashboard-subtitle">نظرة عامة على أداء منصة صنايعي</p>
                    </div>
                    <button
                        onClick={() => { fetchStats(); toast.info('تم التحديث'); }}
                        style={{ padding: '0.6rem 1.4rem', borderRadius: '50px', border: '1.5px solid var(--color-border)', background: 'white', cursor: 'pointer', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                    >
                        🔄 تحديث
                    </button>
                </div>
            </header>

            {/* ── Stats ─── */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-content">
                        <span className="stat-value">{loading ? '...' : (stats?.total_users ?? 0)}</span>
                        <span className="stat-label">إجمالي المستخدمين</span>
                    </div>
                    <div className="stat-icon-wrapper users"><FaUsers size={24} /></div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <span className="stat-value">{loading ? '...' : (stats?.total_craftsmen ?? 0)}</span>
                        <span className="stat-label">إجمالي الصنايعية</span>
                    </div>
                    <div className="stat-icon-wrapper craftsmen"><FaHardHat size={24} /></div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <span className="stat-value">{loading ? '...' : (stats?.total_requests ?? 0)}</span>
                        <span className="stat-label">إجمالي الطلبات</span>
                    </div>
                    <div className="stat-icon-wrapper requests"><FaRegFileAlt size={24} /></div>
                </div>
                <div className="stat-card">
                    <div className="stat-content">
                        <span className="stat-value" style={{ color: stats?.pending_craftsmen ? '#ea580c' : undefined }}>
                            {loading ? '...' : (stats?.pending_craftsmen ?? 0)}
                        </span>
                        <span className="stat-label">صنايعية بانتظار الموافقة</span>
                    </div>
                    <div className="stat-icon-wrapper revenue"><FaDollarSign size={24} /></div>
                </div>
            </div>

            {/* ── Quick Links ─── */}
            <div className="adm-quick-links">
                {[
                    { to: '/admin/users', icon: <FaUser />, label: 'المستخدمون', color: '#3b82f6' },
                    { to: '/admin/craftsmen', icon: <FaHardHat />, label: 'الصنايعية', color: '#f59e0b' },
                    { to: '/admin/live-map', icon: <FaMapMarkedAlt />, label: 'خريطة النظام', color: '#ef4444' },
                    { to: '/admin/services', icon: <FaTools />, label: 'الخدمات', color: '#8b5cf6' },
                    { to: '/admin/governorates', icon: <FaMapMarkerAlt />, label: 'المحافظات', color: '#10b981' },
                    { to: '/admin/categories', icon: <FaTags />, label: 'التصنيفات', color: '#0ea5e9' },
                    { to: '/admin/reviews', icon: <FaCommentAlt />, label: 'التقييمات', color: '#ef4444' },
                    { to: '/admin/requests', icon: <FaRegFileAlt />, label: 'الطلبات', color: '#f97316' },
                    { to: '/admin/products', icon: <FaBoxOpen />, label: 'المنتجات', color: '#6366f1' },
                    { to: '/admin/wallets', icon: <FaDollarSign />, label: 'المحافظ', color: '#10b981' },
                    { to: '/admin/withdrawals', icon: <FaDollarSign />, label: 'طلبات السحب', color: '#f59e0b' },
                    { to: '/admin/transfers', icon: <FaRegFileAlt />, label: 'التحويلات', color: '#6366f1' },
                ].map(item => (
                    <Link key={item.to} to={item.to} className="adm-quick-link" style={{ '--link-color': item.color } as any}>
                        <span className="adm-ql-icon">{item.icon}</span>
                        <span className="adm-ql-label">{item.label}</span>
                    </Link>
                ))}
            </div>

            {/* ── Live Notifications Feed ─── */}
            <div className="dashboard-sections">
                <div className="section-card">
                    <div className="section-header">
                        <h2 className="section-title">
                            <FaBell size={18} style={{ color: 'var(--color-primary)', marginLeft: '8px' }} />
                            آخر النشاطات (إشعارات حية)
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {unreadCount > 0 && (
                                <span className="adm-notif-badge" style={{ background: 'var(--color-primary)', color: '#fff', padding: '2px 10px', borderRadius: '50px', fontSize: '12px', fontWeight: 700 }}>
                                    {unreadCount} جديد
                                </span>
                            )}
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    style={{ fontSize: '12px', color: 'var(--color-primary)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    تعيين الكل مقروء
                                </button>
                            )}
                        </div>
                    </div>

                    {notifications.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                            📭 لا توجد إشعارات حتى الآن — ستظهر هنا فور حدوث أي نشاط جديد
                        </div>
                    ) : (
                        <ul className="activity-list adm-feed-list">
                            {notifications.slice(0, 12).map(notif => {
                                const meta = notifMeta[notif.type] || notifMeta.system_alert;
                                return (
                                    <li key={notif.id} className={`activity-item adm-feed-item${notif.status === 'unread' ? ' adm-notif-unread' : ''}`}>
                                        <div
                                            className="activity-icon"
                                            style={{ background: meta.color + '22', color: meta.color, borderRadius: '12px' }}
                                        >
                                            {meta.icon}
                                        </div>
                                        <div className="activity-details">
                                            <p className="activity-text">{notif.message}</p>
                                            <span className="activity-time">{formatTimeAgo(notif.timestamp)}</span>
                                        </div>
                                        <span
                                            className="adm-feed-tag"
                                            style={{ background: meta.color + '22', color: meta.color }}
                                        >
                                            {meta.label}
                                        </span>
                                        {notif.status === 'unread' && (
                                            <FaCircle style={{ fontSize: '8px', color: meta.color, flexShrink: 0 }} />
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <div className="section-card">
                    <div className="section-header">
                        <h2 className="section-title">إجراءات سريعة</h2>
                    </div>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {stats?.pending_craftsmen ? (
                            <Link to="/admin/craftsmen" style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: '#fef3c7', color: '#92400e', border: '1.5px solid #fde68a', textDecoration: 'none', fontWeight: 700, display: 'block', textAlign: 'center' }}>
                                ⚠️ مراجعة الصنايعية الجدد ({stats.pending_craftsmen})
                            </Link>
                        ) : (
                            <div style={{ padding: '1rem', textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>✅ لا توجد طلبات معلقة</div>
                        )}
                        <Link to="/admin/users" style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: '#e0f2fe', color: '#0369a1', border: '1.5px solid #bae6fd', textDecoration: 'none', fontWeight: 700, display: 'block', textAlign: 'center' }}>
                            👥 إدارة المستخدمين
                        </Link>
                        <Link to="/admin/services" style={{ padding: '0.85rem 1rem', borderRadius: '10px', background: '#f5f3ff', color: '#6d28d9', border: '1.5px solid #ddd6fe', textDecoration: 'none', fontWeight: 700, display: 'block', textAlign: 'center' }}>
                            🔧 إدارة الخدمات
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;