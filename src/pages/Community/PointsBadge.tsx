import React from "react";
import { GiMedal, GiTrophy, GiStarMedal } from "react-icons/gi";
import { FaAward } from "react-icons/fa";
import "./PointsBadge.css";

export const BADGE_CONFIG = {
    bronze: { 
        label: "برونزي", 
        color: "#cd7f32", 
        icon: <FaAward />, 
        next: 500,
        desc: "صنايعي صاعد"
    },
    silver: { 
        label: "فضي", 
        color: "#94a3b8", 
        icon: <GiMedal />, 
        next: 2500,
        desc: "صنايعي مجتهد"
    },
    gold: { 
        label: "ذهبي", 
        color: "#f59e0b", 
        icon: <GiStarMedal />, 
        next: 10000,
        desc: "خبير معتمد"
    },
    platinum: { 
        label: "بلاتيني", 
        color: "#6366f1", 
        icon: <GiTrophy />, 
        next: Infinity,
        desc: "أسطورة الصنايعية"
    },
};

interface PointsBadgeProps {
    points: number;
    showLabel?: boolean;
    size?: "sm" | "md" | "lg";
    variant?: "compact" | "detailed";
}

const PointsBadge: React.FC<PointsBadgeProps> = ({ 
    points, 
    showLabel = true, 
    size = "md",
    variant = "compact" 
}) => {
    const getBadgeType = (p: number) => {
        if (p >= 10000) return "platinum";
        if (p >= 2500) return "gold";
        if (p >= 500) return "silver";
        return "bronze";
    };

    const type = getBadgeType(points);
    const config = BADGE_CONFIG[type];
    
    // Calculate progress to next badge
    const getMilestones = (p: number) => {
        if (p >= 10000) return { current: 10000, next: Infinity };
        if (p >= 2500) return { current: 2500, next: 10000 };
        if (p >= 500) return { current: 500, next: 2500 };
        return { current: 0, next: 500 };
    };

    const { current: minP, next: maxP } = getMilestones(points);
    const progress = maxP === Infinity ? 100 : Math.min(((points - minP) / (maxP - minP)) * 100, 100);

    return (
        <div className={`points-badge-container badge-size-${size} badge-variant-${variant}`}>
            <div 
                className="points-badge-main"
                style={{ "--badge-color": config.color } as React.CSSProperties}
            >
                <span className="badge-icon">{config.icon}</span>
                {showLabel && (
                    <div className="badge-info">
                        <span className="badge-label">{config.label}</span>
                        <span className="badge-points">{points} نقطة</span>
                    </div>
                )}
            </div>
            
            {variant === "detailed" && (
                <div className="badge-details">
                    <p className="badge-desc">{config.desc}</p>
                    {maxP !== Infinity && (
                        <div className="badge-progress-box">
                            <div className="badge-progress-bar">
                                <div className="badge-progress-fill" style={{ width: `${progress}%` }}></div>
                            </div>
                            <span className="badge-next-msg">
                                متبقي {maxP - points} نقطة للوصول للمستوى التالي
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PointsBadge;

