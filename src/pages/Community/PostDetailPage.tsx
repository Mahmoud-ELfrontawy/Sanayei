import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FaArrowRight, FaMapMarkerAlt, FaSpinner, FaTrash,
    FaMoneyBillWave, FaClock, FaComments, FaPaperPlane,
    FaStar, FaCheckCircle, FaBriefcase, FaUserTie
} from "react-icons/fa";
import type { CommunityPost, ServiceOffer, CommunityComment } from "../../Api/community.api";
import { useCommunity } from "../../context/CommunityContext";
import { useAuth } from "../../hooks/useAuth";
import { getAvatarUrl } from "../../utils/imageUrl";
import { formatTimeAgo } from "../../utils/timeAgo";
import { toast } from "react-toastify";
import { MOCK_POSTS, MOCK_OFFERS, MOCK_COMMENTS } from "./mockData";
import "./PostDetailPage.css";

const CATEGORY_LABELS: Record<string, string> = {
    electrical: "⚡ أعمال كهرباء", plumbing: "🔧 أعمال سباكة", masonry: "🧱 أعمال بناء",
    carpentry: "🪚 أعمال نجارة", painting: "🎨 أعمال دهانات", ac: "❄️ تكييف وتبريد", other: "🔨 أخرى",
};

const PostDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated, userType } = useAuth();
    const { updatePost, removePost } = useCommunity();

    const [post, setPost] = useState<CommunityPost | null>(null);
    const [offers, setOffers] = useState<ServiceOffer[]>([]);
    const [comments, setComments] = useState<CommunityComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActing, setIsActing] = useState(false);
    const [lightboxImg, setLightboxImg] = useState<string | null>(null);

    // Offer form
    const [offerPrice, setOfferPrice] = useState("");
    const [offerDesc, setOfferDesc] = useState("");
    const [offerDays, setOfferDays] = useState("");
    const [showOfferForm, setShowOfferForm] = useState(false);

    // Comment form
    const [commentBody, setCommentBody] = useState("");
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        // MOCK MODE: load from static data
        setTimeout(() => {
            const found = MOCK_POSTS.find((p) => p.id === Number(id));
            setPost(found || null);
            setOffers([...MOCK_OFFERS]);
            setIsLoading(false);
        }, 300);
    }, [id]);

    const loadComments = async () => {
        // MOCK MODE
        setComments([...MOCK_COMMENTS]);
        setShowComments(true);
    };

    const handleSubmitOffer = async () => {
        if (!post || !offerPrice || !offerDesc || !offerDays) return;
        setIsActing(true);
        // MOCK MODE
        const newOffer: ServiceOffer = {
            id: Date.now(),
            craftsman: { id: 999, name: "أنت", avatar: "", rating: 0, completed_jobs: 0 },
            price: Number(offerPrice),
            description: offerDesc,
            delivery_days: Number(offerDays),
            status: "pending",
            created_at: new Date().toISOString(),
        };
        setOffers((prev) => [newOffer, ...prev]);
        setOfferPrice(""); setOfferDesc(""); setOfferDays("");
        setShowOfferForm(false);
        toast.success("تم إرسال عرضك بنجاح! ✅");
        setIsActing(false);
    };

    const handleAcceptOffer = async (offerId: number) => {
        if (!post || !window.confirm("هل أنت متأكد من قبول هذا العرض؟")) return;
        setIsActing(true);
        // MOCK MODE
        setOffers((prev) => prev.map((o) =>
            o.id === offerId ? { ...o, status: "accepted" as const } : { ...o, status: "rejected" as const }
        ));
        const updated = { ...post, status: "in_progress" as const };
        setPost(updated);
        updatePost(updated);
        toast.success("تم قبول العرض بنجاح! 🎉");
        setIsActing(false);
    };

    const handleAddComment = async () => {
        if (!post || !commentBody.trim()) return;
        // MOCK MODE
        const newComment: CommunityComment = {
            id: Date.now(),
            body: commentBody,
            user: { id: 999, name: "أنت", avatar: "", type: "craftsman" },
            created_at: new Date().toISOString(),
        };
        setComments((prev) => [...prev, newComment]);
        setCommentBody("");
        toast.success("تم إضافة التعليق");
    };

    const handleDelete = async () => {
        if (!post || !window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
        // MOCK MODE
        removePost(post.id);
        toast.success("تم حذف الطلب");
        navigate("/community");
    };

    if (isLoading) {
        return (
            <div className="detail-loading">
                <FaSpinner className="detail-spinner" />
                <span>جاري التحميل...</span>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="detail-error">
                <span>🔍</span>
                <p>لم يتم العثور على الطلب</p>
                <button className="detail-btn-primary" onClick={() => navigate("/community")}>العودة لسوق الطلبات</button>
            </div>
        );
    }

    const isMine = post.user.id === Number(user?.id);
    const isCraftsman = userType === "craftsman";
    const canOffer = isAuthenticated && isCraftsman && post.status === "open" && !post.has_offered && !isMine;
    const canComment = isAuthenticated && isCraftsman;
    const canAcceptOffer = isMine && post.status === "open";
    const hasBudget = post.budget_min || post.budget_max;

    const getStatusInfo = () => {
        switch (post.status) {
            case "open": return { text: "مفتوح للعروض", className: "status-open" };
            case "in_progress": return { text: "قيد التنفيذ", className: "status-progress" };
            case "completed": return { text: "مكتمل", className: "status-done" };
            default: return { text: post.status, className: "" };
        }
    };
    const statusInfo = getStatusInfo();

    return (
        <section className="detail-page">
            <div className="detail-container">
                {/* Top Bar */}
                <div className="detail-top-bar">
                    <button className="detail-back-btn" onClick={() => navigate("/community")}>
                        <FaArrowRight /> العودة لسوق الطلبات
                    </button>
                    {isMine && (
                        <button className="detail-delete-btn" onClick={handleDelete}>
                            <FaTrash /> حذف الطلب
                        </button>
                    )}
                </div>

                <div className="detail-grid">
                    {/* ── Main Content ── */}
                    <div className="detail-main">
                        <div className="detail-card">
                            {/* Header */}
                            <div className="detail-header">
                                <div className="detail-author">
                                    <img
                                        src={getAvatarUrl(post.user.avatar, post.user.name)}
                                        alt={post.user.name}
                                        className="detail-author-avatar"
                                    />
                                    <div className="detail-author-info">
                                        <span className="detail-author-name">
                                            {post.user.name}
                                            {post.user.type === "company" && (
                                                <span className="detail-company-badge">
                                                    <FaBriefcase /> شركة
                                                </span>
                                            )}
                                        </span>
                                        <span className="detail-time">
                                            <FaClock /> {formatTimeAgo(post.created_at)}
                                        </span>
                                    </div>
                                </div>
                                <span className={`detail-status ${statusInfo.className}`}>
                                    {statusInfo.text}
                                </span>
                            </div>

                            {/* Category */}
                            <span className="detail-category">
                                {CATEGORY_LABELS[post.category] || post.category}
                            </span>

                            {/* Content */}
                            <h1 className="detail-title">{post.title}</h1>
                            <p className="detail-description">{post.description}</p>

                            {/* Info Bar */}
                            <div className="detail-info-bar">
                                {hasBudget && (
                                    <div className="detail-info-item budget">
                                        <FaMoneyBillWave />
                                        <div>
                                            <span className="detail-info-label">الميزانية</span>
                                            <span className="detail-info-value">
                                                {post.budget_min && post.budget_max
                                                    ? `${post.budget_min} - ${post.budget_max} ج.م`
                                                    : post.budget_max
                                                    ? `حتى ${post.budget_max} ج.م`
                                                    : `من ${post.budget_min} ج.م`}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                {post.location && (
                                    <div className="detail-info-item location">
                                        <FaMapMarkerAlt />
                                        <div>
                                            <span className="detail-info-label">الموقع</span>
                                            <span className="detail-info-value">{post.location}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="detail-info-item offers">
                                    <FaComments />
                                    <div>
                                        <span className="detail-info-label">العروض</span>
                                        <span className="detail-info-value">{offers.length} عرض</span>
                                    </div>
                                </div>
                            </div>

                            {/* Images */}
                            {post.images?.length > 0 && (
                                <div className="detail-images">
                                    {post.images.map((img, i) => (
                                        <div key={i} className="detail-img-wrap" onClick={() => setLightboxImg(img)}>
                                            <img src={img} alt={`صورة ${i + 1}`} loading="lazy" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* ── Comments Section ── */}
                        <div className="detail-card">
                            <button className="detail-comments-toggle" onClick={!showComments ? loadComments : () => setShowComments(false)}>
                                <FaComments />
                                {showComments ? "إخفاء التعليقات" : `عرض التعليقات (${post.comments_count})`}
                            </button>

                            {showComments && (
                                <div className="detail-comments">
                                    {comments.length === 0 && (
                                        <p className="detail-no-comments">لا توجد تعليقات بعد</p>
                                    )}
                                    {comments.map((c) => (
                                        <div key={c.id} className="detail-comment">
                                            <img src={getAvatarUrl(c.user.avatar, c.user.name)} alt="" className="detail-comment-avatar" />
                                            <div className="detail-comment-body">
                                                <div className="detail-comment-header">
                                                    <span className="detail-comment-name">{c.user.name}</span>
                                                    {c.user.type === "craftsman" && (
                                                        <span className="detail-craftsman-tag">صنايعي</span>
                                                    )}
                                                    <span className="detail-comment-time">{formatTimeAgo(c.created_at)}</span>
                                                </div>
                                                <p>{c.body}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {canComment && (
                                        <div className="detail-comment-form">
                                            <input
                                                type="text"
                                                placeholder="اكتب تعليقاً..."
                                                value={commentBody}
                                                onChange={(e) => setCommentBody(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                                            />
                                            <button onClick={handleAddComment} disabled={isActing || !commentBody.trim()}>
                                                <FaPaperPlane />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Sidebar: Offers ── */}
                    <div className="detail-sidebar">
                        {/* Submit Offer (Craftsman only) */}
                        {canOffer && (
                            <div className="detail-card offer-form-card">
                                {!showOfferForm ? (
                                    <button className="detail-submit-offer-btn" onClick={() => setShowOfferForm(true)}>
                                        <FaPaperPlane /> قدّم عرضك الآن
                                    </button>
                                ) : (
                                    <div className="offer-form">
                                        <h3>
                                            <FaUserTie /> تقديم عرض
                                        </h3>
                                        <div className="offer-form-field">
                                            <label>السعر (ج.م)</label>
                                            <input
                                                type="number"
                                                placeholder="أدخل السعر"
                                                value={offerPrice}
                                                onChange={(e) => setOfferPrice(e.target.value)}
                                                min="1"
                                            />
                                        </div>
                                        <div className="offer-form-field">
                                            <label>مدة التسليم (بالأيام)</label>
                                            <input
                                                type="number"
                                                placeholder="مثال: 3"
                                                value={offerDays}
                                                onChange={(e) => setOfferDays(e.target.value)}
                                                min="1"
                                            />
                                        </div>
                                        <div className="offer-form-field">
                                            <label>وصف العرض</label>
                                            <textarea
                                                placeholder="اشرح كيف ستنفذ الخدمة..."
                                                value={offerDesc}
                                                onChange={(e) => setOfferDesc(e.target.value)}
                                                rows={4}
                                            />
                                        </div>
                                        <div className="offer-form-actions">
                                            <button className="offer-cancel-btn" onClick={() => setShowOfferForm(false)} type="button">إلغاء</button>
                                            <button
                                                className="offer-submit-btn"
                                                onClick={handleSubmitOffer}
                                                disabled={isActing || !offerPrice || !offerDesc || !offerDays}
                                            >
                                                {isActing ? <FaSpinner className="detail-spinner" /> : <>إرسال العرض <FaPaperPlane /></>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {post.has_offered && isCraftsman && (
                            <div className="detail-card offered-notice">
                                <FaCheckCircle />
                                <span>لقد قدمت عرضك على هذا الطلب بالفعل</span>
                            </div>
                        )}

                        {/* Offers list */}
                        <div className="detail-card offers-list-card">
                            <h3 className="offers-title">
                                <FaComments /> العروض المقدمة ({offers.length})
                            </h3>

                            {offers.length === 0 ? (
                                <div className="offers-empty">
                                    <span>📭</span>
                                    <p>لا توجد عروض بعد. كن أول من يقدم عرضاً!</p>
                                </div>
                            ) : (
                                <div className="offers-list">
                                    {offers.map((offer) => (
                                        <div key={offer.id} className={`offer-item ${offer.status === "accepted" ? "accepted" : ""}`}>
                                            <div className="offer-header">
                                                <div className="offer-craftsman">
                                                    <img
                                                        src={getAvatarUrl(offer.craftsman.avatar, offer.craftsman.name)}
                                                        alt={offer.craftsman.name}
                                                        className="offer-avatar"
                                                    />
                                                    <div className="offer-craftsman-info">
                                                        <span className="offer-craftsman-name">{offer.craftsman.name}</span>
                                                        <div className="offer-craftsman-rating">
                                                            <FaStar className="star-icon" />
                                                            <span>{offer.craftsman.rating || "جديد"}</span>
                                                            <span className="offer-jobs">({offer.craftsman.completed_jobs} مهمة)</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {offer.status === "accepted" && (
                                                    <span className="offer-accepted-badge">
                                                        <FaCheckCircle /> مقبول
                                                    </span>
                                                )}
                                            </div>

                                            <p className="offer-description">{offer.description}</p>

                                            <div className="offer-details">
                                                <div className="offer-price">
                                                    <FaMoneyBillWave />
                                                    <strong>{offer.price} ج.م</strong>
                                                </div>
                                                <div className="offer-delivery">
                                                    <FaClock />
                                                    <span>{offer.delivery_days} يوم</span>
                                                </div>
                                            </div>

                                            {canAcceptOffer && offer.status === "pending" && (
                                                <button
                                                    className="offer-accept-btn"
                                                    onClick={() => handleAcceptOffer(offer.id)}
                                                    disabled={isActing}
                                                >
                                                    {isActing ? <FaSpinner className="detail-spinner" /> : <>قبول العرض <FaCheckCircle /></>}
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxImg && (
                <div className="detail-lightbox" onClick={() => setLightboxImg(null)}>
                    <img src={lightboxImg} alt="full" />
                </div>
            )}
        </section>
    );
};

export default PostDetailPage;
