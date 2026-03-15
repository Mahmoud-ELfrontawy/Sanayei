import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaMapMarkerAlt, FaCamera, FaExclamationTriangle, FaCheckCircle } from "react-icons/fa";
import { createCommunityPost } from "../../Api/community.api";
import { useCommunity } from "../../context/CommunityContext";
import { toast } from "react-toastify";
import "./CreatePostPage.css";

const CATEGORIES = [
    { value: "electrical", label: "⚡ كهرباء" },
    { value: "plumbing", label: "🔧 سباكة" },
    { value: "masonry", label: "🧱 بناء" },
    { value: "carpentry", label: "🪚 نجارة" },
    { value: "painting", label: "🎨 دهانات" },
    { value: "ac", label: "❄️ تكييف" },
    { value: "other", label: "🔨 أخرى" },
];

const STEPS = ["تفاصيل المشكلة", "الصور والموقع", "مراجعة ونشر"];

const CreatePostPage: React.FC = () => {
    const navigate = useNavigate();
    const { prependPost } = useCommunity();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("electrical");
    const [urgency, setUrgency] = useState<"urgent" | "normal">("normal");
    const [location, setLocation] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []).slice(0, 4);
        setImages(files);
        setPreviews(files.map((f) => URL.createObjectURL(f)));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("category", category);
            formData.append("urgency", urgency);
            formData.append("location", location);
            images.forEach((img) => formData.append("images[]", img));

            const res = await createCommunityPost(formData);
            prependPost(res.data ?? res);
            toast.success("تم نشر البلاغ بنجاح! 🎉");
            navigate("/community");
        } catch {
            toast.error("حدث خطأ أثناء النشر، حاول مجدداً");
        } finally {
            setIsSubmitting(false);
        }
    };

    const canProceedStep0 = title.trim().length >= 5 && description.trim().length >= 10;
    const canProceedStep1 = true; // images optional

    return (
        <section className="create-post-page">
            {/* Header */}
            <div className="create-post-header">
                <button className="create-post-back-btn" onClick={() => (step > 0 ? setStep(step - 1) : navigate("/community"))}>
                    <FaArrowRight />
                </button>
                <h1>نشر بلاغ جديد</h1>
            </div>

            {/* Progress */}
            <div className="create-post-progress">
                {STEPS.map((s, i) => (
                    <div key={i} className={`create-post-step ${i === step ? "active" : i < step ? "done" : ""}`}>
                        <div className="create-post-step-circle">
                            {i < step ? <FaCheckCircle /> : i + 1}
                        </div>
                        <span>{s}</span>
                    </div>
                ))}
            </div>

            <div className="create-post-body">
                {/* ── Step 0: Details ── */}
                {step === 0 && (
                    <div className="create-post-step-content">
                        <div className="create-post-urgency-toggle">
                            <button
                                className={`urgency-btn normal ${urgency === "normal" ? "active" : ""}`}
                                onClick={() => setUrgency("normal")}
                                type="button"
                            >
                                عادي
                            </button>
                            <button
                                className={`urgency-btn urgent ${urgency === "urgent" ? "active" : ""}`}
                                onClick={() => setUrgency("urgent")}
                                type="button"
                            >
                                <FaExclamationTriangle /> طارئ
                            </button>
                        </div>

                        <div className="create-post-field">
                            <label>عنوان المشكلة *</label>
                            <input
                                type="text"
                                placeholder="مثال: ماس كهربي في مسجد النور"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={100}
                            />
                            <span className="create-post-char">{title.length}/100</span>
                        </div>

                        <div className="create-post-field">
                            <label>تصنيف التخصص *</label>
                            <div className="create-post-categories">
                                {CATEGORIES.map((c) => (
                                    <button
                                        key={c.value}
                                        type="button"
                                        className={`create-post-cat-btn ${category === c.value ? "active" : ""}`}
                                        onClick={() => setCategory(c.value)}
                                    >
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="create-post-field">
                            <label>وصف المشكلة بالتفصيل *</label>
                            <textarea
                                placeholder="اشرح المشكلة بالتفصيل حتى يتمكن الصنايعي من الاستعداد المناسب..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                maxLength={1000}
                            />
                            <span className="create-post-char">{description.length}/1000</span>
                        </div>

                        <button
                            className="create-post-next-btn"
                            onClick={() => setStep(1)}
                            disabled={!canProceedStep0}
                        >
                            التالي →
                        </button>
                    </div>
                )}

                {/* ── Step 1: Images & Location ── */}
                {step === 1 && (
                    <div className="create-post-step-content">
                        <div className="create-post-field">
                            <label><FaCamera /> صور المشكلة (حتى 4 صور)</label>
                            <label htmlFor="post-images" className="create-post-upload-area">
                                {previews.length > 0 ? (
                                    <div className="create-post-previews">
                                        {previews.map((p, i) => (
                                            <img key={i} src={p} alt={`preview-${i}`} />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <FaCamera className="create-post-upload-icon" />
                                        <span>اضغط لإضافة صور</span>
                                        <small>PNG, JPG حتى 5MB</small>
                                    </>
                                )}
                            </label>
                            <input
                                id="post-images"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                style={{ display: "none" }}
                            />
                        </div>

                        <div className="create-post-field">
                            <label><FaMapMarkerAlt /> الموقع (المنطقة أو الحي)</label>
                            <input
                                type="text"
                                placeholder="مثال: مسجد النور، شارع السلام، القاهرة"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        <div className="create-post-step-btns">
                            <button className="create-post-back-step-btn" onClick={() => setStep(0)}>← رجوع</button>
                            <button className="create-post-next-btn" onClick={() => setStep(2)} disabled={!canProceedStep1}>
                                التالي →
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Step 2: Review & Publish ── */}
                {step === 2 && (
                    <div className="create-post-step-content">
                        <div className="create-post-preview-card">
                            <div className="create-post-preview-header">
                                <span className={`create-post-preview-badge ${urgency}`}>
                                    {urgency === "urgent" ? "⚠️ طارئ" : "✅ عادي"}
                                </span>
                                <span className="create-post-preview-cat">
                                    {CATEGORIES.find((c) => c.value === category)?.label}
                                </span>
                            </div>
                            <h2>{title}</h2>
                            <p>{description}</p>
                            {location && (
                                <p className="create-post-preview-location">
                                    <FaMapMarkerAlt /> {location}
                                </p>
                            )}
                            {previews.length > 0 && (
                                <div className="create-post-previews-review">
                                    {previews.map((p, i) => <img key={i} src={p} alt={`img-${i}`} />)}
                                </div>
                            )}
                        </div>

                        <div className="create-post-step-btns">
                            <button className="create-post-back-step-btn" onClick={() => setStep(1)}>← رجوع</button>
                            <button
                                className="create-post-submit-btn"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "جاري النشر..." : "🚀 نشر البلاغ"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CreatePostPage;
