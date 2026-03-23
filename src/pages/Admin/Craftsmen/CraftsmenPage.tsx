import React, { useState, useEffect } from 'react';
import {
    FaSearch,
    FaEdit,
    FaEye,
    FaCheckCircle,
    FaStar,
    FaWrench,
    FaDollarSign,
    FaFilter,
    FaTimes,
    FaIdCard,
    FaPhone,
    FaMapMarkerAlt,
    FaEnvelope,
    FaCalendarAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './CraftsmenPage.css';
import { adminCraftsmenApi } from '../../../Api/admin/adminCraftsmen.api';
import { getAvatarUrl } from '../../../utils/imageUrl';

interface CraftsmanData {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    specialty: string;
    sub_specialties?: string[];
    governorate?: { id: number; name: string };
    service?: { id: number; name: string };
    status: 'pending' | 'approved' | 'rejected' | 'blocked';
    rating: number;
    reviews_count: number;
    completed_jobs: number;
    experience_years: number;
    price_range: string;
    joined_date: string;
    is_verified: boolean;
    portfolio_url?: string;
    bio?: string;
    completion_rate: number;
    front_identity_photo?: string;
    back_identity_photo?: string;
    is_active: boolean;
    rejection_reason?: string;
}

const CraftsmenPage: React.FC = () => {
    const [craftsmen, setCraftsmen] = useState<CraftsmanData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
    const [selectedCraftsman, setSelectedCraftsman] = useState<CraftsmanData | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Advanced Status State
    const [editStatus, setEditStatus] = useState<'pending' | 'approved' | 'rejected' | 'blocked'>('pending');
    const [editIsActive, setEditIsActive] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [isSavingStatus, setIsSavingStatus] = useState(false);

    const fetchCraftsmen = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                search: searchTerm,
                status: selectedStatus === 'all' ? undefined : selectedStatus
            };
            const response = await adminCraftsmenApi.getAllCraftsmen(params);

            const paginationObj = response.data.data || response.data;
            const allCraftsmen = paginationObj?.data || [];

            const mapped: CraftsmanData[] = allCraftsmen.map((u: any) => ({
                id: (u.id || '').toString(),
                name: u.name || 'بدون اسم',
                email: u.email || '',
                phone: u.phone || '',
                avatar: u.avatar || u.profile_image_url || u.profile_photo,
                specialty: u.service?.name || u.craft_type || 'غير محدد',
                governorate: u.governorate,
                service: u.service,
                status: u.status || 'pending',
                rating: parseFloat(u.average_rating || u.rating || 0),
                reviews_count: parseInt(u.reviews_count || 0),
                completed_jobs: parseInt(u.completed_requests || u.completed_jobs || 0),
                experience_years: parseInt(u.experience_years || 0),
                price_range: u.price_range || 'غير محدد',
                joined_date: u.created_at || u.joined_date,
                is_verified: u.status === 'approved',
                bio: u.bio || u.description,
                completion_rate: parseInt(u.completion_rate || 0),
                front_identity_photo: u.front_identity_photo,
                back_identity_photo: u.back_identity_photo,
                is_active: u.is_active === 1 || u.is_active === true,
                rejection_reason: u.rejection_reason
            }));

            setCraftsmen(mapped);
            setTotalPages(paginationObj?.last_page || 1);
            setError(null);
        } catch (err: any) {
            setError("فشل تحميل البيانات من السيرفر");
            toast.error("فشل تحميل بيانات الصنايعية");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCraftsmen();
    }, [currentPage, searchTerm, selectedStatus]);

    const handleSaveAdvancedStatus = async () => {
        if (!selectedCraftsman) return;
        setIsSavingStatus(true);
        try {
            // 1. Handle Status Changes via specific endpoints provided in backend
            if (editStatus === 'approved' && selectedCraftsman.status !== 'approved') {
                await adminCraftsmenApi.verifyCraftsman(selectedCraftsman.id);
            } else if (editStatus === 'rejected' && selectedCraftsman.status !== 'rejected') {
                await adminCraftsmenApi.rejectCraftsman(selectedCraftsman.id, rejectionReason || undefined);
            } else if (editStatus === 'blocked' && selectedCraftsman.status !== 'blocked') {
                await adminCraftsmenApi.toggleCraftsmanBlock(selectedCraftsman.id);
            }

            // 2. Handle Activity Toggle (is_active) independently
            // Since there's no generic update, we use toggle-block for activity changes 
            // if the status hasn't already been handled above.
            if (editIsActive !== selectedCraftsman.is_active && editStatus === selectedCraftsman.status) {
                await adminCraftsmenApi.toggleCraftsmanBlock(selectedCraftsman.id);
            }

            toast.success("تم تحديث بيانات الحساب بنجاح");
            fetchCraftsmen();
            setIsSidebarOpen(false);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "فشل تحديث بيانات الحساب");
        } finally {
            setIsSavingStatus(false);
        }
    };

    const openSidebar = (craftsman: CraftsmanData) => {
        setSelectedCraftsman(craftsman);
        setEditStatus(craftsman.status);
        setEditIsActive(craftsman.is_active);
        setRejectionReason(craftsman.rejection_reason || '');
        setIsSidebarOpen(true);
    };

    const filteredCraftsmen = craftsmen.filter(c => {
        const matchesSearch =
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm);
        const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
        const matchesSpecialty = selectedSpecialty === 'all' || c.specialty === selectedSpecialty;
        return matchesSearch && matchesStatus && matchesSpecialty;
    });

    if (loading && craftsmen.length === 0) {
        return <div className="loading-state">جاري تحميل بيانات الصنايعية...</div>;
    }

    if (error && craftsmen.length === 0) {
        return (
            <div className="error-state">
                <p>{error}</p>
                <button onClick={fetchCraftsmen}>إعادة المحاولة</button>
            </div>
        );
    }

    return (
        <div className="craftsmen-container">
            <header className="craftsmen-header">
                <div className="header-info">
                    <h1>إدارة الكوادر الفنية (الصنايعية)</h1>
                    <p>مراجعة الطلبات، إدارة التخصصات، ومراقبة جودة الخدمة</p>
                </div>
                <div className="header-stats">
                    <div className="stat-card pending">
                        <span className="label">بانتظار المراجعة</span>
                        <span className="value">{craftsmen.filter(c => c.status === 'pending').length}</span>
                    </div>
                </div>
            </header>

            <div className="controls-section">
                <div className="search-box">
                    <FaSearch size={20} />
                    <input
                        type="text"
                        placeholder="بحث بالاسم، الإيميل، أو الهاتف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters-group">
                    <div className="filter-item">
                        <FaFilter size={18} />
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                            <option value="all">كل الحالات</option>
                            <option value="pending">بانتظار المراجعة</option>
                            <option value="approved">نشط</option>
                            <option value="rejected">مرفوض</option>
                            <option value="blocked">محظور</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <FaWrench size={18} />
                        <select value={selectedSpecialty} onChange={(e) => setSelectedSpecialty(e.target.value)}>
                            <option value="all">كل التخصصات</option>
                            <option value="سباكة">سباكة</option>
                            <option value="كهرباء">كهرباء</option>
                            <option value="تكييف وتبريد">تكييف وتبريد</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="craftsmen-table-wrapper">
                <table className="craftsmen-table">
                    <thead>
                        <tr>
                            <th>الصنايعي / الفني</th>
                            <th>التخصص</th>
                            <th>الموقع</th>
                            <th>التقييم</th>
                            <th>الحالة</th>
                            <th>إجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCraftsmen.map(craftsman => (
                            <tr key={craftsman.id} className={craftsman.status === 'pending' ? 'pending-row' : ''}>
                                <td>
                                    <div className="artisan-info">
                                        <div className="artisan-avatar-wrapper">
                                            <img
                                                src={getAvatarUrl(craftsman.avatar, craftsman.name)}
                                                alt={craftsman.name}
                                                className="artisan-avatar-img"
                                                onError={(e) => {
                                                    (e.currentTarget as HTMLImageElement).src = getAvatarUrl(null, craftsman.name);
                                                }}
                                            />
                                        </div>
                                        <div className="artisan-details">
                                            <span className="name">{craftsman.name}</span>
                                            <div className="sub-details">
                                                <span className="id">ID: {craftsman.id}</span>
                                                <span className={`activity-dot ${craftsman.is_active ? 'active' : 'inactive'}`} title={craftsman.is_active ? 'نشط حالياً' : 'غير مفعل'}></span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className="specialty-badge">
                                        <FaWrench size={14} />
                                        {craftsman.specialty}
                                    </span>
                                </td>
                                <td>{craftsman.governorate?.name || 'غير محدد'}</td>
                                <td>
                                    <div className="rating-mini">
                                        <FaStar size={14} fill="#f59e0b" color="#f59e0b" />
                                        <span>{craftsman.rating || 'جديد'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${craftsman.status}`}>
                                        {craftsman.status === 'approved' ? 'نشط' :
                                            craftsman.status === 'rejected' ? 'مرفوض' :
                                                craftsman.status === 'blocked' ? 'محظور' : 'قيد المراجعة'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button className="view-btn" onClick={() => openSidebar(craftsman)} title="عرض التحكم المتقدم">
                                        <FaEdit size={18} />
                                    </button>
                                    <button className="view-btn secondary" onClick={() => window.open(`/craftsman/${craftsman.id}`, '_blank')} title="معاينة الملف">
                                        <FaEye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="pagination-container">
                    <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="pg-btn">السابق</button>
                    <span className="pg-info">صفحة {currentPage} من {totalPages}</span>
                    <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="pg-btn">التالي</button>
                </div>
            )}

            {isSidebarOpen && selectedCraftsman ? (
                <>
                    <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
                    <div className="artisan-sidebar">
                        <div className="sidebar-header">
                            <button className="close-btn" onClick={() => setIsSidebarOpen(false)}><FaTimes size={24} /></button>
                            <h3>إدارة حساب الصنايعي</h3>
                        </div>

                        <div className="sidebar-content">
                            <div className="profile-hero">
                                <div className="large-avatar-wrapper">
                                    <img
                                        src={getAvatarUrl(selectedCraftsman.avatar, selectedCraftsman.name)}
                                        alt={selectedCraftsman.name}
                                        className="large-avatar-img"
                                    />
                                </div>
                                <h4>{selectedCraftsman.name}</h4>
                                <p className="hero-email-text">
                                    <FaEnvelope size={14} style={{ marginLeft: '6px', opacity: 0.7 }} />
                                    {selectedCraftsman.email || <span className="text-muted">البريد الإلكتروني غير متوفر</span>}
                                </p>
                                <span className={`status-pill ${selectedCraftsman.status}`}>
                                    {selectedCraftsman.status === 'approved' ? 'حساب معتمد' :
                                        selectedCraftsman.status === 'rejected' ? 'طلب مرفوض' :
                                            selectedCraftsman.status === 'blocked' ? 'محظور إدارياً' : 'قيد المراجعة'}
                                </span>
                            </div>

                            {/* Status and Activity Controls */}
                            <div className="admin-control-card">
                                <h4 className="s-title">التحكم في حالة الحساب</h4>

                                <div className="control-group">
                                    <label>حالة الاعتماد</label>
                                    <select
                                        className="admin-select"
                                        value={editStatus}
                                        onChange={(e) => setEditStatus(e.target.value as any)}
                                    >
                                        <option value="pending">قيد المراجعة</option>
                                        <option value="approved">معتمد (Approve)</option>
                                        <option value="rejected">مرفوض (Reject)</option>
                                        <option value="blocked">محظور (Block)</option>
                                    </select>
                                </div>

                                {editStatus === 'rejected' && (
                                    <div className="control-group">
                                        <label>سبب الرفض (اختياري)</label>
                                        <textarea
                                            className="admin-textarea"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            placeholder="اكتب سبب الرفض هنا ليظهر للصنايعي..."
                                        />
                                    </div>
                                )}

                                <div className="control-group toggle-group">
                                    <div className="toggle-info">
                                        <label>حالة النشاط (الظهور)</label>
                                        <p>تحكم في ظهور الصنايعي في نتائج البحث والطلبات</p>
                                    </div>
                                    <label className="switch">
                                        <input
                                            type="checkbox"
                                            checked={editStatus === 'approved' ? true : editIsActive}
                                            disabled={editStatus === 'approved'}
                                            onChange={(e) => setEditIsActive(e.target.checked)}
                                        />
                                        <span className="slider round"></span>
                                    </label>
                                </div>

                                <button
                                    className="save-status-btn"
                                    onClick={handleSaveAdvancedStatus}
                                    disabled={isSavingStatus}
                                >
                                    {isSavingStatus ? 'جاري الحفظ...' : 'حفظ التغييرات الإدارية'}
                                </button>
                            </div>

                            <div className="metrics-grid">
                                <div className="metric-item">
                                    <FaStar size={20} color="#f59e0b" />
                                    <span className="m-value">{selectedCraftsman.rating}</span>
                                    <span className="m-label">التقييم</span>
                                </div>
                                <div className="metric-item">
                                    <FaCheckCircle size={20} color="#10b981" />
                                    <span className="m-value">{selectedCraftsman.completed_jobs}</span>
                                    <span className="m-label">مكتملة</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4 className="s-title">أوراق الهوية</h4>
                                <div className="identity-photos-grid">
                                    <div className="id-photo-item">
                                        <label>وجه البطاقة</label>
                                        <div className="id-image-container">
                                            {selectedCraftsman.front_identity_photo ? (
                                                <img src={getAvatarUrl(selectedCraftsman.front_identity_photo)} alt="ID Front" className="identity-verification-img" onClick={() => window.open(getAvatarUrl(selectedCraftsman.front_identity_photo), '_blank')} />
                                            ) : <div className="no-photo"><FaIdCard size={30} /></div>}
                                        </div>
                                    </div>
                                    <div className="id-photo-item">
                                        <label>ظهر البطاقة</label>
                                        <div className="id-image-container">
                                            {selectedCraftsman.back_identity_photo ? (
                                                <img src={getAvatarUrl(selectedCraftsman.back_identity_photo)} alt="ID Back" className="identity-verification-img" onClick={() => window.open(getAvatarUrl(selectedCraftsman.back_identity_photo), '_blank')} />
                                            ) : <div className="no-photo"><FaIdCard size={30} /></div>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4 className="s-title">المعلومات الأساسية</h4>
                                <div className="info-modern-list">
                                    <div className="info-modern-item">
                                        <FaWrench size={18} />
                                        <div className="content">
                                            <label>التخصص</label>
                                            <span>{selectedCraftsman.specialty}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <FaPhone size={18} />
                                        <div className="content">
                                            <label>رقم الهاتف</label>
                                            <a href={`tel:${selectedCraftsman.phone}`} dir="ltr">{selectedCraftsman.phone}</a>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <FaMapMarkerAlt size={18} />
                                        <div className="content">
                                            <label>المحافظة</label>
                                            <span>{selectedCraftsman.governorate?.name || 'غير محدد'}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <FaDollarSign size={18} />
                                        <div className="content">
                                            <label>فئة السعر</label>
                                            <span>{selectedCraftsman.price_range}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <FaCalendarAlt size={18} />
                                        <div className="content">
                                            <label>تاريخ الانضمام</label>
                                            <span dir="ltr">{new Date(selectedCraftsman.joined_date).toLocaleDateString('ar-EG')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default CraftsmenPage;