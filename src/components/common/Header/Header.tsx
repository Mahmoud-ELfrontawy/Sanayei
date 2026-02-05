import { NavLink, Link } from "react-router-dom";
import { IoIosArrowDown, IoMdNotificationsOutline } from "react-icons/io";
import { FiMessageCircle, FiMenu, FiX } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import { User, LogOut } from "lucide-react";

import { NAV_LINKS, type NavLinkItem } from "../../../constants/header";
import logo from "../../../assets/images/final logo.png";
import "./Header.css";

import Button from "../../ui/Button/Button";
import { useAuth } from "../../../hooks/useAuth";
import { setToastAfterReload } from "../../../utils/toastAfterReload";

/* ================= TYPES ================= */
type DropdownRef = HTMLDivElement | null;

/* ================= COMPONENT ================= */

const Header: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();

    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

    const dropdownRef = useRef<DropdownRef>(null);

    /* ================= Helpers ================= */

    const userType = localStorage.getItem("userType");

    const profilePath =
        userType === "craftsman"
            ? "/craftsman/profile"
            : "/user/profile";

    /* ================= HANDLERS ================= */

    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen((prev) => !prev);
    };

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

    /* ================= EFFECTS ================= */

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
                            <Button to="/login" variant="primary">اطلب الآن</Button>
                            <Button to="/login" variant="outline">تسجيل الدخول</Button>
                        </div>
                    ) : (
                        <div className="avatar-wrapper-header desktop-only">

                            <button className="icon-btn-login">
                                <IoMdNotificationsOutline size={24} />
                            </button>

                            <button className="icon-btn-login">
                                <FiMessageCircle size={24} />
                            </button>

                            <div className="avatar-dropdown" ref={dropdownRef}>
                                <button
                                    className="profile-btn"
                                    onClick={toggleDropdown}
                                >
                                    <div className="avatar-wrapper-profile">
                                        <img
                                            src={user?.avatar || "/avatar.png"}
                                            alt="profile"
                                        />
                                        <span className="online-dot" />
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className="profile-dropdown">
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

                    {/* Quick actions */}
                    {isAuthenticated && (
                        <div className="mobile-quick-actions">
                            <button className="mobile-icon-btn">
                                <IoMdNotificationsOutline size={24} />
                                <span>الإشعارات</span>
                            </button>

                            <button className="mobile-icon-btn">
                                <FiMessageCircle size={24} />
                                <span>الرسائل</span>
                            </button>
                        </div>
                    )}

                    {/* Links */}
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

                    {/* Auth */}
                    {!isAuthenticated ? (
                        <div className="mobile-auth">
                            <Button to="/login" variant="primary">اطلب الآن</Button>
                            <Button to="/login" variant="outline">تسجيل الدخول</Button>
                        </div>
                    ) : (
                        <div className="mobile-auth">
                            <Link
                                to={profilePath}
                                className="dropdown-item"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
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
            )}
        </header>
    );
};

export default Header;
