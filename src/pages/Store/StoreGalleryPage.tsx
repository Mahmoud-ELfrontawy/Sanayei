import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiFilter, FiPackage, FiShoppingCart } from "react-icons/fi";
import { toast } from "react-toastify";
import { getPublicProducts, getPublicCategories } from "../../Api/store/publicStore.api";
import { addToCart } from "../../Api/store/cart.api";
import { getFullImageUrl } from "../../utils/imageUrl";
import "./StoreGalleryPage.css";

interface StoreGalleryPageProps {
    initialCategoryId?: number | null;
    onResetCategory?: () => void;
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
}

const StoreGalleryPage: React.FC<StoreGalleryPageProps> = ({
    initialCategoryId = null,
    onResetCategory,
    searchQuery = "",
    onSearchChange
}) => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(initialCategoryId);
    const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
    const [addingToCartId, setAddingToCartId] = useState<number | null>(null);

    // Sync from parent if changed
    useEffect(() => {
        setSelectedCategory(initialCategoryId);
        setSelectedCompany(null); // Reset company when category changes
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

            // Set categories directly from API
            setCategories(catRes || []);
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

    // Helper to get unique companies and their product count
    const getCompanyCards = () => {
        const companyMap = new Map();
        products.forEach(prod => {
            const company = prod.company;
            if (company) {
                if (!companyMap.has(company.id)) {
                    companyMap.set(company.id, {
                        ...company,
                        productCount: 1,
                        sampleImage: prod.main_image
                    });
                } else {
                    const existing = companyMap.get(company.id);
                    existing.productCount += 1;
                }
            } else {
                // Support for products without company (e.g., generic)
                if (!companyMap.has("generic")) {
                    companyMap.set("generic", {
                        id: "generic",
                        company_name: "منتجات عامة",
                        company_logo: null,
                        productCount: 1,
                        sampleImage: prod.main_image
                    });
                } else {
                    companyMap.get("generic").productCount += 1;
                }
            }
        });
        return Array.from(companyMap.values());
    };

    const filteredProducts = selectedCompany
        ? products.filter(p => (p.company?.id === selectedCompany.id) || (selectedCompany.id === "generic" && !p.company))
        : products;

    return (
        <div className="store-gallery-container-premium">
            <div className="gallery-layout-wrapper">
                <div className="categories-pills-container">
                    <button
                        className={`pill-btn ${selectedCategory === null ? 'active' : ''}`}
                        onClick={() => {
                            setSelectedCategory(null);
                            setSelectedCompany(null);
                        }}
                    >
                        الكل
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                            onClick={() => {
                                setSelectedCategory(cat.id);
                                setSelectedCompany(null);
                            }}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                <div className="products-grid-section">
                    <div className="section-header-row">
                        <div className="results-info-group">
                            {selectedCompany && (
                                <button className="back-to-stores-btn" onClick={() => setSelectedCompany(null)}>
                                    <FiArrowLeft />
                                    <span>الرجوع للشركات</span>
                                </button>
                            )}
                            <div className="results-count">
                                <FiFilter />
                                <span>
                                    {selectedCompany
                                        ? `عرض منتجات شركة ${selectedCompany.company_name}`
                                        : `عرض ${getCompanyCards().length} شركة متوفرة`
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="store-loading-grid">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="product-skeleton-card"></div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {!selectedCompany ? (
                                <div className="companies-premium-grid">
                                    {getCompanyCards().map(company => (
                                        <div
                                            key={company.id}
                                            className="store-company-card-premium"
                                            onClick={() => setSelectedCompany(company)}
                                        >
                                            <div className="company-card-media">
                                                <img
                                                    src={getFullImageUrl(company.company_logo || company.sampleImage)}
                                                    alt={company.company_name}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Company';
                                                    }}
                                                />
                                                <div className="company-overlay">
                                                    <span className="product-count-badge">{company.productCount} منتج</span>
                                                </div>
                                            </div>
                                            <div className="company-card-body">
                                                <h3 className="company-title">{company.company_name}</h3>
                                                <p className="company-hint">{company.company_simple_hint || "استكشف تشكيلة واسعة من المنتجات والمعدات"}</p>
                                                <button className="view-company-products-btn">
                                                    <span>تصفح المنتجات</span>
                                                    <FiArrowLeft />
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {getCompanyCards().length === 0 && (
                                        <div className="store-empty-state">
                                            <div className="empty-icon-circle">
                                                <FiPackage />
                                            </div>
                                            <h3>لا توجد شركات حالياً</h3>
                                            <p>نحن نعمل على إضافة شركات جديدة قريباً، عد لاحقاً!</p>
                                            {searchQuery && (
                                                <button className="back-home-btn" onClick={() => onSearchChange?.("")}>
                                                    <span>مسح البحث</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="products-premium-grid">
                                    {filteredProducts.map(prod => (
                                        <div key={prod.id} className="store-product-card-premium">
                                            <div className="card-media">
                                                {prod.discount_price && Number(prod.discount_price) > 0 && Number(prod.discount_price) < Number(prod.price) && (
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
                                                <p className="product-description">{prod.description}</p>

                                                <div className="price-container-row">
                                                    <div className="prices-group">
                                                        <span className="current-price">
                                                            {(prod.discount_price && Number(prod.discount_price) > 0 && Number(prod.discount_price) < Number(prod.price))
                                                                ? Number(prod.discount_price).toLocaleString()
                                                                : Number(prod.price).toLocaleString()}
                                                            <small>ج.م</small>
                                                        </span>
                                                        {prod.discount_price && Number(prod.discount_price) > 0 && Number(prod.discount_price) < Number(prod.price) && (
                                                            <span className="old-price">{Number(prod.price).toLocaleString()}</span>
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

                                    {filteredProducts.length === 0 && (
                                        <div className="store-empty-state">
                                            <div className="empty-icon-circle">
                                                <FiPackage />
                                            </div>
                                            <h3>لا توجد منتجات لهذه الشركة حالياً</h3>
                                            <button className="back-home-btn" onClick={() => setSelectedCompany(null)}>
                                                <span>الرجوع للشركات</span>
                                                <FiArrowLeft />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoreGalleryPage;