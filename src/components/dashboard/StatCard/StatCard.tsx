import React from "react";
import "./StatCard.css";

interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    isPositive?: boolean;
    icon?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon }) => {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <span className="stat-title">{title}</span>
                {icon && <span className="stat-icon">{icon}</span>}
            </div>
            <div className="stat-value">{value}</div>
            {change && (
                <div className={`stat-change ${isPositive ? "positive" : "negative"}`}>
                    {isPositive ? "+" : "-"}{change}
                </div>
            )}
        </div>
    );
};

export default StatCard;
