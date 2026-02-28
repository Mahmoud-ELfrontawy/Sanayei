import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
    FaWallet, 
    FaFilter, 
    FaEye, 
    FaSyncAlt, 
    FaSortAmountDown
} from 'react-icons/fa';
import { adminWalletsApi } from '../../../Api/admin/adminWallets.api';
import type { WalletFilterParams } from '../../../Api/admin/adminWallets.api';
import { toast } from 'react-toastify';
import './WalletsIndex.css';

interface Wallet {
    id: number;
    walletable_id: number;
    walletable_type: string;
    balance: number;
    created_at: string;
    walletable?: {
        id: number;
        name: string;
        avatar?: string;
    };
}

const WalletsIndex = () => {
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalBalance, setTotalBalance] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<WalletFilterParams>({
        page: 1,
        type: undefined,
        min_balance: undefined,
        max_balance: undefined
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const fetchWallets = async () => {
        setLoading(true);
        try {
            const response = await adminWalletsApi.getAllWallets({
                ...filters,
                page: currentPage
            });
            
            // Assuming response structure like: { wallets: { data: [], last_page: X }, totalBalance: Y }
            // or the Laravel standard pagination object
            const result = response.data;
            if (result.status && result.data) {
                const innerData = result.data;
                if (innerData.wallets) {
                    setWallets(Array.isArray(innerData.wallets.data) ? innerData.wallets.data : []);
                    setLastPage(innerData.wallets.last_page || 1);
                }
                setTotalBalance(innerData.total_balance || 0);
            } else {
                setWallets([]);
            }
            setError(null);
        } catch (err: any) {
            setError('فشل تحميل بيانات المحافظ. يرجى التأكد من اتصال السيرفر.');
            toast.error('خطأ في جلب البيانات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWallets();
    }, [currentPage, filters.type, filters.min_balance, filters.max_balance]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value === '' ? undefined : value
        }));
        setCurrentPage(1);
    };

    const getOwnerType = (type: string) => {
        if (type.includes('User')) return 'user';
        if (type.includes('Craftsman')) return 'craftsman';
        if (type.includes('Company')) return 'company';
        if (type.includes('Admin')) return 'admin';
        return 'other';
    };

    const getTypeText = (type: string) => {
        const t = getOwnerType(type);
        switch (t) {
            case 'user': return 'عميل';
            case 'craftsman': return 'صنايعي';
            case 'company': return 'شركة';
            case 'admin': return 'أدمن';
            default: return 'غير معروف';
        }
    };

    return (
        <div className="wallets-container">
            <header className="wallets-premium-header">
                <div className="header-glass-content">
                    <div className="title-area">
                        <h1>إدارة المحافظ المالية</h1>
                        <p>مراقبة شاملة لكافة الأرصدة والعمليات المالية في المنصة</p>
                    </div>

                    <div className="header-stats-grid">
                        <div className="stat-premium-card">
                            <FaWallet size={24} className="stat-icon" />
                            <div className="stat-values">
                                <span className="label">إجمالي السيولة</span>
                                <span className="value">{totalBalance.toLocaleString()} <small>ج.م</small></span>
                            </div>
                        </div>
                    </div>

                    <div className="header-actions">
                        <button className="refresh-action-btn action-btn" onClick={fetchWallets}>
                            <FaSyncAlt size={20} />
                            تحديث البيانات
                        </button>
                    </div>
                </div>
            </header>

            {error && <div className="error-container">{error}</div>}

            <div className="wallets-controls">
                <div className="filters-grid">
                    <div className="filter-group">
                        <label><FaFilter /> نوع صاحب المحفظة</label>
                        <select 
                            name="type" 
                            className="filter-select"
                            value={filters.type || ''}
                            onChange={handleFilterChange}
                        >
                            <option value="">الكل</option>
                            <option value="user">العملاء</option>
                            <option value="craftsman">الصنايعية</option>
                            <option value="company">الشركات</option>
                            <option value="admin">الإدارة</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label><FaSortAmountDown /> الحد الأدنى للرصيد</label>
                        <input 
                            type="number" 
                            name="min_balance"
                            placeholder="مثال: 100"
                            className="filter-input"
                            value={filters.min_balance || ''}
                            onChange={handleFilterChange}
                        />
                    </div>
                    <div className="filter-group">
                        <label>الحد الأعلى للرصيد</label>
                        <input 
                            type="number" 
                            name="max_balance"
                            placeholder="مثال: 5000"
                            className="filter-input"
                            value={filters.max_balance || ''}
                            onChange={handleFilterChange}
                        />
                    </div>
                </div>
            </div>

            <div className="wallets-table-wrapper">
                <table className="wallets-table">
                    <thead>
                        <tr>
                            <th>صاحب المحفظة</th>
                            <th>النوع</th>
                            <th>الرصيد الحالي</th>
                            <th>تاريخ التحميل</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                                    <div className="spinner">جاري التحميل...</div>
                                </td>
                            </tr>
                        ) : wallets.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                    لم يتم العثور على أي محافظ تطابق البحث
                                </td>
                            </tr>
                        ) : (
                            wallets.map(wallet => (
                                <tr key={wallet.id}>
                                    <td>
                                        <div className="owner-cell">
                                            <div className="owner-avatar">
                                                {wallet.walletable?.avatar ? (
                                                    <img src={wallet.walletable.avatar} alt="" />
                                                ) : (
                                                    wallet.walletable?.name?.[0]?.toUpperCase() || 'W'
                                                )}
                                            </div>
                                            <div className="owner-info">
                                                <span className="owner-name">{wallet.walletable?.name || 'مستخدم غير معروف'}</span>
                                                <span className="owner-id">ID: #{wallet.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`type-badge ${getOwnerType(wallet.walletable_type)}`}>
                                            {getTypeText(wallet.walletable_type)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="balance-cell">
                                            {wallet.balance.toLocaleString()}
                                            <span className="currency">ج.م</span>
                                        </div>
                                    </td>
                                    <td>
                                        {new Date(wallet.created_at).toLocaleDateString('ar-EG')}
                                    </td>
                                    <td>
                                        <Link to={`/admin/wallets/${wallet.id}`} className="action-btn" title="عرض التفاصيل">
                                            <FaEye />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {lastPage > 1 && (
                <div className="pagination-container">
                    <button 
                        className="pg-btn"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                    >
                        السابق
                    </button>
                    <span className="pg-info">صفحة {currentPage} من {lastPage}</span>
                    <button 
                        className="pg-btn"
                        disabled={currentPage === lastPage}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                    >
                        التالي
                    </button>
                </div>
            )}
        </div>
    );
};

export default WalletsIndex;
