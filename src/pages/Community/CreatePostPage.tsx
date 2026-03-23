import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaMapMarkerAlt, FaCamera, FaCheckCircle, FaMoneyBillWave } from "react-icons/fa";
// import { createCommunityPost } from "../../Api/community.api"; // TODO: uncomment when switching to real API
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

const STEPS = ["تفاصيل الخدمة", "الميزانية والصور", "مراجعة ونشر"];

const CreatePostPage: React.FC = () => {
    const navigate = useNavigate();
    const { prependPost } = useCommunity();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("electrical");
    const [budgetMin, setBudgetMin] = useState("");
    const [budgetMax, setBudgetMax] = useState("");
    const [location, setLocation] = useState("");
    // const [images, setImages] = useState<File[]>([]);

    const [previews, setPreviews] = useState<string[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []).slice(0, 4);
        // setImages(files); // Unused in mock mode
        setPreviews(files.map((f) => URL.createObjectURL(f)));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // MOCK MODE: create post locally
        
        await new Promise((r) => setTimeout(r, 500));
        const mockPost = {
            id: Date.now(),
            title,
            description,
            category,
            budget_min: budgetMin ? Number(budgetMin) : undefined,
            budget_max: budgetMax ? Number(budgetMax) : undefined,
            location,
            images: previews,
            status: "open" as const,
            user: { id: 999, name: "أنت", avatar: "", type: "user" },
            offers_count: 0,
            comments_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_mine: true,
            has_offered: false,
        };
        prependPost(mockPost);
        toast.success("تم نشر طلب الخدمة بنجاح! 🎉");
        navigate("/community");
        setIsSubmitting(false);
    };

    const canProceedStep0 = title.trim().length >= 5 && description.trim().length >= 10;
    const canProceedStep1 = true;

    return (
        <section className="create-post-page">
            {/* Header */}
            <div className="create-post-header">
                <button className="create-post-back-btn" onClick={() => (step > 0 ? setStep(step - 1) : navigate("/community"))}>
                    <FaArrowRight />
                </button>
                <h1>نشر طلب خدمة جديد</h1>
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
                        <div className="create-post-field">
                            <label>عنوان الخدمة المطلوبة *</label>
                            <input
                                type="text"
                                placeholder="مثال: تركيب وصلات كهرباء في شقة جديدة"
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
                            <label>وصف الخدمة بالتفصيل *</label>
                            <textarea
                                placeholder="اشرح بالتفصيل ماذا تحتاج حتى يتمكن الصنايعي من تقديم عرض مناسب..."
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

                {/* ── Step 1: Budget, Images & Location ── */}
                {step === 1 && (
                    <div className="create-post-step-content">
                        <div className="create-post-field">
                            <label><FaMoneyBillWave /> الميزانية المتوقعة (ج.م)</label>
                            <div className="create-post-budget-row">
                                <input
                                    type="number"
                                    placeholder="من"
                                    value={budgetMin}
                                    onChange={(e) => setBudgetMin(e.target.value)}
                                    min="0"
                                />
                                <span className="budget-separator">إلى</span>
                                <input
                                    type="number"
                                    placeholder="إلى"
                                    value={budgetMax}
                                    onChange={(e) => setBudgetMax(e.target.value)}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="create-post-field">
                            <label><FaCamera /> صور توضيحية (حتى 4 صور)</label>
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
                                placeholder="مثال: مدينة نصر، القاهرة"
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
                                <span className="create-post-preview-cat">
                                    {CATEGORIES.find((c) => c.value === category)?.label}
                                </span>
                                {(budgetMin || budgetMax) && (
                                    <span className="create-post-preview-budget">
                                        <FaMoneyBillWave />
                                        {budgetMin && budgetMax
                                            ? `${budgetMin} - ${budgetMax} ج.م`
                                            : budgetMax
                                            ? `حتى ${budgetMax} ج.م`
                                            : `من ${budgetMin} ج.م`}
                                    </span>
                                )}
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
                                {isSubmitting ? "جاري النشر..." : "🚀 نشر الطلب"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CreatePostPage;
