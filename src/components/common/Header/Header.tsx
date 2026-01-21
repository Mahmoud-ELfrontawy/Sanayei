import { NavLink, Link } from "react-router-dom";
import { IoIosArrowDown, IoMdNotificationsOutline } from "react-icons/io";
import { FiMessageCircle } from "react-icons/fi";
import { useEffect, useRef, useState } from "react";

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
    const dropdownRef = useRef<DropdownRef>(null);

    /* ================= HANDLERS ================= */

    const toggleDropdown = () => {
        setIsOpen((prev) => !prev);
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

                {/* Navigation Links */}
                <ul className="header-links">
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

                {/* Actions */}
                <div className="header-actions">
                    {!isAuthenticated ? (
                        <>
                            <Button to="/login" variant="primary">
                                اطلب الآن
                            </Button>
                            <Button to="/login" variant="outline">
                                تسجيل الدخول
                            </Button>
                        </>
                    ) : (
                        <div className="avatar-wrapper-header">

                            {/* 🔔 Notifications */}
                            <button className="icon-btn-login">
                                <IoMdNotificationsOutline size={24} />
                            </button>

                            {/* 💬 Messages */}
                            <button className="icon-btn-login">
                                <FiMessageCircle size={24} />
                            </button>

                            {/* 👤 Profile Dropdown */}
                            <div className="avatar-dropdown" ref={dropdownRef}>
                                <button
                                    className="profile-btn"
                                    onClick={toggleDropdown}
                                    aria-expanded={isOpen}
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
                                            👤 الملف الشخصي
                                        </Link>

                                        <button
                                            className="dropdown-item logout"
                                            onClick={handleLogout}
                                        >
                                            🚪 تسجيل الخروج
                                        </button>
                                    </div>
                                )}
                            </div>

                        </div>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;
