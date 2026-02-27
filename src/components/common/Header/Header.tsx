import { NavLink, Link, useLocation } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { FiMenu, FiX } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { FaUser, FaSignOutAlt, FaThLarge, FaBox, FaRegClock, FaCommentDots, FaBell, FaMoon, FaSun } from "react-icons/fa";
import { toast } from "react-toastify";
import { formatTimeAgo } from "../../../utils/timeAgo";
import { getAvatarUrl } from "../../../utils/imageUrl";

import { NAV_LINKS, type NavLinkItem } from "../../../constants/header";
import logo from "../../../assets/images/final logo.png";
import logoDark from "../../../assets/images/logo image dark 1.png";
import "./Header.css";
import "./Header_Notifications.css";

import Button from "../../ui/Button/Button";
import { useAuth } from "../../../hooks/useAuth";
import { useNotifications } from "../../../context/NotificationContext";
import { useUserChat } from "../../../context/UserChatProvider";
import { useCraftsmanChat } from "../../../context/CraftsmanChatProvider";
import { useTheme } from "../../../context/ThemeContext";


/* ================= TYPES ================= */
type DropdownRef = HTMLDivElement | null;

/* ================= COMPONENT ================= */

const Header: React.FC = () => {
  // ✅ Use userType from context for reactivity
  const { user, isAuthenticated, logout, userType } = useAuth();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  // Check if we are in dashboard or admin area
  const isDashboardRoute = location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin");

  // ✅ استدعاء الـ hooks بدون شروط (قواعد React)
  const userChat = useUserChat();
  const craftsmanChat = useCraftsmanChat();

  // ✅ حساب unread بطريقة آمنة
  const unreadTotal =
    userType === "craftsman"
      ? craftsmanChat.contacts.reduce((s, c) => s + c.unread_count, 0)
      : userChat.contacts.reduce((s, c) => s + c.unread_count, 0);

  const [isOpen, setIsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<DropdownRef>(null);
  const notifDropdownRef = useRef<DropdownRef>(null);
  const { userNotifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  /* ================= Helpers ================= */

  const isCraftsman = userType === "craftsman";
  const isAdmin = userType === "admin";
  const isCompany = userType === "company";

  const profilePath = isAdmin
    ? "/admin/profile"
    : (isCraftsman ? "/craftsman/profile" : (isCompany ? "/dashboard/company/profile" : "/user/profile"));

  const dashboardPath = isAdmin
    ? "/admin/dashboard"
    : (isCraftsman ? "/dashboard/craftsman" : (isCompany ? "/dashboard/company" : "/dashboard"));

  const viewLinks = NAV_LINKS.filter(link => !link.authRequired || isAuthenticated);

  /* ================= HANDLERS ================= */

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    setNotifOpen(false);
  };

  const toggleNotifDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    setNotifOpen((prev) => !prev);
    setIsOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const handleLogout = () => {
    setIsOpen(false);
    const name = user?.name || "";
    logout(false);
    toast.success(`تم تسجيل الخروج بنجاح، نراك قريباً ${name}`);
    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node;
    if (dropdownRef.current && !dropdownRef.current.contains(target)) {
      setIsOpen(false);
    }
    if (notifDropdownRef.current && !notifDropdownRef.current.contains(target)) {
      setNotifOpen(false);
    }
  };

  const [isNewMessage, setIsNewMessage] = useState(false);
  const prevUnreadTotal = useRef(unreadTotal);

  /* ================= EFFECTS ================= */

  useEffect(() => {
    if (unreadTotal > prevUnreadTotal.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsNewMessage(true);
      setTimeout(() => setIsNewMessage(false), 1000);
    }
    prevUnreadTotal.current = unreadTotal;
  }, [unreadTotal]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /* ================= RENDER ================= */

  return (
    <header className="header">
      <nav className="header-nav">
        {/* Logo */}
        <Link to="/" className={`header-logo ${isDashboardRoute ? "is-dashboard" : ""}`}>
          <img src={isDark ? logoDark : logo} alt="Sanayei Logo" />
        </Link>

        {/* ================= DESKTOP NAV ================= */}
        <ul className="header-links desktop-only">
          {viewLinks.map((link: NavLinkItem) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `header-nav-link ${isActive ? "active" : ""}`
                }
              >
                <span>{link.label}</span>
                {link.hasDropdown && <IoIosArrowDown size={16} />}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ================= ACTIONS ================= */}
        <div className="header-actions">
          {!isAuthenticated ? (
            <div className="auto-login desktop-only">
              <Button to="/login" variant="primary" className="header-btn">
                اطلب الآن
              </Button>
              <Button to="/login" variant="outline" className="header-btn">
                تسجيل الدخول
              </Button>
            </div>
          ) : (
            <div className="avatar-wrapper-header desktop-only">
              {/* Messages */}
              <Link
                to="/dashboard/messages"
                className={`header-icon-btn ${unreadTotal > 0 ? "has-unread" : ""} ${isNewMessage ? "new-arrival" : ""}`}
              >
                {unreadTotal > 0 && (
                  <span className="header-notification-badge" />
                )}
                <FaCommentDots size={22} />
                <span>الرسائل</span>
              </Link>

              {/* Notifications Dropdown */}
              <div className="header-avatar-dropdown" ref={notifDropdownRef}>
                <button
                  onClick={toggleNotifDropdown}
                  className={`header-icon-btn ${unreadCount > 0 ? "has-unread" : ""} ${unreadCount > 0 ? "has-new-notification" : ""}`}
                >
                  {unreadCount > 0 && (
                    <span className="header-notification-badge" />
                  )}
                  <FaBell size={22} />
                  <span>الإشعارات</span>
                </button>

                {notifOpen && (
                  <div className="header-profile-dropdown header-notification-dropdown">
                    <div className="dropdown-header-notif">
                      <span>التنبيهات</span>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="mark-all-read">تعيين الكل كمقروء</button>
                      )}
                    </div>

                    <div className="notification-list-scroll">
                      {userNotifications.length === 0 ? (
                        <div className="empty-notif">لا يوجد تنبيهات حالياً</div>
                      ) : (
                        userNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            className={`notification-item ${notif.status === "unread" ? "unread" : ""}`}
                            onClick={() => markAsRead(notif.id)}
                          >
                            <div className={`notification-icon-wrapper icon-${notif.type}`}>
                              {notif.type === "order_request" ? <FaBox size={16} /> :
                                notif.type === "chat" ? <FaCommentDots size={16} /> :
                                  <FaRegClock size={16} />}
                            </div>
                            <div className="notification-info">
                              <div className="notification-title-row">
                                <span className="notif-item-title">{notif.title}</span>
                              </div>
                              <p className="notif-item-message">{notif.message}</p>
                              <div className="notification-time">
                                <FaRegClock size={12} />
                                <span className="">{formatTimeAgo(notif.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <Link
                      to="/dashboard/notifications"
                      className="view-all-notif"
                      onClick={() => setNotifOpen(false)}
                    >
                      عرض الكل
                    </Link>
                  </div>
                )}
              </div>

              {/* Avatar Dropdown */}
              <div className="header-avatar-dropdown" ref={dropdownRef}>
                <button className="profile-btn" onClick={toggleDropdown}>
                  <div className="avatar-wrapper-profile">
                    <img
                      src={getAvatarUrl(user?.avatar, user?.name)}
                      alt="profile"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = getAvatarUrl(null, user?.name);
                      }}
                    />
                    <span className="online-dot" />
                  </div>
                </button>

                {isOpen && (
                  <div className="header-profile-dropdown">
                    <Link to={dashboardPath} className="header-dropdown-item">
                      <FaThLarge size={20} />
                      <span>{isAdmin ? "لوحة الإدارة" : "لوحة التحكم"}</span>
                    </Link>

                    <Link to={profilePath} className="header-dropdown-item">
                      <FaUser size={20} />
                      <span>الملف الشخصي</span>
                    </Link>

                    <button
                      className="header-dropdown-item dark-mode-toggle"
                      onClick={toggleTheme}
                    >
                      {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
                      <span>{isDark ? "الوضع الفاتح" : "الوضع المظلم"}</span>
                    </button>

                    <button
                      className="header-dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt size={20} />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= MOBILE ICON ================= */}
          <button
            className="mobile-menu-btn mobile-only"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? <FiX size={26} /> : <FiMenu size={26} />}
          </button>
        </div>
      </nav>

      {/* ================= MOBILE MENU ================= */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          {isAuthenticated && (
            <div className="mobile-quick-actions">
              <Link
                to="/dashboard/messages"
                className={`mobile-icon-btn ${unreadTotal > 0 ? "has-unread" : ""} ${isNewMessage ? "new-arrival" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaCommentDots size={24} />
                {unreadTotal > 0 && (
                  <span className="header-notification-badge" />
                )}
                <span>الرسائل</span>
              </Link>

              <Link
                to="/dashboard/notifications"
                className={`mobile-icon-btn ${unreadCount > 0 ? "has-unread" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaBell size={24} />
                {unreadCount > 0 && (
                  <span className="header-notification-badge" />
                )}
                <span>الإشعارات</span>
              </Link>
            </div>
          )}

          <ul className="mobile-links">
            {viewLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {!isAuthenticated ? (
            <div className="mobile-auth">
              <Button to="/login" variant="primary" className="header-btn">
                اطلب الآن
              </Button>
              <Button to="/login" variant="outline" className="header-btn">
                تسجيل الدخول
              </Button>
            </div>
          ) : (
            <div className="mobile-auth">
              <Link
                to={dashboardPath}
                className="header-dropdown-item"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaThLarge size={20} />
                <span>{isAdmin ? "لوحة الإدارة" : "لوحة التحكم"}</span>
              </Link>

              <Link
                to={profilePath}
                className="header-dropdown-item"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaUser size={20} />
                <span>الملف الشخصي</span>
              </Link>

              <button
                className="header-dropdown-item dark-mode-toggle"
                onClick={toggleTheme}
              >
                {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
                <span>{isDark ? "الوضع الفاتح" : "الوضع المظلم"}</span>
              </button>

              <button className="header-dropdown-item logout" onClick={handleLogout}>
                <FaSignOutAlt size={20} />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;