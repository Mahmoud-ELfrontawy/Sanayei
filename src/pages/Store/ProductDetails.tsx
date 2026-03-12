import React, { useState, useEffect, useMemo } from "react";
import { FiArrowRight, FiShoppingCart, FiStar, FiTruck, FiShield, FiRefreshCw, FiPlus, FiMinus } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { getPublicStoreProductDetails } from "../../Api/auth/Company/storeManagement.api";
import { addToCart, getCartCount } from "../../Api/store/cart.api";
import { getFullImageUrl } from "../../utils/imageUrl";
import { useAuth } from "../../hooks/useAuth";
import "./ProductDetails.css";
import { Link } from "react-router-dom";
import { formatArabicDate } from "../../utils/dateFormatter";

interface ProductDetailsProps {
    product: any; // initial product data from the list (may be partial)
    onBack: () => void;
    onCartCountChange?: (count: number) => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product: initialProduct, onBack, onCartCountChange }) => {
    const [fullProduct, setFullProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState<string | null>(null);

    const images = useMemo(() => {
        if (!fullProduct) return [];
        const list = [];
        if (fullProduct.main_image) list.push(fullProduct.main_image);

        if (fullProduct.images) {
            try {
                const extra = typeof fullProduct.images === "string"
                    ? JSON.parse(fullProduct.images)
                    : fullProduct.images;
                if (Array.isArray(extra)) {
                    list.push(...extra);
                }
            } catch (e) {
                console.error("Error parsing product images:", e);
            }
        }
        return list;
    }, [fullProduct]);

    useEffect(() => {
        if (images.length > 0 && !activeImage) {
            setActiveImage(images[0]);
        }
    }, [images, activeImage]);
    const [addingToCart, setAddingToCart] = useState(false);



    const { userType } = useAuth();
    const [reviews, setReviews] = useState<any[]>([]);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [loadingReviews, setLoadingReviews] = useState(false);


    // Fetch full product details from backend
    useEffect(() => {
        if (!initialProduct?.id) return;
        setLoading(true);
        const productId = initialProduct.id;
        
        getPublicStoreProductDetails(productId)
            .then((data) => {
                setFullProduct(data);
                if (data.main_image) {
                    setActiveImage(data.main_image);
                }
            })
            .catch(() => {
                setFullProduct(initialProduct);
                if (initialProduct.main_image) {
                    setActiveImage(initialProduct.main_image);
                }
            })
            .finally(() => {
                setLoading(false);
            });

        // Fetch Reviews
        setLoadingReviews(true);
        import("../../Api/auth/Company/storeManagement.api").then(api => {
            api.getProductReviews(productId)
                .then(data => {
                    setReviews(Array.isArray(data) ? data : (data?.data ?? []));
                })
                .catch(err => console.error("Error fetching reviews:", err))
                .finally(() => setLoadingReviews(false));
        });
    }, [initialProduct?.id]);

    const handleAddToCart = async () => {
        if (userType === 'company') {
            toast.info("عذراً، يجب التسجيل بحساب مستخدم عادي أو صنايعي لإتمام عمليات الشراء من المتجر 🛒");
            return;
        }

        if (!fullProduct?.id) {
            toast.error("لا يمكن إضافة المنتج للسلة. بيانات المنتج غير متوفرة.");
            return;
        }

        try {
            setAddingToCart(true);
            await addToCart(fullProduct.id, quantity);
            toast.success(`تم إضافة ${quantity} قطعة للسلة ✅`);

            // ✅ Notify Parent to update global badge
            getCartCount().then(onCartCountChange);
        } catch {
            toast.error("يجب تسجيل الدخول أولاً");
        } finally {
            setAddingToCart(false);
        }
    };

    const displayPrice = fullProduct?.discount_price && Number(fullProduct.discount_price) > 0
        ? Number(fullProduct.price) - Number(fullProduct.discount_price)
        : Number(fullProduct?.price ?? 0);
    const originalPrice = fullProduct?.discount_price && Number(fullProduct.discount_price) > 0
        ? Number(fullProduct.price)
        : null;

    if (loading) {
        return (
            <div className="product-details-premium loading-state">
                <div className="details-header">
                    <button className="back-btn-glass" onClick={onBack}>
                        <FiArrowRight />
                        <span>الرجوع للمتجر</span>
                    </button>
                </div>
                <div className="loading-spinner"></div>
                <p>جاري تحميل تفاصيل المنتج...</p>
            </div>
        );
    }

    if (!fullProduct) {
        return (
            <div className="product-details-premium error-state">
                <div className="details-header">
                    <button className="back-btn-glass" onClick={onBack}>
                        <FiArrowRight />
                        <span>الرجوع للمتجر</span>
                    </button>
                </div>
                <p>عذراً، لم نتمكن من تحميل تفاصيل المنتج.</p>
            </div>
        );
    }

    const reviewsToShow = showAllReviews ? reviews : reviews.slice(0, 3);

    return (
        <div className="product-details-premium">
            <header className="details-header">
                <button className="back-btn-glass" onClick={onBack}>
                    <FiArrowRight />
                    <span>الرجوع للمتجر</span>
                </button>
            </header>

            <div className="details-container">
                {/* ===== Images ===== */}
                <div className="product-visuals">
                    <div className="main-image-stage">
                        <img
                            src={getFullImageUrl(activeImage)}
                            alt={fullProduct.name}
                            className="fade-in-image"
                        />
                        {fullProduct.discount_price && Number(fullProduct.discount_price) > 0 && (
                            <div className="main-discount-badge">
                                خصم {Math.round((Number(fullProduct.discount_price) / Number(fullProduct.price)) * 100)}%
                            </div>
                        )}
                        {fullProduct?.badge && fullProduct.badge !== '0' && fullProduct.badge !== 0 && (
                            <span className="product-status-tag">{fullProduct.badge}</span>
                        )}
                    </div>

                    {images.length > 1 && (
                        <div className="thumbnails-grid">
                            {images.map((img: string, idx: number) => (
                                <div
                                    key={idx}
                                    className={`thumb-box ${activeImage === img ? "active" : ""}`}
                                    onClick={() => setActiveImage(img)}
                                >
                                    <img src={getFullImageUrl(img)} alt={`Thumbnail ${idx}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ===== Info Panel ===== */}
                <div className="product-info-panel">
                    <div className="info-bread-crumb">
                        المتجر
                        {fullProduct?.category?.name && ` / ${fullProduct.category.name}`}
                        {` / ${fullProduct?.name}`}
                    </div>

                    <div className="title-area">
                        <h1 className="product-full-name">{fullProduct?.name}</h1>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            {fullProduct?.brand && <span className="brand-name-tag">{fullProduct.brand}</span>}
                            {fullProduct?.company && (
                                <Link to={`/company/${fullProduct.company.id}`} className="company-details-link">
                                    بواسطة: {fullProduct.company.company_name}
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="stats-row">
                        <div className="rating-pill">
                            <FiStar className="star-filled" />
                            <span>{Number(fullProduct?.rating ?? 0).toFixed(1)}</span>
                            <small>({fullProduct?.reviews_count ?? 0} تقييم)</small>
                        </div>
                        <div className="divider-v" />
                        <div className="stock-status-pill">
                            {fullProduct?.stock > 0 ? (
                                <span className="in-stock">متوفر: {fullProduct.stock} قطعة</span>
                            ) : (
                                <span className="out-of-stock">نفذ من المخزن</span>
                            )}
                        </div>
                    </div>

                    <div className="price-tag-section">
                        <div className="main-price">
                            <span className="amount">{displayPrice.toLocaleString()}</span>
                            <span className="currency">ج.م</span>
                        </div>
                        {originalPrice && originalPrice > displayPrice && (
                            <div className="original-price-hint">
                                السعر الأصلي: <s>{originalPrice.toLocaleString()} ج.م</s>
                            </div>
                        )}
                        <div className="tax-hint">شامل ضريبة القيمة المضافة</div>
                    </div>

                    {fullProduct?.description && (
                        <div className="description-box">
                            <h3>وصف المنتج</h3>
                            <p className="product-long-description">{fullProduct.description}</p>
                        </div>
                    )}

                    {/* Specs Grid */}
                    <div className="specification-premium-grid">
                        <div className="spec-item-card">
                            <span className="spec-label">العلامة التجارية</span>
                            <span className="spec-value">{fullProduct?.brand || "غير محدد"}</span>
                        </div>
                        <div className="spec-item-card">
                            <span className="spec-label">بلد المنشأ</span>
                            <span className="spec-value">{fullProduct?.origin_country || "غير محدد"}</span>
                        </div>
                        <div className="spec-item-card">
                            <span className="spec-label">الضمان</span>
                            <span className="spec-value">{fullProduct?.warranty || "لا يوجد ضمان"}</span>
                        </div>
                    </div>

                    <div className="purchase-controls">
                        <div className="quantity-selector">
                            <button
                                onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                                disabled={fullProduct?.stock === 0}
                            >
                                <FiMinus />
                            </button>
                            <span>{quantity}</span>
                            <button
                                onClick={() => quantity < (fullProduct?.stock ?? 99) && setQuantity(q => q + 1)}
                                disabled={fullProduct?.stock === 0 || quantity >= (fullProduct?.stock ?? 1)}
                            >
                                <FiPlus />
                            </button>
                        </div>
                        <button
                            className="add-to-cart-premium-btn"
                            onClick={handleAddToCart}
                            disabled={addingToCart || fullProduct?.stock === 0}
                        >
                            <FiShoppingCart />
                            <span>{addingToCart ? "جاري الإضافة..." : "إضافة للسلة"}</span>
                        </button>
                    </div>

                    <div className="trust-badges-row">
                        <div className="trust-item">
                            <FiTruck />
                            <span>شحن سريع خلال 48 ساعة</span>
                        </div>
                        <div className="trust-item">
                            <FiShield />
                            <span>دفع آمن عند الاستلام</span>
                        </div>
                        <div className="trust-item">
                            <FiRefreshCw />
                            <span>إرجاع مجاني خلال 14 يوم</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== Reviews Section ===== */}
            <div className="product-reviews-section">
                <div className="section-header-reviews">
                    <h3>آراء المشترين ({reviews.length})</h3>
                </div>

                {loadingReviews ? (
                    <div className="reviews-loading-mini">جاري تحميل التقييمات...</div>
                ) : reviews.length === 0 ? (
                    <div className="no-reviews-box">
                        <p>لا توجد تقييمات لهذا المنتج بعد. كن أول من يقيمه!</p>
                    </div>
                ) : (
                    <div className="reviews-grid-list">
                        {reviewsToShow.map((rev: any) => (
                            <div key={rev.id} className="review-card-modern">
                                <div className="rev-header">
                                    <div className="rev-user-info">
                                        <div className="rev-avatar">
                                            {rev.user_avatar ? (
                                                <img src={rev.user_avatar} alt={rev.user_name} />
                                            ) : (
                                                (rev.user_name || "م").charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <div className="rev-user-meta">
                                                <p className="rev-user-name">{rev.user_name || "مستخدم"}</p>
                                                <span className={`rev-type-badge ${rev.user_type === 'صنايعي' ? 'craftsman' : 'user'}`}>
                                                    {rev.user_type}
                                                </span>
                                            </div>
                                            <p className="rev-date">{formatArabicDate(rev.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="rev-stars">
                                        {[...Array(5)].map((_, i) => (
                                            <FaStar key={i} className={i < rev.rating ? "filled" : ""} />
                                        ))}
                                    </div>
                                </div>
                                {rev.comment && <p className="rev-comment">{rev.comment}</p>}
                            </div>
                        ))}

                        {reviews.length > 3 && (
                            <button 
                                className="btn-show-more-reviews" 
                                onClick={() => setShowAllReviews(!showAllReviews)}
                            >
                                {showAllReviews ? "عرض أقل" : "باقي التقييمات"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;
