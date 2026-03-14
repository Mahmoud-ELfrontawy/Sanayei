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
