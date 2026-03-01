import { useState, useEffect } from 'react';
import {
    FaExchangeAlt,
    FaSyncAlt
} from 'react-icons/fa';
import { adminWalletsApi } from '../../../Api/admin/adminWallets.api';
import { toast } from 'react-toastify';
import './TransfersTracker.css';

interface Participant {
    id: number | null;
    name: string;
    type: string;
}

interface Transfer {
    id: number;
    amount: number;
    description: string;
    created_at: string;
    sender: Participant;
    receiver: Participant;
    status: string;
}

const getRoleLabel = (role: string) => {
    switch (role?.toLowerCase()) {
        case 'user': return 'مستخدم';
        case 'craftsman': return 'صنايعي';
        case 'company': return 'شركة';
        case 'admin': return 'مسؤول';
        default: return role || 'مجهول';
    }
}

const TransfersTracker = () => {
    const [transfers, setTransfers] = useState<Transfer[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const fetchTransfers = async () => {
        setLoading(true);
        try {
            const response = await adminWalletsApi.getTransfersTracker({
                page
            });
            const result = response.data;
            console.log("🔍 Transfers API Response:", result);

            if (result.status && result.data) {
                // Determine where the transfers data is (handle nested response)
                const innerData = result.data;
                const txData = innerData.transfers || innerData;

                // Set based on the detected structure (handle array or paginated object)
                const items = Array.isArray(txData.data) ? txData.data : (Array.isArray(txData) ? txData : []);
                console.log("📊 Processed Transfers Items:", items.length, items);

                setTransfers(items);
                setLastPage(txData.last_page || 1);
            } else {
                console.warn("⚠️ API returned success:false or missing data branch:", result);
            }
        } catch (err) {
            console.error("❌ Failed to fetch transfers:", err);
            toast.error('فشل تحميل سجل التحويلات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransfers();
    }, [page]);

    return (
        <div className="transfers-container">
            <header className="transfers-header-premium">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1><FaExchangeAlt /> سجل التحويلات المالية</h1>
                        <p>تتبع حركة الأموال بين جميع أطراف المنصة (إيداع - خصم - تحويل)</p>
                    </div>
                    <button className="action-btn" onClick={fetchTransfers} style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 15px' }}>
                        <FaSyncAlt /> تحديث البيانات
                    </button>
                </div>
            </header>

            <div className="transfers-table-card">
                <table className="history-table">
                    <thead>
                        <tr>
                            <th>المرسل</th>
                            <th>المستلم</th>
                            <th>المبلغ</th>
                            <th>الوصف</th>
                            <th>التاريخ</th>
                            <th>الحالة</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>جاري التحميل...</td></tr>
                        ) : transfers.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>لا توجد عمليات تحويل مسجلة</td></tr>
                        ) : (
                            transfers.map(t => (
                                <tr key={t.id}>
                                    <td>
                                        <div className="participant-info">
                                            <span className="name">{t.sender?.name || 'مجهول'}</span>
                                            <span className="role-badge">{getRoleLabel(t.sender?.type)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="participant-info">
                                            <span className="name">{t.receiver?.name || 'مجهول'}</span>
                                            <span className="role-badge">{getRoleLabel(t.receiver?.type)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="amount-high">
                                            {Number(t.amount).toLocaleString()} <small>ج.م</small>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="tx-desc-text">{t.description}</span>
                                    </td>
                                    <td>
                                        <span className="tx-meta">
                                            {new Date(t.created_at).toLocaleString('ar-EG')}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-badge-tx ${t.status}`}>
                                            {t.status === 'completed' ? 'ناجح' : (t.status === 'pending' ? 'معلق' : t.status)}
                                        </span>
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
