import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiPackage, FiImage } from "react-icons/fi";
import { toast } from "react-toastify";
import { getStoreProducts, addStoreProduct, getStoreCategories, deleteStoreProduct } from "../../../../Api/auth/Company/storeManagement.api";
import { getFullImageUrl } from "../../../../utils/imageUrl";
import "./ProductsManager.css";

const ProductsManager: React.FC = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    const [newProduct, setNewProduct] = useState({
        name: "",
        price: "",
        discount_price: "",
        category_id: "",
        stock: "0",
        description: "",
        main_image: null as File | null,
        is_active: true
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([
                getStoreProducts(),
                getStoreCategories()
            ]);
            setProducts(prodRes);
            setCategories(catRes);
        } catch (error) {
            toast.error("حدث خطأ أثناء تحميل البيانات");
        } finally {
            setLoading(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price) {
            toast.warning("يرجى ملء الحقول الأساسية");
            return;
        }

        const formData = new FormData();
        formData.append("name", newProduct.name);
        formData.append("price", newProduct.price);
        if (newProduct.discount_price) formData.append("discount_price", newProduct.discount_price);
        formData.append("stock", newProduct.stock);
        formData.append("description", newProduct.description);
        formData.append("is_active", newProduct.is_active ? "1" : "0");
        if (newProduct.category_id) formData.append("category_id", newProduct.category_id);
        if (newProduct.main_image) formData.append("main_image", newProduct.main_image);

        try {
            setIsAdding(true);
            const res = await addStoreProduct(formData);
            if (res.success) {
                toast.success("تم إضافة المنتج بنجاح");
                setShowAddForm(false);
                setNewProduct({
                    name: "",
                    price: "",
                    discount_price: "",
                    category_id: "",
                    stock: "0",
                    description: "",
                    main_image: null,
                    is_active: true
                });
                fetchData();
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.message ||
                (error.response?.data?.errors ? Object.values(error.response.data.errors).flat()[0] : null) ||
                "فشل إضافة المنتج";
            toast.error(errorMsg);
            console.error("Add Product Error:", error.response?.data || error);
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteProduct = async (id: number) => {
        if (!window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;

        try {
            const res = await deleteStoreProduct(id);
            if (res.success) {
                toast.success("تم حذف المنتج بنجاح");
                fetchData();
            }
        } catch (error) {
            toast.error("فشل حذف المنتج");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

            {showAddForm && (
                <div className="add-product-overlay">
                    <div className="add-product-modal profile-card">
                        <h3>بيانات المنتج الجديد</h3>
                        <form onSubmit={handleAddProduct} className="prod-form">
                            <div className="form-row">
                                <div className="input-field">
                                    <label>اسم المنتج</label>
                                    <input
                                        value={newProduct.name}
                                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                        placeholder="اسم المنتج"
                                    />
                                </div>
                                <div className="input-field">
                                    <label>السعر (ج.م)</label>
                                    <input
                                        type="number"
                                        value={newProduct.price}
                                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="input-field">
                                    <label>سعر الخصم (اختياري)</label>
                                    <input
                                        type="number"
                                        value={newProduct.discount_price}
                                        onChange={(e) => setNewProduct({ ...newProduct, discount_price: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="input-field">
                                    <label>القسم</label>
                                    <select
                                        value={newProduct.category_id}
                                        onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                                    >
                                        <option value="">اختر القسم...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="input-field">
                                    <label>الكمية المتوفرة</label>
                                    <input
                                        type="number"
                                        value={newProduct.stock}
                                        onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="input-field full-width">
                                <label>وصف المنتج</label>
                                <textarea
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    placeholder="اكتب تفاصيل المنتج..."
                                />
                            </div>

                            <div className="image-upload-zone">
                                <label className="upload-label">
                                    <FiImage size={24} />
                                    <span>{newProduct.main_image ? newProduct.main_image.name : "اضغط لرفع صورة المنتج"}</span>
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={(e) => setNewProduct({ ...newProduct, main_image: e.target.files?.[0] || null })}
                                    />
                                </label>
                            </div>

                            <div className="status-toggle-container" style={{ margin: '15px 0' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={newProduct.is_active}
                                        onChange={(e) => setNewProduct({ ...newProduct, is_active: e.target.checked })}
                                    />
                                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#475569' }}>تفعيل المنتج (متاح للبيع)</span>
                                </label>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="save-btn" disabled={isAdding}>
                                    {isAdding ? "جاري الإضافة..." : "حفظ المنتج"}
                                </button>
                                <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
                                            <img src={getFullImageUrl(prod.main_image)} alt="" className="product-img-mini" />
                                            <span>{prod.name}</span>
                                        </div>
                                    </td>
                                    <td data-label="السعر" className="price-text">{prod.price} ج.م</td>
                                    <td data-label="المخزون">
                                        <span className={`stock-badge ${prod.stock > 0 ? 'in-stock' : 'out-stock'}`}>
                                            {prod.stock > 0 ? `متوفر (${prod.stock})` : "نفذ"}
                                        </span>
                                    </td>
                                    <td data-label="القسم">{prod.category?.name || "عام"}</td>
                                    <td data-label="الإجراءات">
                                        <div className="actions-row">
                                            <button className="delete-btn" onClick={() => handleDeleteProduct(prod.id)}><FiTrash2 /></button>
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
