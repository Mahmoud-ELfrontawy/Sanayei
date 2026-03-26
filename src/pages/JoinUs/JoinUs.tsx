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

    const faqs = [
        { q: "إزاي أسجل كصنايعي؟", a: "ببساطة اضغط على زر 'سجل الآن' وكمل بياناتك الشخصية وصور شغلك." },
        { q: "هل في مصاريف تسجيل؟", a: "لا، التسجيل على منصة صنايعي مجاني تماماً." },
        { q: "إزاي بضمن حقي المادي؟", a: "المنصة بتضمن لك حقك من خلال نظام تقييمات دقيق وتوثيق لكل العمليات." },
        { q: "هل لازم أكون عندي شركة؟", a: "لا، بنقبل الأفراد المحترفين والشركات على حد سواء." }
    ];

    return (
        <div className="ju-page-wrapper">
            {/* Background Blobs */}
            <div className="blob-bg blob-1"></div>
            <div className="blob-bg blob-2"></div>
            <div className="blob-bg blob-3"></div>

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

                <motion.div
                    className="ju-benefits-grid"
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.15
                            }
                        }
                    }}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {benefits.map((benefit, index) => (
                        <motion.div
                            className="ju-benefit-card"
                            key={index}
                            variants={{
                                hidden: { opacity: 0, y: 30, scale: 0.95 },
                                show: { opacity: 1, y: 0, scale: 1 }
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        >
                            <div className="ju-benefit-icon">{benefit.icon}</div>
                            <h3>{benefit.title}</h3>
                            <p>{benefit.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
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

            {/* FAQ Section */}
            <section className="ju-faq-section">
                <div className="ju-content-container">
                    <div className="ju-section-header">
                        <h2>الأسئلة الشائعة</h2>
                        <p>كل اللي محتاج تعرفه عن الانضمام لأسرة صنايعي.</p>
                    </div>
                    <div className="faq-grid">
                        {faqs.map((faq, index) => (
                            <motion.div 
                                className="faq-item" 
                                key={index}
                                initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                            >
                                <h4>{faq.q}</h4>
                                <p>{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default JoinUs;
