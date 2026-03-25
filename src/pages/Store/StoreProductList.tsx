import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    FiPackage, FiShoppingCart, FiStar, FiChevronDown
} from "react-icons/fi";
import { ArrowDownWideNarrow } from "lucide-react";
import { toast } from "react-toastify";
import { getPublicStoreProducts } from "../../Api/auth/Company/storeManagement.api";
import { addToCart, getCartItems } from "../../Api/store/cart.api";
import { getFullImageUrl } from "../../utils/imageUrl";
import { useAuth } from "../../hooks/useAuth";
import "./StoreProductList.css";

interface StoreProductListProps {
    categoryId: number | null;
    searchQuery: string;
    categories: any[];
    onCategoryChange: (id: number | null) => void;
    onProductClick: (product: any) => void;
    onCartCountChange?: (count: number) => void;
}

const SORT_OPTIONS = [
    { label: "الأحدث", sort: "created_at" as const, dir: "desc" as const },
    { label: "السعر: من الأقل", sort: "price" as const, dir: "asc" as const },
    { label: "السعر: من الأعلى", sort: "price" as const, dir: "desc" as const },
    { label: "الأعلى تقييماً", sort: "rating" as const, dir: "desc" as const },
];

const StoreProductList: React.FC<StoreProductListProps> = ({ categoryId, searchQuery, categories, onCategoryChange, onProductClick, onCartCountChange }) => {
    const { isAuthenticated, userType } = useAuth();

    /* ── Products ── */
    const [products, setProducts] = useState<any[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [activeSortIdx, setActiveSortIdx] = useState(0);
    const [isSortOpen, setIsSortOpen] = useState(false);

    /* ── Cart State ── */

    /* ───────────── Products fetch ───────────── */
    const fetchProducts = useCallback(async () => {
        try {
            setProductsLoading(true);
            const active = SORT_OPTIONS[activeSortIdx];
            const res = await getPublicStoreProducts({
                category_id: categoryId || undefined,
                search: searchQuery || undefined,
                sort: active.sort,
                dir: active.dir,
            });
            setProducts(Array.isArray(res) ? res : (res?.data ?? []));
        } catch {
            /* silence */
        } finally {
            setProductsLoading(false);
        }
    }, [categoryId, searchQuery, activeSortIdx]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    /* ───────────── Cart Count fetch ───────────── */
    const fetchCartCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const data = await getCartItems();
            const items = Array.isArray(data) ? data : (data?.data ?? []);
            onCartCountChange?.(items.length);
        } catch {
            /* silence */
        }
    }, [isAuthenticated, onCartCountChange]);

    useEffect(() => { fetchCartCount(); }, [fetchCartCount]);

    /* ───────────── Add to cart ───────────── */
    const handleAddToCart = async (e: React.MouseEvent, productId: number) => {
        e.stopPropagation();
        if (!isAuthenticated) { toast.error("يجب تسجيل الدخول أولاً"); return; }

        if (userType === 'company') {
            toast.info("عذراً، يجب التسجيل بحساب مستخدم عادي أو صنايعي لإتمام عمليات الشراء من المتجر 🛒");
            return;
        }

        try {
            await addToCart(productId, 1);
            toast.success("تم إضافة المنتج للسلة ✅");
            fetchCartCount();
        } catch {
            toast.error("تعذر إضافة المنتج للسلة");
        }
    };

    return (
        <div className="store-product-list-premium">

            {/* ── Sticky Header ── */}
            <div className="list-header-sticky">
                <div className="header-navigation">
                    <div className="list-title-group">
                        <h2 className="company-name-list">جميع المنتجات</h2>
                        <span className="results-badge">{products.length} منتج متوفر</span>
                    </div>

                    <div className="categories-pills-scroll">
                        <button
                            className={`pill-btn ${categoryId === null ? "active" : ""}`}
                            onClick={() => onCategoryChange(null)}
                        >
                            الكل
                        </button>
                        {Array.isArray(categories) && categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`pill-btn ${categoryId === cat.id ? "active" : ""}`}
                                onClick={() => onCategoryChange(cat.id)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="list-filters-bar">
                    <div className="sort-selector-wrapper">
                        <button
                            className={`sort-trigger-btn ${isSortOpen ? 'active' : ''}`}
                            onClick={() => setIsSortOpen(!isSortOpen)}
                        >
                            <ArrowDownWideNarrow size={18} className="sort-icon-main" />
                            <span className="current-sort-label">{SORT_OPTIONS[activeSortIdx].label}</span>
                            <FiChevronDown className={`chevron-sort ${isSortOpen ? 'rotate' : ''}`} />
                        </button>

                        {isSortOpen && (
                            <>
                                <div className="sort-dropdown-overlay" onClick={() => setIsSortOpen(false)} />
                                <div className="sort-dropdown-menu">
                                    {SORT_OPTIONS.map((opt, idx) => (
                                        <div
                                            key={idx}
                                            className={`sort-option-item ${activeSortIdx === idx ? "active" : ""}`}
                                            onClick={() => {
                                                setActiveSortIdx(idx);
                                                setIsSortOpen(false);
                                            }}
                                        >
                                            <span className="option-label">{opt.label}</span>
                                            {activeSortIdx === idx && <div className="active-dot" />}
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Products Grid ── */}
            {productsLoading ? (
                <div className="products-amazon-grid">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="amazon-style-card skeleton-card">
                            <div className="card-image-box skeleton-img" />
                            <div className="card-info-box">
                                <div className="skeleton-line w-80" />
                                <div className="skeleton-line w-50" />
                                <div className="skeleton-line w-40" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div style={{ textAlign: "center", padding: "4rem", color: "var(--slate-400)" }}>
                    <FiShoppingCart size={48} />
                    <p style={{ marginTop: "1rem" }}>لا توجد منتجات في هذه الفئة حالياً</p>
                </div>
            ) : (
                <div className="products-amazon-grid">
                    {products.map(product => {
                        const imgSrc = getFullImageUrl(product.main_image) ?? "https://placehold.co/400x300?text=No+Image";
                        const isLimited = product.stock > 0 && product.stock <= 5;
                        return (
                            <div key={product.id} className="amazon-style-card" onClick={() => onProductClick(product)}>
                                <div className="card-image-box">
                                    <img src={imgSrc} alt={product.name} loading="lazy" />
                                    {product.discount_price && product.price && Number(product.discount_price) > 0 && (
                                        <span className="discount-badge">
                                            -{Math.round((product.discount_price / product.price) * 100)}%
                                        </span>
                                    )}
                                    <div className="quick-actions">
                                        <button className="add-to-cart-mini" title="إضافة للسلة" onClick={e => handleAddToCart(e, product.id)}>
                                            <FiShoppingCart />
                                        </button>
                                    </div>
                                </div>
                                <div className="card-info-box">
                                    <div className="product-meta-row">
                                        {product.badge && product.badge !== '0' && product.badge !== 0 && (
                                            <span className="product-badge-tag">{product.badge}</span>
                                        )}
                                        {product.company?.company_name && (
                                            <Link
                                                to={`/company/${product.company.id}`}
                                                className="company-attribution company-link"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <FiPackage size={12} />
                                                {product.company.company_name}
                                            </Link>
                                        )}
                                    </div>
                                    <h3 className="product-name-amazon">{product.name}</h3>
                                    <div className="rating-row-amazon">
                                        <div className="stars-group">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <FiStar key={i} className={i <= Math.floor(product.rating ?? 0) ? "star-filled" : "star-empty"} />
                                            ))}
                                        </div>
                                        <span className="reviews-count">({product.reviews_count ?? 0})</span>
                                    </div>
                                    <div className="price-row-amazon">
                                        {product.discount_price && Number(product.discount_price) > 0 ? (
                                            <>
                                                <span className="price-amount">{(Number(product.price) - Number(product.discount_price)).toLocaleString()}</span>
                                                <span className="currency-label">ج.م</span>
                                                <span className="original-price">{Number(product.price).toLocaleString()}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="price-amount">{Number(product.price).toLocaleString()}</span>
                                                <span className="currency-label">ج.م</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="stock-hint">
                                        {product.stock === 0 ? (
                                            <span className="out-of-stock">نفذ من المخزن</span>
                                        ) : isLimited ? (
                                            <span className="limited-stock">بقي القليل فقط!</span>
                                        ) : (
                                            <span className="in-stock-hint">متوفر في المخزن</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StoreProductList;

