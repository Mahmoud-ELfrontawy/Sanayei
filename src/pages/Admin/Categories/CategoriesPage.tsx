import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaPlus, FaEdit, FaTrash, FaTags, FaSearch, FaSyncAlt } from "react-icons/fa";
import axios from "axios";
import { authStorage } from "../../../context/auth/auth.storage";
import "./CategoriesPage.css";

const BASE_URL = "/api";
const adminHeaders = () => ({
    Authorization: `Bearer ${authStorage.getToken()}`,
    Accept: "application/json",
    "Content-Type": "application/json",
});

interface Category {
    id: number;
    name: string;
    description?: string;
    icon?: string;
    products_count?: number;
}

const categoriesApi = {
    getAll: () => axios.get(`${BASE_URL}/admin/categories`, { headers: adminHeaders() }),
    create: (data: Partial<Category>) => axios.post(`${BASE_URL}/admin/categories`, { ...data, company_id: null }, { headers: adminHeaders() }),
    update: (id: number, data: Partial<Category>) => axios.put(`${BASE_URL}/admin/categories/${id}`, { ...data, company_id: null }, { headers: adminHeaders() }),
    delete: (id: number) => axios.delete(`${BASE_URL}/admin/categories/${id}`, { headers: adminHeaders() }),
};

const AdminCategoriesPage: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [filtered, setFiltered] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: "", description: "", icon: "" });
    const [saving, setSaving] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await categoriesApi.getAll();
            const data = res.data?.data || res.data || [];
            setCategories(data);
            setFiltered(data);
        } catch {
            toast.error("فشل تحميل التصنيفات");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    useEffect(() => {
        const q = search.trim().toLowerCase();
        setFiltered(q ? categories.filter(c => c.name.toLowerCase().includes(q)) : categories);
    }, [search, categories]);

    const openAdd = () => {
        setEditing(null);
        setFormData({ name: "", description: "", icon: "" });
        setShowModal(true);
    };

    const openEdit = (c: Category) => {
        setEditing(c);
        setFormData({ name: c.name, description: c.description || "", icon: c.icon || "" });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!formData.name.trim()) { toast.warning("اسم التصنيف مطلوب"); return; }
        setSaving(true);
        try {
            if (editing) {
                await categoriesApi.update(editing.id, formData);
                toast.success("تم تحديث التصنيف ✅");
            } else {
                await categoriesApi.create(formData);
                toast.success("تم إضافة التصنيف ✅");
            }
            setShowModal(false);
            fetchCategories();
        } catch (error: any) {
            console.error("Save error:", error);
            const msg = error.response?.data?.message || "فشل حفظ التصنيف";
            const errs = error.response?.data?.errors;

            if (errs) {
                // Show specific validation error
                Object.values(errs).flat().forEach((m: any) => toast.error(m));
            } else {
                toast.error(msg);
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("هل تريد حذف هذا التصنيف؟")) return;
        try {
            await categoriesApi.delete(id);
            toast.success("تم الحذف");
            fetchCategories();
        } catch {
            toast.error("فشل الحذف — ربما هناك منتجات مرتبطة");
        }
    };

    return (
        <div className="cat-page" dir="rtl">
            {/* Header */}
            <header className="cat-header">
                <div className="cat-header-content">
                    <div>
                        <h1><FaTags style={{ marginLeft: '10px' }} />إدارة التصنيفات</h1>
                        <p>إدارة تصنيفات المنتجات في متجر المنصة</p>
                    </div>
                    <button className="cat-add-btn" onClick={openAdd}>
                        <FaPlus /> إضافة تصنيف
                    </button>
                </div>
            </header>

            {/* Controls */}
            <div className="cat-controls">
                <div className="cat-search">
                    <FaSearch className="cat-search-icon" />
                    <input
                        type="text"
                        placeholder="ابحث عن تصنيف..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <button className="cat-refresh-btn" onClick={fetchCategories} title="تحديث">
                    <FaSyncAlt />
                </button>
            </div>

            {/* Table */}
            <div className="cat-table-wrapper">
                {loading ? (
                    <div className="cat-state">⏳ جاري التحميل...</div>
                ) : filtered.length === 0 ? (
                    <div className="cat-state">📭 لا توجد تصنيفات</div>
                ) : (
                    <table className="cat-table">
                        <thead>
                            <tr>
                                <th>الأيقونة</th>
                                <th>اسم التصنيف</th>
                                <th>الوصف</th>
                                <th>عدد المنتجات</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((c) => (
                                <tr key={c.id}>
                                    <td style={{ fontSize: '1.5rem' }}>{c.icon || '📦'}</td>
                                    <td className="cat-name">
                                        {c.name}
                                    </td>
                                    <td className="cat-desc">{c.description || "—"}</td>
                                    <td>
                                        <span className="cat-count">{c.products_count ?? 0} منتج</span>
                                    </td>
                                    <td>
                                        <div className="cat-actions">
                                            <button className="cat-btn-edit" onClick={() => openEdit(c)}><FaEdit /></button>
                                            <button className="cat-btn-del" onClick={() => handleDelete(c.id)}><FaTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="cat-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="cat-modal" onClick={e => e.stopPropagation()}>
                        <h2>{editing ? "تعديل التصنيف" : "إضافة تصنيف جديد"}</h2>
                        <div className="cat-field">
                            <label>اسم التصنيف *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                placeholder="مثال: أدوات كهربائية"
                            />
                        </div>
                        <div className="cat-field">
                            <label>الأيقونة (إيموجي أو كود)</label>
                            <input
                                type="text"
                                value={formData.icon}
                                onChange={e => setFormData(p => ({ ...p, icon: e.target.value }))}
                                placeholder="مثال: 🛠️"
                            />
                        </div>
                        <div className="cat-field">
                            <label>الوصف</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                placeholder="وصف مختصر"
                                rows={3}
                            />
                        </div>
                        <div className="cat-modal-actions">
                            <button className="cat-btn-cancel" onClick={() => setShowModal(false)}>إلغاء</button>
                            <button className="cat-btn-save" onClick={handleSave} disabled={saving}>
                                {saving ? "جاري الحفظ..." : "حفظ"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategoriesPage;
