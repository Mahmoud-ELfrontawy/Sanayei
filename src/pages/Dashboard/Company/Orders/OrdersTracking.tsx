import React, { useState, useEffect } from "react";
import { FiShoppingCart, FiClock, FiCheckCircle, FiPackage, FiTruck, FiXCircle, FiCheck, FiPrinter } from "react-icons/fi";
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

    const handlePrintInvoice = (order: any) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const itemsHtml = order.items?.map((item: any) => `
            <tr>
                <td style="text-align: right; padding: 12px; border: 1px solid #eee;">${item.product?.name || 'منتج'}</td>
                <td style="text-align: center; padding: 12px; border: 1px solid #eee;">${item.quantity}</td>
                <td style="text-align: left; padding: 12px; border: 1px solid #eee;">${parseFloat(item.price || item.product?.price || 0).toLocaleString()} ج.م</td>
                <td style="text-align: left; padding: 12px; border: 1px solid #eee;">${(parseFloat(item.price || item.product?.price || 0) * item.quantity).toLocaleString()} ج.م</td>
            </tr>
        `).join('') || '';

        const invoiceHtml = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <title>فاتورة طلب #${order.id}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
                    body { font-family: 'Cairo', sans-serif; padding: 40px; color: #1e293b; background: white; }
                    .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; }
                    .header { display: flex; justify-content: space-between; align-items: start; border-bottom: 2px solid #5fa8d3; padding-bottom: 20px; margin-bottom: 30px; }
                    .company-logo h1 { margin: 0; font-size: 28px; color: #5fa8d3; font-weight: 900; }
                    .invoice-id { text-align: left; }
                    .invoice-id h2 { margin: 0; font-size: 24px; color: #64748b; }
                    .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
                    .details-box h3 { border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 12px; font-size: 16px; color: #64748b; }
                    .details-box p { margin: 4px 0; font-size: 14px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th { background: #f8fafc; padding: 12px; font-size: 14px; color: #64748b; border: 1px solid #eee; }
                    .total-section { margin-top: 40px; border-top: 2px solid #5fa8d3; padding-top: 20px; }
                    .total-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
                    .total-row.grand-total { font-size: 20px; font-weight: 900; color: #5fa8d3; }
                    .footer { margin-top: 60px; text-align: center; border-top: 1px solid #eee; padding-top: 20px; color: #94a3b8; font-size: 12px; }
                    @media print {
                        body { padding: 0; }
                        .invoice-box { border: none; }
                    }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <div class="header">
                        <div class="company-logo">
                            <h1>${user?.name || 'شركة الصنايعي'}</h1>
                            <p>حلول متكاملة للصيانة والخدمات</p>
                        </div>
                        <div class="invoice-id">
                            <h2>فاتورة ضريبية</h2>
                            <p style="margin:5px 0">رقم الطلب: <strong>#${order.id}</strong></p>
                            <p style="margin:5px 0">التاريخ: ${new Date(order.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                    </div>

                    <div class="details-grid">
                        <div class="details-box">
                            <h3>تفاصيل العميل</h3>
                            <p><strong>الاسم:</strong> ${order.user_name || 'عميل'}</p>
                            <p><strong>العنوان:</strong> ${order.shipping_address || 'استلام من الفرع'}</p>
                            <p><strong>الهاتف:</strong> ${order.shipping_phone || '-'}</p>
                        </div>
                        <div class="details-box">
                            <h3>بيانات الدفع</h3>
                            <p><strong>الحالة:</strong> ${statusMap[order.status]?.label || order.status}</p>
                            <p><strong>طريقة الدفع:</strong> ${order.payment_method === 'wallet' ? 'محفظة إلكترونية' : 'دفع عند الاستلام (كاش)'}</p>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th style="width: 50%;">المنتج</th>
                                <th>الكمية</th>
                                <th>السعر</th>
                                <th>الإجمالي</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="total-row grand-total">
                            <span>الإجمالي النهائي:</span>
                            <span>${parseFloat(order.total_amount).toLocaleString()} ج.م</span>
                        </div>
                    </div>

                    <div class="footer">
                        <p>شكراً لتعاملك معنا. تم إصدار هذه الفاتورة إلكترونياً من منصة صنايعي.</p>
                        <p>${new Date().getFullYear()} &copy; Sanayei Platform</p>
                    </div>
                </div>

                <script>
                    window.onload = () => {
                        window.print();
                        setTimeout(() => window.close(), 1000);
                    };
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(invoiceHtml);
        printWindow.document.close();
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
                // إشعار فوري للشركة نفسها بتأكيد التحديث
                const arabicStatus = statusMap[newStatus]?.label || newStatus;
                addNotification({
                    title: "تم تحديث الحالة ✅",
                    message: `الطلب #${orderId} أصبح الآن ${arabicStatus}`,
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
                <h1>متابعة الخدمات</h1>
                <p>تتبع طلبات العملاء وقم بتحديث حالة الشحن والتسليم</p>
            </div>

            <div className="tracking-table-card">
                {loading ? (
                    <div className="loading-state" style={{ padding: '3rem', textAlign: 'center' }}>جاري تحميل الخدمات...</div>
                ) : orders.length > 0 ? (
                    <table className="tracking-table">
                        <thead>
                            <tr>
                                <th>رقم الطلب</th>
                                <th>العميل</th>
                                <th>العنوان</th>
                                <th>المنتجات</th>
                                <th>الإجمالي</th>
                                <th>طريقة الدفع</th>
                                <th>الحالة</th>
                                <th>الإجراء</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order.id}>
                                    <td data-label="رقم الطلب"><strong>#{order.id}</strong></td>
                                    <td data-label="العميل">
                                        <div className="name-with-type">
                                            {order.user_name || "عميل مجهول"}
                                            <span className={`user-type-badge ${order.user_type?.includes('Craftsman') ? 'craftsman' : 'user'}`}>
                                                {order.user_type?.includes('Craftsman') ? 'صنايعي' : 'عميل'}
                                            </span>
                                        </div>
                                    </td>
                                    <td data-label="العنوان">{order.shipping_address || "غير محدد"}</td>
                                    <td data-label="المنتجات">
                                        <div className="order-items-mini">
                                            {order.items?.map((item: any) => (
                                                <span key={item.id} className="item-line">
                                                    {item.product?.name} ({item.quantity})
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td data-label="الإجمالي" className="price-text">{parseFloat(order.total_amount).toLocaleString()} ج.م</td>
                                    <td data-label="طريقة الدفع">
                                        <span className={`payment-method-badge ${order.payment_method}`}>
                                            {order.payment_method === 'wallet' ? 'المحفظة' : 'كاش'}
                                        </span>
                                    </td>
                                    <td data-label="الحالة">
                                        <span className={`status-badge ${order.status}`}>
                                            {statusMap[order.status]?.icon}
                                            {statusMap[order.status]?.label || order.status}
                                        </span>
                                    </td>
                                    <td data-label="الإجراء">
                                        <div className="order-actions-mobile-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                                title="تحديث الحالة"
                                            >
                                                {loadingStatus === order.id ? "..." : <FiCheck />}
                                            </button>
                                            <button
                                                className="print-btn-mini"
                                                onClick={() => handlePrintInvoice(order)}
                                                title="طباعة الفاتورة"
                                            >
                                                <FiPrinter />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-orders" style={{ padding: '5rem', textAlign: 'center' }}>
                        <FiShoppingCart size={60} color="var(--slate-300)" />
                        <p style={{ marginTop: '1.5rem', color: 'var(--slate-400)', fontSize: '1.1rem' }}>لا يوجد طلبات واردة حالياً</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersTracking;

