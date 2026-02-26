import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiClock, FiCheckCircle, FiPackage, FiTruck, FiXCircle, FiCheck } from "react-icons/fi";
import { toast } from "react-toastify";
import { getStoreOrders, updateOrderStatus } from "../../../../Api/auth/Company/storeManagement.api";
import { useNotifications } from "../../../../context/NotificationContext";
import { useAuth } from "../../../../hooks/useAuth";
import "./OrdersTracking.css";

const statusMap: Record<string, { label: string, icon: any, color: string }> = {
    pending: { label: "قيد الانتظار", icon: <FiClock />, color: "#ff9800" },
    processing: { label: "جاري التجهيز", icon: <FiPackage />, color: "#2196f3" },
    shipped: { label: "تم الشحن", icon: <FiTruck />, color: "#9c27b0" },
    delivered: { label: "تم التوصيل", icon: <FiCheckCircle />, color: "#4caf50" },
    cancelled: { label: "ملغي", icon: <FiXCircle />, color: "#f44336" },
};

const OrdersTracking: React.FC = () => {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState<Record<number, string>>({});
    const [loadingStatus, setLoadingStatus] = useState<number | null>(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await getStoreOrders();
            setOrders(Array.isArray(res) ? res : []);
        } catch (error) {
            toast.error("حدث خطأ أثناء تحميل الطلبات");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: number) => {
        if (user?.status === 'rejected') {
            toast.error("حسابك محظور، يرجى التواصل مع الدعم الفني لحل المشكلة.");
            return;
        }

        const newStatus = updatingStatus[orderId];
        if (!newStatus) return;

        try {
            setLoadingStatus(orderId);
            const res = await updateOrderStatus(orderId, newStatus);
            if (res.success) {
                toast.success("تم تحديث حالة الطلب");

                // إشعار فوري للشركة نفسها بتأكيد التحديث
                const arabicStatus = statusMap[newStatus]?.label || newStatus;
                addNotification({
                    title: "تم تحديث حالة الطلب ✅",
                    message: `تم تغيير حالة الطلب رقم #${orderId} إلى ${arabicStatus}`,
                    type: "order_status",
                    orderId: orderId,
                    recipientId: user?.id || 0,
                    recipientType: "company",
                    variant: newStatus === "cancelled" ? "error" : "success",
                });

                fetchOrders();
                const nextUpdating = { ...updatingStatus };
                delete nextUpdating[orderId];
                setUpdatingStatus(nextUpdating);
            }
        } catch (error) {
            toast.error("فشل تحديث الحالة");
        } finally {
            setLoadingStatus(null);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="orders-tracking-page">
            <div className="tracking-header">
                <h1>متابعة الطلبات</h1>
                <p>تتبع طلبات العملاء وقم بتحديث حالة الشحن والتسليم</p>
            </div>

            <div className="tracking-table-card">
                {loading ? (
                    <div className="loading-state" style={{ padding: '3rem', textAlign: 'center' }}>جاري تحميل الطلبات...</div>
                ) : orders.length > 0 ? (
                    <table className="tracking-table">
                        <thead>
                            <tr>
                                <th>رقم الطلب</th>
                                <th>العميل</th>
                                <th>العنوان</th>
                                <th>المنتجات</th>
                                <th>الإجمالي</th>
                                <th>الحالة</th>
                                <th>الإجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td><strong>#{order.id}</strong></td>
                                    <td>
                                        <div className="name-with-type">
                                            {order.user_name || "عميل مجهول"}
                                            <span className={`user-type-badge ${order.user_type?.includes('Craftsman') ? 'craftsman' : 'user'}`}>
                                                {order.user_type?.includes('Craftsman') ? 'صنايعي' : 'عميل'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>{order.shipping_address || "غير محدد"}</td>
                                    <td>
                                        <div className="order-items-mini">
                                            {order.items?.map((item: any) => (
                                                <span key={item.id} className="item-line">
                                                    {item.product?.name} ({item.quantity})
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="price-text">{parseFloat(order.total_amount).toLocaleString()} ج.م</td>
                                    <td>
                                        <span className={`status-badge ${order.status}`}>
                                            {statusMap[order.status]?.icon}
                                            {statusMap[order.status]?.label || order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <select
                                                className="status-select-premium"
                                                value={updatingStatus[order.id] || order.status}
                                                onChange={(e) => setUpdatingStatus({ ...updatingStatus, [order.id]: e.target.value })}
                                            >
                                                <option value="pending">قيد الانتظار</option>
                                                <option value="processing">جاري التجهيز</option>
                                                <option value="shipped">تم الشحن</option>
                                                <option value="delivered">تم التوصيل</option>
                                                <option value="cancelled">ملغي</option>
                                            </select>
                                            <button
                                                className="update-btn-mini"
                                                onClick={() => handleUpdateStatus(order.id)}
                                                disabled={loadingStatus === order.id || !updatingStatus[order.id] || updatingStatus[order.id] === order.status}
                                            >
                                                {loadingStatus === order.id ? "..." : <FiCheck />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-orders" style={{ padding: '5rem', textAlign: 'center' }}>
                        <FiShoppingCart size={60} color="#cbd5e1" />
                        <p style={{ marginTop: '1.5rem', color: '#94a3b8', fontSize: '1.1rem' }}>لا يوجد طلبات واردة حالياً</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersTracking;
