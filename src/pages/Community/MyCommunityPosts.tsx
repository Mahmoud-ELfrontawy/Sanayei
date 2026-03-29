import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaPlus,
    FaSpinner,
    FaStar,
    FaMapMarkerAlt,
    FaGavel,
    FaCheckCircle,
    FaClock,
    FaBan,
    FaStream,
} from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";
import { getCommunityPosts, type CommunityPost } from "../../Api/community.api";
import ReviewModal from "../../components/ui/ReviewModal/ReviewModal";
import { toast } from "react-toastify";
import "./MyCommunityPosts.css";

// ── Status Config ──────────────────────────
const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    open:        { label: "مفتوح للعروض",  className: "s-open",     icon: <FaStream /> },
    in_progress: { label: "قيد التنفيذ",    className: "s-progress",  icon: <FaClock /> },
    completed:   { label: "مكتمل",          className: "s-done",      icon: <FaCheckCircle /> },
    verified:    { label: "تم الإغلاق",     className: "s-verified",  icon: <FaCheckCircle /> },
    cancelled:   { label: "ملغي",            className: "s-cancelled", icon: <FaBan /> },
};

const getPostImage = (post: CommunityPost) =>
    post.images?.[0] || post.after_images?.[0] || null;

// ── Single Post Card ───────────────────────
interface PostCardProps {
    post: CommunityPost;
    onView: () => void;
    onRate: () => void;
}

const MyPostCard: React.FC<PostCardProps> = ({ post, onView, onRate }) => {
    const cfg = STATUS_CONFIG[post.status] || STATUS_CONFIG.open;
    const img = getPostImage(post);
    const isCompleted = post.status === "completed" || post.status === "verified";
    const canRate = isCompleted && post.accepted_offer && !post.is_reviewed;

    return (
        <article className={`mcp-card ${post.urgency === "urgent" ? "mcp-urgent" : ""}`}>
            {/* Thumbnail */}
            <div className="mcp-thumb" onClick={onView}>
                {img ? (
                    <img src={img} alt={post.title} className="mcp-thumb-img" />
                ) : (
                    <div className="mcp-thumb-placeholder">
                        <span>🔧</span>
                    </div>
                )}
                {post.urgency === "urgent" && (
                    <div className="mcp-urgent-badge">⚡ عاجل</div>
                )}
            </div>

            {/* Content */}
            <div className="mcp-body">
                <div className="mcp-top-row">
                    <div className={`mcp-status-badge ${cfg.className}`}>
                        {cfg.icon}
                        <span>{cfg.label}</span>
                    </div>
                    <span className="mcp-date">
                        {new Date(post.created_at).toLocaleDateString("ar-EG")}
                    </span>
                </div>

                <h3 className="mcp-title" onClick={onView}>{post.title}</h3>
                <p className="mcp-desc">{post.description}</p>

                <div className="mcp-meta">
                    {post.location && (
                        <span className="mcp-meta-item">
                            <FaMapMarkerAlt /> {post.location}
                        </span>
                    )}
                    <span className="mcp-meta-item">
                        <FaGavel /> {post.offers_count} عرض
                    </span>
                    {(post.budget_min || post.budget_max) && (
                        <span className="mcp-meta-item budget">
                            💰 {post.budget_min}–{post.budget_max} ج.م
                        </span>
                    )}
                </div>

                {/* Accepted offer info */}
                {post.accepted_offer && (
                    <div className="mcp-accepted-offer">
                        <img
                            src={post.acceptor?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.acceptor?.name || "؟")}&background=random`}
                            alt={post.acceptor?.name}
                            className="mcp-acc-avatar"
                        />
                        <div>
                            <span className="mcp-acc-label">المنفذ المقبول</span>
                            <span className="mcp-acc-name">{post.acceptor?.name || "صنايعي"}</span>
                        </div>
                        <div className="mcp-acc-price">{post.accepted_offer.price} ج.م</div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="mcp-footer">
                <button className="mcp-btn-view" onClick={onView}>
                    <FiArrowLeft /> عرض التفاصيل
                </button>
                {canRate ? (
                    <button className="mcp-btn-rate" onClick={onRate}>
                        <FaStar /> تقييم المنفذ
                    </button>
                ) : isCompleted && post.is_reviewed ? (
                    <span className="mcp-rated-label">
                        <FaStar /> تم التقييم ✓
                    </span>
                ) : null}
            </div>
        </article>
    );
};

// ── Main Page ──────────────────────────────
const MyCommunityPosts: React.FC = () => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<string>("all");
    const [reviewTarget, setReviewTarget] = useState<{
        postId: number;
        craftsmanId: number;
        craftsmanName: string;
    } | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await getCommunityPosts({ my_posts: 1 });
                setPosts(res.data || res || []);
            } catch (error) {
                console.error("Failed to load my community posts:", error);
                toast.error("تعذّر تحميل الطلبات");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const filtered = activeFilter === "all"
        ? posts
        : posts.filter(p => p.status === activeFilter);

    const stats = {
        all:        posts.length,
        open:       posts.filter(p => p.status === "open").length,
        in_progress:posts.filter(p => p.status === "in_progress").length,
        completed:  posts.filter(p => p.status === "completed" || p.status === "verified").length,
    };

    const TABS = [
        { key: "all",         label: `الكل (${stats.all})` },
        { key: "open",        label: `مفتوح (${stats.open})` },
        { key: "in_progress", label: `قيد التنفيذ (${stats.in_progress})` },
        { key: "completed",   label: `المكتملة (${stats.completed})` },
    ];

    const handleRate = (post: CommunityPost) => {
        if (!post.accepted_offer || !post.acceptor) {
            toast.warn("لا توجد بيانات كافية لتقييم المنفذ");
            return;
        }
        setReviewTarget({
            postId: post.id,
            craftsmanId: post.acceptor.id,
            craftsmanName: post.acceptor.name,
        });
    };

    return (
        <section className="mcp-page">
            {/* Hero */}
            <div className="mcp-hero">
                <div className="mcp-hero-inner">
                    <div>
                        <h1 className="mcp-hero-title">طلباتي في المجتمع</h1>
                        <p className="mcp-hero-sub">تتبع حالة طلباتك وقيّم الصنايعية بعد الإنجاز</p>
                    </div>
                    <div className="mcp-hero-actions">
                        <button className="mcp-btn-back" onClick={() => navigate("/community")}>
                            <FiArrowLeft /> سوق الطلبات
                        </button>
                        <button className="mcp-btn-new" onClick={() => navigate("/community/new")}>
                            <FaPlus /> طلب جديد
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mcp-tabs-wrap">
                <div className="mcp-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`mcp-tab ${activeFilter === tab.key ? "active" : ""}`}
                            onClick={() => setActiveFilter(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="mcp-content">
                {isLoading ? (
                    <div className="mcp-loading">
                        <FaSpinner className="mcp-spin" />
                        <span>جاري التحميل...</span>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="mcp-empty">
                        <div className="mcp-empty-icon">📂</div>
                        <h3>لا توجد طلبات في هذه الفئة</h3>
                        <p>جرّب فئة أخرى أو انشر طلبك الأول الآن!</p>
                        <button className="mcp-btn-new" onClick={() => navigate("/community/new")}>
                            <FaPlus /> انشر طلباً الآن
                        </button>
                    </div>
                ) : (
                    <div className="mcp-grid">
                        {filtered.map(post => (
                            <MyPostCard
                                key={post.id}
                                post={post}
                                onView={() => navigate(`/community/${post.id}`)}
                                onRate={() => handleRate(post)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewTarget && (
                <ReviewModal
                    isOpen={true}
                    onClose={() => setReviewTarget(null)}
                    craftsmanId={reviewTarget.craftsmanId}
                    craftsmanName={reviewTarget.craftsmanName}
                    communityPostId={reviewTarget.postId}
                    onSuccess={() => {
                        setPosts(prev =>
                            prev.map(p =>
                                p.id === reviewTarget.postId ? { ...p, is_reviewed: true } : p
                            )
                        );
                        setReviewTarget(null);
                    }}
                />
            )}
        </section>
    );
};

export default MyCommunityPosts;
