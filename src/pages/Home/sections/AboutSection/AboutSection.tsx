// AboutSection.tsx
import React from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa6";

import bigImg from "../../../../assets/images/portfolio image 1.png";
import smallImg from "../../../../assets/images/portfolio image 2.png";
import mediaDot from "../../../../assets/images/dots.png";

import "./AboutSection.css";

const AboutSection: React.FC = () => {
    return (
        <section className="about-section" aria-labelledby="about-title">
            <div className="about-container">

                <div className="about-media" aria-hidden="true">
                    <div className="media-frame">
                        <img
                            src={bigImg}
                            alt=""
                            className="media-img media-img--large"
                        />
                        <img
                            src={smallImg}
                            alt=""
                            className="media-img media-img--small"
                        />
                        <img src={mediaDot} alt="" className="media-dots" />
                        <div className="media-deco" />
                    </div>
                </div>


                <div className="about-content">
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

                    <ul className="about-features">
                        <li>
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
                        </li>

                        <li>
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
                        </li>
                    </ul>

                    <div className="about-cta mt-5">
                        <Link
                            to="/request-service"
                            className="btn-about btn-primary-about
                            inline-flex items-center justify-between gap-2"
                        >
                            اطلب الآن
                            <FaArrowLeft />
                        </Link>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default AboutSection;
