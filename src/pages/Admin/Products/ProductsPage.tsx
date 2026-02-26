import React, { useState, useEffect } from "react";
import { FiSearch, FiTrash2, FiEye, FiPackage, FiBox, FiArrowRight } from "react-icons/fi";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { adminProductsApi } from "../../../Api/admin/adminProducts.api";
import { getFullImageUrl } from "../../../utils/imageUrl";
import "./ProductsPage.css";

const ProductsPage: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({ total: 0, outOfStock: 0 });

    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

    const fetchProducts = async (params?: { search?: string }) => {
        try {
            setLoading(true);

            // Clean up params
            const cleanParams: any = { ...params };
            if (!cleanParams.search) delete cleanParams.search;

            const response = await adminProductsApi.getAllProducts(cleanParams);

            let list = [];
            let total = 0;

            if (Array.isArray(response)) {
                list = response;
                total = response.length;
            } else if (response && typeof response === 'object') {
                // Case 1: Standard Laravel Pagination { data: [...] }
                if (Array.isArray(response.data)) {
                    list = response.data;
                    total = response.total || response.data.length;

                }
                // Case 2: Wrapped response { success: true, data: { data: [...] } }
                else if (response.data && Array.isArray(response.data.data)) {
                    list = response.data.data;
                    total = response.data.total || response.data.data.length;

                }
                // Case 3: Just the object itself has items? 
                else if (response.items && Array.isArray(response.items)) {
                    list = response.items;
                    total = response.total || response.items.length;
                }
            }

            if (list.length > 0) console.log("📦 Sample product object:", list[0]);

            setProducts(list);
            setStats({
                total: total,
                outOfStock: list.filter((p: any) => Number(p.stock || 0) === 0).length
            });
        } catch (error) {
            toast.error("حدث خطأ في جلب البيانات من السيرفر");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("هل أنت متأكد من حذف هذا المنتج نهائياً؟")) return;
        try {
            await adminProductsApi.deleteProduct(id);
            toast.success("تم حذف المنتج بنجاح");
            fetchProducts(searchTerm ? { search: searchTerm } : undefined);
        } catch (error) {
            toast.error("فشل حذف المنتج");
        }
    };

    const handleToggleStatus = async (id: number) => {
        try {
            await adminProductsApi.toggleProductStatus(id);
            toast.success("تم تحديث حالة المنتج بنجاح");
            fetchProducts(searchTerm ? { search: searchTerm } : undefined);
        } catch (error) {
            toast.error("فشل تحديث حالة المنتج");
        }
    };

    // Server-side search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(searchTerm ? { search: searchTerm } : undefined);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const filteredProducts = products; // Already filtered by server

    return (
        <div className="admin-products-container">
            <div className="admin-products-header">
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <Link to="/admin" style={{ color: '#64748b', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
                            <FiArrowRight />
                        </Link>
                        <h1>إدارة المنتجات</h1>
                    </div>
                    <p>متابعة وإدارة جميع المنتجات المرفوعة من قبل الشركات المشتركة</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="stat-card-mini" style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', minWidth: '120px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>إجمالي المنتجات</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>{stats.total}</div>
                    </div>
                    <div className="stat-card-mini" style={{ background: '#fff1f2', padding: '1rem', borderRadius: '12px', border: '1px solid #fecaca', textAlign: 'center', minWidth: '120px' }}>
                        <div style={{ fontSize: '0.8rem', color: '#991b1b' }}>نفذ من المخزون</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e11d48' }}>{stats.outOfStock}</div>
                    </div>
                </div>
            </div>

            <div className="admin-products-filters">
                <div className="admin-products-search-wrapper">
                    <FiSearch className="admin-products-search-icon" />
                    <input
                        type="text"
                        placeholder="بحث باسم المنتج، الشركة، أو العلامة التجارية..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="admin-products-table-wrapper">
                {loading ? (
                    <div className="admin-loading-state">
                        <FiBox size={40} className="animate-bounce" />
                        <p>جاري تحميل المنتجات...</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <table className="admin-products-table">
                        <thead>
                            <tr>
                                <th>الشركة</th>
                                <th>المنتج</th>
                                <th>السعر</th>
                                <th>المخزون</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((prod) => (
                                <tr key={prod.id}>
                                    <td>
                                        <div className="admin-company-badge">
                                            <FiPackage size={14} />
                                            {prod.company?.company_name || prod.company?.name || "شركة غير معروفة"}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="admin-product-info-cell">
                                            <img
                                                src={getFullImageUrl(prod.main_image) || "https://placehold.co/48x48?text=P"}
                                                alt=""
                                                className="admin-product-img"
                                            />
                                            <div className="admin-product-name-info">
                                                <h4>{prod.name}</h4>
                                                <span>{prod.category?.name || "بدون قسم"}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="admin-price-cell">
                                            {Number(prod.price).toLocaleString()} ج.م
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`admin-stock-badge ${prod.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                                            {prod.stock > 0 ? `${prod.stock} متوفر` : 'نفذ المخزون'}
                                        </span>
                                    </td>
                                    <td>
                                        <div
                                            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
                                            onClick={() => handleToggleStatus(prod.id)}
                                            title="اضغط لتغيير الحالة"
                                        >
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: prod.is_active ? '#22c55e' : '#94a3b8'
                                            }} />
                                            <span style={{ fontSize: '0.85rem', color: prod.is_active ? '#22c55e' : '#64748b', fontWeight: 600 }}>
                                                {prod.is_active ? 'نشط' : 'متوقف'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="admin-action-btn view"
                                                title="عرض التفاصيل"
                                                onClick={() => setSelectedProduct(prod)}
                                            >
                                                <FiEye />
                                            </button>
                                            <button
                                                className="admin-action-btn delete"
                                                title="حذف المنتج"
                                                onClick={() => handleDelete(prod.id)}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="admin-empty-state">
                        <FiPackage size={60} />
                        <p>{searchTerm ? "لم يتم العثور على نتائج للبحث" : "لا يوجد منتجات مرفوعة حالياً"}</p>
                    </div>
                )}
            </div>

            {/* --- Product Details Modal --- */}
            {selectedProduct && (
                <div className="admin-modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="admin-product-modal-content" onClick={e => e.stopPropagation()}>
                        <button className="admin-modal-close" onClick={() => setSelectedProduct(null)}>
                            <FiArrowRight style={{ transform: 'rotate(180deg)' }} />
                        </button>

                        <div className="admin-modal-body">
                            <div className="admin-modal-grid">
                                <div className="admin-modal-image-side">
                                    <img
                                        src={getFullImageUrl(selectedProduct.main_image) || "https://placehold.co/400x400"}
                                        alt={selectedProduct.name}
                                    />
                                    {selectedProduct.images && Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0 && (
                                        <div className="admin-modal-gallery">
                                            {selectedProduct.images.map((img: string, idx: number) => (
                                                <img key={idx} src={getFullImageUrl(img)} alt={`gallery-${idx}`} />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="admin-modal-details-side">
                                    <div className="admin-company-badge" style={{ marginBottom: '1rem' }}>
                                        <FiPackage size={14} />
                                        {selectedProduct.company?.company_name || selectedProduct.company?.name || "شركة غير معروفة"}
                                    </div>
                                    <h2>{selectedProduct.name}</h2>
                                    <div className="admin-modal-price">{Number(selectedProduct.price).toLocaleString()} ج.م</div>

                                    <div className="admin-modal-info-grid">
                                        <div className="admin-info-item">
                                            <label>القسم</label>
                                            <p>{selectedProduct.category?.name || "عام"}</p>
                                        </div>
                                        <div className="admin-info-item">
                                            <label>المخزون</label>
                                            <p>{selectedProduct.stock} قطعة</p>
                                        </div>
                                        <div className="admin-info-item">
                                            <label>العلامة التجارية</label>
                                            <p>{selectedProduct.brand || "—"}</p>
                                        </div>
                                        <div className="admin-info-item">
                                            <label>بلد المنشأ</label>
                                            <p>{selectedProduct.origin_country || "—"}</p>
                                        </div>
                                        <div className="admin-info-item">
                                            <label>الضمان</label>
                                            <p>{selectedProduct.warranty || "—"}</p>
                                        </div>
                                        <div className="admin-info-item">
                                            <label>الحالة</label>
                                            <p>{selectedProduct.is_active ? "نشط ومتاح" : "متوقف"}</p>
                                        </div>
                                    </div>

                                    <label style={{ color: '#64748b', fontSize: '0.85rem' }}>الوصف</label>
                                    <div className="admin-modal-description">
                                        {selectedProduct.description || "لا يوجد وصف لهذا المنتج."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductsPage;
