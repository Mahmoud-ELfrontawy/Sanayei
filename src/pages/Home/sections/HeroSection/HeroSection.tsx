import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronRight, FaChevronLeft } from "react-icons/fa";
import imageHome1 from "../../../../assets/images/home.jpg";
import imageHome2 from "../../../../assets/images/home2.png";
import "./HeroSection.css";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { toast } from "react-toastify";

const slides = [
    {
        id: 1,
        title: "اطلب صنايعك... وخلي الشغل علينا!",
        desc1: "مع صنايعي هتلاقي كل خدمات الصيانة والدِيكور في مكان واحد -",
        desc2: "صنايعية خبرة، أسعار واضحة، وشغل مضمون يوصل لحد بابك.",
        image: imageHome1
    },
    {
        id: 2,
        title: "لما البيت يحتاج صنايعي شاطر.. متلفش كتير",
        desc1: "كفاية تدوير على صنايعي وفي الآخر تطلع الشغلانة مش مظبوطة..",
        desc2: "معانا الصنايعي اللي بيفهم.. والسعر اللي يريّح!",
        image: imageHome2
    }
];

const HeroSection: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, userType } = useAuth();
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, []);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }, []);

    // Auto-play timer
    useEffect(() => {
        const timer = setInterval(() => {
            handleNext();
        }, 10000);
        return () => clearInterval(timer);
    }, [handleNext]);

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

    return (
        <section className="home">
            <div className="image-home">
                {/* Background Image Layer with Motion */}
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentIndex}
                        src={slides[currentIndex].image}
                        alt={`Slide ${currentIndex + 1}`}
                        className="image-home__img"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        fetchPriority="high"
                    />
                </AnimatePresence>

                <div className="image-home__overlay" />

                <div className="image-home__content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1>{slides[currentIndex].title}</h1>
                            <div className="hero-text-container mt-4">
                                <p>{slides[currentIndex].desc1}</p>
                                <p className="text-white">{slides[currentIndex].desc2}</p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRequestNow}
                            className="btn-hero"
                        >
                            اطلب الآن
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate("/choose")}
                            className="btn-outline-herosection"
                        >
                            اقرأ اكثر
                        </motion.button>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <button
                    className="slider-arrow prev"
                    onClick={handlePrev}
                    aria-label="Previous Slide"
                >
                    <FaChevronRight />
                </button>
                <button
                    className="slider-arrow next"
                    onClick={handleNext}
                    aria-label="Next Slide"
                >
                    <FaChevronLeft />
                </button>
            </div>
        </section>
    );
};

export default HeroSection;
