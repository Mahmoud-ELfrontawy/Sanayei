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
    FaBars,
    FaWallet,
    FaChevronDown,
    FaChevronUp,
    FaEnvelope,
    FaEnvelopeOpenText,
    FaMapMarkedAlt
} from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import { useAdminNotifications } from '../context/AdminNotificationContext';
import { formatTimeAgo } from '../utils/timeAgo';
import './AdminLayout.css';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
    const location = useLocation();
    const { logout, user, isAuthenticated, userType, isLoading } = useAuth();
    const { isDark, toggleTheme } = useTheme();

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 1024) {
                setIsSidebarOpen(true);
            } else {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useAdminNotifications();
    const [notifOpen, setNotifOpen] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState<string[]>(() => {
        // Keep Wallet open if we are in any wallet-related path
        if (location.pathname.includes('/admin/wallets') ||
            location.pathname.includes('/admin/withdrawals') ||
            location.pathname.includes('/admin/transfers')) {
            return ['wallet'];
        }
        return [];
    });
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

    const toggleSubMenu = (key: string) => {
        setOpenSubMenus(prev =>
            prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
        );
    };

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
        { path: '/admin/live-map', label: 'خريطة النظام', icon: FaMapMarkedAlt },
        { path: '/admin/services', label: 'الخدمات', icon: FaWrench },
        { path: '/admin/governorates', label: 'المحافظات', icon: FaMapMarkerAlt },
        { path: '/admin/categories', label: 'التصنيفات', icon: FaTags },
        { path: '/admin/requests', label: 'الطلبات', icon: FaFileAlt },
        { path: '/admin/products', label: 'المنتجات', icon: FaBoxOpen },
        {
            key: 'wallet',
            label: 'محفظة',
            icon: FaWallet,
            subItems: [
                { path: '/admin/wallets', label: 'كافة المحافظ' },
                { path: '/admin/withdrawals', label: 'طلبات السحب' },
                { path: '/admin/transfers', label: 'التحويلات' },
            ]
        },
        { path: '/admin/contact-messages', label: 'الشكاوي والاقتراحات', icon: FaEnvelope },
        { path: '/admin/messages', label: 'مركز الرسائل', icon: FaEnvelopeOpenText },
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
                    {menuItems.map((item: any) => {
                        const Icon = item.icon;
                        const isSubMenuOpen = item.key && openSubMenus.includes(item.key);

                        // Handle Regular Items
                        if (!item.subItems) {
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
                        }

                        // Handle Items with Sub-menu
                        const isAnyChildActive = item.subItems.some((sub: any) => location.pathname === sub.path);
                        return (
                            <div key={item.key} className="admin-menu-dropdown">
                                <button
                                    className={`admin-nav-item submenu-trigger ${isAnyChildActive ? 'child-active' : ''}`}
                                    onClick={() => toggleSubMenu(item.key)}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                    {isSubMenuOpen ? <FaChevronUp className="ms-auto" size={12} /> : <FaChevronDown className="ms-auto" size={12} />}
                                </button>
                                {isSubMenuOpen && (
                                    <div className="admin-submenu-list">
                                        {item.subItems.map((sub: any) => (
                                            <Link
                                                key={sub.path}
                                                to={sub.path}
                                                className={`admin-submenu-item ${location.pathname === sub.path ? 'active' : ''}`}
                                                onClick={() => setIsSidebarOpen(false)}
                                            >
                                                {sub.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
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
            <div className={`admin-main-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
                <header className="admin-header">
                    <div className="admin-header-actions">
                        <div className="admin-header-right">
                            <button
                                className="admin-menu-toggle"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                title={isSidebarOpen ? "إغلاق القائمة" : "فتح القائمة"}
                            >
                                <FaBars size={22} />
                            </button>
                        </div>

                        <div className="admin-header-left">
                            <div className="admin-header-controls">
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

                                {/* Theme Toggle Button */}
                                <button
                                    className="admin-theme-toggle-btn"
                                    onClick={toggleTheme}
                                    title={isDark ? "تبديل إلى الوضع النهاري" : "تبديل إلى الوضع الليلي"}
                                >
                                    {isDark ? (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
                                    ) : (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                                    )}
                                </button>
                            </div>

                            <div className="admin-user-profile">
                                <span className="admin-username">{user?.name || 'Admin'}</span>
                                <div className="admin-user-avatar">{user?.name?.[0]?.toUpperCase() || 'A'}</div>
                            </div>
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