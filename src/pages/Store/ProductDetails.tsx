import React, { useState, useEffect } from "react";
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
    const [product, setProduct] = useState<any>(initialProduct);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    // Resolve main image
    const mainImageSrc = getFullImageUrl(product?.main_image)
        ?? "https://placehold.co/600x500?text=No+Image";

    // Build gallery: [main_image, ...images]
    const gallery: string[] = [];
    if (mainImageSrc && !mainImageSrc.includes("placehold.co")) {
        gallery.push(mainImageSrc);
    }

    // Try multiple field names for images
    const rawImages = product?.images || product?.gallery_images;
    if (rawImages) {
        let imagesArray = [];
        try {
            if (typeof rawImages === 'string') {
                if (rawImages.startsWith('[') || rawImages.startsWith('{')) {
                    imagesArray = JSON.parse(rawImages);
                } else if (rawImages.includes(',')) {
                    imagesArray = rawImages.split(',').map(s => s.trim());
                } else {
                    imagesArray = [rawImages];
                }
            } else {
                imagesArray = rawImages;
            }
        } catch (e) {
            console.error("Error parsing images:", e);
        }

        if (Array.isArray(imagesArray)) {
            imagesArray.forEach((img: any) => {
                const url = getFullImageUrl(img);
                if (url && url !== mainImageSrc && !gallery.includes(url)) {
                    gallery.push(url);
                }
            });
        }
    }

    const [activeImage, setActiveImage] = useState(mainImageSrc);

    // Fetch full product details from backend
    useEffect(() => {
        if (!initialProduct?.id) return;
        getPublicStoreProductDetails(initialProduct.id)
            .then((data) => {
                setProduct(data);
                const fullImg = getFullImageUrl(data.main_image) ?? mainImageSrc;
                setActiveImage(fullImg);
            })
            .catch(() => {
                // fallback to initial data if fetch fails
            });
    }, [initialProduct?.id, mainImageSrc]);

    const { userType } = useAuth();

    const handleAddToCart = async () => {
        if (userType === 'company') {
            toast.info("عذراً، يجب التسجيل بحساب مستخدم عادي أو صنايعي لإتمام عمليات الشراء من المتجر 🛒");
            return;
        }

        try {
            setAddingToCart(true);
            await addToCart(product.id, quantity);
            toast.success(`تم إضافة ${quantity} قطعة للسلة ✅`);
        } catch {
            toast.error("يجب تسجيل الدخول أولاً");
        } finally {
            setAddingToCart(false);
        }
    };

    const displayPrice = product?.discount_price && Number(product.discount_price) > 0
        ? Number(product.discount_price)
        : Number(product?.price ?? 0);
    const originalPrice = (product?.discount_price && Number(product.discount_price) > 0 && Number(product.price) > Number(product.discount_price))
        ? Number(product.price)
        : null;
    const discountPct = (originalPrice && displayPrice < originalPrice)
        ? Math.round((1 - displayPrice / originalPrice) * 100)
        : null;

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
                        <img src={activeImage} alt={product?.name} />
                        {discountPct && (
                            <span className="main-discount-badge">-{discountPct}%</span>
                        )}
                        {product?.badge && (
                            <span className="product-status-tag">{product.badge}</span>
                        )}
                    </div>
                    {gallery.length > 1 && (
                        <div className="thumbnails-grid">
                            {gallery.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`thumb-box ${activeImage === img ? "active" : ""}`}
                                    onClick={() => setActiveImage(img)}
                                >
                                    <img src={img} alt={`thumbnail-${idx}`} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ===== Info Panel ===== */}
                <div className="product-info-panel">
                    <div className="info-bread-crumb">
                        المتجر
                        {product?.category?.name && ` / ${product.category.name}`}
                        {` / ${product?.name}`}
                    </div>

                    <div className="title-area">
                        <h1 className="product-full-name">{product?.name}</h1>
                        {product?.brand && <span className="brand-name-tag">{product.brand}</span>}
                    </div>

                    <div className="stats-row">
                        <div className="rating-pill">
                            <FiStar className="star-filled" />
                            <span>{Number(product?.rating ?? 0).toFixed(1)}</span>
                            <small>({product?.reviews_count ?? 0} تقييم)</small>
                        </div>
                        <div className="divider-v" />
                        <div className="stock-status-pill">
                            {product?.stock > 0 ? (
                                <span className="in-stock">متوفر: {product.stock} قطعة</span>
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

                    {product?.description && (
                        <div className="description-box">
                            <h3>وصف المنتج</h3>
                            <p className="product-long-description">{product.description}</p>
                        </div>
                    )}

                    {/* Specs Grid */}
                    <div className="specification-premium-grid">
                        <div className="spec-item-card">
                            <span className="spec-label">العلامة التجارية</span>
                            <span className="spec-value">{product?.brand || "غير محدد"}</span>
                        </div>
                        <div className="spec-item-card">
                            <span className="spec-label">بلد المنشأ</span>
                            <span className="spec-value">{product?.origin_country || "غير محدد"}</span>
                        </div>
                        <div className="spec-item-card">
                            <span className="spec-label">الضمان</span>
                            <span className="spec-value">{product?.warranty || "لا يوجد ضمان"}</span>
                        </div>
                    </div>

                    <div className="purchase-controls">
                        <div className="quantity-selector">
                            <button
                                onClick={() => quantity > 1 && setQuantity(q => q - 1)}
                                disabled={product?.stock === 0}
                            >
                                <FiMinus />
                            </button>
                            <span>{quantity}</span>
                            <button
                                onClick={() => quantity < (product?.stock ?? 99) && setQuantity(q => q + 1)}
                                disabled={product?.stock === 0 || quantity >= (product?.stock ?? 1)}
                            >
                                <FiPlus />
                            </button>
                        </div>
                        <button
                            className="add-to-cart-premium-btn"
                            onClick={handleAddToCart}
                            disabled={addingToCart || product?.stock === 0}
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
