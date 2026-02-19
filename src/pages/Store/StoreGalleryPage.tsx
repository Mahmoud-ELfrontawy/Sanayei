import React, { useState, useEffect } from "react";
import { FiSearch, FiShoppingCart, FiPackage, FiFilter, FiArrowLeft } from "react-icons/fi";
import { toast } from "react-toastify";
import { getPublicProducts, getPublicCategories } from "../../Api/store/publicStore.api";
import { addToCart } from "../../Api/store/cart.api";
import { getFullImageUrl } from "../../utils/imageUrl";
import "./StoreGalleryPage.css";

interface StoreGalleryPageProps {
    initialCategoryId?: number | null;
    onResetCategory?: () => void;
}

const StoreGalleryPage: React.FC<StoreGalleryPageProps> = ({ initialCategoryId = null, onResetCategory }) => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<number | null>(initialCategoryId);
    const [addingToCartId, setAddingToCartId] = useState<number | null>(null);

    // Sync from parent if changed
    useEffect(() => {
        setSelectedCategory(initialCategoryId);
    }, [initialCategoryId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                getPublicProducts({
                    category_id: selectedCategory || undefined,
                    search: searchQuery || undefined
                }),
                getPublicCategories()
            ]);

            // Handle paginated response if applicable
            setProducts(prodRes.data || (Array.isArray(prodRes) ? prodRes : []));
            setCategories(catRes);
        } catch (error) {
            console.error("Fetch Store Data Error:", error);
            toast.error("فشل تحميل بيانات المتجر");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [selectedCategory, searchQuery]);

    const handleAddToCart = async (productId: number) => {
        try {
            setAddingToCartId(productId);
            const res = await addToCart(productId, 1);
            if (res.success) {
                toast.success("تم إضافة المنتج للسلة بنجاح");
            }
        } catch (error: any) {
            const msg = error.response?.status === 401 ? "يجب تسجيل الدخول للإضافة للسلة" : "فشل إضافة المنتج للسلة";
            toast.error(msg);
        } finally {
            setAddingToCartId(null);
        }
    };

    return (
        <div className="store-gallery-container-premium">
            <div className="gallery-main-hero">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <span className="hero-badge">معدات أصلية 100%</span>
                    <h1>متجر صنايعي المعتمد</h1>
                    <p>المكان الوحيد الذي يجمع بين جودة المعدات الاحترافية وخبرة الصنايعية المصريين</p>

                    <div className="search-premium-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="ابحث عن أدوات، معدات، أو مستلزمات..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="gallery-layout-wrapper">
                {/* 📌 Categories Navigation */}
                <div className="categories-pills-container">
                    <button
                        className={`pill-btn ${selectedCategory === null ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        الكل
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="products-grid-section">
                    <div className="section-header-row">
                        <div className="results-count">
                            <FiFilter />
                            <span>عرض {products.length} منتج متوفر حالياً</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="store-loading-grid">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="product-skeleton-card"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="products-premium-grid">
                            {products.map(prod => (
                                <div key={prod.id} className="store-product-card-premium">
                                    <div className="card-media">
                                        {prod.discount_price && (
                                            <div className="sale-badge">خصم حصري</div>
                                        )}
                                        <img
                                            src={getFullImageUrl(prod.main_image)}
                                            alt={prod.name}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
                                            }}
                                        />
                                        <div className="card-overlay-actions">
                                            <button
                                                className="quick-view-btn"
                                                onClick={() => handleAddToCart(prod.id)}
                                                disabled={addingToCartId === prod.id}
                                            >
                                                {addingToCartId === prod.id ? '...' : <FiShoppingCart />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <span className="product-category-label">{prod.category?.name || 'عام'}</span>
                                        <h3 className="product-title">{prod.name}</h3>

                                        <div className="price-container-row">
                                            <div className="prices-group">
                                                <span className="current-price">
                                                    {(prod.discount_price || prod.price).toLocaleString()} <small>ج.م</small>
                                                </span>
                                                {prod.discount_price && (
                                                    <span className="old-price">{prod.price.toLocaleString()}</span>
                                                )}
                                            </div>
                                            <div className="stock-info">
                                                <div className={`status-dot ${prod.stock > 0 ? 'in-stock' : 'out-of-stock'}`}></div>
                                                <span>{prod.stock > 0 ? 'متوفر' : 'نفذ'}</span>
                                            </div>
                                        </div>

                                        <button
                                            className="btn-add-to-cart-premium"
                                            onClick={() => handleAddToCart(prod.id)}
                                            disabled={addingToCartId === prod.id || prod.stock <= 0}
                                        >
                                            {addingToCartId === prod.id ? (
                                                <span className="loader-inner"></span>
                                            ) : (
                                                <>
                                                    <FiShoppingCart />
                                                    <span>{prod.stock > 0 ? 'إضافة للسلة' : 'غير متوفر'}</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {products.length === 0 && (
                                <div className="store-empty-state">
                                    <div className="empty-icon-circle">
                                        <FiPackage />
                                    </div>
                                    <h3>لا توجد منتجات حالياً</h3>
                                    <p>نحن نعمل على إضافة منتجات جديدة قريباً، عد لاحقاً!</p>
                                    <button className="back-home-btn" onClick={() => {
                                        setSearchQuery("");
                                        setSelectedCategory(null);
                                        if (onResetCategory) onResetCategory();
                                    }}>
                                        <span>عرض كافة المنتجات</span>
                                        <FiArrowLeft />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoreGalleryPage;
