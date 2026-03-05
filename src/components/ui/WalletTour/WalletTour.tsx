import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronRight, FiChevronLeft, FiX, FiCheck } from "react-icons/fi";
import "./WalletTour.css";

export interface TourStep {
    targetId: string;
    title: string;
    description: string;
    position: "top" | "bottom" | "left" | "right";
}

interface WalletTourProps {
    steps: TourStep[];
    onComplete: () => void;
    isVisible: boolean;
}

const WalletTour: React.FC<WalletTourProps> = ({ steps, onComplete, isVisible }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    useEffect(() => {
        if (isVisible && steps[currentStep]) {
            const element = document.getElementById(steps[currentStep].targetId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
                setTargetRect(element.getBoundingClientRect());
            }
        }
    }, [currentStep, isVisible, steps]);

    // Update rect on resize
    useEffect(() => {
        const updateRect = () => {
            if (isVisible && steps[currentStep]) {
                const element = document.getElementById(steps[currentStep].targetId);
                if (element) setTargetRect(element.getBoundingClientRect());
            }
        };
        window.addEventListener("resize", updateRect);
        window.addEventListener("scroll", updateRect);
        return () => {
            window.removeEventListener("resize", updateRect);
            window.removeEventListener("scroll", updateRect);
        };
    }, [currentStep, isVisible, steps]);

    if (!isVisible || !steps[currentStep] || !targetRect) return null;

    const currentStepData = steps[currentStep];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div className="tour-overlay">
            {/* Spotlight Effect */}
            <div
                className="tour-spotlight"
                style={{
                    top: targetRect.top - 8,
                    left: targetRect.left - 8,
                    width: targetRect.width + 16,
                    height: targetRect.height + 16,
                }}
            />

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={`tour-card tour-card--${currentStepData.position}`}
                    style={{
                        position: 'fixed',
                        top: currentStepData.position === 'bottom' ? targetRect.bottom + 20 : (currentStepData.position === 'top' ? targetRect.top - 200 : targetRect.top),
                        left: targetRect.left + (targetRect.width / 2) - 150,
                    }}
                >
                    <button className="tour-close" onClick={onComplete}><FiX /></button>

                    <div className="tour-content">
                        <div className="tour-progress">
                            {steps.map((_, idx) => (
                                <div key={idx} className={`tour-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`} />
                            ))}
                        </div>
                        <h3>{currentStepData.title}</h3>
                        <p>{currentStepData.description}</p>
                    </div>

                    <div className="tour-footer">
                        <button
                            className="tour-btn tour-btn--prev"
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                        >
                            <FiChevronRight /> السابق
                        </button>

                        <button className="tour-btn tour-btn--next" onClick={handleNext}>
                            {currentStep === steps.length - 1 ? (
                                <>فهمت <FiCheck /></>
                            ) : (
                                <>التالي <FiChevronLeft /></>
                            )}
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default WalletTour;
