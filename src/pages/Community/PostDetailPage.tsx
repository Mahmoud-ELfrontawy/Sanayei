import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    FaArrowRight, FaMapMarkerAlt, FaUsers, FaClock, FaCheckCircle,
    FaCamera, FaSpinner, FaTrash, FaGlobeAmericas, FaExclamationTriangle
} from "react-icons/fa";
import {
    getCommunityPost, acceptCommunityPost, completeCommunityPost,
    verifyCommunityPost, deleteCommunityPost,
    type CommunityPost,
} from "../../Api/community.api";
import { useCommunity } from "../../context/CommunityContext";
import { useAuth } from "../../hooks/useAuth";
import { getAvatarUrl } from "../../utils/imageUrl";
import { formatTimeAgo } from "../../utils/timeAgo";
import { toast } from "react-toastify";
import "./PostDetailPage.css";

const CATEGORY_LABELS: Record<string, string> = {
    electrical: "أعمال كهرباء", plumbing: "أعمال سباكة", masonry: "أعمال بناء",
    carpentry: "أعمال نجارة", painting: "أعمال دهانات", ac: "تكييف وتبريد", other: "أخرى",
};

const PostDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated, userType } = useAuth();
    const { updatePost, removePost } = useCommunity();

    const [post, setPost] = useState<CommunityPost | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActing, setIsActing] = useState(false);
    const [afterImages, setAfterImages] = useState<File[]>([]);
    const [afterPreviews, setAfterPreviews] = useState<string[]>([]);
    const [showCompleteForm, setShowCompleteForm] = useState(false);
    const [lightboxImg, setLightboxImg] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        getCommunityPost(Number(id))
            .then((res) => {
                setPost(res.data ?? res);
            })
            .catch(() => toast.error("تعذر تحميل البلاغ"))
            .finally(() => setIsLoading(false));
    }, [id]);

    const refreshPost = async () => {
        const res = await getCommunityPost(Number(id));
        const updated = res.data ?? res;
        setPost(updated);
        updatePost(updated);
    };

    const handleAccept = async () => {
        if (!post) return;
        setIsActing(true);
        try {
            await acceptCommunityPost(post.id);
            await refreshPost();
            toast.success("أعلنت اهتمامك! سيتم التواصل مع صاحب البلاغ");
        } catch {
            toast.error("حدث خطأ، حاول مجدداً");
        } finally { setIsActing(false); }
    };

    const handleComplete = async () => {
        if (!post || afterImages.length === 0) return;
        setIsActing(true);
        try {
            const fd = new FormData();
            afterImages.forEach((f) => fd.append("after_images[]", f));
            await completeCommunityPost(post.id, fd);
            await refreshPost();
            setShowCompleteForm(false);
            toast.success("تم رفع صور الإنجاز! في انتظار تأكيد صاحب البلاغ");
        } catch {
            toast.error("حدث خطأ، حاول مجدداً");
        } finally { setIsActing(false); }
    };

    const handleVerify = async () => {
        if (!post) return;
        setIsActing(true);
        try {
            await verifyCommunityPost(post.id);
            await refreshPost();
            toast.success(`🎉 تم التحقق! تم منح ${post.points_reward} نقطة للصنايعي`);
        } catch {
            toast.error("حدث خطأ، حاول مجدداً");
        } finally { setIsActing(false); }
    };

    const handleDelete = async () => {
        if (!post || !window.confirm("هل أنت متأكد من حذف هذا البلاغ؟")) return;
        try {
            await deleteCommunityPost(post.id);
            removePost(post.id);
            toast.success("تم حذف البلاغ");
            navigate("/community");
        } catch {
            toast.error("حدث خطأ أثناء الحذف");
        }
    };

    const handleAfterImages = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []).slice(0, 4);
        setAfterImages(files);
        setAfterPreviews(files.map((f) => URL.createObjectURL(f)));
    };

    if (isLoading) {
        return (
            <div className="post-detail-loading">
                <FaSpinner className="post-detail-spinner" />
                <span>جاري التحميل...</span>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="post-detail-error">
                <span>🔍</span>
                <p>لم يتم العثور على البلاغ</p>
                <button className="fb-btn-primary" onClick={() => navigate("/community")}>العودة للمجتمع</button>
            </div>
        );
    }

    const isMine = post.user.id === Number(user?.id);
    const isCraftsman = userType === "craftsman";
    const canAccept = isAuthenticated && isCraftsman && post.status === "open" && !post.user_has_accepted && !isMine;
    const canComplete = isAuthenticated && isCraftsman && post.user_has_accepted && post.status === "in_progress";
    const canVerify = isMine && post.status === "completed";
    const isVerified = post.status === "verified";

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
        <section className="fb-community-page" style={{ padding: "20px 16px" }}>
            <div className="fb-detail-container">
                <div className="fb-card fb-detail-card">
                    {/* Header Controls */}
                    <div className="post-detail-top-bar">
                        <button className="post-detail-back-btn" onClick={() => navigate("/community")}>
                            <FaArrowRight /> رجوع
                        </button>
                        {isMine && (
                            <button className="post-detail-delete-btn" onClick={handleDelete} title="حذف البلاغ">
                                <FaTrash /> حذف
                            </button>
                        )}
                    </div>

                    {/* Facebook Style Meta Header */}
                    <div className="fb-post-header" style={{ marginBottom: "16px", marginTop: "12px" }}>
                        <img
                            src={getAvatarUrl(post.user.avatar, post.user.name)}
                            alt={post.user.name}
                            className="fb-post-avatar"
                        />
                        <div className="fb-post-header-info">
                            <span className="fb-post-author-name">{post.user.name}</span>
                            <div className="fb-post-meta">
                                <span className="fb-post-time">{formatTimeAgo(post.created_at)}</span>
                                <span className="fb-post-dot">•</span>
                                <span className="fb-post-category">{CATEGORY_LABELS[post.category] || post.category}</span>
                                <span className="fb-post-dot">•</span>
                                <FaGlobeAmericas className="fb-post-privacy-icon" />
                            </div>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="fb-post-badges" style={{ marginBottom: "16px" }}>
                        {post.urgency === "urgent" && (
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
                    <div className="fb-post-content" style={{ marginBottom: "20px" }}>
                        <h1 className="fb-post-title" style={{ fontSize: "20px", marginBottom: "8px" }}>{post.title}</h1>
                        <p className="fb-post-text" style={{ fontSize: "16px" }}>{post.description}</p>
                    </div>

                    {/* Images Gallery */}
                    {post.images?.length > 0 && (
                        <div className={`fb-post-images grid-${Math.min(post.images.length, 4)}`} style={{ marginBottom: "20px", borderRadius: "8px", overflow: "hidden" }}>
                            {post.images.slice(0, 4).map((img, i) => (
                                <div key={i} className="fb-img-wrapper" onClick={() => setLightboxImg(img)} style={{ cursor: "pointer" }}>
                                    <img src={img} alt={`img-${i}`} />
                                    {i === 3 && post.images.length > 4 && (
                                        <div className="fb-img-overlay">
                                            <span>+{post.images.length - 4}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Stats & Points */}
                    <div className="fb-post-stats" style={{ marginBottom: "20px" }}>
                        <div className="fb-stat-left">
                            <div className="fb-reaction-group">
                                <span className="fb-reaction-icon">✋</span>
                                <span className="fb-stat-text">{post.interested_count} مهتمين بالمساعدة</span>
                            </div>
                        </div>
                        {post.points_reward > 0 && (
                            <div className="fb-stat-right">
                                <span className="fb-stat-text points-reward" style={{ fontSize: "16px" }}>🏆 {post.points_reward} نقطة</span>
                            </div>
                        )}
                    </div>

                    {/* Acceptor Callout */}
                    {post.acceptor && (
                        <div className="post-detail-acceptor" style={{ margin: "20px 0", padding: "12px", background: "#f0f2f5", borderRadius: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontSize: "20px" }}>👷</span>
                            <span>يعمل على هذا البلاغ:</span>
                            <img src={getAvatarUrl(post.acceptor.avatar, post.acceptor.name)} alt={post.acceptor.name} style={{ width: "30px", height: "30px", borderRadius: "50%" }} />
                            <strong>{post.acceptor.name}</strong>
                        </div>
                    )}

                    {/* After images (after completion) */}
                    {post.after_images && post.after_images.length > 0 && (
                        <div className="post-detail-after-section" style={{ marginTop: "20px" }}>
                            <h3 style={{ fontSize: "18px", marginBottom: "12px", color: "#137333" }}>✅ صور ما بعد الإصلاح</h3>
                            <div className={`fb-post-images grid-${Math.min(post.after_images.length, 4)}`} style={{ borderRadius: "8px", overflow: "hidden" }}>
                                {post.after_images.slice(0, 4).map((img, i) => (
                                    <div key={i} className="fb-img-wrapper" onClick={() => setLightboxImg(img)} style={{ cursor: "pointer" }}>
                                        <img src={img} alt={`after-${i}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Verified Banner */}
                    {isVerified && (
                        <div className="post-detail-verified-banner" style={{ marginTop: "24px", padding: "16px", background: "#e6ffed", color: "#137333", borderRadius: "8px", display: "flex", gap: "12px", alignItems: "center" }}>
                            <FaCheckCircle size={30} />
                            <div>
                                <strong style={{ display: "block", fontSize: "16px" }}>تم التحقق من إنجاز هذا البلاغ!</strong>
                                <span>تم منح {post.points_reward} نقطة للصنايعي المنجز</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons Container */}
                    <div className="post-detail-actions" style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
                        {canAccept && (
                            <button className="fb-btn-primary full-width" style={{ padding: "12px", fontSize: "16px" }} onClick={handleAccept} disabled={isActing}>
                                {isActing ? <FaSpinner className="post-detail-spinner" /> : "✋ أنا مهتم بإنجاز هذه المهمة"}
                            </button>
                        )}

                        {canComplete && !showCompleteForm && (
                            <button className="fb-btn-primary full-width" style={{ background: "#42b72a", padding: "12px", fontSize: "16px" }} onClick={() => setShowCompleteForm(true)}>
                                <FaCamera /> رفع صور ما بعد الإصلاح
                            </button>
                        )}

                        {canComplete && showCompleteForm && (
                            <div className="post-detail-complete-form" style={{ background: "#f0f2f5", padding: "16px", borderRadius: "8px", border: "1px solid #ced0d4" }}>
                                <h4 style={{ marginBottom: "12px" }}>رفع صور ما بعد الإصلاح لتأكيد الإنجاز</h4>
                                <label htmlFor="after-imgs" style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px", background: "#fff", border: "2px dashed #ccd0d5", borderRadius: "8px", cursor: "pointer", marginBottom: "12px" }}>
                                    {afterPreviews.length > 0 ? (
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            {afterPreviews.map((p, i) => <img key={i} src={p} alt="" style={{ width: "60px", height: "60px", objectFit: "cover", borderRadius: "4px" }} />)}
                                        </div>
                                    ) : (
                                        <><FaCamera size={24} color="#65676B" style={{ marginBottom: "8px" }} /><span style={{ color: "#65676B" }}>اضغط لاختيار الصور</span></>
                                    )}
                                </label>
                                <input id="after-imgs" type="file" accept="image/*" multiple onChange={handleAfterImages} style={{ display: "none" }} />
                                <button
                                    className="fb-btn-primary full-width"
                                    onClick={handleComplete}
                                    disabled={isActing || afterImages.length === 0}
                                    style={{ background: "#42b72a" }}
                                >
                                    {isActing ? <FaSpinner className="post-detail-spinner" /> : "إرسال للتحقق"}
                                </button>
                            </div>
                        )}

                        {canVerify && (
                            <button className="fb-btn-primary full-width" style={{ background: "#42b72a", padding: "12px", fontSize: "16px" }} onClick={handleVerify} disabled={isActing}>
                                {isActing ? <FaSpinner className="post-detail-spinner" /> : <><FaCheckCircle /> تأكيد الإنجاز ومنح النقاط للصنايعي</>}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxImg && (
                <div className="post-detail-lightbox" onClick={() => setLightboxImg(null)} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.9)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <img src={lightboxImg} alt="full" style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain" }} />
                </div>
            )}
        </section>
    );
};

export default PostDetailPage;
