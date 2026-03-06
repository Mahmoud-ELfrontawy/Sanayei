import React, { useState, useEffect, useMemo } from "react";
import {
    FiMapPin, FiCreditCard, FiTruck, FiCheckCircle,
    FiSmartphone, FiInfo, FiShield, FiLock, FiArrowRight
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { getCartItems } from "../../Api/store/cart.api";
import { createOrder } from "../../Api/store/orders.api";
import { getWalletOverview } from "../../Api/wallet.api";
import { useNotifications } from "../../context/NotificationContext";
import { useAuth } from "../../hooks/useAuth";
import "./CheckoutPage.css";

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    const [formData, setFormData] = useState({
        shipping_address: "",
        payment_method: "cash",
        phone: ""
    });

    const [walletBalance, setWalletBalance] = useState<number | null>(null);

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const data = await getCartItems();
                if (!data || data.length === 0) {
                    toast.warn("سلتك فارغة، لا يمكنك إتمام الطلب");
                    navigate("/store");
                    return;
                }
                setCartItems(data);
            } catch (error) {
                console.error("Fetch Cart Error:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchWallet = async () => {
            try {
                const { wallet } = await getWalletOverview();
                setWalletBalance(wallet.balance);
            } catch (error) {
                console.error("Fetch Wallet Error:", error);
            }
        };

        fetchCart();
        fetchWallet();
    }, [navigate]);

    const totalPrice = useMemo(() => cartItems.reduce((sum, item) => {
        const price = Number(item.product?.discount_price || item.product?.price || 0);
        return sum + price * item.quantity;
    }, 0), [cartItems]);

    const companies = useMemo(() => {
        const map = new Map();
        cartItems.forEach(item => {
            const comp = item.product?.company;
            if (comp && !map.has(comp.id)) {
                map.set(comp.id, {
                    id: comp.id,
                    name: comp.company_name || "شركة غير معروفة",
                    phone: comp.phone || comp.user?.phone || "01xxxxxxxxx",
                    wallet_id: comp.wallet?.wallet_id || comp.phone || `W-${comp.id + 1000}`
                });
            }
        });
        return Array.from(map.values());
    }, [cartItems]);

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.shipping_address || !formData.phone) {
            toast.error("يرجى إدخال جميع البيانات المطلوبة");
            return;
        }

        if (formData.payment_method === "wallet") {
            if (walletBalance === null || walletBalance < totalPrice) {
                toast.error("عذراً، رصيدك في المحفظة غير كافٍ لإتمام عملية الشراء");
                return;
            }
        }

        try {
            setIsSubmitting(true);
            const res = await createOrder({
                shipping_address: `${formData.shipping_address} - الهاتف: ${formData.phone}`,
                payment_method: formData.payment_method,
            });

            if (res.success) {
                const firstId = Array.isArray(res.orders) ? res.orders[0]?.id : 0;
                addNotification({
                    title: "تم استلام طلبك بنجاح ✅",
                    message: `طلبك رقم #${firstId || ""} قيد الانتظار. سيتم التواصل معك قريباً لتأكيد التوصيل.`,
                    type: "order_status",
                    orderId: firstId,
                    recipientId: user?.id || 0,
                    recipientType: "user",
                    variant: "success",
                });
                setOrderSuccess(true);
                toast.success("تم إرسال الطلب بنجاح!");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "فشل تسجيل الطلب، يرجى المحاولة لاحقاً");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="checkout-loading-screen">
                <div className="modern-spinner"></div>
                <p>جاري تجهيز سلة المشتريات...</p>
            </div>
        );
    }

    if (orderSuccess) {
        return (
            <div className="checkout-success-container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="success-content-card"
                >
                    <div className="success-icon-wrapper">
                        <FiCheckCircle />
                    </div>
                    <h2>تم إتمام طلبك بنجاح!</h2>
                    <p>شكراً لتسوقك معنا. يمكنك متابعة حالة طلبك من خلال صفحة الطلبات الخاصة بك.</p>
                    <div className="success-actions">
                        <button className="btn-primary-premium" onClick={() => navigate("/dashboard/orders")}>
                            متابعة طلباتي <FiArrowRight />
                        </button>
                        <button className="btn-outline-premium" onClick={() => navigate("/store")}>
                            العودة للمتجر
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="checkout-master-container">
            <div className="checkout-content-wrapper">
                <div className="checkout-page-header">
                    <button className="back-btn-minimal" onClick={() => navigate(-1)}>
                        <FiArrowRight /> العودة للسابق
                    </button>
                    <h1>إتمام الشراء</h1>
                </div>

                <div className="checkout-main-grid">
                    <div className="checkout-form-flow">
                        {/* الشحن */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="checkout-glass-card"
                        >
                            <div className="card-header-premium">
                                <div className="header-icon"><FiMapPin /></div>
                                <div className="header-text">
                                    <h3>عنوان الشحن</h3>
                                    <span>أين تريد استلام طلبك؟</span>
                                </div>
                            </div>
                            <div className="card-body-premium">
                                <form className="premium-form-stack">
                                    <div className="premium-input-group">
                                        <label>العنوان بالتفصيل</label>
                                        <textarea
                                            value={formData.shipping_address}
                                            onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                                            placeholder="المحافظة، المنطقة، اسم الشارع، رقم العقار..."
                                            required
                                        />
                                    </div>
                                    <div className="premium-input-group">
                                        <label>رقم هاتف للتواصل</label>
                                        <div className="input-with-icon">
                                            <FiSmartphone />
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="01xxxxxxxxx"
                                                required
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </motion.div>

                        {/* الدفع */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="checkout-glass-card"
                        >
                            <div className="card-header-premium">
                                <div className="header-icon"><FiCreditCard /></div>
                                <div className="header-text">
                                    <h3>طريقة الدفع</h3>
                                    <span>اختر الوسيلة المناسبة لك</span>
                                </div>
                            </div>
                            <div className="card-body-premium">
                                <div className="payment-stack">
                                    <label className={`payment-card-opt ${formData.payment_method === "cash" ? "selected" : ""}`}>
                                        <input type="radio" checked={formData.payment_method === "cash"}
                                            onChange={() => setFormData({ ...formData, payment_method: "cash" })} />
                                        <div className="opt-indicator"></div>
                                        <FiTruck className="opt-icon" />
                                        <div className="opt-label">
                                            <strong>الدفع عند الاستلام</strong>
                                            <span>ادفع كاش عند وصول المنتج لباب منزلك</span>
                                        </div>
                                    </label>

                                    <label className={`payment-card-opt ${formData.payment_method === "wallet" ? "selected" : ""}`}>
                                        <input type="radio" checked={formData.payment_method === "wallet"}
                                            onChange={() => setFormData({ ...formData, payment_method: "wallet" })} />
                                        <div className="opt-indicator"></div>
                                        <FiSmartphone className="opt-icon" />
                                        <div className="opt-label">
                                            <strong>المحفظة الإلكترونية</strong>
                                            {walletBalance !== null && (
                                                <small className={walletBalance < totalPrice ? "low-bal" : "ok-bal"}>
                                                    رصيدك المتاح: {walletBalance.toLocaleString()} ج.م
                                                </small>
                                            )}
                                        </div>
                                    </label>
                                </div>

                                {formData.payment_method === "wallet" && (
                                    <div className="wallet-details-panel">
                                        <div className="info-badge-premium">
                                            <FiInfo /> سيتم الخصم من محفظتك فور التأكيد وتحويل الرصيد للشركات التالية
                                        </div>
                                        <div className="company-wallet-info-box">
                                            <h4>بيانات المحافظ المستلمة:</h4>
                                            {companies.map(comp => (
                                                <div key={comp.id} className="wallet-id-item-premium">
                                                    <span className="comp-name">{comp.name}</span>
                                                    <div className="wallet-id-tag">
                                                        <FiSmartphone /> {comp.wallet_id}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Summary */}
                    <aside className="checkout-summary-sidebar">
                        <div className="summary-sticky-card">
                            <h3>ملخص الطلب</h3>
                            <div className="summary-products-list">
                                {cartItems.map(item => (
                                    <div key={item.id} className="prod-summary-item">
                                        <img src={item.product?.main_image ? `/storage/${item.product.main_image}` : "https://placehold.co/60"} alt="" />
                                        <div className="prod-name-qty">
                                            <strong>{item.product?.name}</strong>
                                            <span>الكمية: {item.quantity}</span>
                                        </div>
                                        <div className="prod-price">
                                            {(Number(item.product?.discount_price || item.product?.price) * item.quantity).toLocaleString()} ج.م
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="summary-pricing-stack">
                                <div className="pricing-row-premium">
                                    <span>مجموع المنتجات</span>
                                    <span>{totalPrice.toLocaleString()} ج.م</span>
                                </div>
                                <div className="pricing-row-premium">
                                    <span>مصاريف الشحن</span>
                                    <span className="success-txt">مجاناً</span>
                                </div>
                                <div className="grand-total-premium">
                                    <span>الإجمالي</span>
                                    <strong>{totalPrice.toLocaleString()} ج.م</strong>
                                </div>
                            </div>

                            <button
                                className="complete-order-btn-premium"
                                onClick={handleSubmitOrder}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "جاري المعالجة..." : "تأكيد الطلب الآن"}
                            </button>

                            <div className="secure-footer-note">
                                <FiShield /> <FiLock /> تسوق آمن 100%
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
