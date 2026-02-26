import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaThLarge,
    FaUsers,
    FaHardHat,
    FaWrench,
    FaMapMarkerAlt,
    FaFileAlt,
    FaStar,
    FaTags,
    FaSignOutAlt,
    FaTimes,
    FaBell,
    FaEdit,
    FaBuilding,
    FaBoxOpen,
    FaChartBar,
    FaBars
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useAdminNotifications } from '../context/AdminNotificationContext';
import { formatTimeAgo } from '../utils/timeAgo';
import './AdminLayout.css';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const { logout, user, isAuthenticated, userType, isLoading } = useAuth();
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();
    const [notifOpen, setNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    // Guard: Only allow admins
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated || userType !== 'admin') {
                console.warn("🚫 AdminLayout: Unauthorized access attempt. Redirecting to login.");
                navigate('/login');
            }
        }
    }, [isAuthenticated, userType, isLoading, navigate]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotifOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (isLoading) {
        return <div className="admin-loading">جاري التحميل...</div>;
    }

    if (!isAuthenticated || userType !== 'admin') {
        return null; // Will be redirected by useEffect
    }

    const menuItems = [
        { path: '/admin/dashboard', label: 'لوحة التحكم', icon: FaThLarge },
        { path: '/admin/statistics', label: 'الإحصائيات', icon: FaChartBar },
        { path: '/admin/users', label: 'المستخدمين', icon: FaUsers },
        { path: '/admin/craftsmen', label: 'الصنايعية', icon: FaHardHat },
        { path: '/admin/companies', label: 'الشركات', icon: FaBuilding },
        { path: '/admin/services', label: 'الخدمات', icon: FaWrench },
        { path: '/admin/governorates', label: 'المحافظات', icon: FaMapMarkerAlt },
        { path: '/admin/categories', label: 'التصنيفات', icon: FaTags },
        { path: '/admin/requests', label: 'الطلبات', icon: FaFileAlt },
        { path: '/admin/products', label: 'المنتجات', icon: FaBoxOpen },
        { path: '/admin/reviews', label: 'التقييمات', icon: FaStar },
    ];

    return (
        <div className="admin-root" dir="rtl">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="admin-sidebar-header">
                    <h1 className="admin-sidebar-title">صنايعي - أدمن</h1>
                    <button onClick={() => setIsSidebarOpen(false)} className="admin-close-btn md:hidden">
                        <FaTimes size={24} />
                    </button>
                </div>

                <nav className="admin-sidebar-nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`admin-nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="admin-sidebar-footer">
                    <button onClick={handleLogout} className="admin-logout-btn">
                        <FaSignOutAlt size={20} />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="admin-main-wrapper">
                <header className="admin-header">
                    <div className="admin-header-actions">
                        <button
                            className="admin-menu-toggle md:hidden"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <FaBars size={22} />
                        </button>

                        <div className="admin-notif-container" ref={notifRef}>
                            <button className="admin-bell-btn" onClick={() => setNotifOpen(!notifOpen)}>
                                <FaBell size={20} />
                                {unreadCount > 0 && <span className="admin-notif-badge">{unreadCount}</span>}
                            </button>

                            {notifOpen && (
                                <div className="admin-notif-dropdown">
                                    <div className="admin-notif-header">
                                        <span>التنبيهات الإدارية</span>
                                        {unreadCount > 0 && (
                                            <button onClick={markAllAsRead} className="admin-mark-read">تعيين كمنتهي</button>
                                        )}
                                    </div>
                                    <div className="admin-notif-list">
                                        {notifications.length === 0 ? (
                                            <div className="admin-notif-empty">لا توجد تنبيهات جديدة</div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    className={`admin-notif-item ${n.status === 'unread' ? 'unread' : ''}`}
                                                    onClick={() => {
                                                        markAsRead(n.id);
                                                        if (n.link) navigate(n.link);
                                                        setNotifOpen(false);
                                                    }}
                                                >
                                                    <div className={`admin-notif-icon ${n.type}`}>
                                                        {n.type === 'new_registration' && <FaUsers />}
                                                        {n.type === 'new_review' && <FaStar />}
                                                        {n.type === 'new_request' && <FaFileAlt />}
                                                        {n.type === 'new_product' && <FaBoxOpen />}
                                                        {n.type === 'profile_update' && <FaEdit />}
                                                    </div>
                                                    <div className="admin-notif-content">
                                                        <p className="admin-notif-title">{n.title}</p>
                                                        <p className="admin-notif-msg">{n.message}</p>
                                                        <span className="admin-notif-time">{formatTimeAgo(n.timestamp)}</span>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="admin-user-profile">
                            <span className="admin-username">{user?.name || 'Admin'}</span>
                            <div className="admin-user-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
                        </div>
                    </div>
                </header>

                <main className="admin-page-content">
                    <Outlet />
                </main>
            </div>

            {isSidebarOpen && <div className="admin-overlay md:hidden" onClick={() => setIsSidebarOpen(false)} />}
        </div>
    );
};

export default AdminLayout;