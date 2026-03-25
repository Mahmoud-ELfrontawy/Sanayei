import { FaMapMarkerAlt, FaMoneyBillWave, FaComments, FaClock, FaCheckCircle } from "react-icons/fa";
import { formatTimeAgo } from "../../utils/timeAgo";
import { getAvatarUrl } from "../../utils/imageUrl";
import type { CommunityPost } from "../../Api/community.api";
import { communityImageUrl } from "../../Api/community.api";
import "./PostCard.css";


interface PostCardProps {
    post: CommunityPost;
    onClick: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
    const label = post.service?.name || post.category || "طلب خدمة";
    const emoji = post.service?.icon || "🔨";

    const getStatusInfo = () => {
        switch (post.status) {
            case "open": return { text: "مفتوح للعروض", className: "status-open" };
            case "in_progress": return { text: "قيد التنفيذ", className: "status-progress" };
            case "completed": return { text: "مكتمل", className: "status-done" };
            case "verified": return { text: "مُتحقق منه ✓", className: "status-verified" };
            case "cancelled": return { text: "ملغي", className: "status-cancelled" };
            default: return { text: post.status, className: "" };
        }
    };

    const statusInfo = getStatusInfo();
    const hasBudget = post.budget_min || post.budget_max;

    return (
        <article className="req-card" onClick={onClick}>
            {/* Image OR Placeholder */}
            <div className={`req-card-img ${!post.images || post.images.length === 0 ? "no-image" : ""}`}>
                {post.images && post.images.length > 0 ? (
                    <>
                        <img src={communityImageUrl(post.images[0])} alt={post.title} loading="lazy" />
                        {post.images.length > 1 && (
                            <span className="req-card-img-count">+{post.images.length - 1}</span>
                        )}
                    </>
                ) : (
                    // Placeholder when no image exists
                    <div className="req-card-img-placeholder">
                        <span className="placeholder-icon">{emoji}</span>
                        <span className="placeholder-text">{label}</span>
                    </div>
                )}
                <span className={`req-card-status-badge ${statusInfo.className}`}>
                    {post.status === "completed" && <FaCheckCircle />}
                    {statusInfo.text}
                </span>
            </div>

            {/* Body */}
            <div className="req-card-body">
                {/* Category (Always visible) */}
                <div className="req-card-top-row">
                    <span className="req-card-category">
                        {emoji} {label}
                    </span>
                </div>

                {/* Title */}
                <h3 className="req-card-title">{post.title}</h3>

                {/* Description */}
                <p className="req-card-desc">{post.description}</p>

                {/* Meta */}
                <div className="req-card-meta">
                    <div className="req-card-meta-row">
                        {hasBudget && (
                            <div className="req-card-meta-item budget">
                                <FaMoneyBillWave />
                                <span>
                                    {post.budget_min && post.budget_max
                                        ? `${post.budget_min} - ${post.budget_max} ج.م`
                                        : post.budget_max
                                        ? `حتى ${post.budget_max} ج.م`
                                        : `من ${post.budget_min} ج.م`}
                                </span>
                            </div>
                        )}
                        <div className="req-card-meta-item offers">
                            <FaComments />
                            <span>{post.offers_count} عرض</span>
                        </div>
                    </div>
                    {post.location && (
                        <div className="req-card-meta-item location">
                            <FaMapMarkerAlt />
                            <span>{post.location}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="req-card-footer">
                    <div className="req-card-author">
                        <img
                            src={getAvatarUrl(post.user.avatar, post.user.name)}
                            alt={post.user.name}
                            className="req-card-avatar"
                        />
                        <span className="req-card-author-name">{post.user.name}</span>
                    </div>
                    <span className="req-card-time">
                        <FaClock />
                        {formatTimeAgo(post.created_at)}
                    </span>
                </div>
            </div>
        </article>
    );
};

export default PostCard;
