import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    User,
    Mail,
    Bell,

    LogOut,
    Heart
} from "lucide-react";

import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { useNotifications } from "../../../context/NotificationContext";
import { useUserChat } from "../../../context/UserChatProvider";
import { useCraftsmanChat } from "../../../context/CraftsmanChatProvider";

import "./Sidebar.css";

/* ===== Helper: Avatar Fallback ===== */
const buildAvatar = (avatar?: string | null, name?: string | null) => {
    if (avatar && avatar.startsWith("http")) return avatar;

    const safeName = name || "User";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
        safeName
    )}&background=FF8031&color=fff&bold=true`;
};

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { user, logout, userType } = useAuth();
    const { unreadCount } = useNotifications();

    // 🗑️ Removed localStorage.getItem("userType") to use context value

    // ✅ استدعاء الاثنين بدون شروط (قواعد React)
    const userChat = useUserChat();
    const craftsmanChat = useCraftsmanChat();

    // ✅ تحديد unread حسب النوع
    const unreadTotal =
        userType === "craftsman"
            ? craftsmanChat.contacts.reduce((s, c) => s + c.unread_count, 0)
            : userChat.contacts.reduce((s, c) => s + c.unread_count, 0);

    const [isNewMessage, setIsNewMessage] = useState(false);
    const prevUnreadTotal = useRef(unreadTotal);

    useEffect(() => {
        if (unreadTotal > prevUnreadTotal.current) {
            setIsNewMessage(true);
            setTimeout(() => setIsNewMessage(false), 1000);
        }
        prevUnreadTotal.current = unreadTotal;
    }, [unreadTotal]);

    const roleLabels = {
        user: "مستخدم",
        craftsman: "صنايعي",
        company: "شركة",
    };


    const menuLinks = [
        {
            title: "لوحة التحكم",
            path: "/dashboard",
            icon: <LayoutDashboard size={20} />
        },
        {
            title: "الملف الشخصي",
            path: userType === "craftsman" ? "/craftsman/profile" : (userType === "admin" ? "/admin/profile" : "/user/profile"),
            icon: <User size={20} />
        },
        {
            title: "المحفظة",
            path: "/dashboard/saved",
            icon: <Heart size={20} />
        },
        {
            title: "الرسائل",
            path: "/dashboard/messages",
            icon: <Mail size={20} />,
            badge: unreadTotal,
            hasUnread: unreadTotal > 0
        },
        {
            title: "إشعارات",
            path: "/dashboard/notifications",
            icon: <Bell size={20} />,
            badge: unreadCount,
            hasUnread: unreadCount > 0
        },

    ];

    return (
        <aside className={`dashboard-sidebar ${isOpen ? "open" : ""}`}>
            {/* ===== Header ===== */}
            <div className="sidebar-header">
                <div className="user-info">
                    <div className="avatar-wrapper">
                        <img
                            src={buildAvatar(user?.avatar, user?.name)}
                            alt={user?.name || "User"}
                            className="sidebar-avatar"
                        />
                    </div>

                    <div className="user-meta">
                        <h3 className="user-name">
                            {user?.name || "اسم المستخدم"}
                        </h3>

                        <span className={`user-role-badge ${userType || "user"}`}>
                            {roleLabels[userType as keyof typeof roleLabels] || "مستخدم"}
                        </span>
                    </div>
                </div>
            </div>

            {/* ===== Navigation ===== */}
            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {menuLinks.map((link) => (
                        <li key={link.path} className="nav-item">
                            <NavLink
                                to={link.path}
                                end={link.path === "/dashboard"}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? "active" : ""} ${link.hasUnread ? "has-unread" : ""
                                    } ${link.path.includes("messages") && isNewMessage
                                        ? "new-arrival"
                                        : ""
                                    }`
                                }
                            >
                                <span className="link-icon">
                                    {link.icon}
                                    {link.badge !== undefined && link.badge > 0 && (
                                        <span className="notification-badge-header" />
                                    )}
                                </span>

                                <span className="link-title">{link.title}</span>

                                {link.badge !== undefined && link.badge > 0 && (
                                    <span className="sidebar-badge">{link.badge}</span>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* ===== Footer ===== */}
            <div className="sidebar-footer">
                <button onClick={() => {
                    const name = user?.name || "";
                    logout(false);
                    toast.success(`تم تسجيل الخروج بنجاح، نراك قريباً ${name}`);
                    setTimeout(() => {
                        window.location.href = "/login";
                    }, 1000);
                    onClose?.();
                }} className="logout-btn">
                    <LogOut size={20} />
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
