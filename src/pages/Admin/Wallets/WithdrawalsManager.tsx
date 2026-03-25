import { useState, useEffect } from 'react';
import { 
    FaMoneyBillWave, 
    FaCheckCircle, 
    FaTimesCircle, 
    FaSyncAlt,
    FaMobileAlt,
    FaUniversity,
    FaUser
} from 'react-icons/fa';
import { adminWalletsApi } from '../../../Api/admin/adminWallets.api';
import { toast } from 'react-toastify';
import './WithdrawalsManager.css';

interface WithdrawalRequest {
    id: number;
    amount: number;
    payout_method: 'bank' | 'mobile_wallet';
    payout_details: any;
    status: string;
    created_at: string;
    requestable?: {
        name: string;
        avatar?: string;
    };
}

const WithdrawalsManager = () => {
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [rejectingId, setRejectingId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const response = await adminWalletsApi.getWithdrawalRequests({});
            const result = response.data;
            if (result.status && result.data) {
                const innerData = result.data;
                const reqs = innerData.requests || innerData;
                setRequests(Array.isArray(reqs.data) ? reqs.data : (Array.isArray(reqs) ? reqs : []));
            }
        } catch (err) {
            toast.error('فشل تحميل طلبات السحب');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id: number) => {
        if (!window.confirm('هل أنت متأكد من الموافقة على هذا السحب وصرف المبلغ؟ سيتم خصم الرصيد تلقائياً من محفظة المستخدم.')) return;
        
        setSubmitting(true);
        try {
            await adminWalletsApi.approveWithdrawal(id);
            toast.success('تمت الموافقة وصرف المبلغ بنجاح');
            fetchRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'فشلت العملية');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectingId || !rejectReason) return;
        
        setSubmitting(true);
        try {
            await adminWalletsApi.rejectWithdrawal(rejectingId, rejectReason);
            toast.success('تم رفض طلب السحب');
            setRejectingId(null);
            setRejectReason('');
            fetchRequests();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'فشلت العملية');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="withdrawals-container">
            <header className="withdrawals-header-premium">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1><FaMoneyBillWave /> إدارة طلبات السحب</h1>
                        <p>مراجعة ومعالجة طلبات تحويل الأرباح للحسابات البنكية والمحافظ الإلكترونية</p>
                    </div>
                    <button className="action-btn" onClick={fetchRequests}><FaSyncAlt /></button>
                </div>
            </header>

            <div className="withdrawals-list">
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '5rem' }}>جاري التحميل...</div>
                ) : requests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '5rem', background: 'var(--white)', borderRadius: '24px', color: 'var(--slate-400)' }}>
                        🎉 لا توجد طلبات سحب معلقة حالياً
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="request-card">
                            <div className="req-user">
                                <div className="req-avatar">
                                    {req.requestable?.avatar ? <img src={req.requestable.avatar} alt="" /> : <FaUser />}
                                </div>
                                <div className="req-main-info">
                                    <span className="req-name">{req.requestable?.name || 'مستخدم'}</span>
                                    <small style={{ color: 'var(--slate-400)' }}>طلب #{req.id} • {new Date(req.created_at).toLocaleDateString('ar-EG')}</small>
                                    
                                    <div className="payout-details-box">
                                        {req.payout_method === 'mobile_wallet' ? (
                                            <>
                                                <FaMobileAlt /> محفظة: <strong>{req.payout_details?.mobile_number}</strong>
                                            </>
                                        ) : (
                                            <>
                                                <FaUniversity /> {req.payout_details?.bank_name} • {req.payout_details?.account_number}
                                                <br />
                                                <small>باسم: {req.payout_details?.account_name}</small>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div style={{ textAlign: 'center', padding: '0 2rem' }}>
                                <div className="req-amount">
                                    {req.amount.toLocaleString()} <small>ج.م</small>
                                </div>
                                <span className="payout-method-badge">
                                    {req.payout_method === 'mobile_wallet' ? 'محفظة إلكترونية' : 'تحويل بنكي'}
                                </span>
                            </div>

                            <div className="req-actions">
                                {rejectingId === req.id ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <input 
                                            type="text" 
                                            placeholder="سبب الرفض..." 
                                            className="reject-reason-input"
                                            value={rejectReason}
                                            onChange={e => setRejectReason(e.target.value)}
                                            autoFocus
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-approve" onClick={handleReject} disabled={submitting}>تأكيد الرفض</button>
                                            <button className="btn-reject" onClick={() => setRejectingId(null)}>إلغاء</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <button className="btn-approve" onClick={() => handleApprove(req.id)} disabled={submitting}>
                                            <FaCheckCircle /> موافقة وصرف
                                        </button>
                                        <button className="btn-reject" onClick={() => setRejectingId(req.id)} disabled={submitting}>
                                            <FaTimesCircle /> رفض
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default WithdrawalsManager;
