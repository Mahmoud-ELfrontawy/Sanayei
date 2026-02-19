import React, { useState, useEffect } from "react";
import { getUserOrders } from "../../Api/store/orders.api";
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import { formatArabicDate } from "../../utils/dateFormatter";
import "./StoreOrdersPage.css";

const StoreOrdersPage: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const data = await getUserOrders();
                setOrders(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Fetch Store Orders Error:", error);
                toast.error("فشل في تحميل الطلبات، حاول مرة أخرى");
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending': return { label: 'قيد الانتظار', icon: <FiClock />, class: 'pending' };
            case 'processing': return { label: 'جاري التجهيز', icon: <FiPackage />, class: 'processing' };
            case 'shipped': return { label: 'تم الشحن', icon: <FiTruck />, class: 'shipped' };
            case 'completed': return { label: 'تم التسليم', icon: <FiCheckCircle />, class: 'completed' };
            case 'cancelled': return { label: 'ملغي', icon: <FiXCircle />, class: 'cancelled' };
            default: return { label: status || 'غير محدد', icon: <FiPackage />, class: 'default' };
        }
    };

    if (loading) return <div className="orders-loading">جاري تحميل طلبات المتجر...</div>;

    return (
        <div className="store-orders-container-premium">
            <div className="orders-header-mini">
                <h1>طلبات المتجر</h1>
                <p>تتبع حالة مشترياتك من المعدات والأدوات</p>
            </div>

            {orders.length === 0 ? (
                <div className="orders-empty-state">
                    <FiPackage size={64} />
                    <h2>لا توجد طلبات سابقة</h2>
                    <p>لم تقم بشراء أي منتجات من المتجر بعد.</p>
                    <button onClick={() => window.location.href = "/store"} className="btn-go-store">اذهب للمتجر الآن</button>
                </div>
            ) : (
                <div className="orders-cards-list">
                    {orders.map(order => {
                        const status = getStatusInfo(order.status);
                        const totalAmount = Number(order.total_amount) || 0;
                        const paymentLabel = order.payment_method === 'cash' ? 'الدفع عند الاستلام'
                            : order.payment_method === 'card' ? 'بطاقة بنكية'
                                : order.payment_method === 'wallet' ? 'محفظة إلكترونية'
                                    : order.payment_method || 'غير محدد';

                        return (
                            <div key={order.id} className="order-item-card-premium">
                                <div className="order-main-info">
                                    <div className="order-id-date">
                                        <h3>رقم الطلب: #{order.id}</h3>
                                        <span>تاريخ الطلب: {formatArabicDate(order.created_at)}</span>
                                    </div>
                                    <div className={`order-status-pill ${status.class}`}>
                                        {status.icon}
                                        <span>{status.label}</span>
                                    </div>
                                </div>

                                <div className="order-details-summary">
                                    <div className="summary-row">
                                        <span>الشركة:</span>
                                        <strong>{order.company?.name || 'شركة معتمدة'}</strong>
                                    </div>
                                    <div className="summary-row">
                                        <span>الإجمالي:</span>
                                        <strong className="total-price">{totalAmount.toLocaleString()} ج.م</strong>
                                    </div>
                                    <div className="summary-row">
                                        <span>طريقة الدفع:</span>
                                        <span>{paymentLabel}</span>
                                    </div>
                                </div>

                                <div className="order-footer-actions">
                                    <button className="btn-details-mini" onClick={() => toast.info("صفحة التفاصيل قريباً")}>
                                        عرض التفاصيل الكاملة
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default StoreOrdersPage;
