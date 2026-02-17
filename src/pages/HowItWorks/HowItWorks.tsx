import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    FiUserPlus,
    FiSearch,
    FiCheckCircle,
    FiSmile,
    FiEdit3,
    FiSend,
    FiDollarSign,
    FiStar
} from 'react-icons/fi';
import './HowItWorks.css';

const HowItWorks: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'client' | 'craftsman'>('client');

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const clientSteps = [
        {
            icon: <FiUserPlus />,
            title: "سجل حسابك",
            desc: "افتح حساب جديد كعميل في ثواني معدودة وابدأ رحلتك معانا."
        },
        {
            icon: <FiSearch />,
            title: "اطلب خدمة",
            desc: "حدد نوع الخدمة اللي محتاجها، ومكانك، والموعد المناسب ليك."
        },
        {
            icon: <FiStar />,
            title: "اختار الصنايعي",
            desc: "هيوصلك عروض من صنايعية محترفين، اختار الأنسب ليك بناءً على التقييمات والسعر."
        },
        {
            icon: <FiCheckCircle />,
            title: "تمم المهمة",
            desc: "الصنايعي هيخلص الشغل في الميعاد المحدد وبأعلى جودة."
        },
        {
            icon: <FiSmile />,
            title: "قيم التجربة",
            desc: "شاركنا رأيك وقيم الصنايعي علشان تساعد غيرك يختار صح."
        }
    ];

    const craftsmanSteps = [
        {
            icon: <FiUserPlus />,
            title: "انضم إلينا",
            desc: "سجل كصنايعي وابدأ في عرض مهاراتك لمجتمع كبير من العملاء."
        },
        {
            icon: <FiEdit3 />,
            title: "كمل بروفايلك",
            desc: "ضيف صور شغلك وخبراتك علشان تجذب انتباه العملاء."
        },
        {
            icon: <FiSend />,
            title: "استقبل طلبات",
            desc: "هتوصلك تنبيهات بأي شغلانة في تخصصك وبالقرب منك."
        },
        {
            icon: <FiDollarSign />,
            title: "قدم عرضك",
            desc: "حدد سعرك وتواصل مع العميل مباشرة لترتيب الشغل."
        },
        {
            icon: <FiCheckCircle />,
            title: "انجز العمل",
            desc: "خلص شغلك بمهارة وحصل على تقييمات ممتازة تزود فرصك."
        }
    ];

    const currentSteps = activeTab === 'client' ? clientSteps : craftsmanSteps;

    return (
        <div className="hiw-page-wrapper">
            {/* Hero Section */}
            <header className="hiw-hero-section">
                <motion.div
                    className="hiw-content-container"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="hiw-hero-badge">خطوات بسيطة</span>
                    <h1 className="hiw-hero-title">كيف يعمل "صنايعي"؟</h1>
                    <p className="hiw-hero-subtitle">
                        منصة ذكية بتوصلك بأفضل الحرفيين في أسرع وقت. اعرف إزاي تبدأ معانا.
                    </p>
                </motion.div>
            </header>

            {/* Tabs Section */}
            <div className="hiw-content-container">
                <div className="hiw-tabs-outer-wrapper">
                    <div className="hiw-tabs-inner-container">
                        <button
                            className={`hiw-tab-trigger-btn ${activeTab === 'client' ? 'active' : ''}`}
                            onClick={() => setActiveTab('client')}
                        >
                            أنا صاحب عمل (عميل)
                        </button>
                        <button
                            className={`hiw-tab-trigger-btn ${activeTab === 'craftsman' ? 'active' : ''}`}
                            onClick={() => setActiveTab('craftsman')}
                        >
                            أنا صنايعي محترف
                        </button>
                    </div>
                </div>

                {/* Steps Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        className="hiw-steps-display-grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentSteps.map((step, index) => (
                            <motion.div
                                className="hiw-individual-step-card"
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.7, delay: index * 0.1 }}
                            >
                                <div className="hiw-step-bg-number">{index + 1}</div>
                                <div className="hiw-step-visual-icon">{step.icon}</div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HowItWorks;
