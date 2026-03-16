import type { LeaderboardEntry } from "../../Api/community.api";

const BADGE_CONFIG = {
    bronze: { label: "برونزي", color: "#cd7f32", emoji: "🥉" },
    silver: { label: "فضي", color: "#9ca3af", emoji: "🥈" },
    gold: { label: "ذهبي", color: "#f59e0b", emoji: "🥇" },
    platinum: { label: "بلاتيني", color: "#6366f1", emoji: "💎" },
};

interface PointsBadgeProps {
    badge: LeaderboardEntry["badge"];
    points?: number;
    showLabel?: boolean;
    size?: "sm" | "md";
}

const PointsBadge: React.FC<PointsBadgeProps> = ({ badge, points, showLabel = true, size = "md" }) => {
    const config = BADGE_CONFIG[badge] ?? BADGE_CONFIG.bronze;
    return (
        <span
            className={`points-badge points-badge-${size}`}
            style={{
                background: `${config.color}20`,
                border: `1px solid ${config.color}40`,
                color: config.color,
            }}
        >
            <span>{config.emoji}</span>
            {showLabel && <span>{config.label}</span>}
            {points !== undefined && <span style={{ fontWeight: 700 }}>{points} نقطة</span>}
        </span>
    );
};

export default PointsBadge;
