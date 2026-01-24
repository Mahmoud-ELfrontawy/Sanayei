import { useState } from "react";
import "./MyOrders.css";
import { formatArabicDate } from "../../utils/dateFormatter";
import LottiePlayerDataNotFound from "../../components/ui/LottiePlayerDataNotFound";
import type { ServiceRequestPayload } from "../../constants/serviceRequest";



const OrdersPage = () => {
    const [orders, setOrders] = useState<ServiceRequestPayload[]>(() => {
        const stored = localStorage.getItem("myOrders");
        return stored ? JSON.parse(stored) : [];
    });

    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    const confirmDelete = () => {
        if (selectedOrderId === null) return;

        const updated = orders.filter(
            (order) => order.id !== selectedOrderId
        );

        setOrders(updated);
        localStorage.setItem("myOrders", JSON.stringify(updated));
        setSelectedOrderId(null);
    };

    if (orders.length === 0) {
        return <LottiePlayerDataNotFound />;
    }

    return (
        <section className="orders-section">
            <div className="orders-container">

                <h2 className="orders-title">متابعة الطلبات</h2>

                {orders.map((order) => (
                    <div key={order.id} className="order-card">

                        {/* يمين الكارد */}
                        <div className="order-info">

                            <h3 className="order-service">
                                {order.service_name || order.service_type}
                            </h3>

                            <div className="line"></div>

                            <div className="order-details">
                                <div className="details">
                                    <span>الاسم</span>
                                    <p> {order.name}</p>
                                </div>

                                <div className="details">
                                    <span>الموقع</span>
                                    <p> {order.province} - {order.address}</p>
                                </div>

                                <div className="details">
                                    <span>تاريخ الطلب</span>
                                    <p>
                                        {formatArabicDate(order.date, undefined, {
                                            replaceCommaWithDash: true,
                                        })}
                                    </p>
                                </div>

                                <div className="details">
                                    <span>الصنايعي المطلوب</span>
                                    <p>{order.industrial_name}</p>
                                </div>


                                <div className="details">
                                    <span>التوقيت المطلوب</span>
                                    <p>
                                        {formatArabicDate(order.date, order.time, {
                                            withTime: true,
                                        })}
                                    </p>

                                </div>


                                <div className="details">
                                    <span>رقم التواصل</span>
                                    <p> {order.phone}</p>
                                </div>

                                <div className="details">
                                    <span>رقم الطلب</span>
                                    <p>{order.id}</p>
                                </div>
                                <div className="details">
                                    <span>السعر المتوقع</span>
                                    <p>
                                        {order.price ? `${order.price} جنيه` : "غير محدد"}
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* يسار الكارد */}
                        <div className="order-side">

                            <span className={`order-status ${order.status}`}>
                                {order.status === "pending" && "قيد الانتظار"}
                                {order.status === "accepted" && "تم قبول الطلب"}
                                {order.status === "rejected" && "تم رفض الطلب"}
                            </span>

                            {order.status === "pending" && (
                                <button
                                    className="cancel-btn"
                                    onClick={() => setSelectedOrderId(order.id)}
                                >
                                    إلغاء الطلب
                                </button>
                            )}

                        </div>
                    </div>
                ))}

                {/* Popup */}
                {selectedOrderId !== null && (
                    <div className="confirm-overlay">
                        <div className="confirm-box">
                            <h4>تأكيد الإلغاء</h4>
                            <p>هل أنت متأكد أنك تريد إلغاء هذا الطلب؟</p>

                            <div className="confirm-actions">
                                <button
                                    className="btn-no"
                                    onClick={() => setSelectedOrderId(null)}
                                >
                                    لا
                                </button>

                                <button
                                    className="btn-yes"
                                    onClick={confirmDelete}
                                >
                                    نعم، إلغاء
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </section>
    );
};

export default OrdersPage;
