import { useState, useEffect } from 'react';
import { 
    FaExchangeAlt, 
    FaArrowRight, 
    FaSyncAlt
} from 'react-icons/fa';
import { adminWalletsApi } from '../../../Api/admin/adminWallets.api';
import { toast } from 'react-toastify';
import './TransfersTracker.css';

interface Transfer {
    id: number;
    amount: number;
    description: string;
    created_at: string;
    meta: {
        transfer_from?: { id: number; name: string };
        transfer_to?: { id: number; name: string };
    };
    wallet?: {
        id: number;
        walletable?: { name: string };
    };
}

const TransfersTracker = () => {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [loading, setLoading] = useState(true);
    const [direction, setDirection] = useState<'incoming' | 'outgoing' | 'all'>('all');
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const fetchTransfers = async () => {
        setLoading(true);
        try {
            const response = await adminWalletsApi.getTransfersTracker({
                page,
                direction: direction === 'all' ? undefined : direction
            });
            const result = response.data;
            if (result.status && result.data) {
                const innerData = result.data;
                const txData = innerData.transfers || innerData;
                setTransfers(Array.isArray(txData.data) ? txData.data : (Array.isArray(txData) ? txData : []));
                setLastPage(txData.last_page || 1);
            }
        } catch (err) {
            toast.error('فشل تحميل سجل التحويلات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransfers();
    }, [page, direction]);

    return (
        <div className="transfers-container">
            <header className="transfers-header-premium">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1><FaExchangeAlt /> متتبع التحويلات الداخلية</h1>
                        <p>عرض حركة الأموال بين محافظ المستخدمين بشكل حي</p>
                    </div>
                </div>
            </header>

            <div className="transfers-table-card">
                <div className="tx-header" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
                    <div className="filter-group">
                        <select 
                            className="filter-select" 
                            style={{ margin: 0 }}
                            value={direction}
                            onChange={(e) => { setDirection(e.target.value as any); setPage(1); }}
                        >
                            <option value="all">كل التحويلات</option>
                            <option value="incoming">الواردة فقط</option>
                            <option value="outgoing">الصادرة فقط</option>
                        </select>
                    </div>
                    <button className="action-btn" onClick={fetchTransfers}><FaSyncAlt /></button>
                </div>

                <table className="history-table">
                    <thead>
                        <tr>
                            <th>مسار التحويل</th>
                            <th>المبلغ</th>
                            <th>الوصف</th>
                            <th>التاريخ</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>جاري التحميل...</td></tr>
                        ) : transfers.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>لا توجد عمليات تحويل مسجلة</td></tr>
                        ) : (
                            transfers.map(t => (
                                <tr key={t.id}>
                                    <td>
                                        <div className="transfer-path">
                                            <div className="wallet-ref">
                                                <span className="name">{(t as any).sender_name || t.wallet?.walletable?.name || 'مجهول'}</span>
                                                <span className="id">المرسل</span>
                                            </div>
                                            <div className="path-arrow-box">
                                                <FaArrowRight className="path-arrow" />
                                            </div>
                                            <div className="wallet-ref">
                                                <span className="name">{(t as any).receiver_name || t.meta.transfer_to?.name || 'مجهول'}</span>
                                                <span className="id">المستلم</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="amount-high">
                                            {t.amount.toLocaleString()} <small>ج.م</small>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="tx-desc-text" style={{ fontSize: '0.9rem' }}>{t.description}</span>
                                    </td>
                                    <td>
                                        <span className="tx-meta">
                                            {new Date(t.created_at).toLocaleString('ar-EG')}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="status-badge-tx">مكتمل</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                {lastPage > 1 && (
                    <div className="pagination-container">
                        <button className="pg-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>السابق</button>
                        <span className="pg-info">صفحة {page} من {lastPage}</span>
                        <button className="pg-btn" disabled={page === lastPage} onClick={() => setPage(p => p + 1)}>التالي</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransfersTracker;
