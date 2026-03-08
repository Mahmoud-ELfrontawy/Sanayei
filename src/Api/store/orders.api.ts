import api from "../api";

/**
 * إتمام الطلب وتحويل السلة إلى طلبات فعلية
 */
export const createOrder = async (orderData: { shipping_address: string, payment_method: string }) => {
    try {
        const res = await api.post(`/company/store/checkout`, orderData);
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
    try {
        const res = await api.get(`/company/store/my-orders`);
        // handle both { data: [...] } and direct array response
        const data = res.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        if (data && Array.isArray(data.orders)) return data.orders;
        return data || [];
    } catch (error: any) {
        if (error.response?.status === 401) throw new Error("Unauthorized");
        console.error("Fetch Orders Error:", error.response?.data || error.message);
        throw error;
    }
};

/**
 * جلب تفاصيل طلب معين
 */
export const getOrderDetails = async (orderId: number) => {
    try {
        const res = await api.get(`/company/store/orders/${orderId}`);
        return res.data;
    } catch (error: any) {
        console.error("Fetch Order Details Error:", error.response?.data || error.message);
        throw error;
    }
};
