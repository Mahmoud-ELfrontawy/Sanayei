import React from "react";
import { motion } from "framer-motion";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa6";

import bigImg from "../../../../assets/images/portfolio image 1.png";
import smallImg from "../../../../assets/images/portfolio image 2.png";


import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { useIsMobile } from "../../../../hooks/useIsMobile";
import { toast } from "react-toastify";

import "./AboutSection.css";

const AboutSection: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, userType } = useAuth();
    const isMobile = useIsMobile();

    const handleRequestNow = () => {
        if (!isAuthenticated) {
            toast.info("من فضلك سجل دخولك أولًا 🔐");
            navigate("/login");
            return;
        }

        if (userType === 'company' || userType === 'craftsman') {
            toast.info(
                userType === 'company'
                    ? "عذراً، يجب التسجيل بحساب مستخدم عادي لطلب خدمات الصنايعية 🛠️"
                    : "عذراً، لا يمكن للصنايعي طلب خدمة من صنايعي آخر بحسابه الحالي 👤"
            );
            return;
        }

        navigate("/choose");
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: isMobile ? 0 : 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <section className="about-section" aria-labelledby="about-title">
            <div className="about-container">
                {/* Media - Sliding from Left (Negative X) */}
                <motion.div
                    className="about-media"
                    aria-hidden="true"
                    initial={{ opacity: 0, x: isMobile ? 0 : -100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                >
                    <div className="media-frame">
                        <img
                            src={bigImg}
                            alt=""
                            className="media-img media-img--large"
                            loading="lazy"
                            decoding="async"
                        />
                        <motion.img
                            initial={{ scale: 0.8, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            src={smallImg}
                            alt=""
                            className="media-img media-img--small"
                            loading="lazy"
                            decoding="async"
                        />
                        <div className="media-dots" aria-hidden="true" />
                        <div className="media-deco" />
                    </div>
                </motion.div>

                {/* Content - Sliding from Right (Positive X) */}
                <motion.div
                    className="about-content"
                    initial={{ opacity: 0, x: isMobile ? 0 : 100 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                >
                    <p className="about-eyebrow">اعرف عنا</p>

                    <h2 id="about-title" className="about-title">
                        صنايعي، شريكك الموثوق في كل إصلاح
                    </h2>

                    <p className="about-desc">
                        بنؤمن إن كل بيت أو مشروع يستحق خدمة ممتازة وسريعة،
                        علشان كده جمعنالك شبكة من الصنايعية المعتمدين.
                        صنايعي منصة ذكية بتوصلك بأفضل الحرفيين في كل التخصصات،
                        مع حجز سهل ومتابعة دقيقة لحد انتهاء المهمة.
                    </p>

                    <motion.ul
                        className="about-features"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                    >
                        <motion.li variants={itemVariants}>
                            <span className="icon">
                                <FiCheckCircle />
                            </span>
                            <div>
                                <h4>رؤيتنا</h4>
                                <p>
                                    نكون المنصة الأولى لخدمات الصيانة والديكور
                                    في الوطن العربي بجودة عالية وتجربة استخدام سهلة وآمنة.
                                </p>
                            </div>
                        </motion.li>

                        <motion.li variants={itemVariants}>
                            <span className="icon">
                                <FiClock />
                            </span>
                            <div>
                                <h4>مهمتنا</h4>
                                <p>
                                    نوفرلك صنايعي موثوق في أقصر وقت وبأسعار عادلة
                                    وجودة مضمونة.
                                </p>
                            </div>
                        </motion.li>
                    </motion.ul>

                    <motion.div
                        className="about-cta mt-5"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 }}
                    >
                        <button
                            type="button"
                            onClick={handleRequestNow}
                            className="btn-about btn-primary-about"
                        >
                            اطلب الآن
                            <FaArrowLeft />
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default AboutSection;
