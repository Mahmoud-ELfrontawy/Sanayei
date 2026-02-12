/* UsersPage.tsx */
import { useState, useEffect } from 'react';
import {
    Search,
    Edit,
    UserX,
    Wallet,
    MapPin,
    Eye,
    ShieldCheck,
    Mail,
    Phone,
    Calendar,
    RefreshCcw,
    X,
    Download,
    User,
    Users
} from 'lucide-react';
import { adminUsersApi } from '../../../Api/admin/adminUsers.api';
import { toast } from 'react-toastify';
import './UsersPage.css';

interface UserData {
    // الأساسية (Basic)
    id: string; // ID رقم المستخدم
    name: string; // الاسم الكامل
    email: string; // البريد الإلكتروني
    phone: string; // رقم الهاتف
    avatar?: string; // الصورة الشخصية
    role: 'admin' | 'user' | 'craftsman' | 'company'; // نوع الحساب (user/company/craftsman)
    status: 'active' | 'banned' | 'inactive'; // حالة الحساب (نشط/محظور/غير مفعل)
    created_at: string; // تاريخ التسجيل
    last_login: string; // آخر تسجيل دخول

    // النشاط (Activity - Not in API yet)
    total_requests?: number; // عدد طلبات الخدمة
    completed_requests?: number; // عدد الطلبات المكتملة
    cancelled_requests?: number; // عدد الطلبات الملغية
    total_spent?: number; // إجمالي المبالغ المدفوعة
    reviews_written?: number; // عدد التقييمات التي كتبها
    reports_count?: number; // عدد البلاغات عليه

    // الأمان (Security - Not in API yet)
    email_verified: boolean; // حالة تأكيد الإيميل
    phone_verified: boolean; // حالة تأكيد رقم الموبايل
    ip_address?: string; // آخر IP تسجيل دخول
    failed_logins?: number; // عدد محاولات تسجيل الدخول الفاشلة
    is_suspected?: boolean; // هل الحساب مشتبه فيه
    average_rating?: number; // متوسط التقييم (للصنايعية/الشركات)
    last_activity_timeline?: { action: string; time: string; icon: string }[]; // سجل النشاط الأخير
    active_last_24h?: boolean; // نشط خلال الـ 24 ساعة الماضية
    birth_date?: string; // تاريخ الميلاد
    gender?: 'male' | 'female'; // الجنس

    // إضافية
    governorate: string;
    is_verified: boolean; // توثيق الهوية
    wallet_balance?: number; // رصيد المحفظة حالياً (إضافي من الـ API)
}

