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
    transferFunds,
    getMyWithdrawalRequests,
    type WalletOverview,
    type Transaction,
    type WithdrawalRequest
} from "../../../Api/wallet.api";
import { useAuth } from "../../../hooks/useAuth";
import { authStorage } from "../../../context/auth/auth.storage";
import "./WalletPage.css";

const WalletPage: React.FC = () => {
    const { isAuthenticated, isLoading: authLoading, userType: activeRole } = useAuth();
    const [data, setData] = useState<WalletOverview | null>(null);
    const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
    const [activeTab, setActiveTab] = useState<"transactions" | "withdrawals">("transactions");
    const [loading, setLoading] = useState(true);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [showAddFundsModal, setShowAddFundsModal] = useState(false);
    const [showTransferModal, setShowTransferModal] = useState(false);

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

    const [transferAmount, setTransferAmount] = useState("");
    const [targetWalletId, setTargetWalletId] = useState("");
    const [transferDescription, setTransferDescription] = useState("");

    const fetchData = async (isRetry = false) => {
        const token = authStorage.getToken();
        if (!token) {
            setLoading(false);
            return;
        }

        // Get role: prefer context value, fallback to storage (handles hydration timing gap)
        const role = activeRole || authStorage.getUserType();

        if (!role) {
            // Role not loaded yet — retry shortly
            if (!isRetry) setTimeout(() => fetchData(true), 1500);
            else setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const [overview, requests] = await Promise.all([
                getWalletOverview(role),
                getMyWithdrawalRequests()
            ]);
            setData(overview);
            setWithdrawalRequests(requests);
        } catch (error: any) {
            // Handle 401 gracefully, especially right after redirect
            if (error.response?.status === 401 && !isRetry) {
                console.warn("Retrying wallet fetch after 401...");
                setTimeout(() => fetchData(true), 2000);
                return;
            }

            console.error("Failed to fetch wallet data", error);
            if (error.response?.status === 404 || error.response?.data?.message?.includes("wallet")) {
                setData(null);
            } else {
                if (error.response?.status !== 401) {
                    toast.error("فشل في تحميل بيانات المحفظة");
                }
                setData(null);
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
        // Only run when auth state is determined
        if (authLoading) return;

        const params = new URLSearchParams(window.location.search);
        const status = params.get("status");

        if (isAuthenticated) {
            if (status === "success") {
                toast.success("تم شحن الرصيد بنجاح! يتم الآن تحديث محفظتك...");
                window.history.replaceState({}, document.title, window.location.pathname);
                // Give the webhook and auth profile retry enough time to finish before fetching
                setTimeout(() => fetchData(), 3500);
            } else {
                fetchData();
                if (status === "failed") {
                    toast.error("فشلت عملية الدفع. يرجى المحاولة مرة أخرى.");
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            }
        } else {
            // Token exists but isAuthenticated not set yet — wait briefly
            const token = authStorage.getToken();
            if (token) {
                setTimeout(() => fetchData(), 1500);
            } else {
                setLoading(false);
            }
        }
    }, [isAuthenticated, authLoading]);

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

        const role = activeRole || authStorage.getUserType();
        try {
            const res = await addFunds(Number(addAmount), addFundsMethod, role);
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

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. إعادة جلب البيانات فوراً قبل التحويل للتأكد من الرصيد اللحظي
        await fetchData();

        const amount = Number(transferAmount);
        const currentBalance = Number(data?.wallet.balance || 0);

        console.log("� [Final Check Before Transfer]", {
            transfer_amount: amount,
            actual_balance_on_screen: currentBalance,
            sender_id: data?.wallet.id,
            role: activeRole
        });

        if (amount < 0.5) {
            toast.error("الحد الأدنى للتحويل هو 0.5 ج.م");
            return;
        }

        if (amount > currentBalance) {
            toast.error(`عفواً، رصيدك اللحظي (${currentBalance}) غير كافٍ. قد تحتاج لإعادة تسجيل الدخول بالرتبة الصحيحة.`);
            return;
        }

        try {
            setLoading(true);
            const res = await transferFunds({
                wallet_id: Number(targetWalletId),
                amount: amount,
                description: transferDescription
            });

            toast.success(res.message || "تم التحويل بنجاح");
            setShowTransferModal(false);
            setTransferAmount("");
            setTargetWalletId("");
            fetchData();
        } catch (error: any) {
            console.error("❌ [Server rejected transfer]", error.response?.data);
            const errorMessage = error.response?.data?.message || "رصيدك في قاعدة البيانات غير كافٍ لهذا الحساب.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
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
                        <div className="wallet-meta">
                            {data?.wallet.id && (
                                <div className="wallet-id-badge">
                                    المحفظة: <strong>#{data.wallet.id}</strong>
                                </div>
                            )}
                            <div className={`role-badge ${activeRole}`}>
                                {activeRole === 'craftsman' ? 'صنايعي' : activeRole === 'company' ? 'شركة' : 'حساب مستخدم'}
                            </div>
                        </div>
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
                        <button className="btn-action transfer" onClick={() => setShowTransferModal(true)}>
                            <FaArrowUp /> تحويل أموال
                        </button>
                    </div>
                </div>
            </header>

            {/* ===== Prominent Wallet ID ===== */}
            {data?.wallet.id && (
                <div className="wallet-id-prominent">
                    <div className="wip-left">
                        <span className="wip-label">رقم محفظتك</span>
                        <span className="wip-number">#{data.wallet.id}</span>
                        <span className="wip-hint">شارك هذا الرقم مع من يريد التحويل إليك</span>
                    </div>
                    <button
                        className="wip-copy-btn"
                        onClick={() => {
                            navigator.clipboard.writeText(String(data.wallet.id));
                            toast.success('تم نسخ رقم المحفظة ✅');
                        }}
                    >
                        📋 نسخ
                    </button>
                </div>
            )}

            {/* ===== Wallet Guide ===== */}
            <div className="wallet-guide">
                <h3 className="wg-title">📖 دليل استخدام المحفظة</h3>
                <div className="wg-grid">
                    {activeRole === 'user' && (
                        <>
                            <div className="wg-card">
                                <div className="wg-icon">💳</div>
                                <div className="wg-text">
                                    <strong>شحن الرصيد</strong>
                                    <p>أضف رصيداً لمحفظتك من خلال الضغط على "شحن الرصيد" واختر المبلغ.</p>
                                </div>
                            </div>
                            <div className="wg-card">
                                <div className="wg-icon">🛠️</div>
                                <div className="wg-text">
                                    <strong>دفع خدمة بالمحفظة</strong>
                                    <p>عند طلب خدمة، اختر "دفع بالمحفظة" — يُخصم المبلغ فور قبول الصنايعي.</p>
                                </div>
                            </div>
                            <div className="wg-card">
                                <div className="wg-icon">🔁</div>
                                <div className="wg-text">
                                    <strong>استرداد تلقائي</strong>
                                    <p>إذا رفض الصنايعي طلبك، يُسترد المبلغ فوراً لرصيدك دون أي خطوات إضافية.</p>
                                </div>
                            </div>
                            <div className="wg-card">
                                <div className="wg-icon">↗️</div>
                                <div className="wg-text">
                                    <strong>تحويل أموال</strong>
                                    <p>يمكنك تحويل رصيد لأي محفظة أخرى عبر إدخال رقمها في "تحويل أموال".</p>
                                </div>
                            </div>
                        </>
                    )}
                    {activeRole === 'craftsman' && (
                        <>
                            <div className="wg-card">
                                <div className="wg-icon">🔢</div>
                                <div className="wg-text">
                                    <strong>رقم محفظتك</strong>
                                    <p>رقمك الموضح أعلاه هو ما يُستخدم لتحويل أتعابك — شاركه مع العملاء.</p>
                                </div>
                            </div>
                            <div className="wg-card">
                                <div className="wg-icon">✅</div>
                                <div className="wg-text">
                                    <strong>استقبال المدفوعات</strong>
                                    <p>عند قبولك لطلب خدمة مدفوعة بالمحفظة، يُضاف المبلغ تلقائياً لرصيدك.</p>
                                </div>
                            </div>
                            <div className="wg-card">
                                <div className="wg-icon">💸</div>
                                <div className="wg-text">
                                    <strong>سحب الأرباح</strong>
                                    <p>اسحب أرباحك في أي وقت عبر "سحب الأرباح" ويُحوَّل لحسابك البنكي.</p>
                                </div>
                            </div>
                            <div className="wg-card">
                                <div className="wg-icon">📊</div>
                                <div className="wg-text">
                                    <strong>متابعة العمليات</strong>
                                    <p>كل تحويل وارد أو صادر يظهر في قسم "آخر العمليات" مع تفاصيله.</p>
                                </div>
                            </div>
                        </>
                    )}
                    {activeRole === 'company' && (
                        <>
                            <div className="wg-card">
                                <div className="wg-icon">🏢</div>
                                <div className="wg-text">
                                    <strong>محفظة الشركة</strong>
                                    <p>رقم محفظتك الموضح أعلاه يُستخدم لاستقبال التحويلات من العملاء والموظفين.</p>
                                </div>
                            </div>
                            <div className="wg-card">
                                <div className="wg-icon">💳</div>
                                <div className="wg-text">
                                    <strong>شحن الرصيد</strong>
                                    <p>أضف رصيداً لحساب الشركة لتوزيعه أو استخدامه في المدفوعات الداخلية.</p>
                                </div>
                            </div>
                            <div className="wg-card">
                                <div className="wg-icon">↗️</div>
                                <div className="wg-text">
                                    <strong>تحويل للموظفين</strong>
                                    <p>حوّل الرواتب عبر "تحويل أموال" باستخدام رقم محفظة الموظف المباشرة.</p>
                                </div>
                            </div>
                            <div className="wg-card">
                                <div className="wg-icon">💸</div>
                                <div className="wg-text">
                                    <strong>سحب الأرباح</strong>
                                    <p>اسحب رصيد الشركة في أي وقت وسيُحوَّل لحسابك البنكي المسجل.</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <section className="transactions-section">
                <div className="section-header">
                    <div className="tab-switcher">
                        <button
                            className={`tab-btn ${activeTab === "transactions" ? "active" : ""}`}
                            onClick={() => setActiveTab("transactions")}
                        >
                            <FaHistory /> آخر العمليات
                        </button>
                        <button
                            className={`tab-btn ${activeTab === "withdrawals" ? "active" : ""}`}
                            onClick={() => setActiveTab("withdrawals")}
                        >
                            <FaArrowDown /> طلبات السحب
                        </button>
                    </div>
                </div>

                <div className="transactions-list">
                    {activeTab === "transactions" ? (
                        data?.recentTransactions && data.recentTransactions.length > 0 ? (
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
                        )
                    ) : (
                        withdrawalRequests && withdrawalRequests.length > 0 ? (
                            withdrawalRequests.map((req: WithdrawalRequest) => (
                                <div key={req.id} className="transaction-item withdrawal-req">
                                    <div className={`tx-icon debit`}>
                                        <FaArrowDown />
                                    </div>
                                    <div className="tx-details">
                                        <h4 className="tx-desc">طلب سحب {req.payout_method === 'bank' ? 'بنكي' : 'محفظة'}</h4>
                                        <span className="tx-date">
                                            {new Date(req.created_at).toLocaleDateString("ar-EG")}
                                        </span>
                                    </div>
                                    <div className="tx-amount debit">
                                        {req.amount.toLocaleString()} ج.م
                                    </div>
                                    <div className={`tx-status ${req.status}`}>
                                        {req.status === "completed" ? "تم التحويل" :
                                            req.status === "approved" ? "تم القبول" :
                                                req.status === "rejected" ? "مرفوض" : "قيد المراجعة"}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-transactions">لا توجد طلبات سحب حالية</div>
                        )
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
            {/* Transfer Modal */}
            {showTransferModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>تحويل أموال</h3>
                        <form onSubmit={handleTransfer}>
                            <div className="form-group">
                                <label>رقم المحفظة المستلمة (Wallet ID)</label>
                                <input
                                    type="number"
                                    value={targetWalletId}
                                    onChange={(e) => setTargetWalletId(e.target.value)}
                                    placeholder="أدخل رقم المحفظة (مثال: 5)"
                                    required
                                />
                                <small className="info-text">يمكنك الحصول على رقم المحفظة من صاحب الحساب الآخر.</small>
                            </div>

                            <div className="form-group">
                                <label>المبلغ المراد تحويله</label>
                                <input
                                    type="number"
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
                                    placeholder="0.00"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>ملاحظات (اختياري)</label>
                                <input
                                    type="text"
                                    value={transferDescription}
                                    onChange={(e) => setTransferDescription(e.target.value)}
                                    placeholder="مثال: تحويل الدفعة الأولى"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="btn-confirm">تأكيد التحويل</button>
                                <button type="button" className="btn-cancel" onClick={() => setShowTransferModal(false)}>إلغاء</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WalletPage;
