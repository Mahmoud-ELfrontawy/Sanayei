import { FaClock, FaCheckCircle, FaMoneyBillWave } from "react-icons/fa";
import { FiMapPin, FiTag, FiClock as FiClockIcon, FiTrendingUp, FiZap } from "react-icons/fi";
import { GiTrophy } from "react-icons/gi";
import { formatTimeAgo } from "../../utils/timeAgo";
import { getAvatarUrl } from "../../utils/imageUrl";
import type { CommunityPost } from "../../Api/community.api";
import { communityImageUrl } from "../../Api/community.api";
import { formatCommunityCategory } from "../../utils/arabicForamters";
import "./PostCard.css";


interface PostCardProps {
    post: CommunityPost;
    onClick: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
    const label = formatCommunityCategory(post.category, post.service?.name);

    // ── Resolve the actual post owner (user or company) ──────────
    const ownerName = post.company?.name || post.user?.name || "ناشر الطلب";
    const ownerAvatar = post.company?.avatar || post.user?.avatar || null;
    const ownerRole = post.company ? "ناشر الطلب" : "ناشر الطلب";

    // Icon mapping using react-icons instead of emojis
    const getCategoryIcon = () => {
        const cat = post.category || post.service?.name || "";
        if (cat.includes("كهرباء")) return <FiTag className="icon-elec" />;
        if (cat.includes("سباكة")) return <FiTag className="icon-plumb" />;
        if (cat.includes("نجارة")) return <FiTag className="icon-carp" />;
        return <FiTag />;
    };

    const getStatusInfo = () => {
        switch (post.status) {
            case "open": return { text: "مفتوح للعروض", className: "status-open", icon: <FiTrendingUp /> };
            case "in_progress": return { text: "قيد التنفيذ", className: "status-progress", icon: <FaClock /> };
            case "completed": return { text: "مكتمل", className: "status-done", icon: <FaCheckCircle /> };
            case "verified": return { text: "تم الانتهاء", className: "status-verified", icon: <FaCheckCircle /> };
            case "cancelled": return { text: "ملغي", className: "status-cancelled", icon: null };
            default: return { text: post.status, className: "", icon: null };
        }
    };

    const statusInfo = getStatusInfo();
    const hasBudget = post.budget_min || post.budget_max;

    return (
        <article className={`req-card-v2 ${post.urgency === 'urgent' ? 'is-urgent' : ''}`} onClick={onClick}>
            {/* 📷 Image Header */}
            <div className="req-card-media">
                {post.images && post.images.length > 0 ? (
                    <img src={communityImageUrl(post.images[0])} alt={post.title} className="req-card-main-img" />
                ) : (
                    <div className="req-card-placeholder">
                        <FiTag size={40} />
                    </div>
                )}
                <div className={`req-card-badge ${statusInfo.className}`}>
                    {statusInfo.icon}
                    <span>{statusInfo.text}</span>
                </div>
                {post.urgency === 'urgent' && (
                    <div className="req-card-urgent-badge">
                        <FiZap />
                        <span>عاجل</span>
                    </div>
                )}
                {post.images && post.images.length > 1 && (
                    <div className="req-card-img-count-v2">+{post.images.length - 1} صور</div>
                )}
            </div>

            {/* 📝 Content Body */}
            <div className="req-header-row">
                <span className="req-label-tag">
                    {getCategoryIcon()}
                    {label}
                </span>
                <span className="req-time-ago">
                    <FiClockIcon />
                    {formatTimeAgo(post.created_at)}
                </span>
            </div>

            <div className="req-card-main-content">
                <h3 className="req-card-title-v2">{post.title}</h3>
                <p className="req-card-desc-v2">{post.description}</p>
            </div>

            <div className="req-info-grid">
                {hasBudget && (
                    <div className="req-info-item">
                        <FaMoneyBillWave className="icon-budget" />
                        <div>
                            <label>الميزانية</label>
                            <span>
                                {post.budget_min && post.budget_max
                                    ? `${post.budget_min} - ${post.budget_max}`
                                    : post.budget_max
                                        ? `حتى ${post.budget_max}`
                                        : `تبدأ من ${post.budget_min}`}
                                <small> ج.م</small>
                            </span>
                        </div>
                    </div>
                )}
                <div className="req-info-item points-reward-v2">
                    <GiTrophy className="icon-trophy" />
                    <div>
                        <label>المكافأة</label>
                        <span>{post.points_reward ?? 50} نقطة</span>
                    </div>
                </div>
                {post.location && (
                    <div className="req-info-item full">
                        <FiMapPin className="icon-loc" />
                        <span>{post.location}</span>
                    </div>
                )}
            </div>

            <div className="req-card-footer-v2">
                <div className="req-user-info">
                    <img
                        src={getAvatarUrl(ownerAvatar, ownerName)}
                        alt={ownerName}
                        className="req-user-avatar"
                    />
                    <div className="req-user-text">
                        <span className="req-user-name">{ownerName}</span>
                        <span className="req-user-role">{ownerRole}</span>
                    </div>
                </div>
                <button className="req-view-btn">التفاصيل</button>
            </div>
        </article>
    );
};

export default PostCard;
