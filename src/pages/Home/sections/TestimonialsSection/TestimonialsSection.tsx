import React from "react";
import { motion } from "motion/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FaQuoteRight, FaStar, FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Import Swiper styles
import "swiper/swiper-bundle.css";

import avatar1 from "../../../../assets/images/avatar1.jfif";
import avatar2 from "../../../../assets/images/image 7-2.png";
import avatar3 from "../../../../assets/images/OIP (2).jfif";
import avatar4 from "../../../../assets/images/Rectangle 35.png";
import avatar5 from "../../../../assets/images/Ellipse 16.png";

import "./TestimonialsSection.css";

const testimonials = [
    {
        id: 1,
        name: "أحمد محمد",
        role: "عميل",
        content: "بصراحة تجربة ممتازة جداً. طلبت فني سباكة وجالي في الموعد بالضبط والشغل كان احترافي ونظيف جداً. وفر عليا كتير من التعب واللف على صنايعية.",
        image: avatar1,
        rating: 5
    },
    {
        id: 2,
        name: "سارة محمود",
        role: "عميل",
        content: "كنت محتاجة نجار لتصليح عفش البيت ولقيت صنايعي شاطر جداً من خلال التطبيق. التعامل كان راقي جداً والأسعار كانت واضحة ومناسبة من البداية.",
        image: avatar2,
        rating: 4
    },
    {
        id: 3,
        name: "محمد علي",
        role: "عميل",
        content: "أفضل حاجة في صنايعي هي المصداقية والسرعة. الفني قالي على المشكلة الحقيقية وحلها بسرعة من غير لف ودوران. المتابعة من خدمة العملاء ممتازة.",
        image: avatar3,
        rating: 5
    },
    {
        id: 4,
        name: "ليلى حسن",
        role: "عميل",
        content: "تطبيق يريح البال فعلاً. جربت أكتر من خدمة وكل مرة بكون راضية تماماً عن النتيجة. فنيين محترمين وملتزمين بمواعيدهم.",
        image: avatar4,
        rating: 4
    },
    {
        id: 5,
        name: "عمر خالد",
        role: "عميل",
        content: "وفرت وقت كتير باستخدام نظام حجز الخدمات. التقنيات والتقييمات ساعدتني اختار الأنسب ليا بكل سهولة. تجربة مرشحة لكل أصحاب البيوت.",
        image: avatar5,
        rating: 5
    }
];

const TestimonialsSection: React.FC = () => {
    return (
        <section className="testimonials-section" aria-labelledby="testimonials-title">
            <div className="testimonials-container">
                <div className="testimonials-header">
                    <div className="testimonials-text-side">
                        <p className="testimonials-eyebrow">آراء عملائنا</p>
                        <h2 id="testimonials-title" className="testimonials-title">
                            ثقتكم هي سر نجاحنا
                        </h2>
                    </div>
                    
                    <div className="testimonials-nav-btns">
                        <button className="testimonial-prev">
                            <FaChevronRight />
                        </button>
                        <button className="testimonial-next">
                            <FaChevronLeft />
                        </button>
                    </div>
                </div>

                <motion.div 
                    className="testimonials-slider-wrapper"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        navigation={{
                            prevEl: '.testimonial-prev',
                            nextEl: '.testimonial-next',
                        }}
                        pagination={{ clickable: true, dynamicBullets: true }}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        breakpoints={{
                            768: {
                                slidesPerView: 2,
                            },
                            1024: {
                                slidesPerView: 3,
                            },
                        }}
                        className="testimonials-swiper"
                    >
                        {testimonials.map((item) => (
                            <SwiperSlide key={item.id}>
                                <div className="testimonial-card">
                                    <div className="card-top">
                                        <div className="quote-icon">
                                            <FaQuoteRight />
                                        </div>
                                        <div className="rating-stars">
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar 
                                                    key={i} 
                                                    className={i < item.rating ? "star-active" : "star-inactive"} 
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <p className="testimonial-content">
                                        "{item.content}"
                                    </p>
                                    
                                    <div className="testimonial-user">
                                        <div className="user-img-wrapper">
                                            <img src={item.image} alt={item.name} />
                                        </div>
                                        <div className="user-info">
                                            <h4>{item.name}</h4>
                                            <span>{item.role}</span>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </motion.div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
