import React, { useState, useEffect } from "react";
import { FiMapPin, FiCreditCard, FiTruck, FiCheckCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getCartItems } from "../../Api/store/cart.api";
import { createOrder } from "../../Api/store/orders.api";
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
        payment_method: "cash", // Default to Cash on Delivery
        phone: ""
    });

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
        fetchCart();
    }, [navigate]);

    const totalPrice = cartItems.reduce((sum, item) => {
        const price = item.product.discount_price || item.product.price;
        return sum + (price * item.quantity);
    }, 0);

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.shipping_address || !formData.phone) {
            toast.error("يرجى إكمال جميع البيانات المطلوبة");
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await createOrder({
                shipping_address: `${formData.shipping_address} - الهاتف: ${formData.phone}`,
                payment_method: formData.payment_method
            });

            if (res.success) {
                // Trigger real-time notification for the user
                if (user) {
                    addNotification({
                        title: "تم استلام طلبك بنجاح ✅",
                        message: "طلبك الآن (قيد الانتظار)، تابعه من صفحة طلباتي.",
                        type: "store_order",
                        orderId: res.data?.id || res.id || 0,
                        recipientId: user.id,
                        recipientType: "user",
                        variant: "success",
                    });
                }
                setOrderSuccess(true);
                toast.success("تم تسجيل طلبك بنجاح!");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "فشل تسجيل الطلب");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (orderSuccess) {
        return (
            <div className="checkout-success-view">
                <FiCheckCircle className="success-icon-anim" />
                <h2>شكراً لك! تم استلام طلبك</h2>
                <p>طلبك قيد المراجعة الآن، وسيتواصل معك فريقنا قريباً لتأكيد الشحن.</p>
                <div className="success-actions">
                    <button onClick={() => window.location.href = "/store-orders"} className="view-orders-btn">تتبع طلباتي</button>
                    <button onClick={() => window.location.href = "/store"} className="back-store-btn">العودة للمتجر</button>
                </div>
            </div>
        );
    }

    if (loading) return <div className="checkout-loading">جاري تجهيز بيانات الطلب...</div>;

    return (
        <div className="checkout-page-premium">
            <div className="checkout-header-modern">
                <h1>إتمام الشراء</h1>
                <p>يرجى إدخال تفاصيل الشحن لإكمال طلبك</p>
            </div>

            <div className="checkout-grid-layout">
                <form className="checkout-form-section" onSubmit={handleSubmitOrder}>
                    <div className="form-card-modern">
                        <div className="card-header">
                            <FiMapPin />
                            <h3>عنوان الشحن</h3>
                        </div>
                        <div className="input-group-modern">
                            <label>العنوان بالتفصيل (المدينة، الحي، الشارع)</label>
                            <textarea
                                value={formData.shipping_address}
                                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                                placeholder="مثال: القاهرة، مدينة نصر، شارع عباس العقاد، عمارة 15"
                                required
                            />
                        </div>
                        <div className="input-group-modern">
                            <label>رقم هاتف للتواصل</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="01xxxxxxxxx"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-card-modern">
                        <div className="card-header">
                            <FiCreditCard />
                            <h3>طريقة الدفع</h3>
                        </div>
                        <div className="payment-options-grid">
                            <label className={`payment-option ${formData.payment_method === 'cash' ? 'active' : ''}`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="cash"
                                    checked={formData.payment_method === 'cash'}
                                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                />
                                <div className="opt-content">
                                    <FiTruck />
                                    <span>الدفع عند الاستلام</span>
                                </div>
                            </label>

                            <label className={`payment-option ${formData.payment_method === 'card' ? 'active' : ''} disabled`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="card"
                                    disabled
                                    onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                                />
                                <div className="opt-content">
                                    <FiCreditCard />
                                    <span>بطاقة بنكية (قريباً)</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <button type="submit" className="btn-confirm-order" disabled={isSubmitting}>
                        {isSubmitting ? "جاري تنفيذ الطلب..." : "تأكيد الطلب وشحن المنتجات"}
                    </button>
                </form>

                <aside className="order-summary-sidebar">
                    <div className="summary-card-modern">
                        <h3>ملخص الطلب</h3>
                        <div className="items-mini-list">
                            {cartItems.map(item => (
                                <div key={item.id} className="item-mini">
                                    <span>{item.product.name} (x{item.quantity})</span>
                                    <span>{((item.product.discount_price || item.product.price) * item.quantity).toLocaleString()} ج.م</span>
                                </div>
                            ))}
                        </div>
                        <div className="summary-divider"></div>
                        <div className="pricing-rows">
                            <div className="price-row">
                                <span>الإجمالي الفرعي</span>
                                <span>{totalPrice.toLocaleString()} ج.م</span>
                            </div>
                            <div className="price-row">
                                <span>تكلفة الشحن</span>
                                <span className="free-shipping">مجاني</span>
                            </div>
                            <div className="price-row total-order">
                                <span>الإجمالي النهائي</span>
                                <span>{totalPrice.toLocaleString()} ج.م</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default CheckoutPage;
