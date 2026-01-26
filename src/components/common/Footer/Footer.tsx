// Footer.tsx
import { Link } from "react-router-dom";
import { FiChevronUp } from "react-icons/fi";

import logo from "../../../assets/images/logo image dark 1.png";
import {
    FOOTER_LINKS,
    SOCIAL_LINKS,
    CONTACT_NUMBERS,
} from "./Footer.data";
import "./Footer.css";

const Footer: React.FC = () => {
    const scrollToTop = () =>
        window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <footer className="site-footer bg-footer text-footer-text">
            <div className="container mx-auto px-4">

                {/* ===== Top Section ===== */}
                <div className="footer-grid">

                    {/* Brand */}
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <img src={logo} alt="Sanayei Logo" />
                        </div>

                        <div className="footer-social">
                            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                                <a
                                    key={label}
                                    href={href}
                                    aria-label={label}
                                    className="social-btn-footer"
                                >
                                    <Icon />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {FOOTER_LINKS.map((section) => (
                        <div key={section.title} className="footer-links">
                            <h4>{section.title}</h4>
                            <ul>
                                {section.links.map((link) => (
                                    <li key={link.to}>
                                        <Link to={link.to}>{link.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact */}
                    <div className="footer-contact">
                        <h4>تواصل معنا</h4>
                        <ul>
                            {CONTACT_NUMBERS.map((num) => (
                                <li key={num} className="contact-item">
                                    {num}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="footer-divider" />

                {/* Bottom */}
                <div className="footer-bottom">
                    <div className="footer-legal">
                        <Link to="/privacy">سياسة الخصوصية</Link>
                        <span>|</span>
                        <Link to="/terms">شروط الاستخدام</Link>
                    </div>
                    <p>
                        Made by Sanayei © {new Date().getFullYear()}
                    </p>
                </div>
            </div>

            {/* Back to top */}
            <button
                className="back-to-top"
                onClick={scrollToTop}
                aria-label="العودة للأعلى"
            >
                <FiChevronUp />
            </button>
        </footer>
    );
};

export default Footer;
