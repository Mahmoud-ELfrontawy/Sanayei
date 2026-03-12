import React, { useState, useEffect } from "react";
import { getUserOrders } from "../../Api/store/orders.api";
import { FiPackage, FiTruck, FiCheckCircle, FiClock, FiXCircle, FiStar } from "react-icons/fi";
import { toast } from "react-toastify";
import { formatArabicDate } from "../../utils/dateFormatter";
import ProductReviewModal from "../../components/ui/ProductReviewModal/ProductReviewModal";
import "./StoreOrdersPage.css";

import { useAuth } from "../../hooks/useAuth";

const StoreOrdersPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedOrderForReview, setSelectedOrderForReview] = useState<any>(null);

    const fetchOrders = async () => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const data = await getUserOrders();
            const ordersList = Array.isArray(data) ? data : [];
            setOrders(ordersList);

            // 🌟 Auto-popup Logic
            const seenPopups = JSON.parse(sessionStorage.getItem('seen_review_popups') || '[]');
            
            const recentlyCompleted = ordersList.find(o => 
                (o.status === 'completed' || o.status === 'delivered') && 
                !o.is_reviewed && 
                !o.review_id &&
                !seenPopups.includes(o.id)
            );

            if (recentlyCompleted) {
                const product = recentlyCompleted.items?.[0]?.product || recentlyCompleted.product;
                if (product) {
                    setSelectedOrderForReview({
                        orderId: recentlyCompleted.id,
                        productId: product.id,
                        productName: product.name
                    });
                    setIsReviewModalOpen(true);
                    
                    // Mark as seen in this session
                    sessionStorage.setItem('seen_review_popups', JSON.stringify([...seenPopups, recentlyCompleted.id]));
                }
            }
        } catch (error: any) {
            if (error.message !== "Unauthorized") {
                console.error("Fetch Store Orders Error:", error);
                toast.error("فشل في تحميل الطلبات، حاول مرة أخرى");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="store-orders-container-premium">
                <div className="orders-empty-state">
                    <FiPackage size={64} />
                    <h2>يرجى تسجيل الدخول</h2>
                    <p>يجب عليك تسجيل الدخول لعرض قائمة طلباتك.</p>
                    <button onClick={() => window.location.href = "/login"} className="btn-go-store">تسجيل الدخول</button>
                </div>
            </div>
        );
    }

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending': return { label: 'قيد الانتظار', icon: <FiClock />, class: 'pending' };
            case 'processing': return { label: 'جاري التجهيز', icon: <FiPackage />, class: 'processing' };
            case 'shipped': return { label: 'تم الشحن', icon: <FiTruck />, class: 'shipped' };
            case 'completed':
            case 'delivered': return { label: 'تم التسليم ✅', icon: <FiCheckCircle />, class: 'completed' };
            case 'cancelled': return { label: 'ملغي', icon: <FiXCircle />, class: 'cancelled' };
            default: return { label: status || 'غير محدد', icon: <FiPackage />, class: 'default' };
        }
    };

    const handleOpenReview = (order: any) => {
        if (order.is_reviewed || order.review_id) {
            toast.info("لقد قمت بتقييم هذا الطلب مسبقاً");
            return;
        }

        const product = order.items?.[0]?.product || order.product;
        if (!product) {
            toast.error("خطأ في بيانات المنتج");
            return;
        }

        setSelectedOrderForReview({
            orderId: order.id,
            productId: product.id,
            productName: product.name
        });
        setIsReviewModalOpen(true);
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
                                        <strong>{order.company?.name || order.company?.company_name || 'شركة معتمدة'}</strong>
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
                                    
                                    {(order.status === 'completed' || order.status === 'delivered') && (
                                        <button 
                                            className={`btn-rate-order ${order.is_reviewed || order.review_id ? 'already-rated' : ''}`}
                                            onClick={() => handleOpenReview(order)}
                                        >
                                            <FiStar />
                                            {order.is_reviewed || order.review_id ? 'تم التقييم' : 'تقييم المنتج'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Product Review Modal */}
            {selectedOrderForReview && (
                <ProductReviewModal
                    isOpen={isReviewModalOpen}
                    onClose={() => setIsReviewModalOpen(false)}
                    orderId={selectedOrderForReview.orderId}
                    productId={selectedOrderForReview.productId}
                    productName={selectedOrderForReview.productName}
                    onSuccess={fetchOrders}
                />
            )}
        </div>
    );
};

export default StoreOrdersPage;
