import React, { useState, useEffect, useRef } from "react";
import { FiPlus, FiTrash2, FiPackage, FiImage, FiX } from "react-icons/fi";
import { toast } from "react-toastify";
import { getStoreProducts, addStoreProduct, getStoreCategories, deleteStoreProduct } from "../../../../Api/auth/Company/storeManagement.api";
import { getFullImageUrl } from "../../../../utils/imageUrl";
import "./ProductsManager.css";

const EMPTY_PRODUCT = {
    name: "",
    price: "",
    discount_price: "",
    category_id: "",
    stock: "1",
    description: "",
    brand: "",
    origin_country: "",
    warranty: "",
    badge: "",
    is_active: true,
    main_image: null as File | null,
    gallery_images: [] as File[],
};

const ProductsManager: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProduct, setNewProduct] = useState({ ...EMPTY_PRODUCT });

    // Preview URLs
    const [mainPreview, setMainPreview] = useState<string | null>(null);
    const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                getStoreProducts(),
                getStoreCategories()
            ]);
            setProducts(prodRes);
            setCategories(catRes);
        } catch {
            toast.error("حدث خطأ أثناء تحميل البيانات");
        } finally {
            setLoading(false);
        }
    };

    const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setNewProduct(p => ({ ...p, main_image: file }));
        if (file) setMainPreview(URL.createObjectURL(file));
        else setMainPreview(null);
    };

    const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        // Allow max 5 gallery images total
        const combined = [...newProduct.gallery_images, ...files].slice(0, 5);
        setNewProduct(p => ({ ...p, gallery_images: combined }));
        setGalleryPreviews(combined.map(f => URL.createObjectURL(f)));
        // Reset input so same files can be re-selected
        if (galleryInputRef.current) galleryInputRef.current.value = "";
    };

    const removeGalleryImage = (idx: number) => {
        const updated = newProduct.gallery_images.filter((_, i) => i !== idx);
        setNewProduct(p => ({ ...p, gallery_images: updated }));
        setGalleryPreviews(updated.map(f => URL.createObjectURL(f)));
    };

    const handleChange = (field: keyof typeof EMPTY_PRODUCT) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            setNewProduct(p => ({ ...p, [field]: e.target.value }));
        };

    const resetForm = () => {
        setNewProduct({ ...EMPTY_PRODUCT });
        setMainPreview(null);
        setGalleryPreviews([]);
        setShowAddForm(false);
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price) {
            toast.warning("يرجى ملء الحقول الأساسية (الاسم والسعر)");
            return;
        }

        const formData = new FormData();
        formData.append("name", newProduct.name);
        formData.append("price", newProduct.price);
        formData.append("stock", newProduct.stock);
        formData.append("is_active", newProduct.is_active ? "1" : "0");

        if (newProduct.discount_price) formData.append("discount_price", newProduct.discount_price);
        if (newProduct.category_id) formData.append("category_id", newProduct.category_id);
        if (newProduct.description) formData.append("description", newProduct.description);
        if (newProduct.brand) formData.append("brand", newProduct.brand);
        if (newProduct.origin_country) formData.append("origin_country", newProduct.origin_country);
        if (newProduct.warranty) formData.append("warranty", newProduct.warranty);
        if (newProduct.badge) formData.append("badge", newProduct.badge);
        if (newProduct.main_image) formData.append("main_image", newProduct.main_image);

        // Gallery images
        newProduct.gallery_images.forEach((img) => {
            formData.append("images[]", img);
        });

        try {
            setIsAdding(true);
            const res = await addStoreProduct(formData);
            if (res.success) {
                toast.success("تم إضافة المنتج بنجاح ✅");
                resetForm();
                fetchData();
            }
        } catch (error: any) {
            const errorMsg =
                error.response?.data?.message ||
                (error.response?.data?.errors
                    ? Object.values(error.response.data.errors).flat()[0]
                    : null) ||
                "فشل إضافة المنتج";
            toast.error(String(errorMsg));
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
        try {
            const res = await deleteStoreProduct(id);
            if (res.success) {
                toast.success("تم حذف المنتج");
                fetchData();
            }
        } catch {
            toast.error("فشل حذف المنتج");
        }
    };

    useEffect(() => { fetchData(); }, []);

    return (
        <div className="products-manager-container">
            <div className="manager-header">
                <div>
                    <h1>إدارة المنتجات</h1>
                    <p>أضف منتجاتك الجديدة وقم بتحديث المخزون والأسعار</p>
                </div>
                <button className="add-btn-premium" onClick={() => setShowAddForm(!showAddForm)}>
                    <FiPlus />
                    {showAddForm ? "إغلاق النموذج" : "إضافة منتج جديد"}
                </button>
            </div>

            {/* ===== ADD PRODUCT FORM ===== */}
            {showAddForm && (
                <div className="add-product-overlay" onClick={(e) => e.target === e.currentTarget && resetForm()}>
                    <div className="add-product-modal profile-card">
                        <div className="modal-header-row">
                            <h3>بيانات المنتج الجديد</h3>
                            <button className="close-modal-btn" onClick={resetForm}><FiX /></button>
                        </div>

                        <form onSubmit={handleAddProduct} className="prod-form">

                            {/* ── Section: Basic Info ── */}
                            <p className="form-section-title">المعلومات الأساسية</p>
                            <div className="form-row">
                                <div className="input-field">
                                    <label>اسم المنتج *</label>
                                    <input value={newProduct.name} onChange={handleChange("name")} placeholder="مثال: مثقاب كهربائي 18 فولت" />
                                </div>
                                <div className="input-field">
                                    <label>السعر (ج.م) *</label>
                                    <input type="number" min="0" value={newProduct.price} onChange={handleChange("price")} placeholder="0.00" />
                                </div>
                                <div className="input-field">
                                    <label>سعر الخصم (اختياري)</label>
                                    <input type="number" min="0" value={newProduct.discount_price} onChange={handleChange("discount_price")} placeholder="0.00" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-field">
                                    <label>القسم</label>
                                    <select value={newProduct.category_id} onChange={handleChange("category_id")}>
                                        <option value="">اختر القسم...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-field">
                                    <label>الكمية المتوفرة *</label>
                                    <input type="number" min="0" value={newProduct.stock} onChange={handleChange("stock")} />
                                </div>
                                <div className="input-field">
                                    <label>الحالة</label>
                                    <label className="toggle-label">
                                        <input
                                            type="checkbox"
                                            checked={newProduct.is_active}
                                            onChange={(e) => setNewProduct(p => ({ ...p, is_active: e.target.checked }))}
                                        />
                                        <span>{newProduct.is_active ? "متاح للبيع" : "غير متاح"}</span>
                                    </label>
                                </div>
                            </div>

                            <div className="input-field full-width">
                                <label>وصف المنتج</label>
                                <textarea
                                    rows={3}
                                    value={newProduct.description}
                                    onChange={handleChange("description")}
                                    placeholder="اكتب وصفاً تفصيلياً للمنتج..."
                                />
                            </div>

                            {/* ── Section: Specs ── */}
                            <p className="form-section-title">المواصفات</p>
                            <div className="form-row">
                                <div className="input-field">
                                    <label>العلامة التجارية</label>
                                    <input value={newProduct.brand} onChange={handleChange("brand")} placeholder="مثال: Bosch" />
                                </div>
                                <div className="input-field">
                                    <label>بلد المنشأ</label>
                                    <input value={newProduct.origin_country} onChange={handleChange("origin_country")} placeholder="مثال: ألمانيا" />
                                </div>
                                <div className="input-field">
                                    <label>الضمان</label>
                                    <input value={newProduct.warranty} onChange={handleChange("warranty")} placeholder="مثال: 12 شهر" />
                                </div>
                            </div>

                            <div className="input-field full-width">
                                <label>بادج المنتج (اختياري)</label>
                                <input value={newProduct.badge} onChange={handleChange("badge")} placeholder="مثال: صنايعي بريميوم" />
                                <small style={{ color: '#94a3b8', fontSize: '12px' }}>يظهر كشارة مميزة على المنتج في القائمة</small>
                            </div>

                            {/* ── Section: Images ── */}
                            <p className="form-section-title">الصور</p>

                            {/* Main Image */}
                            <div className="image-upload-zone">
                                <label className="upload-label">
                                    {mainPreview ? (
                                        <img src={mainPreview} alt="preview" className="upload-preview-img" />
                                    ) : (
                                        <>
                                            <FiImage size={24} />
                                            <span>الصورة الرئيسية — اضغط للرفع</span>
                                        </>
                                    )}
                                    <input type="file" hidden accept="image/*" onChange={handleMainImageChange} />
                                </label>
                                {mainPreview && (
                                    <button type="button" className="remove-img-btn" onClick={() => { setMainPreview(null); setNewProduct(p => ({ ...p, main_image: null })); }}>
                                        <FiX /> إزالة الصورة الرئيسية
                                    </button>
                                )}
                            </div>

                            {/* Gallery Images */}
                            <div className="gallery-upload-section">
                                <div className="gallery-header-row">
                                    <span className="gallery-label">صور إضافية للمعرض (حتى 5 صور)</span>
                                    <button
                                        type="button"
                                        className="add-gallery-btn"
                                        onClick={() => galleryInputRef.current?.click()}
                                        disabled={newProduct.gallery_images.length >= 5}
                                    >
                                        <FiPlus /> إضافة صور
                                    </button>
                                    <input
                                        ref={galleryInputRef}
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        multiple
                                        onChange={handleGalleryChange}
                                    />
                                </div>
                                {galleryPreviews.length > 0 && (
                                    <div className="gallery-previews-grid">
                                        {galleryPreviews.map((url, idx) => (
                                            <div key={idx} className="gallery-preview-item">
                                                <img src={url} alt={`gallery-${idx}`} />
                                                <button type="button" className="remove-gallery-img" onClick={() => removeGalleryImage(idx)}>
                                                    <FiX />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="save-btn" disabled={isAdding}>
                                    {isAdding ? "جاري الإضافة..." : "حفظ المنتج"}
                                </button>
                                <button type="button" className="cancel-btn" onClick={resetForm}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ===== PRODUCTS TABLE ===== */}
            <div className="table-wrapper">
                {loading ? (
                    <div className="loading-state" style={{ padding: '2rem', textAlign: 'center' }}>جاري تحميل المنتجات...</div>
                ) : products.length > 0 ? (
                    <table className="products-table">
                        <thead>
                            <tr>
                                <th>المنتج</th>
                                <th>السعر</th>
                                <th>المخزون</th>
                                <th>القسم</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map((prod) => (
                                <tr key={prod.id}>
                                    <td data-label="المنتج">
                                        <div className="product-cell-info">
                                            <img
                                                src={getFullImageUrl(prod.main_image) ?? "https://placehold.co/60x60?text=?"}
                                                alt=""
                                                className="product-img-mini"
                                            />
                                            <div>
                                                <span>{prod.name}</span>
                                                {prod.badge && <span className="table-badge-tag">{prod.badge}</span>}
                                            </div>
                                        </div>
                                    </td>
                                    <td data-label="السعر" className="price-text">
                                        {prod.discount_price ? (
                                            <>
                                                <span>{Number(prod.discount_price).toLocaleString()} ج.م</span>
                                                <small style={{ textDecoration: 'line-through', color: '#94a3b8', marginRight: '6px' }}>
                                                    {Number(prod.price).toLocaleString()}
                                                </small>
                                            </>
                                        ) : (
                                            <span>{Number(prod.price).toLocaleString()} ج.م</span>
                                        )}
                                    </td>
                                    <td data-label="المخزون">
                                        <span className={`stock-badge ${prod.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                                            {prod.stock > 0 ? `متوفر (${prod.stock})` : "نفذ"}
                                        </span>
                                    </td>
                                    <td data-label="القسم">{prod.category?.name || "عام"}</td>
                                    <td data-label="الإجراءات">
                                        <div className="actions-row">
                                            <button className="delete-btn" onClick={() => handleDeleteProduct(prod.id)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-products" style={{ padding: '4rem', textAlign: 'center' }}>
                        <FiPackage size={50} color="#cbd5e1" />
                        <p style={{ marginTop: '1rem', color: '#94a3b8' }}>لا يوجد منتجات معروضة حالياً، ابدأ بإضافة أول منتج!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductsManager;
