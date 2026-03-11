import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
    FiShoppingCart, FiTrash2, FiMapPin, FiCreditCard,
    FiTruck, FiCheckCircle, FiArrowRight, FiShield, FiSmartphone
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { getCartItems, removeFromCart } from "../../Api/store/cart.api";
import { createOrder } from "../../Api/store/orders.api";
import { getWalletOverview } from "../../Api/wallet.api";
import { getFullImageUrl } from "../../utils/imageUrl";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../context/NotificationContext";
import PhoneValidationMeter from "../../components/ui/PhoneValidationMeter/PhoneValidationMeter";
import "./StoreCartTab.css";

interface StoreCartTabProps {
    onCartCountChange?: (count: number) => void;
    onGoToOrders?: () => void;
}

type CartView = "cart" | "checkout" | "success";

const StoreCartTab: React.FC<StoreCartTabProps> = ({ onCartCountChange, onGoToOrders }) => {
    const { isAuthenticated, user } = useAuth();
    const { addNotification } = useNotifications();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartView, setCartView] = useState<CartView>("cart");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        shipping_address: "",
        phone: "",
        payment_method: "cash",
    });

    const [walletBalance, setWalletBalance] = useState<number | null>(null);

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) { setLoading(false); return; }
        try {
            setLoading(true);
            const data = await getCartItems();
            const items = Array.isArray(data) ? data : (data?.data ?? []);
            setCartItems(items);
            onCartCountChange?.(items.length);
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, onCartCountChange]);

    const fetchWallet = useCallback(async () => {
        if (!isAuthenticated) return;
        try {
            const { wallet } = await getWalletOverview();
            setWalletBalance(wallet.balance);
        } catch { /* silent */ }
    }, [isAuthenticated]);

    useEffect(() => {
        fetchCart();
        fetchWallet();
    }, [fetchCart, fetchWallet]);

    const handleRemove = async (itemId: number) => {
        try {
            await removeFromCart(itemId);
            const updated = cartItems.filter(i => i.id !== itemId);
            setCartItems(updated);
            onCartCountChange?.(updated.length);
            toast.success("تم حذف المنتج من السلة");
        } catch {
            toast.error("فشل حذف المنتج");
        }
    };

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

    const handleConfirmOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.shipping_address || !formData.phone) {
            toast.error("يرجى إكمال جميع البيانات المطلوبة");
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
                    title: "تم استلام طلبك ✅",
                    message: `طلبك رقم #${firstId || ""} قيد الانتظار. سيتم التواصل معك قريباً.`,
                    type: "order_status",
                    orderId: firstId,
                    recipientId: user?.id || 0,
                    recipientType: "user",
                    variant: "success",
                });

                setCartView("success");
                setCartItems([]);
                onCartCountChange?.(0);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "فشل تسجيل الطلب");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="cart-tab-container">
                <div className="cart-tab-empty">
                    <FiShield size={64} />
                    <h3>يجب تسجيل الدخول أولاً</h3>
                    <p>سجّل دخولك لتتمكن من التسوق وإدارة سلتك</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="cart-tab-container">
                <div className="cart-tab-loading">
                    <div className="modern-spinner"></div>
                    <p>جاري تحميل السلة...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-tab-container">
            <AnimatePresence mode="wait">
                {cartView === "success" ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="cart-tab-success"
                    >
                        <FiCheckCircle className="success-icon-big" />
                        <h2>تم استلام طلبك بنجاح!</h2>
                        <p>شكراً لثقتك بنا. طلبك قيد المراجعة الآن.</p>
                        <div className="success-actions">
                            <button className="cart-tab-btn-primary" onClick={() => setCartView("cart")}>
                                العودة للمتجر
                            </button>
                            <button className="btn-outline-prem" onClick={onGoToOrders}>
                                متابعة الطلبات
                            </button>
                        </div>
                    </motion.div>
                ) : cartItems.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="cart-tab-empty"
                    >
                        <FiShoppingCart size={64} />
                        <h3>سلتك فارغة حالياً</h3>
                        <p>تصفح المنتجات وأضف ما يعجبك هنا</p>
                    </motion.div>
                ) : (
                    <div className="cart-tab-layout">
                        <div className="cart-tab-header">
                            {cartView === "checkout" ? (
                                <button className="cart-tab-back-btn" onClick={() => setCartView("cart")}>
                                    <FiArrowRight /> رجوع للسلة
                                </button>
                            ) : (
                                <h2><FiShoppingCart /> السلة الذكية</h2>
                            )}
                            <div className="cart-tab-count">{cartItems.length} عنصر</div>
                        </div>

                        <AnimatePresence mode="wait">
                            {cartView === "cart" ? (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="cart-tab-items"
                                >
                                    {cartItems.map(item => (
                                        <div key={item.id} className="cart-tab-item">
                                            <img
                                                src={getFullImageUrl(item.product?.main_image) ?? "https://placehold.co/80?text=PS"}
                                                alt={item.product?.name}
                                                className="cart-tab-item-img"
                                            />
                                            <div className="cart-tab-item-info">
                                                <p className="cart-tab-item-name">{item.product?.name}</p>
                                                <p className="cart-tab-item-price">
                                                    {Number(item.product?.discount_price || item.product?.price).toLocaleString()} ج.م
                                                    {item.quantity > 1 && <small> × {item.quantity}</small>}
                                                </p>
                                            </div>
                                            <button className="cart-tab-remove-btn" title="حذف" onClick={() => handleRemove(item.id)}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    onSubmit={handleConfirmOrder}
                                    className="cart-tab-form"
                                >
                                    <div className="cart-field-group">
                                        <label><FiMapPin /> عنوان التوصيل بالتفصيل</label>
                                        <input
                                            type="text"
                                            value={formData.shipping_address}
                                            onChange={e => setFormData(d => ({ ...d, shipping_address: e.target.value }))}
                                            placeholder="المحافظة، المنطقة، اسم الشارع، رقم العقار..."
                                            required
                                        />
                                    </div>

                                    <div className="cart-field-group">
                                        <label><FiSmartphone /> رقم التواصل</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => setFormData(d => ({ ...d, phone: e.target.value.replace(/\D/g, '').slice(0, 11) }))}
                                            placeholder="رقم الموبايل (مثال: 01012345678)"
                                            required
                                        />
                                        <PhoneValidationMeter phone={formData.phone} />
                                    </div>

                                    <div className="cart-field-group">
                                        <label><FiCreditCard /> اختر طريقة الدفع</label>
                                        <div className="cart-payment-opts">
                                            <label className={`cart-payment-opt ${formData.payment_method === "cash" ? "active" : ""}`}>
                                                <input type="radio" checked={formData.payment_method === "cash"}
                                                    onChange={() => setFormData(d => ({ ...d, payment_method: "cash" }))} />
                                                <div className="pm-opt-title">
                                                    <FiTruck />
                                                    <span>الدفع نقداً</span>
                                                </div>
                                            </label>

                                            <label className={`cart-payment-opt ${formData.payment_method === "wallet" ? "active" : ""}`}>
                                                <input type="radio" checked={formData.payment_method === "wallet"}
                                                    onChange={() => setFormData(d => ({ ...d, payment_method: "wallet" }))} />
                                                <div className="pm-opt-title">
                                                    <FiCreditCard />
                                                    <span>المحفظة</span>
                                                </div>
                                                {walletBalance !== null && (
                                                    <div className={`balance-info ${walletBalance < totalPrice ? 'balance-low' : 'balance-ok'}`}>
                                                        رصيدك: {walletBalance.toLocaleString()} ج.م
                                                    </div>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    {formData.payment_method === "wallet" && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="cart-wallet-info"
                                        >
                                            <div className="wallet-note">
                                                <FiShield /> سيتم التحويل لمحفظة الشركة مباشرة لضمان حقوقك
                                            </div>
                                            <div className="mini-company-wallets">
                                                {companies.map(comp => (
                                                    <div key={comp.id} className="mini-wallet-item">
                                                        <span>{comp.name}</span>
                                                        <code>{comp.wallet_id}</code>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.form>
                            )}
                        </AnimatePresence>

                        <div className="cart-tab-footer">
                            <div className="cart-tab-total">
                                <span>الإجمالي النهائي</span>
                                <strong>{totalPrice.toLocaleString()} ج.م</strong>
                            </div>
                            {cartView === "cart" ? (
                                <button className="cart-tab-btn-primary" onClick={() => setCartView("checkout")}>
                                    الاستمرار لبيانات الشحن
                                </button>
                            ) : (
                                <button className="cart-tab-btn-primary" onClick={handleConfirmOrder} disabled={isSubmitting}>
                                    {isSubmitting ? "جاري المعالجة..." : "تأكيد وإتمام الطلب ✓"}
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StoreCartTab;
