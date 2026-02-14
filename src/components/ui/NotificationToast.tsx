import React from "react";
import { Check, X, BellRing } from "lucide-react";

interface NotificationToastProps {
    title: string;
    message: string;
    type: "order_request" | "order_status";
    onAccept?: () => void;
    onReject?: () => void;
    closeToast?: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({
    title,
    message,
    type,
    onAccept,
    onReject,
    closeToast
}) => {
    return (
        <div className="notification-toast-content">
            <div className="notification-toast-body-wrapper">
                <div className="notification-toast-main-icon">
                    <BellRing size={28} />
                </div>
                <div className="notification-toast-text">
                    <div className="notification-toast-header">
                        <span className="notification-toast-title">{title}</span>
                    </div>
                    <p className="notification-toast-body">{message}</p>
                </div>
            </div>

            {type === "order_request" && onAccept && onReject && (
                <div className="notification-toast-actions">
                    <button
                        className="btn-toast-accept"
                        onClick={(e) => {
                            e.stopPropagation();
                            onAccept();
                            closeToast?.();
                        }}
                    >
                        <Check size={18} />
                        <span>قبول</span>
                    </button>
                    <button
                        className="btn-toast-reject"
                        onClick={(e) => {
                            e.stopPropagation();
                            onReject();
                            closeToast?.();
                        }}
                    >
                        <X size={18} />
                        <span>رفض</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default NotificationToast;
