import { NavLink, Link } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { NAV_LINKS, type NavLinkItem } from "../../../constants/header";
import logo from "../../../assets/images/final logo.png";
import "./Header.css";

const Header: React.FC = () => {
    return (
        <header className="header">
            <nav className="header-nav">

                {/* Logo */}
                <Link to="/" className="header-logo">
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
                                {link.hasDropdown && (
                                    <IoIosArrowDown size={16} aria-hidden="true" />
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>

                {/* Actions */}
                <div className="header-actions">
                    <Link to="/login" className="btn-primary">
                        اطلب الآن
                    </Link>

                    <Link
                        to="/register"
                        className="btn-outline inline-flex items-center gap-1.5"
                    >
                        <span>تسجيل الدخول</span>
                        <IoIosArrowDown size={16} aria-hidden="true" />
                    </Link>
                </div>

            </nav>
        </header>
    );
};

export default Header;