const UsersPage = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [roleFilter, setRoleFilter] = useState('all'); // Filter by User/Company
    const [sortBy, setSortBy] = useState('newest'); // Sorting: newest, most_requests, most_spent

    // Detailed View State
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await adminUsersApi.getAllUsers();
            setUsers(response.data.users || response.data.data || []);
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch users", err);
            setError("فشل الاتصال بالسيرفر - يتم عرض بيانات تجريبية كاملة (Production Demo)");
            // بيانات تجريبية شاملة للمشروع (Comprehensive Mock Data)
            setUsers([
                {
                    id: '101',
                    name: 'أحمد محمد علي',
                    email: 'ahmed@example.com',
                    phone: '01012345678',
                    role: 'user',
                    status: 'active',
                    created_at: '2023-11-10',
                    last_login: '2024-02-12 10:30',
                    total_requests: 15,
                    completed_requests: 12,
                    cancelled_requests: 2,
                    total_spent: 4500.00,
                    reviews_written: 8,
                    reports_count: 0,
                    email_verified: true,
                    phone_verified: true,
                    ip_address: '192.168.1.1',
                    failed_logins: 0,
                    is_suspected: false,
                    governorate: 'القاهرة',
                    is_verified: true,
                    wallet_balance: 150.00,
                    average_rating: 4.8,
                    active_last_24h: true,
                    birth_date: '1995-05-15',
                    gender: 'male',
                    last_activity_timeline: [
                        { action: 'طلب خدمة تركيب سباكة', time: 'منذ ساعتين', icon: 'wrench' },
                        { action: 'دفع فاتورة محفظة', time: 'منذ 5 ساعات', icon: 'wallet' },
                        { action: 'تغيير كلمة المرور', time: 'أمس', icon: 'lock' }
                    ]
                },
                {
                    id: '102',
                    name: 'شركة النور للمقاولات',
                    email: 'alnoor@company.com',
                    phone: '01155667788',
                    role: 'company',
                    status: 'inactive',
                    created_at: '2024-01-05',
                    last_login: '2024-02-10 15:45',
                    total_requests: 45,
                    completed_requests: 40,
                    cancelled_requests: 1,
                    total_spent: 12500.00,
                    reviews_written: 0,
                    reports_count: 2,
                    email_verified: true,
                    phone_verified: false,
                    ip_address: '41.235.10.5',
                    failed_logins: 3,
                    is_suspected: true,
                    governorate: 'الجيزة',
                    is_verified: false,
                    wallet_balance: 0,
                    active_last_24h: false,
                    birth_date: '2010-01-01',
                    gender: 'male',
                    last_activity_timeline: [
                        { action: 'فشل تسجيل دخول', time: 'منذ يومين', icon: 'alert' },
                        { action: 'تعديل بيانات الشركة', time: 'منذ أسبوع', icon: 'edit' }
                    ]
                },
                {
                    id: '103',
                    name: 'ياسر إبراهيم',
                    email: 'yasser@example.com',
                    phone: '01299887766',
                    role: 'user',
                    status: 'banned',
                    created_at: '2023-05-20',
                    last_login: '2023-12-25 09:12',
                    total_requests: 3,
                    completed_requests: 0,
                    cancelled_requests: 3,
                    total_spent: 0,
                    reviews_written: 1,
                    reports_count: 10,
                    email_verified: false,
                    phone_verified: true,
                    ip_address: '156.202.5.11',
                    failed_logins: 12,
                    is_suspected: true,
                    governorate: 'الإسكندرية',
                    is_verified: false,
                    wallet_balance: 45.00,
                    active_last_24h: false,
                    birth_date: '1988-11-20',
                    gender: 'male',
                    last_activity_timeline: [
                        { action: 'حظر الحساب من قبل النظام', time: 'ديسمبر 2023', icon: 'ban' }
                    ]
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users
        .filter(user => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.phone.includes(searchQuery);
            const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            return matchesSearch && matchesStatus && matchesRole;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            if (sortBy === 'requests') return (b.total_requests || 0) - (a.total_requests || 0);
            if (sortBy === 'spent') return (b.total_spent || 0) - (a.total_spent || 0);
            return 0;
        });


    const handleResetPassword = async (userId: string) => {
        if (window.confirm("هل أنت متأكد من إعادة تعيين كلمة المرور لهذا المستخدم؟")) {
            try {
                await adminUsersApi.resetPassword(userId);
                toast.success("تم إرسال رابط إعادة التعيين");
            } catch (err) {
                toast.error("فشل تنفيذ الطلب");
            }
        }
    };

    const handleUpdateWallet = async (userId: string) => {
        const amountStr = window.prompt("أدخل المبلغ (استخدم سالباً للخصم):");
        if (amountStr) {
            const amount = parseFloat(amountStr);
            if (isNaN(amount)) return toast.error("برجاء إدخال رقم صحيح");

            const type = amount >= 0 ? 'add' : 'deduct';
            try {
                await adminUsersApi.updateWallet(userId, Math.abs(amount), type);
                toast.success("تم تحديث المحفظة بنجاح");
                fetchUsers();
            } catch (err) {
                toast.error("فشل تحديث المحفظة");
            }
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '---';
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(date);
        } catch (e) {
            return dateString;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'نشط';
            case 'banned': return 'محظور';
            case 'inactive': return 'غير مفعل';
            default: return status;
        }
    };

    const openDetails = (user: UserData) => {
        setSelectedUser(user);
        setIsDetailOpen(true);
    };

    const totalUsers = users.length;
    const activeLast24h = users.filter(u => u.active_last_24h).length;

    const handleExportData = () => {
        toast.info("جاري تجهيز تقرير المستخدمين بصيغة Excel...");
        // Simulation logic
    };

    const handleImpersonate = (userName: string) => {
        toast.warning(`جاري الدخول كـ ${userName}... (اختبار المحاكاة)`);
    };

    if (loading && users.length === 0) {
        return (
            <div className="users-container skeleton-active">
                <header className="users-header">
                    <div className="skeleton h-12 w-1/3"></div>
                    <div className="flex gap-4">
                        <div className="skeleton h-16 w-24"></div>
                        <div className="skeleton h-16 w-24"></div>
                    </div>
                </header>
                <div className="users-controls skeleton h-12 w-full mt-4"></div>
                <div className="users-table-wrapper mt-8">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="skeleton h-16 w-full mb-2"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="users-container">
            <header className="users-premium-header">
                <div className="header-glass-content">
                    <div className="title-area">
                        <h1>إدارة الحسابات الشاملة</h1>
                        <p>الرقابة الكاملة والتحليل الذكي لبيانات المستخدمين</p>
                    </div>

                    <div className="header-stats-grid">
                        <div className="stat-premium-card">
                            <Users size={24} className="stat-icon" />
                            <div className="stat-values">
                                <span className="label">إجمالي المستخدمين</span>
                                <span className="value">{totalUsers}</span>
                            </div>
                        </div>
                        <div className="stat-premium-card highlight">
                            <RefreshCcw size={24} className="stat-icon spinning" />
                            <div className="stat-values">
                                <span className="label">نشاط 24 ساعة</span>
                                <span className="value">+{activeLast24h}</span>
                            </div>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button className="export-action-btn" onClick={handleExportData}>
                            <Download size={20} />
                            تصدير Excel
                        </button>
                        <button className="refresh-action-btn" onClick={fetchUsers}>
                            <RefreshCcw size={20} />
                            تحديث
                        </button>
                    </div>
                </div>
            </header>

            {error && <div className="error-container">{error}</div>}

            <div className="users-controls advanced">
                <div className="search-wrapper">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="بحث بالاسم، الإيميل، أو الهاتف..."
                        className="search-input"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filters-grid">
                    <select className="filter-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="all">كل الأنواع</option>
                        <option value="user">مستخدم (User)</option>
                        <option value="company">شركة (Company)</option>
                        <option value="craftsman">صنايعي (Craftsman)</option>
                    </select>
                    <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">كل الحالات</option>
                        <option value="active">نشط</option>
                        <option value="inactive">غير مفعل</option>
                        <option value="banned">محظور</option>
                    </select>
                    <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option value="newest">الأحدث تسجيلاً</option>
                        <option value="requests">الأكثر طلباً</option>
                        <option value="spent">الأكثر إنفاقاً</option>
                    </select>
                </div>
            </div>

            <div className="users-table-wrapper">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th># ID</th>
                            <th>المستخدم</th>
                            <th>نوع الحساب</th>
                            <th>حالة الحساب</th>
                            <th>تاريخ التسجيل</th>
                            <th>آخر ظهور</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id} className={user.is_suspected ? 'suspected-row' : ''}>
                                <td className="font-mono text-xs opacity-60">#{user.id}</td>
                                <td>
                                    <div className="user-profile-cell">
                                        <div className={`user-avatar-mini ${user.role}`}>
                                            {user.avatar ? <img src={user.avatar} alt="" /> : user.name[0].toUpperCase()}
                                        </div>
                                        <div className="user-main-info">
                                            <div className="name-wrapper">
                                                <span className="user-name">{user.name}</span>
                                                {user.total_requests && user.total_requests > 10 && (
                                                    <span className="request-badge" title="عميل مميز">
                                                        {user.total_requests} طلب
                                                    </span>
                                                )}
                                            </div>
                                            <span className="user-email">{user.email}</span>
                                            <span className="user-email">{user.phone}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`role-badge ${user.role}`}>
                                        {user.role === 'admin' ? 'أدمن' : user.role === 'company' ? 'شركة' : user.role === 'craftsman' ? 'صنايعي' : 'عميل'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`status-badge-modern ${user.status}`}>
                                        {getStatusLabel(user.status)}
                                    </span>
                                </td>
                                <td><span className="date-display">{formatDate(user.created_at)}</span></td>
                                <td><span className="text-sm opacity-80">{user.last_login}</span></td>
                                <td className="actions-cell">
                                    <button className="action-btn" onClick={() => openDetails(user)} title="عرض التفاصيل الكاملة">
                                        <Eye size={18} />
                                    </button>
                                    <button className="action-btn" onClick={() => handleUpdateWallet(user.id)} title="إدارة المحفظة">
                                        <Wallet size={18} />
                                    </button>
                                    <button className="action-btn" onClick={() => handleResetPassword(user.id)} title="إعادة تعيين الباسوورد">
                                        <RefreshCcw size={18} />
                                    </button>
                                    <button className="action-btn delete" title="حظر المستخدم">
                                        <UserX size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* User Details Sidebar - Production Ready */}
            {isDetailOpen && selectedUser && (
                <>
                    <div className="sidebar-overlay" onClick={() => setIsDetailOpen(false)}></div>
                    <div className="user-detail-sidebar large">
                        <div className="detail-sidebar-header">
                            <div className="header-title-group">
                                <h2>ملف المستخدم الشامل</h2>
                                <span className="user-id-tag">ID: {selectedUser.id}</span>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="close-sidebar"><X size={24} /></button>
                        </div>

                        <div className="detail-scroll-area">
                            {/* Profile Section */}
                            <div className="detail-profile-hero">
                                <div className={`detail-avatar xlarge ${selectedUser.role}`}>
                                    {selectedUser.avatar ? <img src={selectedUser.avatar} alt="" /> : selectedUser.name[0]}
                                </div>
                                <h3 className="profile-name">{selectedUser.name}</h3>
                                <div className="hero-badges">
                                    <span className={`role-badge ${selectedUser.role}`}>
                                        {selectedUser.role === 'admin' ? 'أدمن' : selectedUser.role === 'company' ? 'شركة' : 'عميل'}
                                    </span>
                                    <span className={`status-badge ${selectedUser.status}`}>
                                        {getStatusLabel(selectedUser.status)}
                                    </span>
                                </div>
                                {selectedUser.average_rating && (
                                    <div className="detail-rating">
                                        <div className="stars">⭐⭐⭐⭐⭐</div>
                                        <span>({selectedUser.average_rating}) تقييم عام</span>
                                    </div>
                                )}
                            </div>

                            {/* Wallet Info */}
                            <div className="detail-balance-card">
                                <div className="balance-info">
                                    <label>رصيد المحفظة</label>
                                    <strong>{(selectedUser.wallet_balance || 0).toFixed(2)} ج.م</strong>
                                </div>
                                <button className="add-balance-mini" onClick={() => handleUpdateWallet(selectedUser.id)}>
                                    <Wallet size={16} /> تعديل الرصيد
                                </button>
                            </div>

                            {/* Section: Activity Metrics (Not in API) */}
                            <div className="detail-section">
                                <h4 className="section-title">إحصائيات النشاط</h4>
                                <div className="activity-grid">
                                    <div className="activity-item">
                                        <span className="value">{selectedUser.total_requests || 0}</span>
                                        <span className="label">إجمالي الطلبات</span>
                                    </div>
                                    <div className="activity-item pulse-green">
                                        <span className="value">{selectedUser.completed_requests || 0}</span>
                                        <span className="label">مكتملة</span>
                                    </div>
                                    <div className="activity-item pulse-red">
                                        <span className="value">{selectedUser.cancelled_requests || 0}</span>
                                        <span className="label">ملغاة</span>
                                    </div>
                                    <div className="activity-item highlight">
                                        <span className="value">{(selectedUser.total_spent || 0).toLocaleString()}</span>
                                        <span className="label">إجمالي المدفوع</span>
                                    </div>
                                </div>
                            </div>

                            {/* Section: Security Details (Not in API) */}
                            <div className="detail-section security-section">
                                <h4 className="section-title">بيانات الأمان والرقابة</h4>
                                <div className="security-list">
                                    <div className={`security-check ${selectedUser.email_verified ? 'ok' : 'warn'}`}>
                                        {selectedUser.email_verified ? <ShieldCheck size={16} /> : <X size={16} />}
                                        <span>تأكيد الإيميل: {selectedUser.email_verified ? 'مفعل' : 'غير مؤكد'}</span>
                                    </div>
                                    <div className={`security-check ${selectedUser.phone_verified ? 'ok' : 'warn'}`}>
                                        {selectedUser.phone_verified ? <ShieldCheck size={16} /> : <X size={16} />}
                                        <span>تأكيد الموبايل: {selectedUser.phone_verified ? 'مفعل' : 'غير مؤكد'}</span>
                                    </div>
                                    <div className="security-item">
                                        <label>IP تسجيل الدخول:</label>
                                        <code>{selectedUser.ip_address || '---.---.---.---'}</code>
                                    </div>
                                    <div className={`security-item ${selectedUser.failed_logins && selectedUser.failed_logins > 5 ? 'danger' : ''}`}>
                                        <label>محاولات فاشلة:</label>
                                        <span>{selectedUser.failed_logins || 0} محاولات</span>
                                    </div>
                                    {selectedUser.is_suspected && (
                                        <div className="suspect-alert">
                                            <UserX size={18} />
                                            <span>حساب مشتبه في سلوكه!</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Activity Timeline Section */}
                            <div className="detail-section">
                                <h4 className="section-title">سجل النشاط الأخير (Timeline)</h4>
                                <div className="activity-timeline">
                                    {(selectedUser.last_activity_timeline || []).map((item, idx) => (
                                        <div key={idx} className="timeline-item">
                                            <div className="timeline-marker"></div>
                                            <div className="timeline-content">
                                                <p className="action-text">{item.action}</p>
                                                <span className="action-time">{item.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!selectedUser.last_activity_timeline || selectedUser.last_activity_timeline.length === 0) && (
                                        <p className="no-data">لا يوجد نشاط مسجل مؤخراً</p>
                                    )}
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4 className="section-title">المعلومات الأساسية</h4>
                                <div className="info-modern-list">
                                    <div className="info-modern-item">
                                        <Mail size={18} />
                                        <div className="content">
                                            <label>البريد الإلكتروني</label>
                                            <span>{selectedUser.email}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <Phone size={18} />
                                        <div className="content">
                                            <label>رقم الهاتف</label>
                                            <span>{selectedUser.phone}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <Calendar size={18} />
                                        <div className="content">
                                            <label>تاريخ الميلاد</label>
                                            <span>{selectedUser.birth_date ? formatDate(selectedUser.birth_date) : 'غير مسجل'}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <MapPin size={18} />
                                        <div className="content">
                                            <label>الموقع / المحافظة</label>
                                            <span>{selectedUser.governorate}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <RefreshCcw size={18} />
                                        <div className="content">
                                            <label>الجنس</label>
                                            <span>{selectedUser.gender === 'male' ? 'ذكر' : selectedUser.gender === 'female' ? 'أنثى' : 'غير محدد'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Dashboard */}
                            <div className="detail-section">
                                <h4 className="section-title">إجراءات الإدارة السريعة</h4>
                                <div className="actions-control-stack">
                                    <button className="control-action-card" onClick={() => handleImpersonate(selectedUser.name)}>
                                        <div className="icon-box blue"><User size={20} /></div>
                                        <div className="text">
                                            <strong>تسجيل الدخول كمستخدم</strong>
                                            <span>الدخول للحساب ومعاينة المشاكل</span>
                                        </div>
                                    </button>

                                    <button className="control-action-card">
                                        <div className="icon-box green"><Edit size={20} /></div>
                                        <div className="text">
                                            <strong>تعديل بيانات الحساب</strong>
                                            <span>تحديث الإيميل، الاسم، أو الموبايل</span>
                                        </div>
                                    </button>

                                    <button className="control-action-card" onClick={() => handleResetPassword(selectedUser.id)}>
                                        <div className="icon-box orange"><RefreshCcw size={20} /></div>
                                        <div className="text">
                                            <strong>إعادة تعيين كلمة المرور</strong>
                                            <span>إرسال رابط استعادة الوصول</span>
                                        </div>
                                    </button>

                                    <button className="control-action-card danger">
                                        <div className="icon-box red"><UserX size={20} /></div>
                                        <div className="text">
                                            <strong>حظر المستخدم نهائياً</strong>
                                            <span>منع الدخول وإلغاء كافة الصلاحيات</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default UsersPage;
