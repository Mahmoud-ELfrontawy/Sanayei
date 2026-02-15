import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FaThLarge,
    FaUsers,
    FaHardHat,
    FaWrench,
    FaMapMarkerAlt,
    FaFileAlt,
    FaStar,
    FaSignOutAlt,
    FaTimes,
    FaBell
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', label: 'لوحة التحكم', icon: FaThLarge },
        { path: '/admin/users', label: 'المستخدمين', icon: FaUsers },
        { path: '/admin/craftsmen', label: 'الصنايعية', icon: FaHardHat },
        { path: '/admin/services', label: 'الخدمات', icon: FaWrench },
        { path: '/admin/governorates', label: 'المحافظات', icon: FaMapMarkerAlt },
        { path: '/admin/requests', label: 'الطلبات', icon: FaFileAlt },
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
                        <button className="admin-bell-btn">
                            <FaBell size={20} />
                        </button>
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