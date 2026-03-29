import api from "../api";

export const getMyNotifications = async (role: string) => {
    try {
        let endpoint = "/user/notifications"; 

        if (role === "craftsman") {
            endpoint = "/craftsmen/notifications";
        } else if (role === "company") {
            endpoint = "/company/notifications";
        }

        const response = await api.get(endpoint);
        return response.data;
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return [];
    }
};

export const sendNotification = async (payload: {
    title: string;
    message: string;
    recipientId: number;
    recipientType: string;
    type: string;
    orderId?: number;
}) => {
    try {
        const response = await api.post("/notifications/send", payload);
        return response.data;
    } catch (error) {
        console.error("Error sending notification:", error);
        throw error;
    }
};

export const markNotificationAsRead = async (id: number | string) => {
    try {
        const response = await api.post(`/notifications/${id}/mark-read`);
        return response.data;
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
};

export const markAllNotificationsAsRead = async () => {
    try {
        const response = await api.post("/notifications/mark-all-read");
        return response.data;
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
    }
};
