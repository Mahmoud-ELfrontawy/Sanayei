import React from "react";
import { FiArrowRight, FiShoppingCart, FiStar, FiFilter } from "react-icons/fi";
import "./StoreProductList.css";

interface StoreProductListProps {
    companyId: any;
    onBack: () => void;
    onProductClick: (product: any) => void;
}

const StoreProductList: React.FC<StoreProductListProps> = ({ companyId, onBack, onProductClick }) => {
    // Mock products for the redesign demonstration
    const mockProducts = [
        {
            id: 1,
            name: "طقم مفكات احترافي 32 قطعة",
            description: "طقم مفكات عالي الجودة مصنوع من الكروم فاناديوم، مثالي لأعمال الصيانة المنزلية والاحترافية.",
            price: 850,
            image: "https://images.unsplash.com/photo-1581244275151-5407077759a1?q=80&w=400&auto=format&fit=crop",
            rating: 4.8,
            reviewsCount: 124,
            stockStatus: "in-stock"
        },
        {
            id: 2,
            name: "مثقاب لاسلكي 18 فولت",
            description: "مثقاب قوي ببطاريتين لعمل متواصل، مزود بإضاءة LED ومجموعة رؤوس متنوعة.",
            price: 2400,
            image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop",
            rating: 4.9,
            reviewsCount: 89,
            stockStatus: "in-stock"
        },
        {
            id: 3,
            name: "مفتاح فرنسي قابل للتعديل 12 بوصة",
            description: "مصنوع من الفولاذ المقاوم للصدأ مع قبضة مريحة مانعة للانزلاق.",
            price: 320,
            image: "https://images.unsplash.com/photo-1586864387419-35293c6f39bc?q=80&w=400&auto=format&fit=crop",
            rating: 4.5,
            reviewsCount: 56,
            stockStatus: "limited"
        },
        {
            id: 4,
            name: "ميزان ليزر احترافي",
            description: "ميزان ليزر عالي الدقة يغطي 360 درجة، مثالي لأعمال الديكور والإنشاءات.",
            price: 1850,
            image: "https://images.unsplash.com/photo-1534394017416-0814460f1e1d?q=80&w=400&auto=format&fit=crop",
            rating: 4.7,
            reviewsCount: 42,
            stockStatus: "in-stock"
        }
    ];

    return (
        <div className="store-product-list-premium">
            <div className="list-header-sticky">
                <div className="header-navigation">
                    <button className="back-btn-glass" onClick={onBack}>
                        <FiArrowRight />
                        <span>الرجوع للمتجر</span>
                    </button>
                    <div className="list-title-group">
                        <h2 className="company-name-list">منتجات شركة {companyId}</h2>
                        <span className="results-badge">{mockProducts.length} منتج متوفر</span>
                    </div>
                </div>

                <div className="list-filters-bar">
                    <div className="filter-chip active">
                        <FiFilter />
                        <span>الأكثر مبيعاً</span>
                    </div>
                    <div className="filter-chip">
                        <span>السعر: من الأقل للأعلى</span>
                    </div>
                    <div className="filter-chip">
                        <span>الأحدث وصولاً</span>
                    </div>
                </div>
            </div>

            <div className="products-amazon-grid">
                {mockProducts.map(product => (
                    <div 
                        key={product.id} 
                        className="amazon-style-card"
                        onClick={() => onProductClick(product)}
                    >
                        <div className="card-image-box">
                            <img src={product.image} alt={product.name} />
                            <div className="quick-actions">
                                <button className="add-to-cart-mini" onClick={(e) => e.stopPropagation()}>
                                    <FiShoppingCart />
                                </button>
                            </div>
                        </div>
                        <div className="card-info-box">
                            <h3 className="product-name-amazon">{product.name}</h3>
                            <div className="rating-row-amazon">
                                <div className="stars-group">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <FiStar key={i} className={i <= Math.floor(product.rating) ? "star-filled" : "star-empty"} />
                                    ))}
                                </div>
                                <span className="reviews-count">({product.reviewsCount})</span>
                            </div>
                            <div className="price-row-amazon">
                                <span className="price-amount">{product.price.toLocaleString()}</span>
                                <span className="currency-label">ج.م</span>
                            </div>
                            <div className="stock-hint">
                                {product.stockStatus === "limited" ? (
                                    <span className="limited-stock">بقي القليل فقط!</span>
                                ) : (
                                    <span className="in-stock-hint">متوفر في المخزن</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StoreProductList;
