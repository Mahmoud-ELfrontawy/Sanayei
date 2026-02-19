import axios from "axios";

const BASE_URL = "/api";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    return {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
    };
};

/**
 * إتمام الطلب وتحويل السلة إلى طلبات فعلية
 */
export const createOrder = async (orderData: { shipping_address: string, payment_method: string }) => {
    const headers = getAuthHeaders();
    if (!headers) throw new Error("Unauthorized");
    try {
        const res = await axios.post(`${BASE_URL}/company/store/checkout`, orderData, { headers });
        return res.data;
    } catch (error: any) {
        console.error("Order API Error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * جلب جميع طلبات المستخدم الحالي
 */
export const getUserOrders = async () => {
    const headers = getAuthHeaders();
    if (!headers) throw new Error("Unauthorized");
    try {
        const res = await axios.get(`${BASE_URL}/company/store/my-orders`, { headers });
        // handle both { data: [...] } and direct array response
        const data = res.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        if (data && Array.isArray(data.orders)) return data.orders;
        return data || [];
    } catch (error: any) {
        console.error("Fetch Orders Error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * جلب تفاصيل طلب معين
 */
export const getOrderDetails = async (orderId: number) => {
    const headers = getAuthHeaders();
    if (!headers) throw new Error("Unauthorized");
    try {
        const res = await axios.get(`${BASE_URL}/company/store/orders/${orderId}`, { headers });
        return res.data;
    } catch (error: any) {
        console.error("Fetch Order Details Error:", error.response?.data || error.message);
        throw error;
    }
};
