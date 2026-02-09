import React, { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
    LayoutDashboard,
    User,
    Mail,
    Bell,
    MapPin,
    LogOut
} from "lucide-react";

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

const Sidebar: React.FC = () => {
    const { user, logout } = useAuth();
    const { unreadCount } = useNotifications();

    const userType = localStorage.getItem("userType");

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

    const profilePath =
        userType === "craftsman" ? "/craftsman/profile" : "/user/profile";

    const menuLinks = [
        {
            title: "لوحة التحكم",
            path: "/dashboard",
            icon: <LayoutDashboard size={20} />
        },
        {
            title: "الملف الشخصي",
            path: profilePath,
            icon: <User size={20} />
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
        {
            title: "الموقع",
            path: "/dashboard/location",
            icon: <MapPin size={20} />
        },
    ];

    return (
        <aside className="dashboard-sidebar">
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
                <button onClick={logout} className="logout-btn">
                    <LogOut size={20} />
                    <span>تسجيل الخروج</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
