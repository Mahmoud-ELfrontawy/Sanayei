import React, { useState } from "react";
import { FiArrowRight, FiShoppingCart, FiShield, FiTruck, FiRefreshCw, FiPlus, FiMinus, FiStar } from "react-icons/fi";
import "./ProductDetails.css";

interface ProductDetailsProps {
    product: any;
    onBack: () => void;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product, onBack }) => {
    const [quantity, setQuantity] = useState(1);
    const [activeImage, setActiveImage] = useState(product.image);

    return (
        <div className="product-details-premium">
            <header className="details-header">
                <button className="back-btn-glass" onClick={onBack}>
                    <FiArrowRight />
                    <span>الرجوع للمنتجات</span>
                </button>
            </header>

            <div className="details-container">
                <div className="product-visuals">
                    <div className="main-image-stage">
                        <img src={activeImage} alt={product.name} />
                    </div>
                    <div className="thumbnails-grid">
                        {[product.image, "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=200&auto=format&fit=crop", "https://images.unsplash.com/photo-1581244275151-5407077759a1?q=80&w=200&auto=format&fit=crop"].map((img, idx) => (
                            <div 
                                key={idx} 
                                className={`thumb-box ${activeImage === img ? 'active' : ''}`}
                                onClick={() => setActiveImage(img)}
                            >
                                <img src={img} alt="thumbnail" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="product-info-panel">
                    <div className="info-bread-crumb">المتجر / المعدات والآلات / {product.name}</div>
                    <h1 className="product-full-name">{product.name}</h1>
                    
                    <div className="stats-row">
                        <div className="rating-pill">
                            <FiStar className="star-filled" />
                            <span>{product.rating}</span>
                            <small>({product.reviewsCount} تقييم)</small>
                        </div>
                        <div className="divider-v"></div>
                        <div className="brand-pill">صنايعي بريميوم</div>
                    </div>

                    <div className="price-tag-section">
                        <div className="main-price">
                            <span className="amount">{product.price.toLocaleString()}</span>
                            <span className="currency">ج.م</span>
                        </div>
                        <div className="tax-hint">شامل ضريبة القيمة المضافة</div>
                    </div>

                    <p className="product-long-description">
                        {product.description}
                        هذا المنتج يأتي مع ضمان كامل ضد عيوب الصناعة لمدة عام. تم تصميمه خصيصاً ليتحمل ساعات العمل الطويلة والظروف القاسية.
                    </p>

                    <div className="specification-mini-grid">
                        <div className="spec-item">
                            <span className="spec-label">العلامة التجارية</span>
                            <span className="spec-value">صنايعي تولز</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">بلد المنشأ</span>
                            <span className="spec-value">ألمانيا</span>
                        </div>
                        <div className="spec-item">
                            <span className="spec-label">الضمان</span>
                            <span className="spec-value">12 شهر</span>
                        </div>
                    </div>

                    <div className="purchase-controls">
                        <div className="quantity-selector">
                            <button onClick={() => quantity > 1 && setQuantity(quantity - 1)}><FiMinus /></button>
                            <span>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)}><FiPlus /></button>
                        </div>
                        <button className="add-to-cart-premium-btn">
                            <FiShoppingCart />
                            <span>إضافة للسلة</span>
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
