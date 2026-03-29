import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowRight, FaMapMarkerAlt, FaCamera, FaCheckCircle, FaBolt, FaClock, FaSpinner } from "react-icons/fa";
import { createCommunityPost } from "../../Api/community.api";
import { getServices } from "../../Api/services.api";
import type { Service } from "../../constants/service";
import { useCommunity } from "../../context/CommunityContext";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import "./CreatePostPage.css";

const STEPS = ["تفاصيل الخدمة", "الصور والموقع", "مراجعة ونشر"];

const CreatePostPage: React.FC = () => {
    const navigate = useNavigate();
    const { prependPost } = useCommunity();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [categories, setCategories] = useState<Service[]>([]);
    const [category, setCategory] = useState<string | number>("");
    const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
    const [location, setLocation] = useState("");
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch real services from API
    useEffect(() => {
        const fetchCats = async () => {
            try {
                const data = await getServices();
                setCategories(data);
                if (data.length > 0) setCategory(data[0].id); // Default to first service ID
            } catch (err) {
                console.error("Failed to fetch services", err);
                toast.error("فشل تحميل قائمة التخصصات");
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCats();
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []).slice(0, 4);
        setImages(files);
        setPreviews(files.map((f) => URL.createObjectURL(f)));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("title", title.trim());
            formData.append("description", description.trim());
            formData.append("category", String(category));
            formData.append("urgency", urgency);
            if (location.trim()) formData.append("location", location.trim());
            images.forEach((img) => formData.append("images[]", img));

            const res = await createCommunityPost(formData);
            const newPost = res.data ?? res;

            prependPost({
                ...newPost,
                images: newPost.images ?? previews,
                user: newPost.user ?? { id: user?.id ?? 0, name: user?.name ?? "أنت", avatar: null, type: "user" },
                offers_count: 0,
                comments_count: 0,
                is_mine: true,
                has_offered: false,
            });

            toast.success("تم نشر طلب الخدمة بنجاح! 🎉");
            navigate("/community");
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || "حدث خطأ أثناء النشر، حاول مجدداً";
            toast.error(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const canProceedStep0 = title.trim().length >= 5 && description.trim().length >= 10;

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
                            <label><FaBolt size={20} color="var(--primary)" /> عنوان الخدمة المطلوبة *</label>
                            <input
                                type="text"
                                placeholder="مثال: تركيب وصلات كهرباء في شقة جديدة"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                maxLength={150}
                            />
                            <div className="create-post-char">{title.length} / 150 حرف</div>
                        </div>

                        <div className="create-post-field">
                            <label><FaCheckCircle size={20} color="var(--primary)" /> تصنيف التخصص *</label>
                            {isLoadingCategories ? (
                                <div className="create-post-cats-loading">
                                    <FaSpinner className="spin-icon" /> جاري تحميل التخصصات...
                                </div>
                            ) : (
                                <div className="create-post-categories">
                                    {categories.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            className={`create-post-cat-btn ${category === c.id ? "active" : ""}`}
                                            onClick={() => setCategory(c.id)}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="create-post-field">
                            <label><FaBolt size={20} color="var(--orange-500)" /> درجة الأولوية</label>
                            <div className="urgency-toggle-group">
                                <button
                                    type="button"
                                    className={`urgency-btn ${urgency === "normal" ? "active" : ""}`}
                                    onClick={() => setUrgency("normal")}
                                >
                                    <FaClock size={22} /> عادي
                                </button>
                                <button
                                    type="button"
                                    className={`urgency-btn urgent ${urgency === "urgent" ? "active" : ""}`}
                                    onClick={() => setUrgency("urgent")}
                                >
                                    <FaBolt size={22} /> عاجل (+٥٠ نقطة)
                                </button>
                            </div>
                        </div>

                        <div className="create-post-field">
                            <label><FaCheckCircle size={20} color="var(--primary)" /> وصف الخدمة بالتفصيل *</label>
                            <textarea
                                placeholder="اشرح بالتفصيل ماذا تحتاج حتى يتمكن الصنايعية من تقديم عروض مناسبة..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={6}
                                maxLength={2000}
                            />
                            <div className="create-post-char">{description.length} / 2000 حرف</div>
                        </div>

                        <button
                            className="create-post-next-btn"
                            onClick={() => setStep(1)}
                            disabled={!canProceedStep0}
                        >
                            استمرار للمرحلة التالية
                        </button>
                    </div>
                )}

                {/* ── Step 1: Images & Location ── */}
                {step === 1 && (
                    <div className="create-post-step-content">
                        <div className="create-post-field">
                            <label><FaCamera size={22} color="var(--primary)" /> صور توضيحية (حتى 4 صور)</label>
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
                                        <span>اضغط أو اسحب الصور هنا</span>
                                        <small>PNG, JPG حتى 5MB لكل صورة</small>
                                    </>
                                )}
                            </label>
                            <input
                                id="post-images"
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                style={{ display: "none" }}
                            />
                        </div>

                        <div className="create-post-field">
                            <label><FaMapMarkerAlt size={22} color="var(--primary)" /> الموقع (الحي أو المنطقة)</label>
                            <input
                                type="text"
                                placeholder="مثال: مدينة نصر، القاهرة"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>

                        <div className="create-post-step-btns">
                            <button className="create-post-back-step-btn" onClick={() => setStep(0)}>
                                <FaArrowRight size={20} /> رجوع
                            </button>
                            <button className="create-post-next-btn" onClick={() => setStep(2)}>
                                التالي
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
                                    <FaCheckCircle size={12} style={{marginLeft: '5px'}} />
                                    {categories.find((c) => c.id === Number(category))?.name || "تخصص غير محدد"}
                                </span>
                                {urgency === "urgent" && (
                                    <span className="create-post-urgency-badge">
                                        <FaBolt size={12} style={{marginLeft: '5px'}} /> عاجل
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
                            <button className="create-post-back-step-btn" onClick={() => setStep(1)}>
                                <FaArrowRight size={20} /> رجوع
                            </button>
                            <button
                                className="create-post-submit-btn"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "جاري المعالجة..." : "🚀 نشر الطلب الآن"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default CreatePostPage;
