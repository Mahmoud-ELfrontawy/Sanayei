import React, { useState, useEffect } from 'react';
import {
    Search,
    Edit,
    Eye,
    CheckCircle,
    XCircle,
    Star,
    Clock,
    Wrench,
    Briefcase,
    DollarSign,
    ExternalLink,
    Filter,
    X
} from 'lucide-react';
import { toast } from 'react-toastify';
import './CraftsmenPage.css';

interface CraftsmanData {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    specialty: string;
    sub_specialties?: string[];
    governorate: string;
    status: 'pending' | 'approved' | 'rejected';
    rating: number;
    reviews_count: number;
    completed_jobs: number;
    experience_years: number;
    price_range: string;
    joined_date: string;
    is_verified: boolean;
    portfolio_url?: string;
    bio?: string;
    completion_rate: number; // نسبة إكمال المهام
}

const CraftsmenPage: React.FC = () => {
    const [craftsmen, setCraftsmen] = useState<CraftsmanData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');
    const [selectedCraftsman, setSelectedCraftsman] = useState<CraftsmanData | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        // Simulation of fetching data
        const timer = setTimeout(() => {
            setCraftsmen([
                {
                    id: 'C001',
                    name: 'محمد أحمد السباك',
                    email: 'mohamed.p@example.com',
                    phone: '01011223344',
                    specialty: 'سباكة',
                    sub_specialties: ['تصريف صحي', 'تركيب خلاطات'],
                    governorate: 'القاهرة',
                    status: 'approved',
                    rating: 4.8,
                    reviews_count: 156,
                    completed_jobs: 210,
                    experience_years: 12,
                    price_range: 'متوسط',
                    joined_date: '2023-01-15',
                    is_verified: true,
                    portfolio_url: 'https://images.com/portfolio1',
                    bio: 'متخصص في كافة أعمال السباكة المنزلية والإنشاءات الجديدة.',
                    completion_rate: 98
                },
                {
                    id: 'C002',
                    name: 'أحمد محمود كهربائي',
                    email: 'ahmed.e@example.com',
                    phone: '01122334455',
                    specialty: 'كهرباء',
                    sub_specialties: ['تأسيس كهرباء', 'صيانة أعطال'],
                    governorate: 'الجيزة',
                    status: 'pending',
                    rating: 0,
                    reviews_count: 0,
                    completed_jobs: 0,
                    experience_years: 8,
                    price_range: 'اقتصادي',
                    joined_date: '2024-02-10',
                    is_verified: false,
                    bio: 'فني كهرباء خبرة في التأسيس والصيانة.',
                    completion_rate: 0
                },
                {
                    id: 'C003',
                    name: 'شركة النيل للتكييف',
                    email: 'nile.air@company.com',
                    phone: '01233445566',
                    specialty: 'تكييف وتبريد',
                    sub_specialties: ['شحن فريون', 'غسيل تكييفات'],
                    governorate: 'الإسكندرية',
                    status: 'rejected',
                    rating: 3.2,
                    reviews_count: 12,
                    completed_jobs: 15,
                    experience_years: 5,
                    price_range: 'مرتفع',
                    joined_date: '2023-11-20',
                    is_verified: true,
                    bio: 'مركز صيانة معتمد لجميع أنواع التكييفات.',
                    completion_rate: 75
                }
            ]);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const handleUpdateStatus = (id: string, newStatus: 'approved' | 'rejected') => {
        const actionText = newStatus === 'approved' ? 'اعتماد' : 'رفض';
        toast.info(`جاري ${actionText} الحساب...`);

        setCraftsmen(prev => prev.map(c =>
            c.id === id ? { ...c, status: newStatus } : c
        ));

        if (selectedCraftsman?.id === id) {
            setSelectedCraftsman(prev => prev ? { ...prev, status: newStatus } : null);
        }

        toast.success(`تم ${actionText} الحساب بنجاح`);
    };

    const openSidebar = (craftsman: CraftsmanData) => {
        setSelectedCraftsman(craftsman);
        setIsSidebarOpen(true);
    };

    const filteredCraftsmen = craftsmen.filter(c => {
        const matchesSearch = c.name.includes(searchTerm) || c.email.includes(searchTerm) || c.phone.includes(searchTerm);
        const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;
        const matchesSpecialty = selectedSpecialty === 'all' || c.specialty === selectedSpecialty;
        return matchesSearch && matchesStatus && matchesSpecialty;
    });

    if (loading) {
        return <div className="loading-state">جاري تحميل بيانات الصنايعية...</div>;
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
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="بحث بالاسم، الإيميل، أو الهاتف..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters-group">
                    <div className="filter-item">
                        <Filter size={18} />
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                            <option value="all">كل الحالات</option>
                            <option value="pending">بانتظار المراجعة</option>
                            <option value="approved">معتمد</option>
                            <option value="rejected">مرفوض</option>
                        </select>
                    </div>
                    <div className="filter-item">
                        <Wrench size={18} />
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
                                        <Wrench size={14} />
                                        {craftsman.specialty}
                                    </span>
                                </td>
                                <td>{craftsman.governorate}</td>
                                <td>
                                    <div className="rating-mini">
                                        <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                        <span>{craftsman.rating || 'جديد'}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${craftsman.status}`}>
                                        {craftsman.status === 'approved' ? 'معتمد' :
                                            craftsman.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button className="view-btn" onClick={() => openSidebar(craftsman)} title="عرض التفاصيل">
                                        <Eye size={18} />
                                    </button>
                                    {craftsman.status === 'pending' && (
                                        <>
                                            <button className="approve-btn" onClick={() => handleUpdateStatus(craftsman.id, 'approved')} title="اعتماد">
                                                <CheckCircle size={18} />
                                            </button>
                                            <button className="reject-btn" onClick={() => handleUpdateStatus(craftsman.id, 'rejected')} title="رفض">
                                                <XCircle size={18} />
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Artisan Detail Sidebar */}
            {isSidebarOpen && selectedCraftsman && (
                <>
                    <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
                    <div className="artisan-sidebar">
                        <div className="sidebar-header">
                            <button className="close-btn" onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
                            <h3>تفاصيل الملف المهني</h3>
                        </div>

                        <div className="sidebar-content">
                            <div className="profile-hero">
                                <div className="large-avatar">{selectedCraftsman.name[0]}</div>
                                <h4>{selectedCraftsman.name}</h4>
                                <span className={`status-pill ${selectedCraftsman.status}`}>
                                    {selectedCraftsman.status === 'approved' ? 'حساب معتمد' :
                                        selectedCraftsman.status === 'rejected' ? 'حساب مرفوض' : 'بانتظار التفعيل'}
                                </span>
                            </div>

                            <div className="metrics-grid">
                                <div className="metric-item">
                                    <Star size={20} color="#f59e0b" />
                                    <span className="m-value">{selectedCraftsman.rating}</span>
                                    <span className="m-label">تقييم عام</span>
                                </div>
                                <div className="metric-item">
                                    <Briefcase size={20} color="#3b82f6" />
                                    <span className="m-value">{selectedCraftsman.completed_jobs}</span>
                                    <span className="m-label">مهمة مكتملة</span>
                                </div>
                                <div className="metric-item">
                                    <Clock size={20} color="#10b981" />
                                    <span className="m-value">{selectedCraftsman.experience_years}س</span>
                                    <span className="m-label">خبرة</span>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4 className="s-title">المعلومات المهنية</h4>
                                <div className="info-modern-list">
                                    <div className="info-modern-item">
                                        <Wrench size={18} />
                                        <div className="content">
                                            <label>التخصص الأساسي</label>
                                            <span>{selectedCraftsman.specialty}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <DollarSign size={18} />
                                        <div className="content">
                                            <label>فئة الأسعار</label>
                                            <span>{selectedCraftsman.price_range}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <CheckCircle size={18} />
                                        <div className="content">
                                            <label>نسبة النجاح / الإكمال</label>
                                            <span>{selectedCraftsman.completion_rate}%</span>
                                        </div>
                                    </div>
                                    {selectedCraftsman.portfolio_url && (
                                        <div className="info-modern-item">
                                            <ExternalLink size={18} />
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
                                        <button className="full-approve-btn" onClick={() => handleUpdateStatus(selectedCraftsman.id, 'approved')}>
                                            <CheckCircle size={20} /> تفعيل الحساب فوراً
                                        </button>
                                        <button className="full-reject-btn" onClick={() => handleUpdateStatus(selectedCraftsman.id, 'rejected')}>
                                            <XCircle size={20} /> رفض الطلب
                                        </button>
                                    </div>
                                ) : (
                                    <button className="full-edit-btn">
                                        <Edit size={20} /> تعديل بيانات الملف الفني
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CraftsmenPage;
