import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    FaArrowRight, FaMapMarkerAlt, FaSpinner, FaTrash,
    FaMoneyBillWave, FaClock, FaComments, FaPaperPlane,
    FaStar, FaCheckCircle, FaBriefcase, FaUserTie, FaLock, FaBolt,
    FaCommentDots, FaShieldAlt, FaBan, FaCheckDouble, FaTimes
} from "react-icons/fa";
import { GiTrophy } from "react-icons/gi";
import { FiTag } from "react-icons/fi"; // Added FiTag import
import type { CommunityPost, ServiceOffer, CommunityComment } from "../../Api/community.api";
import {
    getCommunityPost,
    getPostOffers,
    submitOffer,
    acceptOffer,
    verifyCommunityPost,
    getCommunityComments,
    addCommunityComment,
    deleteCommunityPost,
    communityImageUrl,
} from "../../Api/community.api";
import { formatArabicDays, formatCommunityCategory } from "../../utils/arabicForamters";
import { useCommunity } from "../../context/CommunityContext";
import { useAuth } from "../../hooks/useAuth";
import { getAvatarUrl } from "../../utils/imageUrl";
import { formatTimeAgo } from "../../utils/timeAgo";
import { toast } from "react-toastify";
import { useUserChat } from "../../context/UserChatProvider";
import { useCraftsmanChat } from "../../context/CraftsmanChatProvider";
import api from "../../Api/api";
import "./PostDetailPage.css";


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

    // شات — يجب يكون فوق كل الكود (Rules of Hooks)
    const userChat = useUserChat();
    const craftsmanChat = useCraftsmanChat();

    // Offer form
    const [offerPrice, setOfferPrice] = useState("");
    const [offerDesc, setOfferDesc] = useState("");
    const [offerDays, setOfferDays] = useState("");
    const [showOfferForm, setShowOfferForm] = useState(false);

    // Comment form
    const [commentBody, setCommentBody] = useState("");
    const [showComments, setShowComments] = useState(false);
    const [commentsLoaded, setCommentsLoaded] = useState(false);

    // 🌟 Review State
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isReviewing, setIsReviewing] = useState(false);

    /* ── Load post + offers ── */
    useEffect(() => {
        if (!id) return;
        setIsLoading(true);

        const load = async () => {
            try {
                const [postRes, offersRes] = await Promise.all([
                    getCommunityPost(Number(id)),
                    getPostOffers(Number(id)),
                ]);
                const postData: CommunityPost = postRes.data ?? postRes;
                const offersData: ServiceOffer[] = offersRes.data ?? offersRes ?? [];
                setPost(postData);
                setOffers(offersData);
            } catch {
                toast.error("فشل تحميل بيانات الطلب");
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [id]);

    /* ── Load comments ── */
    const loadComments = async () => {
        if (commentsLoaded) { setShowComments(true); return; }
        try {
            const res = await getCommunityComments(Number(id));
            setComments(res.data ?? res ?? []);
            setCommentsLoaded(true);
            setShowComments(true);
        } catch {
            toast.error("فشل تحميل التعليقات");
        }
    };

    /* ── Submit Offer ── */
    const handleSubmitOffer = async () => {
        if (!post || !offerPrice || !offerDesc || !offerDays) return;
        setIsActing(true);
        try {
            const res = await submitOffer(Number(id), {
                price: Number(offerPrice),
                description: offerDesc,
                delivery_days: Number(offerDays),
            });
            const newOffer: ServiceOffer = res.data ?? res;
            setOffers((prev) => [newOffer, ...prev]);
            setPost((p) => p ? { ...p, has_offered: true, offers_count: (p.offers_count ?? 0) + 1 } : p);
            setOfferPrice(""); setOfferDesc(""); setOfferDays("");
            setShowOfferForm(false);
            toast.success("تم إرسال عرضك بنجاح! ✅");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "حدث خطأ أثناء إرسال العرض");
        } finally {
            setIsActing(false);
        }
    };

    /* ── Accept Offer ── */
    const handleAcceptOffer = async (offerId: number) => {
        if (!post || !window.confirm("هل أنت متأكد من قبول هذا العرض؟")) return;
        setIsActing(true);
        try {
            const res = await acceptOffer(Number(id), offerId);

            // ✅ التعامل مع الرد الجديد من الباكيند (success: true, data: CommunityPost)
            if (res.success || res.data) {
                const updatedPost: CommunityPost = res.data;
                setPost(updatedPost);
                updatePost(updatedPost);

                // تحديث العروض محلياً
                setOffers((prev) =>
                    prev.map((o) => o.id === offerId
                        ? { ...o, status: "accepted" as const }
                        : { ...o, status: "rejected" as const }
                    )
                );
                toast.success(res.message || "تم قبول العرض! جاري التنفيذ 🎉");
            } else {
                toast.error(res.message || "فشل قبول العرض");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "حدث خطأ أثناء قبول العرض");

        } finally {
            setIsActing(false);
        }
    };

    /* ── Add Comment ── */
    const handleAddComment = async () => {
        if (!post || !commentBody.trim()) return;
        setIsActing(true);
        try {
            const res = await addCommunityComment(Number(id), commentBody.trim());
            const newComment: CommunityComment = res.data ?? res;
            setComments((prev) => [...prev, newComment]);
            setPost((p) => p ? { ...p, comments_count: (p.comments_count ?? 0) + 1 } : p);
            setCommentBody("");
            toast.success("تم إضافة التعليق ✅");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "فشل إرسال التعليق");
        } finally {
            setIsActing(false);
        }
    };

    /* ── Delete Post ── */
    const handleDelete = async () => {
        if (!post || !window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
        try {
            await deleteCommunityPost(Number(id));
            removePost(post.id);
            toast.success("تم حذف الطلب");
            navigate("/community");
        } catch {
            toast.error("فشل حذف الطلب");
        }
    };

    /* ── Verify/Complete Post ── */
    const handleReviewSubmit = async () => {
        if (!post || !post.acceptor) return;
        setIsReviewing(true);
        try {
            await api.post("/reviews", {
                craftsman_id: post.acceptor.id,
                community_post_id: post.id,
                rating: reviewRating,
                comment: reviewComment,
            });
            toast.success("شكراً لتقييمك! تم إغلاق الطلب بنجاح 🌟");
            setShowReviewModal(false);
            setPost(prev => prev ? { ...prev, status: "verified" as const, is_reviewed: true } : prev);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "فشل إرسال التقييم");
        } finally {
            setIsReviewing(false);
        }
    };

    const handleVerify = async () => {
        if (!post || !window.confirm("هل تؤكد استلام الخدمة المكتملة؟ سيتم تحويل النقاط للصنايعي.")) return;
        setIsActing(true);
        try {
            const res = await verifyCommunityPost(Number(id));

            if (res.success) {
                const fresh = await getCommunityPost(Number(id));
                const updatedPost: CommunityPost = fresh.data ?? fresh;
                setPost(updatedPost);
                updatePost(updatedPost);
                toast.success(res.message || "تم تأكيد الإكمال وصرف المكافأة! 🎉");
                setShowReviewModal(true); // Open modal automatically
            } else {
                toast.error(res.message || "فشل تأكيد الإكمال");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "فشل تأكيد الإكمال");
        } finally {
            setIsActing(false);
        }
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

    const userId = user?.id ? Number(user.id) : null;

    // 🔍 فحص دقيق للملكية لفتح الأزرار (الحذف / التأكيد / القبول)
    const isMine = post.is_mine || (
        userType === 'company'
            ? (post.company_id != null && Number(post.company_id) === userId)
            : (post.user_id != null && Number(post.user_id) === userId)
    );

    const isCraftsman = userType === "craftsman";
    const isLocked = post.status === "in_progress" || post.status === "completed" || post.status === "verified" || post.status === "cancelled";
    const canOffer = isAuthenticated && isCraftsman && post.status === "open" && !post.has_offered && !isMine;
    const canComment = isAuthenticated && !isLocked;
    const canAcceptOffer = isMine && post.status === "open";

    // شات المجتمع بيتفتح لصاحب الطلب + الصنايعي المقبول فقط وبس لما الحالة in_progress
    const isAcceptor = isCraftsman && post.acceptor?.id === Number(user?.id);
    const canChat = (isMine || isAcceptor) && post.status === "in_progress";
    const canVerify = isMine && post.status === "in_progress";
    const canReview = isMine && post.status === "verified" && !post.is_reviewed;

    // ديبك: شوف حالة العروض والمتغيرات

    const handleStartChat = () => {
        if (!post.acceptor) return;

        const receiverType: "worker" | "company" | "user" = isMine
            ? "worker"
            : (post.user?.type === "company" ? "company" : "user");

        const receiver = isMine
            ? { id: post.acceptor.id, name: post.acceptor.name }
            : { id: post.user?.id || 0, name: post.user?.name || "مستخدم" };

        const contact = { ...receiver, type: receiverType, avatar: undefined, unread_count: 0, isCommunityChat: true };

        if (isCraftsman) craftsmanChat.setActiveChat(contact);
        else userChat.setActiveChat(contact);

        navigate("/dashboard/messages");
    };

    const getStatusInfo = () => {
        switch (post.status) {
            case "open": return { text: "مفتوح للعروض", className: "status-open", icon: <FaBolt /> };
            case "in_progress": return { text: "قيد التنفيذ", className: "status-progress", icon: <FaClock /> };
            case "completed": return { text: "مكتمل", className: "status-done", icon: <FaCheckCircle /> };
            case "verified": return { text: " تم الانتهاء ✓", className: "status-verified", icon: <FaCheckCircle /> };
            case "cancelled": return { text: "ملغي", className: "status-cancelled", icon: <FaBan /> };
            default: return { text: post.status, className: "", icon: null };
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

                {/* Status Card (Locked/Active/Verified) */}
                {isLocked && (
                    <div className={`detail-status-card ${post.status}`}>
                        <div className="status-card-inner">
                            <div className="status-icon-wrap">
                                {post.status === "verified" ? <FaCheckDouble /> :
                                    post.status === "cancelled" ? <FaBan /> :
                                        <FaShieldAlt />}
                            </div>

                            <div className="status-content">
                                <div className="status-header">
                                    <h2 className="status-title">
                                        {post.status === "in_progress" && "الطلب قيد التنفيذ حالياً"}
                                        {post.status === "completed" && "تم إكمال تنفيذ الخدمة"}
                                        {post.status === "verified" && "تم إغلاق الطلب بنجاح ✓"}
                                        {post.status === "cancelled" && "هذا الطلب ملغى"}
                                    </h2>
                                    <span className="status-badge">
                                        {post.status === "in_progress" && "نشط"}
                                        {post.status === "completed" && "بانتظار التأكيد"}
                                        {post.status === "verified" && "مكتمل"}
                                        {post.status === "cancelled" && "مغلق"}
                                    </span>
                                </div>
                                <p className="status-message">
                                    {post.status === "in_progress" && "تم قبول عرض صنايعي وهو يعمل حالياً على تنفيذ طلبك. يمكنك التواصل معه عبر المحادثة."}
                                    {post.status === "completed" && "انتهى الصنايعي من العمل وبانتظار مراجعتك وتأكيد استلام الخدمة لصرف النقاط."}
                                    {post.status === "verified" && "لقد قمت بتأكيد استلام الخدمة. تم تحويل النقاط للصنايعي وإغلاق الطلب رسمياً."}
                                    {post.status === "cancelled" && "قام صاحب الطلب بإلغاء هذا الطلب ولم يعد متاحاً لأي عروض أو مراسلات."}
                                </p>

                                {/* Actions Row */}
                                {(canChat || canVerify) && (
                                    <div className="status-actions">
                                        {canChat && (
                                            <button className="status-chat-btn" onClick={handleStartChat}>
                                                <FaCommentDots /> مراسلة الصنايعي
                                            </button>
                                        )}
                                        {canVerify && (
                                            <button className="status-verify-btn" onClick={handleVerify} disabled={isActing}>
                                                {isActing ? <FaSpinner className="spin" /> : <><FaCheckCircle /> تأكيد الإكمال والاستلام</>}
                                            </button>
                                        )}
                                        {canReview && (
                                            <button className="status-verify-btn" onClick={() => setShowReviewModal(true)}>
                                                <FaStar /> تقييم الصنايعي الآن
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="detail-grid">
                    {/* ── Main Content ── */}
                    <div className="detail-main">
                        <div className={`detail-card ${post.urgency === 'urgent' ? 'is-urgent' : ''}`}>
                            {/* Header */}
                            <div className="detail-header">
                                <div className="detail-author">
                                    <img
                                        src={getAvatarUrl(post.company?.avatar || post.user?.avatar, post.company?.name || post.user?.name || "ناشر الطلب")}
                                        alt={post.company?.name || post.user?.name}
                                        className="detail-author-avatar"
                                    />
                                    <div className="detail-author-info">
                                        <div className="detail-name-row">
                                            <span className="detail-author-name">
                                                {post.company?.name || post.user?.name || "ناشر الطلب"}
                                            </span>
                                            {post.company && (
                                                <span className="detail-company-badge">
                                                    <FaBriefcase /> شركة
                                                </span>
                                            )}
                                        </div>
                                        <div className="detail-meta-row">
                                            <span className="detail-time">
                                                <FaClock /> {formatTimeAgo(post.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="detail-badges">
                                    {post.urgency === "urgent" && (
                                        <span className="detail-urgent-badge"><FaBolt /> عاجل</span>
                                    )}
                                    <span className={`detail-status ${statusInfo.className}`}>
                                        {statusInfo.icon}
                                        {statusInfo.text}
                                    </span>
                                </div>
                            </div>

                            {/* Category */}
                            <span className="detail-category">
                                <FiTag /> {formatCommunityCategory(post.category, post.service?.name)}
                            </span>

                            {/* Content */}
                            <h1 className="detail-title">{post.title}</h1>
                            <p className="detail-description">{post.description}</p>

                            {/* Info Bar */}
                            <div className="detail-info-bar">
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
                                <div className="detail-info-item points-v2">
                                    <div className="points-v2-icon">
                                        <GiTrophy />
                                    </div>
                                    <div className="points-v2-text">
                                        <span className="detail-info-label">المكافأة</span>
                                        <span className="detail-info-value">{post.points_reward ?? 50} نقطة تميز</span>
                                    </div>
                                </div>
                            </div>

                            {/* Before Images */}
                            {post.images?.length > 0 && (
                                <div className="detail-images-section">
                                    <h4 className="detail-images-title">صور الطلب</h4>
                                    <div className="detail-images">
                                        {post.images.map((img, i) => (
                                            <div key={i} className="detail-img-wrap" onClick={() => setLightboxImg(communityImageUrl(img))}>
                                                <img src={communityImageUrl(img)} alt={`صورة ${i + 1}`} loading="lazy" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* After Images (completion) */}
                            {post.after_images && post.after_images.length > 0 && (
                                <div className="detail-images-section after">
                                    <h4 className="detail-images-title after">✅ صور ما بعد التنفيذ</h4>
                                    <div className="detail-images">
                                        {post.after_images.map((img, i) => (
                                            <div key={i} className="detail-img-wrap after" onClick={() => setLightboxImg(communityImageUrl(img))}>
                                                <img src={communityImageUrl(img)} alt={`بعد ${i + 1}`} loading="lazy" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── Comments ── */}
                        <div className="detail-card">
                            <button
                                className="detail-comments-toggle"
                                onClick={!showComments ? loadComments : () => setShowComments(false)}
                            >
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
                                            <img src={getAvatarUrl(c.user?.avatar, c.user?.name || "مستخدم")} alt="" className="detail-comment-avatar" />
                                            <div className="detail-comment-body">
                                                <div className="detail-comment-header">
                                                    <span className="detail-comment-name">{c.user?.name || "مستخدم"}</span>
                                                    {c.user?.type === "craftsman" && (
                                                        <span className="detail-craftsman-tag">صنايعي</span>
                                                    )}
                                                    <span className="detail-comment-time">{formatTimeAgo(c.created_at)}</span>
                                                </div>
                                                <p>{c.body}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {canComment ? (
                                        <div className="detail-comment-form">
                                            <input
                                                type="text"
                                                placeholder="اكتب تعليقاً..."
                                                value={commentBody}
                                                onChange={(e) => setCommentBody(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                                                disabled={isActing}
                                            />
                                            <button onClick={handleAddComment} disabled={isActing || !commentBody.trim()}>
                                                {isActing ? <FaSpinner className="detail-spinner" /> : <FaPaperPlane />}
                                            </button>
                                        </div>
                                    ) : isLocked ? (
                                        <div className="detail-comments-locked">
                                            <FaLock /> التعليقات مغلقة — الطلب {statusInfo.text}
                                        </div>
                                    ) : null}
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
                                        <h3><FaUserTie /> تقديم عرض</h3>
                                        <div className="offer-form-field">
                                            <label>السعر (ج.م)</label>
                                            <input
                                                type="number"
                                                placeholder="أدخل سعرك"
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
                                                placeholder="اشرح كيف ستنفذ الخدمة، وما يميز عرضك..."
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

                        {/* Offers List */}
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
                                        <div
                                            key={offer.id}
                                            className={`offer-item ${offer.status === "accepted" ? "accepted" : offer.status === "rejected" ? "rejected" : ""}`}
                                        >
                                            <div className="offer-header">
                                                <div className="offer-craftsman">
                                                    <img
                                                        src={getAvatarUrl(offer.craftsman.avatar, offer.craftsman.name)}
                                                        alt={offer.craftsman.name}
                                                        className="offer-avatar"
                                                    />
                                                    <div className="offer-craftsman-info">
                                                        <Link to={`/craftsman/${offer.craftsman.id}`} className="offer-craftsman-name-link">
                                                            {offer.craftsman.name}
                                                        </Link>
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
                                                {offer.status === "rejected" && (
                                                    <span className="offer-rejected-badge">مرفوض</span>
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
                                                    <span>{formatArabicDays(offer.delivery_days)}</span>
                                                </div>
                                                <span className="offer-time">{formatTimeAgo(offer.created_at)}</span>
                                            </div>

                                            {/* 🌟 زر تقييم العرض المقبول */}
                                            {offer.status === "accepted" && isMine && post.status === "verified" && (
                                                <div className="offer-inline-review-wrap">
                                                    {!post.is_reviewed ? (
                                                        <button 
                                                            className="offer-inline-review-btn"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowReviewModal(true);
                                                            }}
                                                        >
                                                            <FaStar className="bounce-icon" /> قيّم هذا العرض
                                                        </button>
                                                    ) : (
                                                        <div className="offer-inline-reviewed">
                                                            <FaCheckCircle /> تم التقييم مسبقاً
                                                        </div>
                                                    )}
                                                </div>
                                            )}

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

            {/* 🌟 Review Modal */}
            {showReviewModal && post?.acceptor && (
                <div className="detail-lightbox review-modal-overlay" onClick={() => setShowReviewModal(false)}>
                    <div className="review-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="review-modal-header">
                            <h3>🌟 تقييم الصنايعي</h3>
                            <button className="close-btn" onClick={() => setShowReviewModal(false)}><FaTimes /></button>
                        </div>
                        <div className="review-modal-body">
                            <p>كيف كانت تجربتك مع <strong>{post.acceptor.name}</strong>؟</p>
                            <div className="star-rating-input">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <FaStar
                                        key={s}
                                        className={reviewRating >= s ? "star active" : "star"}
                                        onClick={() => setReviewRating(s)}
                                    />
                                ))}
                            </div>
                            <textarea
                                placeholder="اكتب رأيك هنا (اختياري)..."
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                rows={4}
                            />
                        </div>
                        <div className="review-modal-footer">
                            <button className="cancel-btn" onClick={() => setShowReviewModal(false)}>تخطى الآن</button>
                            <button 
                                className="submit-btn" 
                                onClick={handleReviewSubmit}
                                disabled={isReviewing}
                            >
                                {isReviewing ? <FaSpinner className="spin" /> : "إرسال التقييم"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default PostDetailPage;
