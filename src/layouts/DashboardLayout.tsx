import { useState } from "react";
import { FaBars, FaTimes, FaLock, FaEnvelope } from "react-icons/fa";
import { Link, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar/Sidebar";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/images/final logo.png";
import logoDark from "../assets/images/logo image dark 1.png";
import { useTheme } from "../context/ThemeContext";
import "./DashboardLayout.css";

function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const isMessagesPage = location.pathname.includes("/dashboard/messages");
    const { user } = useAuth();
    const { isDark } = useTheme();
    const isBlocked = user?.status === 'rejected';

    return (
        <div className={`dashboard-container ${isSidebarOpen ? "sidebar-open" : ""} ${isMessagesPage ? "is-messages-page" : ""} ${isBlocked ? "is-blocked" : ""}`}>
            {isBlocked && (
                <div className="global-blocked-banner">
                    <div className="banner-content">
                        <FaLock className="lock-icon" />
                        <span className="banner-text">هذا الحساب محظور حالياً. يمكنك تصفح البيانات فقط، للتفعيل يرجى: </span>
                        <Link to="/contact" className="banner-link">
                            <FaEnvelope /> تواصل معنا
                        </Link>
                    </div>
                </div>
            )}
            {/* Mobile Header */}
            <header className="dashboard-mobile-header">
                <button
                    className="sidebar-toggle-btn"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label="Toggle Navigation"
                >
                    {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
                <div className="mobile-logo-wrapper">
                    <img src={isDark ? logoDark : logo} alt="Sanayei" className="mobile-dashboard-logo" />
                </div>
            </header>

            {/* Sidebar with Backdrop */}
            {isSidebarOpen && (
                <div className="sidebar-backdrop" onClick={() => setIsSidebarOpen(false)} />
            )}

            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="dashboard-content">
                <div className="dashboard-inner-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;
