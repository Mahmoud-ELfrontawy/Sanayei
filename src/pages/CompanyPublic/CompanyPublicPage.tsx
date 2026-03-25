import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { FiArrowRight, FiCheckCircle, FiClock, FiStar, FiPackage, FiShoppingCart } from "react-icons/fi";
import { getPublicCompanyProfile, getPublicStoreProducts } from "../../Api/auth/Company/storeManagement.api";
import { getFullImageUrl } from "../../utils/imageUrl";
import { formatArabicDate } from "../../utils/dateFormatter";
import "./CompanyPublicPage.css";

const CompanyPublicPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [company, setCompany] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!id) return;

        const load = async () => {
            try {
                setLoading(true);

                // Fetch company products first (guaranteed to work)
                const productsRes = await getPublicStoreProducts({ company_id: id });
                const prodList = Array.isArray(productsRes)
                    ? productsRes
                    : (productsRes?.data ?? productsRes?.products ?? []);
                setProducts(prodList);

                // Try to get company profile — if endpoint exists use it,
                // otherwise fall back to extracting company info from the products
                try {
                    const profileRes = await getPublicCompanyProfile(id);
                    // The endpoint may wrap data in { data: {...} } or return directly
                    const raw = profileRes?.data?.company ?? profileRes?.data ?? profileRes?.company ?? profileRes;
                    if (raw && (raw.company_name || raw.name)) {
                        setCompany({
                            ...raw,
                            company_name: raw.company_name || raw.name,
                            company_logo: raw.company_logo || raw.logo,
                            company_simple_hint: raw.company_simple_hint || raw.description,
                            status: raw.status,
                        });
                    } else {
                        throw new Error("No company data");
                    }
                } catch {
                    // Fallback: extract company from first product
                    const firstProduct = prodList[0];
                    const comp = firstProduct?.company;
                    if (comp) {
                        setCompany({
                            id: comp.id ?? id,
                            company_name: comp.company_name || comp.name || "متجر",
                            company_logo: comp.logo || comp.company_logo,
                            company_simple_hint: comp.description || comp.company_simple_hint || "",
                            status: comp.status || "approved",
                        });
                    } else {
                        setCompany({ id, company_name: "متجر", status: "approved" });
                    }
                }

                // Fetch reviews for all products using the new API
                const { getProductReviews } = await import("../../Api/auth/Company/storeManagement.api");
                const allReviews: any[] = [];
                for (const p of prodList) {
                    try {
                        const revRes = await getProductReviews(p.id);
                        const revList = Array.isArray(revRes) ? revRes : (revRes?.data ?? []);
                        revList.forEach((r: any) => allReviews.push({ ...r, productName: p.name }));
                    } catch {
                        // ignore per-product errors
                    }
                }
                setReviews(allReviews);

            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    if (loading) {
        return (
            <div className="cpub-loading">
                <div className="cpub-spinner" />
                <p>جاري تحميل بيانات المتجر...</p>
            </div>
        );
    }

    if (error || !company) {
        return (
            <div className="cpub-error">
                <FiPackage size={60} />
                <h2>المتجر غير متاح</h2>
                <p>تعذر تحميل بيانات هذا المتجر. يرجى المحاولة لاحقاً.</p>
                <button onClick={() => navigate(-1)}>
                    <FiArrowRight /> العودة للمتجر
                </button>
            </div>
        );
    }

    const logoUrl = getFullImageUrl(company.company_logo);
    const isApproved = company.status === "approved";

    return (
        <div className="cpub-page">

            {/* ── Back nav ── */}
            <div className="cpub-back-bar">
                <button className="cpub-back-btn" onClick={() => navigate(-1)}>
                    <FiArrowRight /> العودة للمتجر
                </button>
            </div>

            {/* ── Hero / Identity ── */}
            <section className="cpub-hero">
                <div className="cpub-hero-inner">
                    <div className="cpub-logo-wrap">
                        {logoUrl ? (
                            <img src={logoUrl} alt={company.company_name} className="cpub-logo" />
                        ) : (
                            <div className="cpub-logo-placeholder">
                                <FiPackage size={40} />
                            </div>
                        )}
                    </div>

                    <div className="cpub-hero-info">
                        <div className="cpub-name-row">
                            <h1 className="cpub-name">{company.company_name}</h1>
                            <span className={`cpub-badge ${isApproved ? "approved" : "pending"}`}>
                                {isApproved ? <><FiCheckCircle /> متجر معتمد</> : <><FiClock /> قيد المراجعة</>}
                            </span>
                        </div>

                        {company.company_category && (
                            <div className="cpub-category-row">
                                <span className="cpub-category-tag">{company.company_category}</span>
                            </div>
                        )}

                        {company.company_simple_hint && (
                            <p className="cpub-about">{company.company_simple_hint}</p>
                        )}

                        <div className="cpub-stats">
                            <div className="cpub-stat">
                                <strong>{products.length}</strong>
                                <span>منتج</span>
                            </div>
                            <div className="cpub-stat">
                                <strong>{reviews.length}</strong>
                                <span>تقييم</span>
                            </div>
                            {reviews.length > 0 && (
                                <div className="cpub-stat">
                                    <div className="cpub-avg-stars">
                                        <FiStar fill="var(--amber-500)" color="var(--amber-500)" />
                                        <strong>
                                            {(reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1)}
                                        </strong>
                                    </div>
                                    <span>متوسط التقييم</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Products Grid ── */}
            <section className="cpub-section">
                <div className="cpub-section-header">
                    <h2 className="cpub-section-title">
                        <FiShoppingCart /> منتجات المتجر
                    </h2>
                </div>

                {products.length === 0 ? (
                    <div className="cpub-empty">
                        <FiPackage size={48} />
                        <p>لا توجد منتجات معروضة حالياً</p>
                    </div>
                ) : (
                    <div className="cpub-products-grid">
                        {products.map((product: any) => {
                            const imgSrc = getFullImageUrl(product.main_image) ?? "https://placehold.co/300x220?text=No+Image";
                            const discountAmount = Number(product.discount_price ?? 0);
                            const basePrice = Number(product.price ?? 0);
                            const finalPrice = discountAmount > 0 ? basePrice - discountAmount : basePrice;

                            return (
                                <Link
                                    key={product.id}
                                    to={`/store`}
                                    className="cpub-product-card"
                                    onClick={() => navigate("/store")}
                                >
                                    <div className="cpub-product-img-wrap">
                                        <img src={imgSrc} alt={product.name} loading="lazy" />
                                        {discountAmount > 0 && (
                                            <span className="cpub-discount-badge">
                                                -{Math.round((discountAmount / basePrice) * 100)}%
                                            </span>
                                        )}
                                    </div>
                                    <div className="cpub-product-info">
                                        <h3 className="cpub-product-name">{product.name}</h3>
                                        <div className="cpub-product-price">
                                            <span className="cpub-price-main">{finalPrice.toLocaleString()} ج.م</span>
                                            {discountAmount > 0 && (
                                                <span className="cpub-price-old">{basePrice.toLocaleString()}</span>
                                            )}
                                        </div>
                                        <div className="cpub-product-rating">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <FiStar
                                                    key={i}
                                                    className={i <= Math.floor(product.rating ?? 0) ? "star-on" : "star-off"}
                                                />
                                            ))}
                                            <span>({product.reviews_count ?? 0})</span>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* ── Customer Reviews ── */}
            {reviews.length > 0 && (
                <section className="cpub-section">
                    <div className="cpub-section-header">
                        <h2 className="cpub-section-title">
                            <FiStar /> آراء العملاء
                        </h2>
                    </div>
                    <div className="cpub-reviews-grid">
                        {reviews.map((review: any, idx: number) => (
                            <div key={idx} className="cpub-review-card">
                                <div className="cpub-review-header">
                                    <div className="cpub-reviewer-avatar">
                                        {review.user_avatar ? (
                                            <img src={review.user_avatar} alt={review.user_name} />
                                        ) : (
                                            (review.user_name || "م").charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="cpub-reviewer-info">
                                        <div className="cpub-reviewer-name-row">
                                            <strong>{review.user_name || "مستخدم"}</strong>
                                            <span className={`cpub-reviewer-type ${review.user_type === 'صنايعي' ? 'craftsman' : 'user'}`}>
                                                {review.user_type}
                                            </span>
                                        </div>
                                        <div className="cpub-review-meta-row">
                                            <div className="cpub-review-stars">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <FiStar
                                                        key={i}
                                                        className={i <= (Number(review.rating) || 0) ? "star-on" : "star-off"}
                                                    />
                                                ))}
                                            </div>
                                            <span className="cpub-review-date">
                                                {review.created_at ? formatArabicDate(review.created_at) : ""}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                {review.comment && (
                                    <p className="cpub-review-comment">"{review.comment}"</p>
                                )}
                                <span className="cpub-review-product-tag">{review.productName}</span>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};

export default CompanyPublicPage;

