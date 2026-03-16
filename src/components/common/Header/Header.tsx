import { NavLink, Link, useLocation } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { FiX, FiChevronLeft } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { FaUser, FaUserPlus, FaSignOutAlt, FaThLarge, FaBox, FaRegClock, FaCommentDots, FaBell, FaMoon, FaSun, FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaClipboardList, FaHeadset, FaInfoCircle } from "react-icons/fa";
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
import { useUI } from "../../../context/UIContext";


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
  const [authOpen, setAuthOpen] = useState(false);
  const { isMobileMenuOpen, closeMobileMenu } = useUI();

  const dropdownRef = useRef<DropdownRef>(null);
  const notifDropdownRef = useRef<DropdownRef>(null);
  const authDropdownRef = useRef<DropdownRef>(null);
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
    setAuthOpen(false);
  };

  const toggleAuthDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAuthOpen((prev) => !prev);
    setNotifOpen(false);
    setIsOpen(false);
  };


  const handleLogout = () => {
    setIsOpen(false);
    closeMobileMenu(); // Ensure mobile menu closes on logout
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
    if (authDropdownRef.current && !authDropdownRef.current.contains(target)) {
      setAuthOpen(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  /* ================= RENDER ================= */

  return (
    <header className="header">
      <nav className="header-nav">
        {/* ================= MOBILE MENU BUTTON REMOVED (Moved to Bottom Nav) ================= */}

        {/* Logo (Desktop Only) */}
        <Link to="/" className={`header-logo desktop-only ${isDashboardRoute ? "is-dashboard" : ""}`}>
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
            <div className="header-actions-guest desktop-only">
              <button
                type="button"
                className="header-theme-toggle standalone"
                onClick={toggleTheme}
                title={isDark ? "الوضع الفاتح" : "الوضع المظلم"}
              >
                {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
              </button>
              <div className="header-auth-buttons">
                <Button to="/login" variant="primary" className="header-btn">
                  اطلب الآن
                </Button>
                
                <div className="header-auth-dropdown" ref={authDropdownRef}>
                  <button 
                    type="button" 
                    className={`btn btn-outline header-btn header-auth-trigger ${authOpen ? 'active' : ''}`}
                    onClick={toggleAuthDropdown}
                  >
                    <span>تسجيل الدخول</span>
                    <IoIosArrowDown size={14} className={`arrow-icon ${authOpen ? 'rotate' : ''}`} />
                  </button>

                  {authOpen && (
                    <div className="header-profile-dropdown auth-dropdown">
                      <Link to="/login" className="header-dropdown-item" onClick={() => setAuthOpen(false)}>
                        <FaUser size={18} />
                        <span>تسجيل دخول</span>
                      </Link>
                      <Link to="/join" className="header-dropdown-item" onClick={() => setAuthOpen(false)}>
                        <FaUserPlus size={18} />
                        <span>إنشاء حساب</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="avatar-wrapper-header desktop-only">
              {/* Theme Toggle for Authenticated Users */}
              <button
                type="button"
                className="header-theme-toggle standalone"
                onClick={toggleTheme}
                title={isDark ? "الوضع الفاتح" : "الوضع المظلم"}
              >
                {isDark ? <FaSun size={22} /> : <FaMoon size={22} />}
              </button>


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
                  type="button"
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
                        <button type="button" onClick={markAllAsRead} className="mark-all-read">تعيين الكل كمقروء</button>
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
                <button type="button" className="profile-btn" onClick={toggleDropdown}>
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
                      type="button"
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

        {/* ================= MOBILE ACTIONS REMOVED (Moved to Sidebar) ================= */}
      </div>
    </nav>

      {/* ================= MOBILE OVERLAY & MENU ================= */}
      <div 
        className={`mobile-overlay mobile-only ${isMobileMenuOpen ? "open" : ""}`} 
        onClick={closeMobileMenu} 
        aria-hidden="true" 
      />

      <div className={`mobile-menu mobile-only ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
           <div className="mobile-header-right">
             <Link to="/" className="mobile-logo" onClick={closeMobileMenu}>
                <img src={isDark ? logoDark : logo} alt="Sanayei" style={{ height: '40px' }} />
             </Link>
             <button
               type="button"
               className="header-theme-toggle-mobile"
               onClick={toggleTheme}
               title={isDark ? "الوضع الفاتح" : "الوضع المظلم"}
             >
               {isDark ? <FaSun size={22} /> : <FaMoon size={22} />}
             </button>
           </div>
           <button className="mobile-close-btn" onClick={closeMobileMenu}>
              <FiX size={26} />
           </button>
        </div>

        {isAuthenticated && (
          <Link to={profilePath} className="mobile-user-profile" onClick={closeMobileMenu}>
            <div className="mobile-avatar-frame">
              <img 
                src={getAvatarUrl(user?.avatar, user?.name)} 
                alt="Profile" 
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getAvatarUrl(null, user?.name);
                }}
              />
              <span className="online-indicator-pulse" />
            </div>
            <div className="mobile-user-info">
              <span className="mobile-greeting">مرحباً بك</span>
              <span className="mobile-user-name">{user?.name}</span>
            </div>
            <FiChevronLeft size={24} className="mobile-profile-chevron" />
          </Link>
        )}

        <div className="mobile-menu-scrollable">
          <ul className="mobile-links">
            {isAuthenticated && (
              <>
                <li>
                  <NavLink to="/dashboard/messages" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "active" : ""}>
                    <div className="mobile-link-inner">
                      <FaCommentDots size={20} />
                      <span>الرسائل</span>
                    </div>
                    {unreadTotal > 0 && <span className="mobile-link-badge messages">{unreadTotal}</span>}
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/dashboard/notifications" onClick={closeMobileMenu} className={({ isActive }) => isActive ? "active" : ""}>
                    <div className="mobile-link-inner">
                      <FaBell size={20} />
                      <span>الإشعارات</span>
                    </div>
                    {unreadCount > 0 && <span className="mobile-link-badge notifications">{unreadCount}</span>}
                  </NavLink>
                </li>
                <div className="mobile-menu-divider" />
              </>
            )}

            {viewLinks
              .filter(link => !['/', '/services', '/store'].includes(link.path))
              .map((link) => (
                <li key={link.path}>
                  <NavLink
                    to={link.path}
                    onClick={closeMobileMenu}
                    className={({ isActive }) => isActive ? "active" : ""}
                  >
                    <div className="mobile-link-inner">
                      {/* Icons for common links */}
                      {link.path.includes('dashboard') ? <FaThLarge size={20} /> : 
                       link.path.includes('profile') ? <FaUser size={20} /> : 
                       link.path.includes('contact') ? <FaHeadset size={20} /> :
                       link.path.includes('orders') || link.label.includes('طلب') ? <FaClipboardList size={20} /> :
                       link.path.includes('about') ? <FaInfoCircle size={20} /> :
                       <FaBox size={20} />}
                      <span>{link.label}</span>
                    </div>
                  </NavLink>
                </li>
             ))}
          </ul>

          {!isAuthenticated ? (
            <div className="mobile-auth">
              <Button to="/login" variant="primary" className="header-btn" onClick={closeMobileMenu}>
                اطلب الآن
              </Button>
              <div className="mobile-auth-options">
                <Button to="/login" variant="outline" className="header-btn w-100" onClick={closeMobileMenu}>
                   <FaUser size={18} style={{marginLeft: '8px'}} />
                   تسجيل الدخول
                </Button>
                <Button to="/join" variant="outline" className="header-btn w-100" onClick={closeMobileMenu}>
                   <FaUserPlus size={18} style={{marginLeft: '8px'}} />
                   إنشاء حساب
                </Button>
              </div>
            </div>
          ) : (
            <div className="mobile-auth">

              <Link
                to={dashboardPath}
                className="header-dropdown-item mobile-dashboard-btn"
                onClick={closeMobileMenu}
              >
                <FaThLarge size={20} />
                <span>{isAdmin ? "لوحة الإدارة" : "لوحة التحكم"}</span>
              </Link>

              <button className="header-dropdown-item logout mobile-logout-btn" onClick={handleLogout}>
                <FaSignOutAlt size={20} />
                <span>تسجيل الخروج</span>
              </button>
            </div>
          )}

          {/* Social Media Footer */}
          <div className="mobile-social-footer">
            <a href="#" onClick={closeMobileMenu} aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" onClick={closeMobileMenu} aria-label="Twitter"><FaTwitter /></a>
            <a href="#" onClick={closeMobileMenu} aria-label="Instagram"><FaInstagram /></a>
            <a href="#" onClick={closeMobileMenu} aria-label="LinkedIn"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;