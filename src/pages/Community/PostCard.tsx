import { FaMapMarkerAlt, FaGlobeAmericas, FaEllipsisH, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { formatTimeAgo } from "../../utils/timeAgo";
import { getAvatarUrl } from "../../utils/imageUrl";
import type { CommunityPost } from "../../Api/community.api";
import "./PostCard.css";

const CATEGORY_LABELS: Record<string, string> = {
    electrical: "أعمال كهرباء",
    plumbing: "أعمال سباكة",
    masonry: "أعمال بناء",
    carpentry: "أعمال نجارة",
    painting: "أعمال دهانات",
    ac: "تكييف وتبريد",
    other: "أخرى",
};

interface PostCardProps {
    post: CommunityPost;
    onClick: () => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
    const isUrgent = post.urgency === "urgent";

    const getStatusText = () => {
        switch (post.status) {
            case "open": return "متاح للمساعدة";
            case "in_progress": return "صنايعي في الطريق";
            case "completed": return "بانتظار تأكيد الإنجاز";
            case "verified": return "تم حل المشكلة";
            default: return post.status;
        }
    };

    return (
        <article className={`fb-post-card ${isUrgent ? 'is-urgent' : ''}`} onClick={onClick}>
            {/* Header: Avatar, Name, Time, Privacy */}
            <div className="fb-post-header">
                <img
                    src={getAvatarUrl(post.user.avatar, post.user.name)}
                    alt={post.user.name}
                    className="fb-post-avatar"
                />
                <div className="fb-post-header-info">
                    <div className="fb-post-author-row">
                        <span className="fb-post-author-name">{post.user.name}</span>
                        {/* {post.user.type === 'company' && <FaCheckCircle className="verified-icon" />} */}
                    </div>
                    <div className="fb-post-meta">
                        <span className="fb-post-time">{formatTimeAgo(post.created_at)}</span>
                        <span className="fb-post-dot">•</span>
                        <span className="fb-post-category">{CATEGORY_LABELS[post.category] || post.category}</span>
                        <span className="fb-post-dot">•</span>
                        <FaGlobeAmericas className="fb-post-privacy-icon" />
                    </div>
                </div>
                <button className="fb-post-options-btn" aria-label="خيارات المنشور">
                    <FaEllipsisH />
                </button>
            </div>

            {/* Badges Row (Urgency + Status + Location) */}
            <div className="fb-post-badges">
                {isUrgent && (
                    <span className="fb-badge badge-urgent">
                        <FaExclamationTriangle /> حالة طارئة
                    </span>
                )}
                <span className={`fb-badge badge-status status-${post.status}`}>
                    {getStatusText()}
                </span>
                {post.location && (
                    <span className="fb-badge badge-location">
                        <FaMapMarkerAlt /> {post.location}
                    </span>
                )}
            </div>

            {/* Post Content */}
            <div className="fb-post-content">
                {post.title && <h3 className="fb-post-title">{post.title}</h3>}
                <p className="fb-post-text">{post.description}</p>
            </div>

            {/* Images Grid */}
            {post.images && post.images.length > 0 && (
                <div className={`fb-post-images grid-${Math.min(post.images.length, 4)}`}>
                    {post.images.slice(0, 4).map((img, idx) => (
                        <div key={idx} className="fb-img-wrapper">
                            <img src={img} alt={`صورة المشكلة ${idx + 1}`} loading="lazy" />
                            {idx === 3 && post.images.length > 4 && (
                                <div className="fb-img-overlay">
                                    <span>+{post.images.length - 4}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Stats Row */}
            <div className="fb-post-stats">
                <div className="fb-stat-left">
                    {post.interested_count > 0 && (
                        <div className="fb-reaction-group">
                            <span className="fb-reaction-icon">✋</span>
                            <span className="fb-stat-text">{post.interested_count} مهتمين بالمساعدة</span>
                        </div>
                    )}
                </div>
                {post.points_reward > 0 && (
                    <div className="fb-stat-right">
                        <span className="fb-stat-text points-reward">🏆 {post.points_reward} نقطة</span>
                    </div>
                )}
            </div>

            {/* Action Buttons (No Comments) */}
            <div className="fb-post-actions">
                <button 
                    className={`fb-action-btn ${post.user_has_accepted ? 'active' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                >
                    <span className="action-icon">✋</span>
                    <span className="action-text">{post.user_has_accepted ? 'تم تسجيل الاهتمام' : 'مهتم بالمساعدة'}</span>
                </button>
                <button 
                    className="fb-action-btn share-btn"
                    onClick={(e) => { e.stopPropagation(); /* share logic */ }}
                >
                    <span className="action-icon">📤</span>
                    <span className="action-text">مشاركة</span>
                </button>
            </div>
        </article>
    );
};

export default PostCard;
