import React from "react";
import { WHY_ITEMS } from "./data";
import "./WhySanayeiSection.css";
import { motion } from "framer-motion";
import { useFramerInView } from "../../../../hooks/useInView";
import Counter from "../../../../components/ui/Counter";

const WhySanayeiSection: React.FC = () => {

    const { ref, isVisible } = useFramerInView();

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isVisible ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
        >
            <section className="why-section">
                <div
                    ref={ref}
                    className={`why-container ${isVisible ? "show" : ""}`}
                >

                    <div className="why-stats">
                        {WHY_ITEMS.map((item, index) => (
                            <div key={index} className="why-card">
                                <div className="why-icon">{item.icon}</div>

                                <div className="why-content">
                                    <span className="why-value">
                                        <Counter value={item.value} />
                                        {item.suffix}
                                    </span>
                                    <h4 className="why-title">{item.title}</h4>
                                    <p className="why-desc">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="why-divider" />

                    <div className="why-text">
                        <h2 className="why-heading">
                            ليه تثق في <span>“صنايعي”</span>؟
                        </h2>

                        <p>
                            لأنك بتتعامل مع منصة بتجمع أحسن الصنايعية والشركات
                            والمهندسين، وتضمنلك شغل محترف، وأسعار واضحة،
                            والتزام بالمواعيد.
                        </p>
                    </div>

                </div>
            </section>
        </motion.div>
    );
};

export default WhySanayeiSection;
