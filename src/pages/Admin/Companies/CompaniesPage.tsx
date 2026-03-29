import React, { useState, useEffect } from 'react';
import { adminCompaniesApi, type CompanyData } from '../../../Api/admin/adminCompanies.api';
import { toast } from 'react-toastify';
import {
    FaSearch, FaCheckCircle, FaTimesCircle, FaTrash, FaEye, FaBuilding,
    FaSyncAlt, FaStar, FaBriefcase, FaClock, FaWrench,
    FaExternalLinkAlt, FaTimes, FaMapMarkerAlt, FaEnvelope, FaWhatsapp, FaPhone
} from 'react-icons/fa';
import { FiFileText, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
import { getFullImageUrl } from '../../../utils/imageUrl';
import { authStorage } from '../../../context/auth/auth.storage';
import axios from 'axios';
import './CompaniesPage.css';

const CompaniesPage: React.FC = () => {
    const [companies, setCompanies] = useState<CompanyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Edit Category States
    const [categoriesList, setCategoriesList] = useState<{id: number, name: string}[]>([]);
    const [isEditingCategory, setIsEditingCategory] = useState(false);
    const [editCategoryValue, setEditCategoryValue] = useState("");
    const [isSavingCategory, setIsSavingCategory] = useState(false);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const { data } = await adminCompaniesApi.getAllCompanies(page, search, statusFilter);
            if (data.status === 'success') {
                setCompanies(data.data);
                setTotalPages(data.meta.last_page);
            }
        } catch (error) {
            toast.error("خطأ في تحميل بيانات الشركات");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/admin/categories', {
                headers: {
                    Authorization: `Bearer ${authStorage.getToken()}`,
                    Accept: "application/json",
                }
            });
            const data = res.data?.data || res.data || [];
            setCategoriesList(data);
        } catch (error) {
            console.error("Failed to load categories for admin.");
        }
    };

    useEffect(() => {
        fetchCompanies();
        fetchCategories();
    }, [page, statusFilter]);


    const handleToggleApproval = async (id: number) => {
        try {
            const { data } = await adminCompaniesApi.toggleApproval(id);
            if (data.status === 'success') {
                toast.success(data.message);
                const newStatus = data.data.status;
                setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
                if (selectedCompany && selectedCompany.id === id) {
                    setSelectedCompany({ ...selectedCompany, status: newStatus });
                }
            }
        } catch (error) {
            toast.error("فشل تحديث حالة الشركة");
        }
    };

    const handleToggleBlock = async (id: number, currentStatus: string) => {
        const isCurrentlyBlocked = currentStatus === 'rejected';
        const confirmMsg = isCurrentlyBlocked
            ? "هل أنت متأكد من إلغاء حظر هذه الشركة؟ ستتمكن من الدخول للمنصة مرة أخرى."
            : "هل أنت متأكد من حظر هذه الشركة؟ سيتم منعها من الدخول للمنصة.";

        if (!window.confirm(confirmMsg)) return;

        try {
            const { data } = await adminCompaniesApi.toggleBlockCompany(id);
            if (data.status === 'success') {
                toast.success(isCurrentlyBlocked ? "تم إلغاء الحظر بنجاح" : "تم حظر الشركة بنجاح");
                const newStatus = data.data.status;
                setCompanies(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
                if (selectedCompany && selectedCompany.id === id) {
                    setSelectedCompany({ ...selectedCompany, status: newStatus });
                }
            }
        } catch (error) {
            toast.error(isCurrentlyBlocked ? "فشل إلغاء حظر الشركة" : "فشل حظر الشركة");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("هل أنت متأكد من حذف هذه الشركة؟")) return;
        try {
            const { data } = await adminCompaniesApi.deleteCompany(id);
            if (data.status === 'success') {
                toast.success(data.message);
                setCompanies(prev => prev.filter(c => c.id !== id));
                if (selectedCompany && selectedCompany.id === id) {
                    setIsSidebarOpen(false);
                }
            }
        } catch (error) {
            toast.error("فشل في حذف الشركة");
        }
    };

    const handleSaveCategory = async () => {
        if (!selectedCompany) return;
        if (!editCategoryValue.trim()) {
            toast.warning("يرجى إدخال أو اختيار تصنيف");
            return;
        }
        setIsSavingCategory(true);
        try {
            const { data } = await adminCompaniesApi.updateCategory(selectedCompany.id, editCategoryValue);
            if (data.status === 'success') {
                toast.success(data.message);
                const updatedCategory = data.data.company_category;
                
                // Update specific company in the list
                setCompanies(prev => prev.map(c => c.id === selectedCompany.id ? { ...c, company_category: updatedCategory } : c));
                
                // Update selectedCompany details
                setSelectedCompany({ ...selectedCompany, company_category: updatedCategory });
                setIsEditingCategory(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "فشل تحديث التصنيف");
        } finally {
            setIsSavingCategory(false);
        }
    };

    return (
        <div className="services-container">
            <header className="services-premium-header">
                <div className="header-glass-content">
                    <div className="title-area">
                        <h1>إدارة الشركات</h1>
                        <p>عرض وإدارة الحسابات التجارية المسجلة في المنصة</p>
                    </div>
                </div>
            </header>

            <div className="services-controls">
                <div className="search-wrapper">
                    <FaSearch className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="البحث باسم الشركة أو البريد..."
                        className="search-input"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && fetchCompanies()}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="admin-select companies-status-filter"
                >
                    <option value="">كل الحالات</option>
                    <option value="approved">معتمدة</option>
                    <option value="pending">قيد الانتظار</option>
                    <option value="rejected">محظورة</option>
                </select>

                <button className="action-btn" onClick={fetchCompanies} title="تحديث">
                    <FaSyncAlt size={18} />
                </button>
            </div>

            <div className="services-table-wrapper">
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>جاري التحميل...</div>
                ) : (
                    <table className="services-table">
                        <thead>
                            <tr>
                                <th>الشركة</th>
                                <th>البريد الإلكتروني</th>
                                <th>تاريخ التسجيل</th>
                                <th>الحالة</th>
                                <th>الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>لا توجد شركات حالياً</td>
                                </tr>
                            ) : (
                                companies.map(company => (
                                    <tr key={company.id}>
                                        <td>
                                            <div className="company-info-cell">
                                                <div className="company-logo-wrapper">
                                                    {company.company_logo ? (
                                                        <img src={getFullImageUrl(company.company_logo)} alt={company.company_name} />
                                                    ) : (
                                                        <FaBuilding size={20} />
                                                    )}
                                                </div>
                                                <div className="company-info-text">
                                                    <span className="company-primary-name">{company.company_name}</span>
                                                    <span className="company-category-tag">{company.company_category || "بدون تصنيف"}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="company-contact-cell">
                                                <span>{company.company_email}</span>
                                                <span className="company-phone-sub">{company.company_phone_number || "بدون هاتف"}</span>
                                            </div>
                                        </td>
                                        <td>{new Date(company.created_at).toLocaleDateString('ar-EG')}</td>
                                        <td>
                                            <span className={`admin-badge ${company.status === 'approved' ? 'success' : company.status === 'rejected' ? 'danger' : 'warning'}`}>
                                                {company.status === 'approved' ? 'معتمدة' : company.status === 'rejected' ? 'محظورة' : 'قيد الانتظار'}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="action-btn info"
                                                title="عرض التفاصيل"
                                                onClick={() => {
                                                    setSelectedCompany(company);
                                                    setIsSidebarOpen(true);
                                                }}
                                            >
                                                <FaEye size={18} />
                                            </button>
                                            <button className="action-btn delete" title="حذف" onClick={() => handleDelete(company.id)}>
                                                <FaTrash size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}

                {totalPages > 1 && (
                    <div className="pagination-container">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(page - 1)}
                            className="pg-btn"
                        >السابق</button>
                        <span className="pg-info">صفحة {page} من {totalPages}</span>
                        <button
                            disabled={page === totalPages}
                            onClick={() => setPage(page + 1)}
                            className="pg-btn"
                        >التالي</button>
                    </div>
                )}
            </div>

            {/* Company Detail Sidebar */}
            {isSidebarOpen && selectedCompany ? (
                <>
                    <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
                    <div className="artisan-sidebar">
                        <div className="sidebar-header">
                            <button className="close-btn" onClick={() => setIsSidebarOpen(false)}><FaTimes size={24} /></button>
                            <h3>تفاصيل الشركة</h3>
                        </div>

                        <div className="sidebar-content">
                            <div className="profile-hero">
                                <div className="large-avatar">
                                    {selectedCompany.company_logo ? (
                                        <img src={getFullImageUrl(selectedCompany.company_logo)} alt={selectedCompany.company_name} />
                                    ) : (
                                        <FaBuilding size={40} />
                                    )}
                                </div>
                                <h4>{selectedCompany.company_name}</h4>
                                <span className={`status-pill ${selectedCompany.status === 'approved' ? 'approved' : selectedCompany.status === 'rejected' ? 'rejected' : 'pending'}`}>
                                    {selectedCompany.status === 'approved' ? 'حساب معتمد' : selectedCompany.status === 'rejected' ? 'حساب محظور' : 'بانتظار التفعيل'}
                                </span>
                            </div>

                            <div className="metrics-grid">
                                <div className="metric-item">
                                    <FaStar size={20} color="var(--amber-500)" />
                                    <span className="m-value">{(Math.random() * 2 + 3).toFixed(1)}</span>
                                    <span className="m-label">تقييم المتجر</span>
                                </div>
                                <div className="metric-item">
                                    <FaBriefcase size={20} color="#3b82f6" />
                                    <span className="m-value">{Math.floor(Math.random() * 50) + 10}</span>
                                    <span className="m-label">منتج متاح</span>
                                </div>
                                <div className="metric-item">
                                    <FaClock size={20} color="#10b981" />
                                    <span className="m-value">
                                        {Math.floor((new Date().getTime() - new Date(selectedCompany.created_at).getTime()) / (1000 * 60 * 60 * 24))}ي
                                    </span>
                                    <span className="m-label">منذ الانضمام</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4 className="s-title">المعلومات الأساسية</h4>
                                <div className="info-modern-list">
                                    <div className="info-modern-item">
                                        <FaEnvelope size={18} />
                                        <div className="content">
                                            <label>البريد الإلكتروني</label>
                                            <span>{selectedCompany.company_email}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <FaPhone size={18} />
                                        <div className="content">
                                            <label>رقم الهاتف</label>
                                            <span>{selectedCompany.company_phone_number || 'غير متوفر'}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <FaWhatsapp size={18} />
                                        <div className="content">
                                            <label>رقم الواتساب</label>
                                            <span>{selectedCompany.company_whatsapp_number || 'غير متوفر'}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <FaWrench size={18} />
                                        <div className="content" style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <label>التصنيف المقترح من المتجر</label>
                                                {!isEditingCategory && (
                                                    <button 
                                                        onClick={() => {
                                                            setEditCategoryValue(selectedCompany.company_category || '');
                                                            setIsEditingCategory(true);
                                                        }}
                                                        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}
                                                    >
                                                        <FiEdit2 size={12} /> تعديل
                                                    </button>
                                                )}
                                            </div>
                                            {isEditingCategory ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '5px' }}>
                                                    <input 
                                                        type="text" 
                                                        list="categories-datalist"
                                                        value={editCategoryValue} 
                                                        onChange={(e) => setEditCategoryValue(e.target.value)}
                                                        style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '6px', width: '100%' }}
                                                        placeholder="اختر أو اكتب تصنيفاً..."
                                                    />
                                                    <datalist id="categories-datalist">
                                                        {categoriesList.map(cat => (
                                                            <option key={cat.id} value={cat.name} />
                                                        ))}
                                                    </datalist>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button 
                                                            onClick={handleSaveCategory} 
                                                            disabled={isSavingCategory}
                                                            style={{ flex: 1, padding: '6px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            {isSavingCategory ? 'جاري الحفظ...' : <><FiCheck /> حفظ</>}
                                                        </button>
                                                        <button 
                                                            onClick={() => setIsEditingCategory(false)} 
                                                            disabled={isSavingCategory}
                                                            style={{ flex: 1, padding: '6px', background: '#f3f4f6', color: '#374151', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px' }}
                                                        >
                                                            <FiX /> إلغاء
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span>{selectedCompany.company_category || 'غير مصنف'}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <FaMapMarkerAlt size={18} />
                                        <div className="content">
                                            <label>العنوان والمدينة</label>
                                            <span>{selectedCompany.company_city} - {selectedCompany.company_specific_address || 'بدون تفاصيل'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4 className="s-title">نبذة تعريفية</h4>
                                <p className="artisan-bio">{selectedCompany.company_simple_hint || 'لا يوجد وصف متاح حالياً للمتجر.'}</p>
                            </div>

                            <div className="detail-section">
                                <h4 className="s-title">وثائق التحقق</h4>
                                <div className="info-modern-list">
                                    <div className="info-modern-item">
                                        <FiFileText size={18} />
                                        <div className="content">
                                            <label>البطاقة الضريبية</label>
                                            {selectedCompany.tax_card ? (
                                                <a href={getFullImageUrl(selectedCompany.tax_card)} target="_blank" rel="noreferrer" className="doc-link-sidebar">
                                                    عرض البطاقة <FaExternalLinkAlt size={12} />
                                                </a>
                                            ) : <span className="no-doc-pill">غير متوفرة</span>}
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <FiFileText size={18} />
                                        <div className="content">
                                            <label>السجل التجاري</label>
                                            {selectedCompany.commercial_register ? (
                                                <a href={getFullImageUrl(selectedCompany.commercial_register)} target="_blank" rel="noreferrer" className="doc-link-sidebar">
                                                    عرض السجل <FaExternalLinkAlt size={12} />
                                                </a>
                                            ) : <span className="no-doc-pill">غير متوفر</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="sidebar-actions-sticky">
                                <div className="approval-actions">
                                    <button
                                        className={`full-approve-btn ${selectedCompany.status === 'approved' ? 'reject-variant' : ''}`}
                                        onClick={() => handleToggleApproval(selectedCompany.id)}
                                    >
                                        {selectedCompany.status === 'approved' ? (
                                            <><FaTimesCircle size={20} /> إلغاء الاعتماد</>
                                        ) : (
                                            <><FaCheckCircle size={20} /> اعتماد الشركة فوراً</>
                                        )}
                                    </button>
                                    <button
                                        className={`full-reject-btn ${selectedCompany.status === 'rejected' ? 'unblock-variant' : 'danger-variant'}`}
                                        onClick={() => handleToggleBlock(selectedCompany.id, selectedCompany.status)}
                                    >
                                        {selectedCompany.status === 'rejected' ? (
                                            <><FaCheckCircle size={20} /> إلغاء حظر الشركة</>
                                        ) : (
                                            <><FaTrash size={20} /> حظر الشركة</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default CompaniesPage;

