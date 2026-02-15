/* UsersPage.tsx */
import { useState, useEffect } from 'react';
import {
    FaSearch,
    FaEdit,
    FaRegTrashAlt,
    FaUserSlash,
    FaEye,
    FaPlus,
    FaRegEnvelope,
    FaPhoneAlt,
    FaRegCalendarAlt,
    FaSyncAlt,
    FaShieldAlt,
    FaTimes,
    FaDownload,
    FaUsers
} from 'react-icons/fa';
import { adminUsersApi } from '../../../Api/admin/adminUsers.api';
import { toast } from 'react-toastify';
import './UsersPage.css';

interface UserData {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    role: 'admin' | 'user' | 'craftsman' | 'company';
    is_active: boolean;
    is_admin: boolean;
    gender?: 'male' | 'female';
    birth_date?: string;
    created_at: string;
    // ... other optional fields from controller
    latitude?: number;
    longitude?: number;
    registered_via?: string;
}

const UsersPage = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isActiveFilter, setIsActiveFilter] = useState<boolean | 'all'>('all');
    const [isAdminFilter, setIsAdminFilter] = useState<boolean | 'all'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [roleFilter, setRoleFilter] = useState('all');

    // Detailed View State
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Modal State (Create/Edit)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        gender: '' as 'male' | 'female' | '',
        birth_date: '',
        is_active: true,
        is_admin: false,
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                search: searchQuery,
                is_active: isActiveFilter === 'all' ? undefined : isActiveFilter,
                is_admin: isAdminFilter === 'all' ? undefined : isAdminFilter
            };
            const response = await adminUsersApi.getAllUsers(params);

            // The latest controller wraps the pagination object in a 'data' field
            // response.data (axios) -> { status: true, data: { data: [...], last_page: X, ... } }
            const paginationObj = response.data.data;
            const usersList = paginationObj?.data || [];

            setUsers(usersList);
            setTotalPages(paginationObj?.last_page || 1);
            setError(null);
        } catch (err: any) {
            if (err.response) {
                setError(`خطأ من السيرفر: ${err.response.status} - ${err.response.data?.message || 'مشكلة داخلية'}`);
            } else if (err.request) {
                setError("فشل الاتصال: مشكلة في الشبكة أو CORS (يرجى التأكد من تشغيل الباك إيند)");
            } else {
                setError("حدث خطأ غير متوقع");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchQuery, isActiveFilter, isAdminFilter]);

    const filteredUsers = users
        .filter(user => {
            // roleFilter (user/craftsman/company) still client-side if API doesn't support it
            const matchesRole = roleFilter === 'all' || user.role === roleFilter;
            return matchesRole;
        });



    const handleToggleBlock = async (userId: string, isActive: boolean) => {
        const action = isActive ? 'حظر' : 'إلغاء حظر';
        if (window.confirm(`هل أنت متأكد من ${action} هذا المستخدم؟`)) {
            try {
                await adminUsersApi.toggleBlockUser(userId);
                toast.success(`تم ${action} المستخدم بنجاح`);
                fetchUsers();
            } catch (err: any) {
                const msg = err.response?.data?.message || `فشل ${action} المستخدم`;
                toast.error(msg);
            }
        }
    };


    const handleDeleteUser = async (userId: string) => {
        if (window.confirm("⚠️ هل أنت متأكد من حذف هذا المستخدم نهائياً؟ لا يمكن التراجع عن هذا الإجراء.")) {
            if (window.confirm("تأكيد أخير: هل أنت متأكد فعلاً؟")) {
                try {
                    await adminUsersApi.deleteUser(userId);
                    toast.success("تم حذف المستخدم بنجاح");
                    fetchUsers();
                } catch (err: any) {
                    const msg = err.response?.data?.message || "فشل حذف المستخدم";
                    toast.error(msg);
                }
            }
        }
    };

    const handleOpenCreateModal = () => {
        setModalMode('create');
        setFormData({
            name: '',
            email: '',
            phone: '',
            password: '',
            gender: '' as 'male' | 'female' | '',
            birth_date: '',
            is_active: true,
            is_admin: false,
        });
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (user: UserData) => {
        setModalMode('edit');
        setSelectedUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            password: '', // Keep empty for edit
            gender: user.gender || '',
            birth_date: user.birth_date || '',
            is_active: user.is_active,
            is_admin: user.is_admin,
        });
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await adminUsersApi.createUser({ ...formData, registered_via: 'admin' });
                toast.success("تم إنشاء المستخدم بنجاح");
            } else if (selectedUser) {
                // Remove password if empty during Edit
                const updatePayload = { ...formData };
                if (!updatePayload.password) delete (updatePayload as any).password;

                await adminUsersApi.updateUser(selectedUser.id, updatePayload);
                toast.success("تم تحديث بيانات المستخدم");
            }
            setIsModalOpen(false);
            fetchUsers();
        } catch (err: any) {
            const msg = err.response?.data?.message || "حدث خطأ أثناء حفظ البيانات";
            toast.error(msg);
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

    const getStatusLabel = (isActive: boolean) => {
        return isActive ? 'نشط' : 'محظور / غير نشط';
    };

    const openDetails = (user: UserData) => {
        setSelectedUser(user);
        setIsDetailOpen(true);
    };


    const handleExportData = () => {
        toast.info("جاري تجهيز تقرير المستخدمين بصيغة Excel...");
        // Simulation logic
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
                            <FaUsers size={24} className="stat-icon" />
                            <div className="stat-values">
                                <span className="label">المستخدمين بالصفحة</span>
                                <span className="value">{users.length}</span>
                            </div>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button className="add-user-btn" onClick={handleOpenCreateModal}>
                            <FaPlus size={20} />
                            إضافة مستخدم جديد
                        </button>
                        <button className="export-action-btn" onClick={handleExportData}>
                            <FaDownload size={20} />
                            تصدير Excel
                        </button>
                        <button className="refresh-action-btn" onClick={fetchUsers}>
                            <FaSyncAlt size={20} />
                            تحديث
                        </button>
                    </div>
                </div>
            </header>

            {error && <div className="error-container">{error}</div>}

            <div className="users-controls advanced">
                <div className="search-wrapper">
                    <FaSearch className="search-icon" size={20} />
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
                        <option value="all">كل الأدوار</option>
                        <option value="user">مستخدم (User)</option>
                        <option value="company">شركة (Company)</option>
                        <option value="craftsman">صنايعي (Craftsman)</option>
                    </select>
                    <select className="filter-select" value={isActiveFilter.toString()} onChange={(e) => setIsActiveFilter(e.target.value === 'all' ? 'all' : e.target.value === 'true')}>
                        <option value="all">كل الحالات (نشط/محظور)</option>
                        <option value="true">نشط فقط</option>
                        <option value="false">محظور فقط</option>
                    </select>
                    <select className="filter-select" value={isAdminFilter.toString()} onChange={(e) => setIsAdminFilter(e.target.value === 'all' ? 'all' : e.target.value === 'true')}>
                        <option value="all">الكل (أدمن/مستخدم)</option>
                        <option value="true">أدمن فقط</option>
                        <option value="false">مستخدمين عاديين</option>
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
                            <th>الأدمن</th>
                            <th>حالة الحساب</th>
                            <th>تاريخ التسجيل</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td className="font-mono text-xs opacity-60">#{user.id}</td>
                                <td>
                                    <div className="user-profile-cell">
                                        <div className={`user-avatar-mini ${user.role}`}>
                                            {user.avatar ? <img src={user.avatar} alt="" /> : user.name[0].toUpperCase()}
                                        </div>
                                        <div className="user-main-info">
                                            <div className="name-wrapper">
                                                <span className="user-name">{user.name}</span>
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
                                    {user.is_admin ? <FaShieldAlt size={18} color="#10b981" /> : <FaTimes size={18} color="#94a3b8" />}
                                </td>
                                <td>
                                    <span className={`status-badge-modern ${user.is_active ? 'active' : 'banned'}`}>
                                        {getStatusLabel(user.is_active)}
                                    </span>
                                </td>
                                <td><span className="date-display">{formatDate(user.created_at)}</span></td>
                                <td className="actions-cell">
                                    <button className="action-btn" onClick={() => openDetails(user)} title="عرض التفاصيل الكاملة">
                                        <FaEye size={18} />
                                    </button>
                                    <button className="action-btn edit" onClick={() => handleOpenEditModal(user)} title="تعديل البيانات">
                                        <FaEdit size={18} />
                                    </button>
                                    <button className="action-btn delete" onClick={() => handleDeleteUser(user.id)} title="حذف نهائي">
                                        <FaRegTrashAlt size={18} />
                                    </button>
                                    <button
                                        className={`action-btn ${user.is_active ? 'delete' : 'success'}`}
                                        onClick={() => handleToggleBlock(user.id, user.is_active)}
                                        title={user.is_active ? 'حظر المستخدم' : 'إلغاء الحظر'}
                                    >
                                        <FaUserSlash size={18} />
                                    </button>
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

            {/* User Details Sidebar */}
            {isDetailOpen && selectedUser && (
                <>
                    <div className="sidebar-overlay" onClick={() => setIsDetailOpen(false)}></div>
                    <div className="user-detail-sidebar large">
                        <div className="detail-sidebar-header">
                            <div className="header-title-group">
                                <h2>ملف المستخدم الشامل</h2>
                                <span className="user-id-tag">ID: {selectedUser.id}</span>
                            </div>
                            <button onClick={() => setIsDetailOpen(false)} className="close-sidebar"><FaTimes size={24} /></button>
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
                                        {selectedUser.role === 'admin' ? 'أدمن' : selectedUser.role === 'company' ? 'شركة' : selectedUser.role === 'craftsman' ? 'صنايعي' : 'عميل'}
                                    </span>
                                    <span className={`status-badge ${selectedUser.is_active ? 'active' : 'banned'}`}>
                                        {getStatusLabel(selectedUser.is_active)}
                                    </span>
                                </div>
                            </div>

                            {/* Role Hero Info */}

                            <div className="detail-section">
                                <h4 className="section-title">المعلومات الأساسية</h4>
                                <div className="info-modern-list">
                                    <div className="info-modern-item">
                                        <FaRegEnvelope size={18} />
                                        <div className="content">
                                            <label>البريد الإلكتروني</label>
                                            <span>{selectedUser.email}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <FaPhoneAlt size={18} />
                                        <div className="content">
                                            <label>رقم الهاتف</label>
                                            <span>{selectedUser.phone}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <FaRegCalendarAlt size={18} />
                                        <div className="content">
                                            <label>تاريخ الميلاد</label>
                                            <span>{selectedUser.birth_date ? formatDate(selectedUser.birth_date) : 'غير مسجل'}</span>
                                        </div>
                                    </div>
                                    <div className="info-modern-item">
                                        <FaSyncAlt size={18} />
                                        <div className="content">
                                            <label>الجنس</label>
                                            <span>{selectedUser.gender === 'male' ? 'ذكر' : selectedUser.gender === 'female' ? 'أنثى' : 'غير محدد'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Create / Edit User Modal */}
            {isModalOpen && (
                <>
                    <div className="modal-overlay" onClick={() => setIsModalOpen(false)}></div>
                    <div className="admin-user-modal">
                        <div className="modal-header">
                            <h3>{modalMode === 'create' ? 'إضافة مستخدم جديد' : 'تعديل بيانات المستخدم'}</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}><FaTimes size={20} /></button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="user-form">
                            <div className="form-grid">
                                <div className="form-group-user">
                                    <label>الاسم الكامل</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group-user">
                                    <label>البريد الإلكتروني</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group-user">
                                    <label>رقم الهاتف</label>
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                                <div className="form-group-user">
                                    <label>{modalMode === 'create' ? 'كلمة المرور' : 'كلمة المرور الجديدة (اتركها فارغة لعدم التغيير)'}</label>
                                    <input
                                        type="password"
                                        required={modalMode === 'create'}
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                                <div className="form-group-user">
                                    <label>الجنس</label>
                                    <select
                                        value={formData.gender}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value as any })}
                                    >
                                        <option value="">اختر</option>
                                        <option value="male">ذكر</option>
                                        <option value="female">أنثى</option>
                                    </select>
                                </div>
                                <div className="form-group-user">
                                    <label>تاريخ الميلاد</label>
                                    <input
                                        type="date"
                                        value={formData.birth_date}
                                        onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                                    />
                                </div>
                                <div className="form-check-group">
                                    <label className="checkbox-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        />
                                        <span>حساب نشط</span>
                                    </label>
                                    <label className="checkbox-wrapper">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_admin}
                                            onChange={e => setFormData({ ...formData, is_admin: e.target.checked })}
                                        />
                                        <span>صلاحيات أدمن</span>
                                    </label>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>إلغاء</button>
                                <button type="submit" className="submit-btn">
                                    {modalMode === 'create' ? 'إنشاء الحساب' : 'حفظ التغييرات'}
                                </button>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
};

export default UsersPage;