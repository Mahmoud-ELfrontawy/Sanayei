import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaHardHat, FaRegFileAlt, FaDollarSign, FaBell, FaUser, FaTools, FaMapMarkerAlt, FaTags, FaCommentAlt, FaBoxOpen } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { adminApi } from '../../Api/admin/admin.api';
import { adminUsersApi } from '../../Api/admin/adminUsers.api';
import { adminCraftsmenApi } from '../../Api/admin/adminCraftsmen.api';
import { adminReviewsApi } from '../../Api/admin/adminReviews.api';
import './AdminDashboard.css';

interface DashboardStats {
    total_users: number;
    total_craftsmen: number;
    total_requests: number;
    pending_craftsmen: number;
    total_reviews: number;
}

interface ActivityItem {
    id: number;
    type: 'user' | 'craftsman' | 'review';
    message: string;
    time: string;
    color: string;
    icon: string;
}

const AdminDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [activityLoading, setActivityLoading] = useState(true);

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

    /* ── Build Live Activity Feed ──────────────────── */
    const fetchActivity = useCallback(async () => {
        setActivityLoading(true);
        const items: ActivityItem[] = [];
        let id = 1;

        try {
            const res = await adminUsersApi.getAllUsers({ page: 1 });
            const users: any[] = res.data?.data || res.data || [];
            users.slice(0, 5).forEach((u: any) => {
                items.push({
                    id: id++,
                    type: 'user',
                    message: `مستخدم جديد: ${u.name || u.email || 'مجهول'}`,
                    time: u.created_at ? new Date(u.created_at).toLocaleString('ar-EG') : '—',
                    color: '#3b82f6',
                    icon: '👤',
                });
            });
        } catch { /* silent */ }

        try {
            const res = await adminCraftsmenApi.getAllCraftsmen({ page: 1 });
            const craftsmen: any[] = res.data?.data || res.data || [];
            craftsmen.slice(0, 5).forEach((c: any) => {
                items.push({
                    id: id++,
                    type: 'craftsman',
                    message: `صنايعي جديد: ${c.name || 'مجهول'} — ${c.service?.name || ''}`,
                    time: c.created_at ? new Date(c.created_at).toLocaleString('ar-EG') : '—',
                    color: '#f59e0b',
                    icon: '🔧',
                });
            });
        } catch { /* silent */ }

        try {
            const res = await adminReviewsApi.getAllReviews();
            const reviews: any[] = res.data?.data || res.data || [];
            reviews.slice(0, 5).forEach((r: any) => {
                items.push({
                    id: id++,
                    type: 'review',
                    message: `تقييم جديد ⭐${r.rating} من ${r.user?.name || 'مستخدم'} للصنايعي ${r.craftsman?.name || '—'}`,
                    time: r.created_at ? new Date(r.created_at).toLocaleString('ar-EG') : '—',
                    color: '#10b981',
                    icon: '⭐',
                });
            });
        } catch { /* silent */ }

        // Sort by id descending (most recent last inserted = highest id based on our counter order)
        setActivity(items.sort((a, b) => b.id - a.id).slice(0, 12));
        setActivityLoading(false);
    }, []);

    useEffect(() => {
        fetchStats();
        fetchActivity();
        // Auto-refresh every minute to catch new registrations
        const interval = setInterval(() => {
            fetchStats();
            fetchActivity();
        }, 60_000);
        return () => clearInterval(interval);
    }, [fetchStats, fetchActivity]);

    return (
        <div className="admin-dashboard-container">
            <header className="dashboard-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 className="dashboard-title">🛡️ لوحة التحكم</h1>
                        <p className="dashboard-subtitle">نظرة عامة على أداء منصة صنايعي</p>
                    </div>
                    <button
                        onClick={() => { fetchStats(); fetchActivity(); toast.info('تم التحديث'); }}
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
                    { to: '/admin/services', icon: <FaTools />, label: 'الخدمات', color: '#8b5cf6' },
                    { to: '/admin/governorates', icon: <FaMapMarkerAlt />, label: 'المحافظات', color: '#10b981' },
                    { to: '/admin/categories', icon: <FaTags />, label: 'التصنيفات', color: '#0ea5e9' },
                    { to: '/admin/reviews', icon: <FaCommentAlt />, label: 'التقييمات', color: '#ef4444' },
                    { to: '/admin/requests', icon: <FaRegFileAlt />, label: 'الطلبات', color: '#f97316' },
                    { to: '/admin/products', icon: <FaBoxOpen />, label: 'المنتجات', color: '#6366f1' },
                ].map(item => (
                    <Link key={item.to} to={item.to} className="adm-quick-link" style={{ '--link-color': item.color } as any}>
                        <span className="adm-ql-icon">{item.icon}</span>
                        <span className="adm-ql-label">{item.label}</span>
                    </Link>
                ))}
            </div>

            {/* ── Activity Feed ─── */}
            <div className="dashboard-sections">
                <div className="section-card">
                    <div className="section-header">
                        <h2 className="section-title">
                            <FaBell size={18} style={{ color: 'var(--color-primary)', marginLeft: '8px' }} />
                            آخر النشاطات (اشعارات حية)
                        </h2>
                        <span className="adm-notif-badge">{activity.length}</span>
                    </div>
                    {activityLoading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>⏳ جاري التحميل...</div>
                    ) : activity.length === 0 ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>📭 لا توجد نشاطات حديثة</div>
                    ) : (
                        <ul className="activity-list adm-feed-list">
                            {activity.map(item => (
                                <li key={item.id} className="activity-item adm-feed-item">
                                    <div
                                        className="activity-icon"
                                        style={{ background: item.color + '22', color: item.color, borderRadius: '12px' }}
                                    >
                                        <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                                    </div>
                                    <div className="activity-details">
                                        <p className="activity-text">{item.message}</p>
                                        <span className="activity-time">{item.time}</span>
                                    </div>
                                    <span
                                        className="adm-feed-tag"
                                        style={{ background: item.color + '22', color: item.color }}
                                    >
                                        {item.type === 'user' ? 'مستخدم' : item.type === 'craftsman' ? 'صنايعي' : 'تقييم'}
                                    </span>
                                </li>
                            ))}
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