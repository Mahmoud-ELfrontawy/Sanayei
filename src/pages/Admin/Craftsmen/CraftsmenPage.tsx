import React, { useState, useEffect } from 'react';
import {
    FaSearch,
    FaEdit,
    FaEye,
    FaCheckCircle,
    FaTimesCircle,
    FaStar,
    FaClock,
    FaWrench,
    FaBriefcase,
    FaDollarSign,
    FaExternalLinkAlt,
    FaFilter,
    FaTimes
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import './CraftsmenPage.css';
import { adminCraftsmenApi } from '../../../Api/admin/adminCraftsmen.api';

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
    status: 'pending' | 'approved' | 'rejected' | 'blocked' | 'active';
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

    const fetchCraftsmen = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                search: searchTerm,
                status: selectedStatus === 'all' ? undefined : selectedStatus
            };
            const response = await adminCraftsmenApi.getAllCraftsmen(params);

            // Handle both wrapped {data: {...}} and direct {...} response formats
            const paginationObj = response.data.data || response.data;
            const allCraftsmen = paginationObj?.data || [];

            // Map to the interface
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
                completion_rate: parseInt(u.completion_rate || 0)
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

    const handleUpdateStatus = async (id: string, action: 'approve' | 'reject' | 'block') => {
        const actionText = action === 'approve' ? 'تفعيل' : (action === 'reject' ? 'رفض' : 'حظر');

        try {
            switch (action) {
                case 'approve':
                    await adminCraftsmenApi.verifyCraftsman(id);
                    toast.success("تم تنشيط الحساب بنجاح");
                    break;
                case 'reject':
                    await adminCraftsmenApi.rejectCraftsman(id);
                    toast.success("تم رفض الطلب");
                    break;
                case 'block':
                    await adminCraftsmenApi.toggleCraftsmanBlock(id);
                    toast.success("تم تحديث حالة الحظر");
                    break;
            }
            fetchCraftsmen(); // Refresh data to get updated states from backend

        } catch (err) {
            toast.error(`فشل ${actionText} الحساب`);
        }
    };

    const openSidebar = (craftsman: CraftsmanData) => {
        setSelectedCraftsman(craftsman);
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
                                        <div className="artisan-avatar">
                                            {craftsman.name[0]}
                                        </div>
                                        <div className="artisan-details">
                                            <span className="name">{craftsman.name}</span>
                                            <span className="id">ID: {craftsman.id}</span>
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
                                        {(craftsman.status === 'approved' || craftsman.status === 'active') ? 'نشط' :
                                            craftsman.status === 'rejected' ? 'مرفوض' :
                                                craftsman.status === 'blocked' ? 'محظور' : 'قيد المراجعة'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button className="view-btn" onClick={() => openSidebar(craftsman)} title="عرض التفاصيل">
                                        <FaEye size={18} />
                                    </button>
                                    {craftsman.status === 'pending' && (
                                        <>
                                            <button className="approve-btn" onClick={() => handleUpdateStatus(craftsman.id, 'approve')} title="تنشيط">
                                                <FaCheckCircle size={18} />
                                            </button>
                                            <button className="reject-btn" onClick={() => handleUpdateStatus(craftsman.id, 'reject')} title="رفض">
                                                <FaTimesCircle size={18} />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="pagination-container">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        className="pg-btn"
                    >
                        السابق
                    </button>
                    <span className="pg-info">صفحة {currentPage} من {totalPages}</span>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        className="pg-btn"
                    >
                        التالي
                    </button>
                </div>
            )}

            {/* Artisan Detail Sidebar */}
            {isSidebarOpen && selectedCraftsman ? (
                <>
                    <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
                    <div className="artisan-sidebar">
                        <div className="sidebar-header">
                            <button className="close-btn" onClick={() => setIsSidebarOpen(false)}><FaTimes size={24} /></button>
                            <h3>تفاصيل الملف المهني</h3>
                        </div>

                        <div className="sidebar-content">
                            <div className="profile-hero">
                                <div className="large-avatar">{selectedCraftsman.name[0]}</div>
                                <h4>{selectedCraftsman.name}</h4>
                                <span className={`status-pill ${selectedCraftsman.status}`}>
                                    {(selectedCraftsman.status === 'approved' || selectedCraftsman.status === 'active') ? 'حساب نشط' :
                                        selectedCraftsman.status === 'rejected' ? 'حساب مرفوض' :
                                            selectedCraftsman.status === 'blocked' ? 'حساب محظور' : 'بانتظار التفعيل'}
                                </span>
                            </div>

                            <div className="metrics-grid">
                                <div className="metric-item">
                                    <FaStar size={20} color="#f59e0b" />
                                    <span className="m-value">{selectedCraftsman.rating}</span>
                                    <span className="m-label">تقييم عام</span>
                                </div>
                                <div className="metric-item">
                                    <FaBriefcase size={20} color="#3b82f6" />
                                    <span className="m-value">{selectedCraftsman.completed_jobs}</span>
                                    <span className="m-label">مهمة مكتملة</span>
                                </div>
                                <div className="metric-item">
                                    <FaClock size={20} color="#10b981" />
                                    <span className="m-value">{selectedCraftsman.experience_years}س</span>
                                    <span className="m-label">خبرة</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4 className="s-title">المعلومات المهنية</h4>
                                <div className="info-modern-list">
                                    <div className="info-modern-item">
                                        <FaWrench size={18} />
                                        <div className="content">
                                            <label>التخصص الأساسي</label>
                                            <span>{selectedCraftsman.specialty}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <FaDollarSign size={18} />
                                        <div className="content">
                                            <label>فئة الأسعار</label>
                                            <span>{selectedCraftsman.price_range}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <FaCheckCircle size={18} />
                                        <div className="content">
                                            <label>نسبة النجاح / الإكمال</label>
                                            <span>{selectedCraftsman.completion_rate}%</span>
                                        </div>
                                    </div>
                                    {selectedCraftsman.portfolio_url && (
                                        <div className="info-modern-item">
                                            <FaExternalLinkAlt size={18} />
                                            <div className="content">
                                                <label>معرض الأعمال / بورتفوليو</label>
                                                <a href={selectedCraftsman.portfolio_url} target="_blank" rel="noreferrer">عرض الرابط الخارجي</a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4 className="s-title">نبذة تعريفية</h4>
                                <p className="artisan-bio">{selectedCraftsman.bio || 'لا يوجد وصف حالياً'}</p>
                            </div>

                            <div className="sidebar-actions-sticky">
                                {selectedCraftsman.status === 'pending' ? (
                                    <div className="approval-actions">
                                        <button className="full-approve-btn" onClick={() => handleUpdateStatus(selectedCraftsman.id, 'approve')}>
                                            <FaCheckCircle size={20} /> تفعيل الحساب فوراً
                                        </button>
                                        <button className="full-reject-btn" onClick={() => handleUpdateStatus(selectedCraftsman.id, 'reject')}>
                                            <FaTimesCircle size={20} /> رفض الطلب
                                        </button>
                                    </div>
                                ) : (
                                    <div className="approval-actions">
                                        <button className="full-reject-btn" onClick={() => handleUpdateStatus(selectedCraftsman.id, 'block')}>
                                            <FaEdit size={20} /> {selectedCraftsman.status === 'blocked' ? 'إلغاء الحظر' : 'حظر الحساب'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            ) : null}
        </div >
    );
};

export default CraftsmenPage;