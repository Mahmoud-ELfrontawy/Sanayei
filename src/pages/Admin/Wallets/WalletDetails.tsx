import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    FaArrowRight, 
    FaHistory, 
    FaPlusCircle, 
    FaMinusCircle, 
    FaUserCircle, 
    FaSyncAlt
} from 'react-icons/fa';
import { adminWalletsApi } from '../../../Api/admin/adminWallets.api';
import { toast } from 'react-toastify';
import './WalletDetails.css';

interface Transaction {
    id: number;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    status: string;
    created_at: string;
    meta?: any;
}

interface WalletDetailsData {
    id: number;
    balance: number;
    walletable?: {
        id: number;
        name: string;
        avatar?: string;
    };
    transactions?: {
        data: Transaction[];
        last_page: number;
    };
}

const WalletDetails = () => {
    const { id } = useParams<{ id: string }>();
    const [wallet, setWallet] = useState<WalletDetailsData | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Adjustment states
    const [creditAmount, setCreditAmount] = useState('');
    const [creditDesc, setCreditDesc] = useState('');
    const [debitAmount, setDebitAmount] = useState('');
    const [debitDesc, setDebitDesc] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchDetails = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await adminWalletsApi.showWallet(id);
            const result = response.data;
            if (result.status && result.data) {
                const innerData = result.data;
                const walletData = innerData.wallet || innerData;
                if (walletData && !walletData.transactions && innerData.transactions) {
                    walletData.transactions = innerData.transactions;
                } else if (walletData && !walletData.transactions) {
                    walletData.transactions = { data: [], last_page: 1 };
                }
                setWallet(walletData);
            }
        } catch (err) {
            toast.error('فشل تحميل تفاصيل المحفظة');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const handleManualAdjustment = async (type: 'credit' | 'debit') => {
        if (!id) return;
        const amount = type === 'credit' ? creditAmount : debitAmount;
        const desc = type === 'credit' ? creditDesc : debitDesc;

        if (!amount || Number(amount) <= 0) {
            toast.warn('يرجى إدخال مبلغ صحيح');
            return;
        }
        if (!desc) {
            toast.warn('يرجى إدخال سبب العملية');
            return;
        }

        setSubmitting(true);
        try {
            if (type === 'credit') {
                await adminWalletsApi.manualCredit(id, { amount: Number(amount), description: desc });
                toast.success('تمت إضافة الرصيد بنجاح');
                setCreditAmount('');
                setCreditDesc('');
            } else {
                await adminWalletsApi.manualDebit(id, { amount: Number(amount), description: desc });
                toast.success('تم خصم الرصيد بنجاح');
                setDebitAmount('');
                setDebitDesc('');
            }
            fetchDetails();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'فشلت العملية');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !wallet) return <div className="loading-p">جاري التحميل...</div>;

    return (
        <div className="wallet-details-container">
            <Link to="/admin/wallets" className="btn-back">
                <FaArrowRight /> العودة لقائمة المحافظ
            </Link>

            <div className="details-grid">
                {/* Main Content: Transactions */}
                <div className="transactions-main-card">
                    <div className="tx-header">
                        <h2><FaHistory /> سجل المعاملات</h2>
                        <button className="action-btn" onClick={fetchDetails}><FaSyncAlt /></button>
                    </div>

                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>نوع العملية</th>
                                <th>المبلغ</th>
                                <th>الوصف</th>
                                <th>التاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!wallet?.transactions?.data?.length ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                                        لا توجد معاملات مسجلة لهذه المحفظة
                                    </td>
                                </tr>
                            ) : (
                                wallet.transactions.data.map(tx => (
                                    <tr key={tx.id}>
                                        <td>
                                            <span className={`tx-type-tag ${tx.type}`}>
                                                {tx.type === 'credit' ? 'إيداع' : 'خصم'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`tx-amount-val ${tx.type}`}>
                                                {tx.type === 'credit' ? '+' : '-'} {tx.amount.toLocaleString()} <small>ج.م</small>
                                            </span>
                                        </td>
                                        <td className="tx-desc-cell">
                                            <span className="tx-desc-text">{tx.description}</span>
                                            {tx.meta?.withdrawal_request_id && (
                                                <small className="tx-meta">طلب سحب #{tx.meta.withdrawal_request_id}</small>
                                            )}
                                        </td>
                                        <td>
                                            <span className="tx-meta" style={{ color: '#64748b' }}>
                                                {new Date(tx.created_at).toLocaleString('ar-EG')}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Sidebar: Profile & Forms */}
                <aside className="wallet-sidebar">
                    <div className="wallet-info-card">
                        <div className="user-profile-large">
                            <div className="avatar-large">
                                {wallet?.walletable?.avatar ? (
                                    <img src={wallet.walletable.avatar} alt="" />
                                ) : (
                                    <FaUserCircle />
                                )}
                            </div>
                            <span className="user-name-large">{wallet?.walletable?.name || 'صاحب المحفظة'}</span>
                            <small className="owner-id">Wallet ID: #{wallet?.id}</small>
                        </div>

                        <div className="wallet-balance-display">
                            <span className="balance-label">الرصيد الكلي</span>
                            <div className="balance-val">
                                {wallet?.balance.toLocaleString() || '0'} <small>ج.م</small>
                            </div>
                        </div>

                        <div className="adjustment-forms">
                            {/* Credit Form */}
                            <div className="form-card credit">
                                <h3><FaPlusCircle /> إيداع يدوي</h3>
                                <div className="adj-form">
                                    <input 
                                        type="number" 
                                        placeholder="المبلغ" 
                                        className="adj-input"
                                        value={creditAmount}
                                        onChange={e => setCreditAmount(e.target.value)}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="السبب (مثال: تعويض)" 
                                        className="adj-input"
                                        value={creditDesc}
                                        onChange={e => setCreditDesc(e.target.value)}
                                    />
                                    <button 
                                        className="adj-btn credit"
                                        onClick={() => handleManualAdjustment('credit')}
                                        disabled={submitting}
                                    >
                                        إيداع رصيد
                                    </button>
                                </div>
                            </div>

                            {/* Debit Form */}
                            <div className="form-card debit">
                                <h3><FaMinusCircle /> خصم يدوي</h3>
                                <div className="adj-form">
                                    <input 
                                        type="number" 
                                        placeholder="المبلغ" 
                                        className="adj-input"
                                        value={debitAmount}
                                        onChange={e => setDebitAmount(e.target.value)}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="السبب (مثال: غرامة)" 
                                        className="adj-input"
                                        value={debitDesc}
                                        onChange={e => setDebitDesc(e.target.value)}
                                    />
                                    <button 
                                        className="adj-btn debit"
                                        onClick={() => handleManualAdjustment('debit')}
                                        disabled={submitting}
                                    >
                                        خصم رصيد
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default WalletDetails;
