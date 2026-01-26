import { NavLink, Link } from "react-router-dom";
import { IoIosArrowDown, IoMdNotificationsOutline } from "react-icons/io";
import { FiMessageCircle, FiMenu, FiX } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";
import {User, LogOut} from 'lucide-react'; 

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

    // ✅ NEW: mobile menu state
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

    const dropdownRef = useRef<DropdownRef>(null);

    /* ================= HANDLERS ================= */

    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
    };

    // ✅ NEW
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(prev => !prev);
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
                <Link to="/profile" className="header-logo">
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

                    {/* Desktop Auth */}
                    {!isAuthenticated ? (
                        <div className="auto-login">
                            <Button to="/login" variant="primary">اطلب الآن</Button>
                            <Button to="/login" variant="outline">تسجيل الدخول</Button>
                        </div>
                    ) : (
                        <div className="avatar-wrapper-header">

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
                                            src={user?.profile_image_url || "/avatar.png"}
                                            alt="profile"
                                            className="profile-img"
                                        />
                                        <span className="online-dot" />
                                    </div>
                                </button>

                                {isOpen && (
                                <div className="profile-dropdown">
                                    <Link to="/profile" className="dropdown-item">
                                        <span className="icon-wrapper">
                                            <User size={20} />
                                        </span>
                                        <span className="item-text">الملف الشخصي</span>
                                    </Link>

                                    <button
                                        className="dropdown-item logout"
                                        onClick={handleLogout}
                                    >
                                        <span className="icon-wrapper">
                                            <LogOut size={20} />
                                        </span>
                                        <span className="item-text">تسجيل الخروج</span>
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

                    <ul className="mobile-links">
                        {NAV_LINKS.map(link => (
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
                            <Button to="/login" variant="primary">اطلب الآن</Button>
                            <Button to="/login" variant="outline">تسجيل الدخول</Button>
                        </div>
                    ) : (
                        <div className="mobile-auth">
                                    <Link to="/profile" className="dropdown-item">
                                        <span className="icon-wrapper">
                                            <User size={20} />
                                        </span>
                                        <span className="item-text">الملف الشخصي</span>
                                    </Link>

                                    <button
                                        className="dropdown-item logout"
                                        onClick={handleLogout}
                                    >
                                        <span className="icon-wrapper">
                                            <LogOut size={20} />
                                        </span>
                                        <span className="item-text">تسجيل الخروج</span>
                                    </button>
                                </div>
                    )}
                </div>
            )}

        </header>
    );
};

export default Header;