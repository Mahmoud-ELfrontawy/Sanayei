import { NavLink, Link } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { NAV_LINKS, type NavLinkItem } from "../../../constants/header";
import logo from "../../../assets/images/final logo.png";
import "./Header.css";
import Button from "../../ui/Button/Button";

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
                    <Button to="/login" variant="primary">
                        اطلب الآن
                    </Button>

                    <Button
                        to="/register"
                        variant="outline"
                        icon={<IoIosArrowDown size={16} />}
                    >
                        تسجيل الدخول
                    </Button>
                </div>
            </nav>
        </header>
    );
};

export default Header;
