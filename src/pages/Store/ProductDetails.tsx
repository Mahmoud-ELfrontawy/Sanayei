import React, { useState, useEffect, useMemo } from "react";
import { FiArrowRight, FiShoppingCart, FiShield, FiTruck, FiRefreshCw, FiPlus, FiMinus, FiStar } from "react-icons/fi";
import { toast } from "react-toastify";
import { getPublicStoreProductDetails } from "../../Api/auth/Company/storeManagement.api";
import { addToCart } from "../../Api/store/cart.api";
import { getFullImageUrl } from "../../utils/imageUrl";
import { useAuth } from "../../hooks/useAuth";
import "./ProductDetails.css";

interface ProductDetailsProps {
    product: any; // initial product data from the list (may be partial)
    onBack: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product: initialProduct, onBack }) => {
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

    // Fetch full product details from backend
    useEffect(() => {
        if (!initialProduct?.id) return;
        setLoading(true);
        getPublicStoreProductDetails(initialProduct.id)
            .then((data) => {
                setFullProduct(data);
                if (data.main_image) {
                    setActiveImage(data.main_image);
                }
            })
            .catch(() => {
                // fallback to initial data if fetch fails
                setFullProduct(initialProduct);
                if (initialProduct.main_image) {
                    setActiveImage(initialProduct.main_image);
                }
            })
            .finally(() => {
                setLoading(false);
            });
    }, [initialProduct?.id]);

    const { userType } = useAuth();

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
        } catch {
            toast.error("يجب تسجيل الدخول أولاً");
        } finally {
            setAddingToCart(false);
        }
    };

    const displayPrice = fullProduct?.discount_price && Number(fullProduct.discount_price) > 0
        ? Number(fullProduct.discount_price)
        : Number(fullProduct?.price ?? 0);
    const originalPrice = (fullProduct?.discount_price && Number(fullProduct.discount_price) > 0 && Number(fullProduct.price) > Number(fullProduct.discount_price))
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
                        {fullProduct.discount_price && fullProduct.price > fullProduct.discount_price && (
                            <div className="main-discount-badge">
                                خصم {Math.round(((fullProduct.price - fullProduct.discount_price) / fullProduct.price) * 100)}%
                            </div>
                        )}
                        {fullProduct?.badge && (
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
                        {fullProduct?.brand && <span className="brand-name-tag">{fullProduct.brand}</span>}
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
        </div>
    );
};

export default ProductDetails;
