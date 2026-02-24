import React, { useState, useEffect, useCallback } from "react";
import {
    FiArrowRight, FiShoppingCart, FiStar, FiFilter
} from "react-icons/fi";
import { toast } from "react-toastify";
import { getPublicStoreProducts } from "../../Api/auth/Company/storeManagement.api";
import { addToCart, getCartItems } from "../../Api/store/cart.api";
import { getFullImageUrl } from "../../utils/imageUrl";
import { useAuth } from "../../hooks/useAuth";
import "./StoreProductList.css";

interface StoreProductListProps {
    companyId: any;
    onBack: () => void;
    onProductClick: (product: any) => void;
    onCartCountChange?: (count: number) => void;
}

const SORT_OPTIONS = [
    { label: "الأحدث", sort: "created_at" as const, dir: "desc" as const },
    { label: "السعر: من الأقل", sort: "price" as const, dir: "asc" as const },
    { label: "السعر: من الأعلى", sort: "price" as const, dir: "desc" as const },
    { label: "الأعلى تقييماً", sort: "rating" as const, dir: "desc" as const },
];

const StoreProductList: React.FC<StoreProductListProps> = ({ companyId, onBack, onProductClick, onCartCountChange }) => {
    const { isAuthenticated } = useAuth();

    /* ── Products ── */
    const [products, setProducts] = useState<any[]>([]);
    const [productsLoading, setProductsLoading] = useState(true);
    const [activeSortIdx, setActiveSortIdx] = useState(0);

    /* ── Cart State ── */
    const [cartCount, setCartCount] = useState(0);

    /* ───────────── Products fetch ───────────── */
    const fetchProducts = useCallback(async () => {
        try {
            setProductsLoading(true);
            const active = SORT_OPTIONS[activeSortIdx];
            const res = await getPublicStoreProducts({
                company_id: companyId,
                sort: active.sort,
                dir: active.dir,
            });
            setProducts(Array.isArray(res) ? res : (res?.data ?? []));
        } catch {
            /* silence */
        } finally {
            setProductsLoading(false);
        }
    }, [companyId, activeSortIdx]);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    /* ───────────── Cart Count fetch ───────────── */
    const fetchCartCount = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const data = await getCartItems();
            const items = Array.isArray(data) ? data : [];
            setCartCount(items.length);
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
                    <button className="back-btn-glass" onClick={onBack}>
                        <FiArrowRight />
                        <span>الرجوع للمتجر</span>
                    </button>
                    <div className="list-title-group">
                        <h2 className="company-name-list">منتجات المتجر</h2>
                        <span className="results-badge">{products.length} منتج متوفر</span>
                    </div>

                    {/* Simple Cart Indicator - Clicking this doesn't open drawer now, user uses the top tab */}
                    <div className="cart-float-btn static">
                        <FiShoppingCart size={20} />
                        {cartCount > 0 && <span className="cart-float-count">{cartCount}</span>}
                        <span>السلة</span>
                    </div>
                </div>

                <div className="list-filters-bar">
                    <FiFilter style={{ color: "#94a3b8", flexShrink: 0 }} />
                    {SORT_OPTIONS.map((opt, idx) => (
                        <div
                            key={idx}
                            className={`filter-chip ${activeSortIdx === idx ? "active" : ""}`}
                            onClick={() => setActiveSortIdx(idx)}
                        >
                            <span>{opt.label}</span>
                        </div>
                    ))}
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
                <div style={{ textAlign: "center", padding: "4rem", color: "#94a3b8" }}>
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
                                    {product.discount_price && product.price && (
                                        <span className="discount-badge">
                                            -{Math.round((1 - product.discount_price / product.price) * 100)}%
                                        </span>
                                    )}
                                    <div className="quick-actions">
                                        <button className="add-to-cart-mini" title="إضافة للسلة" onClick={e => handleAddToCart(e, product.id)}>
                                            <FiShoppingCart />
                                        </button>
                                    </div>
                                </div>
                                <div className="card-info-box">
                                    {product.badge && <span className="product-badge-tag">{product.badge}</span>}
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
                                        {product.discount_price ? (
                                            <>
                                                <span className="price-amount">{Number(product.discount_price).toLocaleString()}</span>
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
