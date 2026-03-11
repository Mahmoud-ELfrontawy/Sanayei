import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { FiTrendingUp, FiShield, FiHeart, FiSettings, FiBriefcase, FiZap } from 'react-icons/fi';
import './LearnMorePage.css';

const LearnMorePage: React.FC = () => {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const pillars = [
        {
            icon: <FiZap />,
            title: "سرعة الاستجابة",
            desc: "احنا عارفين إن وقتك غالي، علشان كدة منصتنا مصممة توصلك بالصنايعي المناسب في دقايق."
        },
        {
            icon: <FiShield />,
            title: "أمان ومصداقية",
            desc: "كل صنايعي في شبكتنا بيتم مراجعته والتأكد من هويته وكفائته المهنية قبل ما ينضم لينا."
        },
        {
            icon: <FiTrendingUp />,
            title: "جودة معيارية",
            desc: "بنحط معايير للجودة في كل شبر، وتقييمات العملاء الحقيقية هي اللي بتحدد استمرار الصنايعي معانا."
        },
        {
            icon: <FiHeart />,
            title: "دعم مبيخلصش",
            desc: "فريق خدمة العملاء موجود دايماً علشان يضمن لك تجربة مريحة ويحل أي مشكلة تواجهك."
        }
    ];

    return (
        <div className="lm-page">
            {/* Header Hero */}
            <header className="lm-hero">
                <div className="lm-container">
                    <motion.span
                        className="lm-hero-badge"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        قصة نجاح بدأت بمهارة
                    </motion.span>
                    <motion.h1
                        className="lm-hero-title"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        لماذا اختار الآلاف منصة <span>صنايعي</span>؟
                    </motion.h1>
                    <motion.p
                        className="lm-hero-subtitle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                    >
                        صنايعي مش مجرد تطبيق، إحنا مجتمع هدفه نطور مفهوم الخدمات المنزلية في بلدنا، ونبني علاقة قايمة على الثقة والاحترام بين صاحب البيت والصنايعي الشاطر.
                    </motion.p>
                </div>

                {/* Decorative background circle */}
                <div className="lm-hero-deco" />
            </header>

            {/* Vision Section */}
            <section className="lm-section lm-vision">
                <div className="lm-container">
                    <div className="lm-visual-grid">
                        <motion.div
                            className="lm-text-side"
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="lm-section-title">إحنا بنؤمن بالمهارة المصرية</h2>
                            <p>
                                مصر مليانة صنايعية "فنانين"، بس اللي كان ناقص هو النظام والتواصل الفعال. صنايعي جه علشان يسد الفجوة دي. بنحول المهنة التقليدية لنظام رقمي ذكي بيحافظ على مهارة الإيد وبيزودها بالتكنولوجيا.
                            </p>
                            <div className="lm-stats">
                                <div className="lm-stat-item">
                                    <span className="lm-stat-num">500+</span>
                                    <span className="lm-stat-label">صنايعي معتمد</span>
                                </div>
                                <div className="lm-stat-item">
                                    <span className="lm-stat-num">98%</span>
                                    <span className="lm-stat-label">نسبة رضاء العملاء</span>
                                </div>
                            </div>
                        </motion.div>
                        <motion.div
                            className="lm-image-side"
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="lm-card-deco">
                                <FiBriefcase className="floating-icon" />
                                <FiSettings className="floating-icon-2" />
                                <div className="lm-image-placeholder">
                                    <img src="/src/assets/images/home.jpg" alt="Work Execution" />
                                    <div className="lm-video-overlay">
                                        <span className="lm-video-logo">صنايعي</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Pillars Section */}
            <section className="lm-section lm-pillars">
                <div className="lm-container">
                    <div className="lm-centered-header">
                        <h2 className="lm-section-title">أعمدة الثقة في صنايعي</h2>
                        <p className="lm-section-desc">
                            كل خطوة في التطبيق متفصلة علشان تحميك وتضمن لك أفضل نتيجة ممكنة.
                        </p>
                    </div>

                    <div className="lm-pillars-grid">
                        {pillars.map((pillar, idx) => (
                            <motion.div
                                className="lm-pillar-card"
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                whileHover={{ y: -10 }}
                            >
                                <div className="lm-pillar-icon">{pillar.icon}</div>
                                <h3>{pillar.title}</h3>
                                <p>{pillar.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Future Vision */}
            <section className="lm-section lm-footer-cta">
                <div className="lm-container">
                    <motion.div
                        className="lm-cta-inner"
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2>مستعد تبدأ تجربتك الأولى؟</h2>
                        <p>انضم لينا دلوقتي وخلي صيانة بيتك أسهل وأكثر أماناً من أي وقت فات.</p>
                        <div className="lm-cta-actions">
                            <button className="lm-btn lm-btn-primary" onClick={() => navigate('/choose')}>ابدأ حجز خدمة</button>
                            <button className="lm-btn lm-btn-outline" onClick={() => navigate('/contact')}>تواصل معنا</button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default LearnMorePage;
