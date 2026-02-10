import { NavLink, Link } from "react-router-dom";
import { IoIosArrowDown, IoMdNotificationsOutline } from "react-icons/io";
import { FiMessageCircle, FiMenu, FiX } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { User, LogOut, LayoutDashboard } from "lucide-react";

import { NAV_LINKS, type NavLinkItem } from "../../../constants/header";
import logo from "../../../assets/images/final logo.png";
import "./Header.css";
import "./Header_Notifications.css";

import Button from "../../ui/Button/Button";
import { useAuth } from "../../../hooks/useAuth";
import { useNotifications } from "../../../context/NotificationContext";
import { useUserChat } from "../../../context/UserChatProvider";
import { useCraftsmanChat } from "../../../context/CraftsmanChatProvider";

import { setToastAfterReload } from "../../../utils/toastAfterReload";

/* ================= TYPES ================= */
type DropdownRef = HTMLDivElement | null;

/* ================= COMPONENT ================= */

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useNotifications();

  // ✅ تعريف واحد فقط
  const userType = localStorage.getItem("userType");

  // ✅ استدعاء الـ hooks بدون شروط (قواعد React)
  const userChat = useUserChat();
  const craftsmanChat = useCraftsmanChat();

  // ✅ حساب unread بطريقة آمنة
  const unreadTotal =
    userType === "craftsman"
      ? craftsmanChat.contacts.reduce((s, c) => s + c.unread_count, 0)
      : userChat.contacts.reduce((s, c) => s + c.unread_count, 0);

  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<DropdownRef>(null);

  /* ================= Helpers ================= */

  const profilePath =
    userType === "craftsman" ? "/craftsman/profile" : "/user/profile";

  /* ================= HANDLERS ================= */

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    setToastAfterReload("تم تسجيل الخروج بنجاح");
    window.location.replace("/login");
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
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
        <Link to="/" className="header-logo">
          <img src={logo} alt="Sanayei Logo" />
        </Link>

        {/* ================= DESKTOP NAV ================= */}
        <ul className="header-links desktop-only">
          {NAV_LINKS.map((link: NavLinkItem) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
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
              <Button to="/login" variant="primary">
                اطلب الآن
              </Button>
              <Button to="/login" variant="outline">
                تسجيل الدخول
              </Button>
            </div>
          ) : (
            <div className="avatar-wrapper-header desktop-only">
              {/* Messages */}
              <Link
                to="/dashboard/messages"
                className={`icon-btn-login ${unreadTotal > 0 ? "has-unread" : ""} ${isNewMessage ? "new-arrival" : ""}`}
              >
                <FiMessageCircle size={24} />
                <span>الرسائل</span>
                {unreadTotal > 0 && (
                  <span className="notification-badge-header" />
                )}
              </Link>

              {/* Notifications */}
              <Link
                to="/dashboard/notifications"
                className={`icon-btn-login ${unreadCount > 0 ? "has-unread" : ""}`}
              >
                <IoMdNotificationsOutline size={24} />
                <span>الإشعارات</span>
                {unreadCount > 0 && (
                  <span className="notification-badge-header" />
                )}
              </Link>

              {/* Avatar Dropdown */}
              <div className="avatar-dropdown" ref={dropdownRef}>
                <button className="profile-btn" onClick={toggleDropdown}>
                  <div className="avatar-wrapper-profile">
                    <img src={user?.avatar || "/avatar.png"} alt="profile" />
                    <span className="online-dot" />
                  </div>
                </button>

                {isOpen && (
                  <div className="profile-dropdown">
                    <Link to="/dashboard" className="dropdown-item">
                      <LayoutDashboard size={20} />
                      <span>لوحة التحكم</span>
                    </Link>

                    <Link to={profilePath} className="dropdown-item">
                      <User size={20} />
                      <span>الملف الشخصي</span>
                    </Link>

                    <button
                      className="dropdown-item logout"
                      onClick={handleLogout}
                    >
                      <LogOut size={20} />
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
                <FiMessageCircle size={24} />
                {unreadTotal > 0 && (
                  <span className="notification-badge-header" />
                )}
                <span>الرسائل</span>
              </Link>

              <Link
                to="/dashboard/notifications"
                className={`mobile-icon-btn ${unreadCount > 0 ? "has-unread" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <IoMdNotificationsOutline size={24} />
                {unreadCount > 0 && (
                  <span className="notification-badge-header" />
                )}
                <span>الإشعارات</span>
              </Link>
            </div>
          )}

          <ul className="mobile-links">
            {NAV_LINKS.map((link) => (
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
              <Button to="/login" variant="primary">
                اطلب الآن
              </Button>
              <Button to="/login" variant="outline">
                تسجيل الدخول
              </Button>
            </div>
          ) : (
            <div className="mobile-auth">
              <Link
                to="/dashboard"
                className="dropdown-item"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LayoutDashboard size={20} />
                <span>لوحة التحكم</span>
              </Link>

              <Link
                to={profilePath}
                className="dropdown-item"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User size={20} />
                <span>الملف الشخصي</span>
              </Link>

              <button className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={20} />
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
