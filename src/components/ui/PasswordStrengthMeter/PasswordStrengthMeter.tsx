import React, { useMemo } from "react";
import "./PasswordStrengthMeter.css";

interface PasswordStrengthMeterProps {
    password: string;
}

type StrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";

interface StrengthInfo {
    level: StrengthLevel;
    score: number; // 0-4
    label: string;
    color: string;
    tips: string[];
}

function getStrengthInfo(password: string): StrengthInfo {
    if (!password) {
        return { level: "empty", score: 0, label: "", color: "", tips: [] };
    }

    const checks = {
        length8: password.length >= 8,
        length12: password.length >= 12,
        hasLower: /[a-z]/.test(password),
        hasUpper: /[A-Z]/.test(password),
        hasDigit: /[0-9]/.test(password),
        hasSpecial: /[^A-Za-z0-9]/.test(password),
    };

    let score = 0;
    if (checks.length8) score++;
    if (checks.length12) score++;
    if (checks.hasLower && checks.hasUpper) score++;
    if (checks.hasDigit) score++;
    if (checks.hasSpecial) score++;

    // Must have both letters AND numbers at minimum
    const hasMix = (checks.hasLower || checks.hasUpper) && checks.hasDigit;

    const tips: string[] = [];
    if (!checks.length8) tips.push("على الأقل 8 أحرف");
    if (!checks.hasLower && !checks.hasUpper) tips.push("أضف حروف إنجليزية");
    else if (!checks.hasLower || !checks.hasUpper) tips.push("أضف حروف كبيرة وصغيرة");
    if (!checks.hasDigit) tips.push("أضف أرقاماً");
    if (!checks.hasSpecial) tips.push("أضف رموزاً (!@#$...)");

    // Normalize score to 0-4
    const normalizedScore = Math.min(4, score);

    if (!hasMix || score <= 1) {
        return { level: "weak", score: 1, label: "ضعيفة جداً", color: "#ef4444", tips };
    }
    if (score === 2) {
        return { level: "fair", score: 2, label: "مقبولة", color: "#f97316", tips };
    }
    if (score === 3) {
        return { level: "good", score: 3, label: "جيدة", color: "#eab308", tips };
    }
    return { level: "strong", score: normalizedScore, label: "قوية جداً ✓", color: "#22c55e", tips };
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
    const info = useMemo(() => getStrengthInfo(password), [password]);

    if (info.level === "empty") return null;

    const bars = [1, 2, 3, 4];

    return (
        <div className="psm-container">
            {/* Strength bars */}
            <div className="psm-bars">
                {bars.map((bar) => (
                    <div
                        key={bar}
                        className={`psm-bar ${info.score >= bar ? "psm-bar--filled" : ""}`}
                        style={info.score >= bar ? { backgroundColor: info.color } : {}}
                    />
                ))}
                <span className="psm-label" style={{ color: info.color }}>
                    {info.label}
                </span>
            </div>

            {/* Tips */}
            {info.tips.length > 0 && (
                <div className="psm-tips">
                    {info.tips.map((tip, i) => (
                        <span key={i} className="psm-tip">
                            • {tip}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PasswordStrengthMeter;
