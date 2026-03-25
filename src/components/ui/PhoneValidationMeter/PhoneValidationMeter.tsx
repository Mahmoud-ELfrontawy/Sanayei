import React, { useMemo } from "react";
import "./PhoneValidationMeter.css";

interface PhoneValidationMeterProps {
    phone: string;
}

type ValidationLevel = "empty" | "invalid" | "partial" | "valid";

interface ValidationInfo {
    level: ValidationLevel;
    score: number; // 0-3
    label: string;
    color: string;
    tips: string[];
}

function getValidationInfo(phone: string): ValidationInfo {
    if (!phone) {
        return { level: "empty", score: 0, label: "", color: "", tips: [] };
    }

    const checks = {
        isDigits: /^\d+$/.test(phone),
        startsCorrect: /^(010|011|012|015)/.test(phone),
        length11: phone.length === 11,
    };

    const tips: string[] = [];
    if (!checks.isDigits) tips.push("أرقام فقط");
    if (!checks.startsCorrect) tips.push("يجب أن يبدأ بـ 010, 011, 012, 015");
    if (phone.length < 11) tips.push("على الأقل 11 رقم");
    if (phone.length > 11) tips.push("لا يزيد عن 11 رقم");

    let score = 0;
    if (phone.length > 0 && checks.isDigits) score = 1;
    if (score === 1 && checks.startsCorrect) score = 2;
    if (score === 2 && checks.length11) score = 3;

    if (!checks.isDigits || (phone.length > 0 && !checks.startsCorrect && phone.length >= 3)) {
        return { level: "invalid", score: 1, label: "رقم غير صحيح", color: "var(--color-error)", tips };
    }

    if (score === 2) {
        return { level: "partial", score: 2, label: "جاري الإدخال...", color: "#f97316", tips };
    }

    if (score === 3) {
        return { level: "valid", score: 3, label: "رقم صحيح ✓", color: "#22c55e", tips: [] };
    }

    return { level: "partial", score: 1, label: "أكمل الرقم", color: "var(--slate-300)", tips };
}

const PhoneValidationMeter: React.FC<PhoneValidationMeterProps> = ({ phone }) => {
    const info = useMemo(() => getValidationInfo(phone), [phone]);

    if (info.level === "empty") return null;

    const bars = [1, 2, 3];

    return (
        <div className="pvm-container">
            <div className="pvm-bars">
                {bars.map((bar) => (
                    <div
                        key={bar}
                        className={`pvm-bar ${info.score >= bar ? "pvm-bar--filled" : ""}`}
                        style={info.score >= bar ? { backgroundColor: info.color } : {}}
                    />
                ))}
                <span className="pvm-label" style={{ color: info.color }}>
                    {info.label}
                </span>
            </div>

            {info.tips.length > 0 && (
                <div className="pvm-tips">
                    {info.tips.map((tip, i) => (
                        <span key={i} className="pvm-tip">
                            • {tip}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PhoneValidationMeter;

