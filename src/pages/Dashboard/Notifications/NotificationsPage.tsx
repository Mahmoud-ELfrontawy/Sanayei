import React, { useEffect } from "react";
import { useNotifications } from "../../../context/NotificationContext";
import { FaBell, FaRegClock, FaCheckCircle, FaShoppingCart, FaTools } from "react-icons/fa";
import "./NotificationsPage.css";

const NotificationsPage: React.FC = () => {
    const { userNotifications, markAllAsRead } = useNotifications();

    useEffect(() => {
        // Mark all as read when viewing the page
        const timer = setTimeout(() => {
            markAllAsRead();
        }, 2000);
        return () => clearTimeout(timer);
    }, [markAllAsRead]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'order_status': return <FaCheckCircle size={20} color="#10b981" />;
            case 'store_order': return <FaShoppingCart size={20} color="#3b82f6" />;
            case 'order_request': return <FaTools size={20} color="#f59e0b" />;
            default: return <FaBell size={20} color="#64748b" />;
        }
    };

    return (
        <div className="notifications-page">
            <header className="notifications-header">
                <h1>التنبيهات</h1>
                <p>تابع آخر المستجدات لطلباتك ومحادثاتك</p>
            </header>

            <div className="notifications-list">
                {userNotifications.length > 0 ? (
                    userNotifications.map((notif) => (
                        <div key={notif.id} className={`notification-card ${notif.status}`}>
                            <div className="notif-icon-box">
                                {getIcon(notif.type)}
                            </div>
                            <div className="notif-content">
                                <h3>{notif.title}</h3>
                                <p>{notif.message}</p>
                                <span className="notif-time">
                                    <FaRegClock size={12} />
                                    {new Date(notif.timestamp).toLocaleString('ar-EG')}
                                </span>
                            </div>
                            {notif.status === 'unread' && <div className="unread-dot"></div>}
                        </div>
                    ))
                ) : (
                    <div className="empty-notifications">
                        <FaBell size={48} />
                        <p>لا توجد تنبيهات جديدة</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;