import React, { useEffect, useState } from "react";
import {
    FaWallet,
    FaArrowUp,
    FaArrowDown,
    FaPlus,
    FaHistory,
    FaUniversity,
    FaMobileAlt,
    FaCreditCard
} from "react-icons/fa";
import { toast } from "react-toastify";
import {
    getWalletOverview,
    addFunds,
    withdraw,
    createWallet,
    type WalletOverview,
    type Transaction
} from "../../../Api/wallet.api";
import "./WalletPage.css";

const WalletPage: React.FC = () => {
    const [data, setData] = useState<WalletOverview | null>(null);
    const [loading, setLoading] = useState(true);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showAddFundsModal, setShowAddFundsModal] = useState(false);

    // Form States
    const [withdrawAmount, setWithdrawAmount] = useState("");
    const [payoutMethod, setPayoutMethod] = useState<"bank" | "mobile_wallet">("mobile_wallet");
    const [payoutDetails, setPayoutDetails] = useState({
        mobile_number: "",
        account_name: "",
        account_number: "",
        bank_name: ""
    });

    const [addAmount, setAddAmount] = useState("");
    const [addFundsMethod, setAddFundsMethod] = useState<"card" | "wallet">("card");

    const fetchData = async () => {
        try {
            setLoading(true);
            const overview = await getWalletOverview();
            setData(overview);
        } catch (error: any) {
            console.error("Failed to fetch wallet data", error);
            // If the error indicates no wallet, we set data to null and loading to false
            // which will trigger the "No Wallet" view
            if (error.response?.status === 404 || error.response?.data?.message?.includes("wallet")) {
                setData(null);
            } else {
                toast.error("فشل في تحميل بيانات المحفظة");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWallet = async () => {
        try {
            setLoading(true);
            await createWallet();
            toast.success("تم إنشاء المحفظة بنجاح");
            fetchData();
        } catch (error) {
            toast.error("فشل إنشاء المحفظة");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // ✅ Handle payment redirection status (success/failed)
        const params = new URLSearchParams(window.location.search);
        const status = params.get("status");

        if (status === "success") {
            toast.success("تم شحن الرصيد بنجاح! سيتم تحديث رصيدك خلال ثوانٍ.");
            // Clean the URL parameters without reloading the page
            window.history.replaceState({}, document.title, window.location.pathname);
            // Refresh data to show the updated balance
            fetchData();
        } else if (status === "failed") {
            toast.error("فشلت عملية الدفع. يرجى التأكد من بياناتك والمحاولة مرة أخرى.");
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!withdrawAmount || Number(withdrawAmount) <= 0) {
            toast.error("يرجى إدخال مبلغ صحيح");
            return;
        }

        try {
            await withdraw({
                amount: Number(withdrawAmount),
                payout_method: payoutMethod,
                payout_details: payoutDetails
            });
            toast.success("تم تقديم طلب السحب بنجاح");
            setShowWithdrawModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "فشل طلب السحب");
        }
    };

    const handleAddFunds = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addAmount || Number(addAmount) <= 0) {
            toast.error("يرجى إدخال مبلغ صحيح");
            return;
        }

        try {
            const res = await addFunds(Number(addAmount), addFundsMethod);
            if (res.redirect_url) {
                window.location.href = res.redirect_url;
            } else {
                toast.success("تمت العملية بنجاح");
                setShowAddFundsModal(false);
                fetchData();
            }
        } catch (error) {
            toast.error("فشل في بدء عملية الدفع");
        }
    };

    if (loading && !data) {
        return (
            <div className="wallet-loading-screen">
                <div className="loader"></div>
                <p>جاري تحميل المحفظة...</p>
            </div>
        );
    }

    if (!data || !data.wallet) {
        return (
            <div className="no-wallet-container">
                <div className="no-wallet-card">
                    <div className="icon-box">
                        <FaWallet size={60} />
                    </div>
                    <h2>ليس لديك محفظة بعد</h2>
                    <p>أنشئ محفظتك الآن لتبدأ في إدارة أرباحك وعمليات الدفع بسهولة وأمان.</p>
                    <button className="btn-create-wallet" onClick={handleCreateWallet} disabled={loading}>
                        {loading ? "جاري الإنشاء..." : "إنشاء محفظة جديدة"}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="wallet-page">
            <header className="wallet-header">
                <div className="wallet-balance-card">
                    <div className="balance-info">
                        <span className="balance-label">الرصيد المتاح</span>
                        <h2 className="balance-amount">
                            {data?.wallet.balance.toLocaleString()} <span>ج.م</span>
                        </h2>
                    </div>
                    <div className="balance-icon">
                        <FaWallet size={40} />
                    </div>

                    <div className="wallet-actions">
                        <button className="btn-action deposit" onClick={() => setShowAddFundsModal(true)}>
                            <FaPlus /> شحن الرصيد
                        </button>
                        <button className="btn-action withdraw" onClick={() => setShowWithdrawModal(true)}>
                            <FaArrowDown /> سحب الأرباح
                        </button>
                    </div>
                </div>
            </header>

            <section className="transactions-section">
                <div className="section-header">
                    <h3 className="section-title">
                        <FaHistory /> آخر العمليات
                    </h3>
                </div>

                <div className="transactions-list">
                    {data?.recentTransactions && data.recentTransactions.length > 0 ? (
                        data.recentTransactions.map((tx: Transaction) => (
                            <div key={tx.id} className="transaction-item">
                                <div className={`tx-icon ${tx.type}`}>
                                    {tx.type === "credit" ? <FaArrowUp /> : <FaArrowDown />}
                                </div>
                                <div className="tx-details">
                                    <h4 className="tx-desc">{tx.description}</h4>
                                    <span className="tx-date">
                                        {new Date(tx.created_at).toLocaleDateString("ar-EG")}
                                    </span>
                                </div>
                                <div className={`tx-amount ${tx.type}`}>
                                    {tx.type === "credit" ? "+" : "-"}
                                    {tx.amount.toLocaleString()} ج.م
                                </div>
                                <div className={`tx-status ${tx.status}`}>
                                    {tx.status === "completed" ? "مكتمل" : (tx.status === "pending" ? "قيد الانتظار" : "فاشل")}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-transactions">لا توجد عمليات سابقة</div>
                    )}
                </div>
            </section>

            {/* Withdraw Modal */}
            {showWithdrawModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>سحب الأرباح</h3>
                        <form onSubmit={handleWithdraw}>
                            <div className="form-group">
                                <label>المبلغ المراد سحبه</label>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>طريقة السحب</label>
                                <div className="method-selector">
                                    <button
                                        type="button"
                                        className={payoutMethod === "mobile_wallet" ? "active" : ""}
                                        onClick={() => setPayoutMethod("mobile_wallet")}
                                    >
                                        <FaMobileAlt /> محفظة إلكترونية
                                    </button>
                                    <button
                                        type="button"
                                        className={payoutMethod === "bank" ? "active" : ""}
                                        onClick={() => setPayoutMethod("bank")}
                                    >
                                        <FaUniversity /> حساب بنكي
                                    </button>
                                </div>
                            </div>

                            {payoutMethod === "mobile_wallet" ? (
                                <div className="form-group">
                                    <label>رقم المحفظة (فودافون كاش، إلخ)</label>
                                    <input
                                        type="text"
                                        value={payoutDetails.mobile_number}
                                        onChange={(e) => setPayoutDetails({ ...payoutDetails, mobile_number: e.target.value })}
                                        placeholder="01xxxxxxxxx"
                                        required
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="form-group">
                                        <label>اسم صاحب الحساب</label>
                                        <input
                                            type="text"
                                            value={payoutDetails.account_name}
                                            onChange={(e) => setPayoutDetails({ ...payoutDetails, account_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>رقم الحساب / IBAN</label>
                                        <input
                                            type="text"
                                            value={payoutDetails.account_number}
                                            onChange={(e) => setPayoutDetails({ ...payoutDetails, account_number: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>اسم البنك</label>
                                        <input
                                            type="text"
                                            value={payoutDetails.bank_name}
                                            onChange={(e) => setPayoutDetails({ ...payoutDetails, bank_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div className="modal-actions">
                                <button type="submit" className="btn-confirm">تأكيد السحب</button>
                                <button type="button" className="btn-cancel" onClick={() => setShowWithdrawModal(false)}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Funds Modal */}
            {showAddFundsModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>شحن الرصيد</h3>
                        <form onSubmit={handleAddFunds}>
                            <div className="form-group">
                                <label>المبلغ</label>
                                <input
                                    type="number"
                                    value={addAmount}
                                    onChange={(e) => setAddAmount(e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>طريقة الدفع</label>
                                <div className="method-selector">
                                    <button
                                        type="button"
                                        className={addFundsMethod === "card" ? "active" : ""}
                                        onClick={() => setAddFundsMethod("card")}
                                    >
                                        <FaCreditCard /> بطاقة بنكية
                                    </button>
                                    <button
                                        type="button"
                                        className={addFundsMethod === "wallet" ? "active" : ""}
                                        onClick={() => setAddFundsMethod("wallet")}
                                    >
                                        <FaMobileAlt /> محفظة إلكترونية
                                    </button>
                                </div>
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="btn-confirm">متابعة للدفع</button>
                                <button type="button" className="btn-cancel" onClick={() => setShowAddFundsModal(false)}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletPage;
