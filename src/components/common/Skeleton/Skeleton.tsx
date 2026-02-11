import React from "react";
import "./Skeleton.css";

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
    variant?: "text" | "circular" | "rectangular";
    style?: React.CSSProperties;
}

const Skeleton: React.FC<SkeletonProps> = ({
    width,
    height,
    borderRadius,
    className = "",
    variant = "rectangular",
    style,
}) => {
    const combinedStyle: React.CSSProperties = {
        width,
        height,
        borderRadius: variant === "circular" ? "50%" : borderRadius,
        ...style,
    };

    return (
        <div
            className={`skeleton-loader ${variant} ${className}`}
            style={combinedStyle}
        />
    );
};

export default Skeleton;
