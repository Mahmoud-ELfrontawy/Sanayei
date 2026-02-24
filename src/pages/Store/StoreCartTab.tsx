import React, { useState, useEffect, useCallback } from "react";
import {
    FiShoppingCart, FiTrash2, FiMapPin, FiCreditCard,
    FiTruck, FiCheckCircle, FiArrowRight
} from "react-icons/fi";
import { toast } from "react-toastify";
import { getCartItems, removeFromCart } from "../../Api/store/cart.api";
import { createOrder } from "../../Api/store/orders.api";
import { getFullImageUrl } from "../../utils/imageUrl";
import { useAuth } from "../../hooks/useAuth";
import "./StoreCartTab.css";

interface StoreCartTabProps {
    onCartCountChange?: (count: number) => void;
    onGoToOrders?: () => void;
}

type CartView = "cart" | "checkout" | "success";

const StoreCartTab: React.FC<StoreCartTabProps> = ({ onCartCountChange, onGoToOrders }) => {
    const { isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [cartView, setCartView] = useState<CartView>("cart");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [checkoutData, setCheckoutData] = useState({
        shipping_address: "",
        phone: "",
        payment_method: "cash",
    });

    const fetchCart = useCallback(async () => {
        if (!isAuthenticated) { setLoading(false); return; }
        try {
            setLoading(true);
            const data = await getCartItems();
            const items = Array.isArray(data) ? data : [];
            setCartItems(items);
            onCartCountChange?.(items.length);
        } catch {
            /* silent */
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, onCartCountChange]);

    useEffect(() => { fetchCart(); }, [fetchCart]);

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

    const totalPrice = cartItems.reduce((sum, item) => {
        const price = Number(item.product?.discount_price || item.product?.price || 0);
        return sum + price * item.quantity;
    }, 0);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkoutData.shipping_address || !checkoutData.phone) {
            toast.error("يرجى إكمال جميع البيانات المطلوبة");
            return;
        }
        try {
            setIsSubmitting(true);
            const res = await createOrder({
                shipping_address: `${checkoutData.shipping_address} - الهاتف: ${checkoutData.phone}`,
                payment_method: checkoutData.payment_method,
            });
            if (res.success) {
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

    /* ── Not logged in ── */
    if (!isAuthenticated) {
        return (
            <div className="cart-tab-container">
                <div className="cart-tab-empty">
                    <FiShoppingCart size={60} />
                    <h3>يجب تسجيل الدخول أولاً</h3>
                    <p>سجّل دخولك لعرض سلة مشترياتك</p>
                </div>
            </div>
        );
    }

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="cart-tab-container">
                <p className="cart-tab-loading">جاري تحميل السلة...</p>
            </div>
        );
    }

    /* ── Success ── */
    if (cartView === "success") {
        return (
            <div className="cart-tab-container">
                <div className="cart-tab-success">
                    <FiCheckCircle size={72} className="success-icon-big" />
                    <h2>شكراً لك! تم استلام طلبك 🎉</h2>
                    <p>طلبك قيد المراجعة وسيتم التواصل معك قريباً.</p>
                    <div className="success-actions">
                        <button className="cart-tab-btn-primary" onClick={() => { setCartView("cart"); }}>
                            العودة للسلة
                        </button>
                        <button className="cart-tab-btn-outline" onClick={onGoToOrders}>
                            عرض طلباتي
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Empty cart ── */
    if (cartItems.length === 0 && cartView === "cart") {
        return (
            <div className="cart-tab-container">
                <div className="cart-tab-empty">
                    <FiShoppingCart size={60} />
                    <h3>سلتك فارغة حالياً</h3>
                    <p>أضف منتجات من المتجر وستظهر هنا</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-tab-container">
            {/* ── Cart View ── */}
            {cartView === "cart" && (
                <div className="cart-tab-layout">
                    <div className="cart-tab-header">
                        <h2><FiShoppingCart /> سلة المشتريات</h2>
                        <span className="cart-tab-count">{cartItems.length} منتج</span>
                    </div>

                    <div className="cart-tab-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-tab-item">
                                <img
                                    src={getFullImageUrl(item.product?.main_image) ?? "https://placehold.co/80x80?text=?"}
                                    alt={item.product?.name}
                                    className="cart-tab-item-img"
                                />
                                <div className="cart-tab-item-info">
                                    <p className="cart-tab-item-name">{item.product?.name}</p>
                                    <p className="cart-tab-item-price">
                                        {Number(item.product?.discount_price || item.product?.price).toLocaleString()} ج.م
                                        {item.quantity > 1 && <span> × {item.quantity}</span>}
                                    </p>
                                </div>
                                <button className="cart-tab-remove-btn" onClick={() => handleRemove(item.id)} title="حذف">
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="cart-tab-footer">
                        <div className="cart-tab-total">
                            <span>الإجمالي</span>
                            <strong>{totalPrice.toLocaleString()} ج.م</strong>
                        </div>
                        <button className="cart-tab-btn-primary wide" onClick={() => setCartView("checkout")}>
                            إتمام الشراء →
                        </button>
                    </div>
                </div>
            )}

            {/* ── Checkout View ── */}
            {cartView === "checkout" && (
                <div className="cart-tab-layout">
                    <div className="cart-tab-header">
                        <button className="cart-tab-back-btn" onClick={() => setCartView("cart")}>
                            <FiArrowRight /> العودة للسلة
                        </button>
                        <h2>إتمام الشراء</h2>
                    </div>

                    <form onSubmit={handleCheckout} className="cart-tab-form">
                        <div className="cart-field-group">
                            <label><FiMapPin /> عنوان الشحن</label>
                            <textarea
                                value={checkoutData.shipping_address}
                                onChange={e => setCheckoutData(d => ({ ...d, shipping_address: e.target.value }))}
                                placeholder="مثال: القاهرة، مدينة نصر، شارع عباس العقاد"
                                required
                                rows={3}
                            />
                        </div>

                        <div className="cart-field-group">
                            <label>رقم الهاتف</label>
                            <input
                                type="tel"
                                value={checkoutData.phone}
                                onChange={e => setCheckoutData(d => ({ ...d, phone: e.target.value }))}
                                placeholder="01xxxxxxxxx"
                                required
                            />
                        </div>

                        <div className="cart-field-group">
                            <label><FiCreditCard /> طريقة الدفع</label>
                            <div className="cart-payment-opts">
                                <label className={`cart-payment-opt ${checkoutData.payment_method === "cash" ? "active" : ""}`}>
                                    <input type="radio" name="pm" value="cash"
                                        checked={checkoutData.payment_method === "cash"}
                                        onChange={() => setCheckoutData(d => ({ ...d, payment_method: "cash" }))} />
                                    <FiTruck /> الدفع عند الاستلام
                                </label>
                                <label className="cart-payment-opt disabled">
                                    <input type="radio" name="pm" value="card" disabled />
                                    <FiCreditCard /> بطاقة بنكية (قريباً)
                                </label>
                            </div>
                        </div>

                        {/* Order summary */}
                        <div className="cart-order-summary">
                            <h4>ملخص الطلب</h4>
                            {cartItems.map(item => (
                                <div key={item.id} className="cart-summary-row">
                                    <span>{item.product?.name} (×{item.quantity})</span>
                                    <span>{((Number(item.product?.discount_price || item.product?.price)) * item.quantity).toLocaleString()} ج.م</span>
                                </div>
                            ))}
                            <div className="cart-summary-row total-row">
                                <span>الإجمالي النهائي</span>
                                <strong>{totalPrice.toLocaleString()} ج.م</strong>
                            </div>
                        </div>

                        <button type="submit" className="cart-tab-btn-confirm" disabled={isSubmitting}>
                            {isSubmitting ? "جاري التأكيد..." : "تأكيد الطلب ✓"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default StoreCartTab;
