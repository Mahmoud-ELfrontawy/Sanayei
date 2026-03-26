import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { FiCheckCircle, FiTarget, FiTool, FiUsers, FiStar } from 'react-icons/fi';
import './AboutUs.css';

// Images - using existing images from the project
import aboutImg from "../../assets/images/portfolio image 1.png";
import toolsImg from "../../assets/images/image5.png"; // Using a placeholder-like image for the tools section

const AboutUs: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const stats = [
        { label: "صنايعي شاطر", value: "2,000+" },
        { label: "عميل راضي", value: "50,000+" },
        { label: "خدمة منفذة", value: "120,000+" },
        { label: "محافظة مصرية", value: "27" }
    ];

    return (
        <div className="about-page">
            {/* Background Blobs */}
            <div className="blob-bg blob-1"></div>
            <div className="blob-bg blob-2"></div>
            <div className="blob-bg blob-3"></div>

            {/* Hero Section */}
            <header className="about-hero">
                <motion.div
                    className="hero-container"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="hero-badge">من نحن</span>
                    <h1 className="hero-title">نبني جسور الثقة بين العميل والصنايعي المحترف</h1>
                    <p className="hero-subtitle">
                        صنايعي هي المنصة الرائدة في تحويل تجربة البحث عن الحرفيين إلى تجربة سهلة، آمنة، وموثوقة تماماً.
                    </p>
                </motion.div>
            </header>

            {/* Mission & Vision Section */}
            <section className="section-container">
                <motion.div
                    className="mission-vision-grid"
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.2
                            }
                        }
                    }}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <motion.div
                        className="feature-card"
                        whileHover={{ y: -10 }}
                        variants={{
                            hidden: { opacity: 0, y: 50 },
                            show: { opacity: 1, y: 0 }
                        }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="feature-icon"><FiTarget /></div>
                        <h3>رؤيتنا</h3>
                        <p>أن نصبح الوجهة الأولى في الوطن العربي لطلب خدمات الصيانة المنزلية والديكور بجودة تضاهي المعايير العالمية.</p>
                    </motion.div>

                    <motion.div
                        className="feature-card"
                        whileHover={{ y: -10 }}
                        variants={{
                            hidden: { opacity: 0, y: 50 },
                            show: { opacity: 1, y: 0 }
                        }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="feature-icon"><FiCheckCircle /></div>
                        <h3>رسالتنا</h3>
                        <p>تسهيل حياة الناس من خلال توفير أفضل الصنايعية المعتمدين والموثوقين، وضمان حق العميل والصنايعي في تجربة عمل عادلة.</p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-container">
                    {stats.map((stat, index) => (
                        <motion.div 
                            key={index}
                            className="stat-item"
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Our Story Section */}
            <section className="section-container">
                <div className="section-grid">
                    <motion.div
                        className="section-content"
                        initial={{ opacity: 0, x: 80 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        <h2>قصتنا.. لماذا صنايعي؟</h2>
                        <p>
                            بدأت فكرتنا من معاناة البحث عن صنايعي شاطر وموثوق في وقت الأزمات. قررنا نبني منصة بتجمع بين التكنولوجيا المتطورة وبين المهارة الحرفية العالية.
                        </p>
                        <p>
                            إحنا مش مجرد وسيط، إحنا شركاء في نجاح كل صنايعي بيحاول يحسن دخله ويطور من نفسه، وشركاء في راحة كل عميل بيدور على الأمان والجودة.
                        </p>
                    </motion.div>
                    <motion.div
                        className="section-image"
                        initial={{ opacity: 0, x: -80 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <img src={aboutImg} alt="قصة صنايعي" />
                    </motion.div>
                </div>
            </section>

            {/* Upcoming Company Section */}
            <section className="company-highlight">
                <div className="company-container">
                    <motion.div
                        className="company-image order-first"
                        initial={{ opacity: 0, scale: 0.85 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <img src={toolsImg} alt="صنايعي للعدد والأدوات" />
                    </motion.div>
                    <motion.div
                        className="company-content"
                        initial={{ opacity: 0, y: 60 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    >
                        <h2>قريباً.. شركة صنايعي للعدد</h2>
                        <p>
                            لإننا فاهمين إن الصنايعي الشاطر بيحتاج عدة شاطرة، بنجهز حالياً لإطلاق ذراعنا التجاري "شركة صنايعي للأدوات الكهربائية".
                        </p>
                        <ul className="company-features-list">
                            <li><span><FiStar /></span> أفضل ماركات العدد والأدوات الكهربائية العالمية.</li>
                            <li><span><FiStar /></span> أسعار تنافسية خاصة وحصرية لصنايعية المنصة.</li>
                            <li><span><FiStar /></span> نظام تقسيط مريح لتجديد عدتك وتكبير شغلك.</li>
                            <li><span><FiStar /></span> ضمان حقيقي وقطع غيار أصلية.</li>
                        </ul>
                    </motion.div>
                </div>
            </section>

            {/* How we Differ Section */}
            <section className="section-container" style={{ textAlign: 'center' }}>
                <motion.h2
                    className="different-heading"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.7 }}
                >
                    ما الذي يميزنا؟
                </motion.h2>
                <motion.div
                    className="mission-vision-grid"
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.2
                            }
                        }
                    }}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                >
                    <motion.div
                        className="feature-card"
                        variants={{
                            hidden: { opacity: 0, y: 40 },
                            show: { opacity: 1, y: 0 }
                        }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="feature-icon"><FiUsers /></div>
                        <h3>حرفيين معتمدين</h3>
                        <p>كل صنايعي على المنصة بيتم فحصه وتقييمه بعناية لضمان الكفاءة والأمان التام لبيتك.</p>
                    </motion.div>
                    <motion.div
                        className="feature-card"
                        variants={{
                            hidden: { opacity: 0, y: 40 },
                            show: { opacity: 1, y: 0 }
                        }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="feature-icon"><FiTool /></div>
                        <h3>دعم فني مستمر</h3>
                        <p>فريقنا متاح على مدار الساعة لمساعدتك في الحصول على أفضل تجربة صيانة ممكنة.</p>
                    </motion.div>
                    <motion.div
                        className="feature-card"
                        variants={{
                            hidden: { opacity: 0, y: 40 },
                            show: { opacity: 1, y: 0 }
                        }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="feature-icon"><FiStar /></div>
                        <h3>جودة مضمونة</h3>
                        <p>بنضمن لك حقك في إعادة الشغل أو حل أي ملاحظة لو مكنتش راضي 100% عن النتيجة.</p>
                    </motion.div>
                </motion.div>
            </section>
        </div>
    );
};

export default AboutUs;
