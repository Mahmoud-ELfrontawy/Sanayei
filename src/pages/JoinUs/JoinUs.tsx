import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { FiBriefcase, FiTrendingUp, FiCheckCircle, FiShield, FiZap } from 'react-icons/fi';
import './JoinUs.css';

const JoinUs: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const benefits = [
        {
            icon: <FiZap />,
            title: "زيادة دخلك اليومي",
            desc: "افتح باب جديد للرزق واستقبل طلبات تشغيل حقيقية في منطقتك وتخصصك."
        },
        {
            icon: <FiTrendingUp />,
            title: "بناء سمعة رقمية",
            desc: "احصل على تقييمات حقيقية من عملائك تزيد من ثقتهم في مهاراتك وتجذب لك المزيد."
        },
        {
            icon: <FiShield />,
            title: "حماية حقوقك",
            desc: "نحن نضمن بيئة عمل عادلة تضمن حق الصنايعي الشاطر في الحصول على مستحقاته."
        },
        {
            icon: <FiBriefcase />,
            title: "تنظيم وقتك",
            desc: "انت مدير نفسك، حدد مواعيدك واقبل الشغل اللي يناسب جدولك الزمني."
        }
    ];

    return (
        <div className="ju-page-wrapper">
            {/* Hero Section */}
            <header className="ju-hero-section">
                <motion.div
                    className="ju-content-container"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="ju-hero-badge">كن شريكنا في النجاح</span>
                    <h1 className="ju-hero-title">حول مهارتك إلى مصدر دخل مستمر</h1>
                    <p className="ju-hero-subtitle">
                        انضم إلى آلاف الحرفيين المعتمدين في منصة "صنايعي" وابدأ في بناء مستقبلك المهني اليوم.
                    </p>
                    <motion.button
                        className="ju-main-cta-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        ابدأ التسجيل الآن
                    </motion.button>
                </motion.div>
            </header>

            {/* Why Join Us Grid */}
            <section className="ju-content-container ju-benefits-section">
                <div className="ju-section-header">
                    <h2>ليه تنضم لشبكة صنايعي؟</h2>
                    <p>بنقدم لك الأدوات والبيئة اللي تساعدك تنجح وتكبر في سوق العمل.</p>
                </div>

                <div className="ju-benefits-grid">
                    {benefits.map((benefit, index) => (
                        <motion.div
                            className="ju-benefit-card"
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                        >
                            <div className="ju-benefit-icon">{benefit.icon}</div>
                            <h3>{benefit.title}</h3>
                            <p>{benefit.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="ju-register-cta">
                <div className="ju-content-container">
                    <motion.div
                        className="ju-cta-box"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <FiCheckCircle className="ju-check-icon" />
                        <h2>جاهز تبدأ أول "شغلانة ؟"</h2>
                        <p>التسجيل مجاني تماماً ولا يستغرق أكثر من دقيقتين. جهز صور شغلك وخليك مستعد.</p>
                        <div className="ju-cta-buttons">
                            <button className="btn-primary">سجل كصنايعي الآن</button>
                            <button className="btn-outline">اقرأ الشروط والأحكام</button>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default JoinUs;
