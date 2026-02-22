import React, { useState, useEffect } from "react";
import { FiTrash2, FiShoppingCart, FiArrowRight } from "react-icons/fi";
import { toast } from "react-toastify";
import { getCartItems, removeFromCart } from "../../Api/store/cart.api";
import { getFullImageUrl } from "../../utils/imageUrl";
import { Link } from "react-router-dom";
import "./CartPage.css";

interface CartPageProps {
    onCheckout?: () => void;
}

import { useAuth } from "../../hooks/useAuth";

const CartPage: React.FC<CartPageProps> = ({ onCheckout }) => {
    const { isAuthenticated } = useAuth();
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getCartItems();
            setCartItems(data || []);
        } catch (error: any) {
            if (error.message !== "Unauthorized") {
                console.error("Fetch Cart Error:", error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="cart-page-container">
                <div className="cart-empty-state">
                    <FiShoppingCart size={64} />
                    <h2>يرجى تسجيل الدخول</h2>
                    <p>يجب عليك تسجيل الدخول لعرض سلة المشتريات الخاصة بك.</p>
                    <Link to="/login" className="browse-btn">تسجيل الدخول</Link>
                </div>
            </div>
        );
    }

    const handleRemove = async (id: number) => {
        try {
            await removeFromCart(id);
            setCartItems(cartItems.filter(item => item.id !== id));
            toast.success("تم حذف المنتج من السلة");
        } catch (error) {
            toast.error("فشل حذف المنتج");
        }
    };

    const totalPrice = cartItems.reduce((sum, item) => {
        const price = item.product.discount_price || item.product.price;
        return sum + (price * item.quantity);
    }, 0);

    if (loading) return <div className="cart-loading">جاري تحميل السلة...</div>;

    return (
        <div className="cart-page-container">
            <div className="cart-header">
                <h1>سلة المشتريات</h1>
                <Link to="/store" className="continue-shopping">
                    <span>متابعة التسوق</span>
                    <FiArrowRight />
                </Link>
            </div>

            {cartItems.length === 0 ? (
                <div className="cart-empty-state">
                    <FiShoppingCart size={64} />
                    <h2>سلتك فارغة حالياً</h2>
                    <p>ابدأ بإضافة بعض المنتجات الرائعة لملء سلتك!</p>
                    <Link to="/store" className="browse-btn">تصفح المتجر</Link>
                </div>
            ) : (
                <div className="cart-layout">
                    <div className="cart-items-list">
                        {cartItems.map(item => (
                            <div key={item.id} className="cart-item-card">
                                <img
                                    src={getFullImageUrl(item.product.main_image)}
                                    alt={item.product.name}
                                    className="cart-item-img"
                                />
                                <div className="cart-item-info">
                                    <h3>{item.product.name}</h3>
                                    <p className="item-price">
                                        {(item.product.discount_price || item.product.price).toLocaleString()} ج.م
                                    </p>
                                    <div className="item-qty">الكمية: {item.quantity}</div>
                                </div>
                                <button className="remove-btn" onClick={() => handleRemove(item.id)}>
                                    <FiTrash2 />
                                </button>
                            </div>
                        ))}
                    </div>

                    <aside className="cart-summary-card">
                        <h3>ملخص الطلب</h3>
                        <div className="summary-row">
                            <span>إجمالي المنتجات</span>
                            <span>{cartItems.length} منتجات</span>
                        </div>
                        <div className="summary-row total-row">
                            <span>الإجمالي الكلي</span>
                            <span className="total-amount">{totalPrice.toLocaleString()} ج.م</span>
                        </div>
                        <button className="checkout-btn" onClick={() => onCheckout ? onCheckout() : toast.info("ميزة الدفع ستتوفر قريباً!")}>
                            إتمام الشراء
                        </button>
                    </aside>
                </div>
            )}
        </div>
    );
};

export default CartPage;
