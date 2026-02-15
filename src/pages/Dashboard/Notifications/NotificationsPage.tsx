import React, { useEffect } from "react";
import { useNotifications } from "../../../context/NotificationContext";
import { FaBell, FaRegClock, FaCheckCircle } from "react-icons/fa";
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
                                {notif.type === 'order_status' ? <FaCheckCircle size={20} /> : <FaBell size={20} />}
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