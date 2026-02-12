import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    HardHat,
    Wrench,
    MapPin,
    FileText,
    Star,
    LogOut,
    Menu,
    X,
    Bell
} from 'lucide-react';
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
        { path: '/admin/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
        { path: '/admin/users', label: 'المستخدمين', icon: Users },
        { path: '/admin/craftsmen', label: 'الصنايعية', icon: HardHat },
        { path: '/admin/services', label: 'الخدمات', icon: Wrench },
        { path: '/admin/governorates', label: 'المحافظات', icon: MapPin },
        { path: '/admin/requests', label: 'الطلبات', icon: FileText },
        { path: '/admin/reviews', label: 'التقييمات', icon: Star },
    ];

    return (
        <div className="admin-layout" dir="rtl">
            {/* Sidebar */}
            <aside
                className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}
            >
                <div className="sidebar-header">
                    <h1 className="sidebar-title">صنايعي - أدمن</h1>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="close-sidebar-btn md:hidden"
                    >
                        <X size={24} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <Icon size={20} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar-footer">
                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                    >
                        <LogOut size={20} />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="main-wrapper">
                {/* Header */}
                <header className="admin-header">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="mobile-menu-btn md:hidden"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="header-actions">
                        <button className="p-2 text-gray-400 hover:text-gray-500 transition-colors">
                            <Bell size={20} />
                        </button>
                        <div className="user-profile">
                            <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                {user?.name || 'Admin'}
                            </span>
                            <div className="user-avatar">
                                {user?.name?.[0]?.toUpperCase() || 'A'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="page-content">
                    <Outlet />
                </main>
            </div>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div
                    className="overlay md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
