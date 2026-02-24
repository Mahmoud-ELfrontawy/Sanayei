import React, { useState, useEffect } from "react";
import { FiArrowLeft, FiFilter, FiPackage } from "react-icons/fi";
import { toast } from "react-toastify";
import { getPublicProducts, getPublicCategories } from "../../Api/store/publicStore.api";
import { getFullImageUrl } from "../../utils/imageUrl";
import "./StoreGalleryPage.css";

interface StoreGalleryPageProps {
    initialCategoryId?: number | null;
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
    onBrowseProducts?: (companyId: any) => void;
}

const StoreGalleryPage: React.FC<StoreGalleryPageProps> = ({
    initialCategoryId = null,
    searchQuery = "",
    onSearchChange,
    onBrowseProducts
}) => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(initialCategoryId);

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
            setProducts(prodRes.data || (Array.isArray(prodRes) ? prodRes : []));
            setCategories(catRes || []);
        } catch {
            toast.error("فشل تحميل بيانات المتجر");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => { fetchData(); }, 400);
        return () => clearTimeout(timer);
    }, [selectedCategory, searchQuery]);

    /** Build a unique company card list from fetched products */
    const getCompanyCards = () => {
        const map = new Map<any, any>();
        products.forEach(prod => {
            const company = prod.company;
            if (company) {
                if (!map.has(company.id)) {
                    map.set(company.id, {
                        ...company,
                        productCount: 1,
                        sampleImage: prod.main_image
                    });
                } else {
                    map.get(company.id).productCount += 1;
                }
            } else {
                if (!map.has("generic")) {
                    map.set("generic", {
                        id: "generic",
                        company_name: "منتجات عامة",
                        company_logo: null,
                        productCount: 1,
                        sampleImage: prod.main_image
                    });
                } else {
                    map.get("generic").productCount += 1;
                }
            }
        });
        return Array.from(map.values());
    };

    const companyCards = getCompanyCards();

    return (
        <div className="store-gallery-container-premium">
            <div className="gallery-layout-wrapper">

                {/* ── Category pills ── */}
                <div className="categories-pills-container">
                    {[
                        { id: null, name: "الكل" },
                        ...(categories.map(c => ({ id: c.id, name: c.name })))
                    ].map(cat => (
                        <button
                            key={cat.id === null ? "all" : cat.id}
                            className={`pill-btn ${selectedCategory === cat.id ? "active" : ""}`}
                            onClick={() => setSelectedCategory(cat.id as any)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* ── Companies Grid ── */}
                <div className="products-grid-section">
                    <div className="section-header-row">
                        <div className="results-count">
                            <FiFilter />
                            <span>عرض {companyCards.length} شركة متوفرة</span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="store-loading-grid">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="product-skeleton-card" />
                            ))}
                        </div>
                    ) : companyCards.length === 0 ? (
                        <div className="store-empty-state">
                            <div className="empty-icon-circle"><FiPackage /></div>
                            <h3>لا توجد شركات حالياً</h3>
                            <p>نحن نعمل على إضافة شركات جديدة قريباً، عد لاحقاً!</p>
                            {searchQuery && (
                                <button className="back-home-btn" onClick={() => onSearchChange?.("")}>
                                    مسح البحث
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="companies-premium-grid">
                            {companyCards.map(company => (
                                <div
                                    key={company.id}
                                    className="store-company-card-premium"
                                    onClick={() => onBrowseProducts?.(company.id)}
                                >
                                    <div className="company-card-media">
                                        <img
                                            src={getFullImageUrl(company.company_logo || company.sampleImage) ?? "https://placehold.co/400x300?text=Company"}
                                            alt={company.company_name}
                                            onError={e => {
                                                (e.target as HTMLImageElement).src = "https://placehold.co/400x300?text=Company";
                                            }}
                                        />
                                        <div className="company-overlay">
                                            <span className="product-count-badge">{company.productCount} منتج</span>
                                        </div>
                                    </div>
                                    <div className="company-card-body">
                                        <h3 className="company-title">{company.company_name}</h3>
                                        <p className="company-hint">
                                            {company.company_simple_hint || "استكشف تشكيلة واسعة من المنتجات والمعدات"}
                                        </p>
                                        <button
                                            className="view-company-products-btn"
                                            onClick={e => {
                                                e.stopPropagation();
                                                onBrowseProducts?.(company.id);
                                            }}
                                        >
                                            <span>تصفح المنتجات</span>
                                            <FiArrowLeft />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StoreGalleryPage;