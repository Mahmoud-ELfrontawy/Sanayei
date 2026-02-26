import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiTag } from "react-icons/fi";
import { toast } from "react-toastify";
import { getStoreCategories, addStoreCategory, deleteStoreCategory } from "../../../../Api/auth/Company/storeManagement.api";
import { useAuth } from "../../../../hooks/useAuth";
import { FiAlertCircle } from "react-icons/fi";
import "./CategoriesManager.css";

const CategoriesManager: React.FC = () => {
    const { user } = useAuth();
    const isApproved = user?.status === 'approved';
    const isBlocked = user?.status === 'rejected';

    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: "", description: "", icon: "" });

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await getStoreCategories();
            setCategories(res);
        } catch (error) {
            toast.error("حدث خطأ أثناء جلب الأقسام");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isBlocked) {
            toast.error("حسابك محظور، يرجى التواصل مع الدعم الفني لحل المشكلة.");
            return;
        }

        if (!isApproved) {
            toast.info("بانتظار اعتماد الحساب لتتمكن من إضافة أقسام");
            return;
        }

        if (!newCategory.name.trim()) return;

        try {
            setIsAdding(true);
            const res = await addStoreCategory(newCategory);
            if (res.success) {
                toast.success("تم إضافة القسم بنجاح");
                setNewCategory({ name: "", description: "", icon: "" });
                fetchCategories();
            }
        } catch (error) {
            toast.error("فشل إضافة القسم");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (isBlocked) {
            toast.error("حسابك محظور، يرجى التواصل مع الدعم الفني لحل المشكلة.");
            return;
        }

        if (!isApproved) {
            toast.error("لا يمكنك حذف الأقسام إلا بعد اعتماد حسابك.");
            return;
        }

        if (!window.confirm("هل أنت متأكد من حذف هذا القسم؟ قد يؤثر ذلك على المنتجات المرتبطة به.")) return;

        try {
            const res = await deleteStoreCategory(id);
            if (res.success) {
                toast.success("تم حذف القسم بنجاح");
                fetchCategories();
            }
        } catch (error) {
            toast.error("فشل حذف القسم");
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <div className="categories-manager-container">
            <div className="manager-header">
                <h2>إدارة أقسام المتجر</h2>
                <p>قم بتنظيم منتجاتك في أقسام ليسهل على العملاء العثور عليها</p>
            </div>

            {isBlocked && (
                <div className="approval-warning-banner blocked" style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiAlertCircle />
                    <span>حسابك محظور من قبل الإدارة. يرجى التواصل مع الدعم الفني لحل المشكلة.</span>
                </div>
            )}

            {!isApproved && !isBlocked && (
                <div className="approval-warning-banner" style={{ background: '#fffbeb', border: '1px solid #fef3c7', color: '#92400e', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiAlertCircle />
                    <span>حسابك قيد المراجعة. لا يمكنك إضافة أقسام جديدة أو حذف الأقسام الحالية حتى يتم اعتماد الحساب.</span>
                </div>
            )}

            <div className="manager-content">
                {/* Add Category Form */}
                <div className="add-category-card profile-card">
                    <h3>إضافة قسم جديد</h3>
                    <form onSubmit={handleAdd} className="add-cat-form-premium">
                        <div className="input-field">
                            <label>اسم القسم</label>
                            <input
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                placeholder="مثال:أدوات كهربائية ، سباكة..."
                            />
                        </div>
                        <div className="input-field">
                            <label>أيقونة القسم (اختياري)</label>
                            <input
                                value={newCategory.icon}
                                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                                placeholder="مثال: fa-tools"
                            />
                        </div>
                        <div className="input-field">
                            <label>وصف مختصر (اختياري)</label>
                            <textarea
                                value={newCategory.description}
                                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                placeholder="اكتب وصفاً للقسم..."
                            />
                        </div>
                        <button type="submit" className="save-btn" disabled={isAdding}>
                            <FiPlus />
                            {isAdding ? "جاري الإضافة..." : "إضافة القسم"}
                        </button>
                    </form>
                </div>

                {/* Categories List */}
                <div className="categories-list-wrapper">
                    <div className="list-header">
                        <h3>الأقسام الحالية</h3>
                        <span>{categories.length} قسم</span>
                    </div>

                    {loading ? (
                        <div className="loading-state">جاري التحميل...</div>
                    ) : (
                        <div className="categories-grid">
                            {categories.map((cat) => (
                                <div key={cat.id} className="category-item-card">
                                    <div className="cat-info">
                                        <div className="cat-icon">
                                            {cat.icon ? <i className={`fa ${cat.icon}`}></i> : <FiTag />}
                                        </div>
                                        <div>
                                            <h4>{cat.name}</h4>
                                            <p>{cat.description || "لا يوجد وصف"}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="delete-btn"
                                        title="حذف"
                                        onClick={() => handleDelete(cat.id)}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            ))}

                            {categories.length === 0 && (
                                <div className="empty-state">
                                    <p>لا يوجد أقسام مضافة بعد</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoriesManager;
