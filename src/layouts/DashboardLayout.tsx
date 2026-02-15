import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar/Sidebar";
import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../assets/images/final logo.png";
import "./DashboardLayout.css";

function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();
    const isMessagesPage = location.pathname.includes("/dashboard/messages");

    return (
        <div className={`dashboard-container ${isSidebarOpen ? "sidebar-open" : ""} ${isMessagesPage ? "is-messages-page" : ""}`}>
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
                    <img src={logo} alt="Sanayei" className="mobile-dashboard-logo" />
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