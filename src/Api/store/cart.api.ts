import axios from "axios";
import { authStorage } from "../../context/auth/auth.storage";

const BASE_URL = "/api";

const getAuthHeaders = () => {
    const token = authStorage.getToken();
    if (!token) return null;
    return {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
    };
};

/**
 * جلب منتجات السلة للمستخدم الحالي
 */
export const getCartItems = async () => {
    const headers = getAuthHeaders();
    if (!headers) throw new Error("Unauthorized");
    try {
        const res = await axios.get(`${BASE_URL}/company/store/cart`, { headers });
        return res.data;
    } catch (error: any) {
        if (error.response?.status === 401) throw new Error("Unauthorized");
        console.error("Cart API Error (Get):", error.response?.data || error.message);
        throw error;
    }
};

/**
 * إضافة منتج للسلة أو تحديث الكمية
 */
export const addToCart = async (productId: number, quantity: number = 1) => {
    const headers = getAuthHeaders();
    if (!headers) throw new Error("Unauthorized");
    try {
        const res = await axios.post(`${BASE_URL}/company/store/cart/add`, {
            product_id: productId,
            quantity: quantity
        }, { headers });
        return res.data;
    } catch (error: any) {
        console.error("Cart API Error (Add):", error.response?.data || error.message);
        throw error;
    }
};

/**
 * حذف منتج من السلة
 */
export const removeFromCart = async (cartItemId: number) => {
    const headers = getAuthHeaders();
    if (!headers) throw new Error("Unauthorized");
    try {
        const res = await axios.delete(`${BASE_URL}/company/store/cart/${cartItemId}`, { headers });
        return res.data;
    } catch (error: any) {
        console.error("Cart API Error (Delete):", error.response?.data || error.message);
        throw error;
    }
};

/**
 * جلب عدد العناصر في السلة (للعرض في الهيدر مثلاً)
 */
export const getCartCount = async () => {
    try {
        const items = await getCartItems();
        return Array.isArray(items) ? items.length : 0;
    } catch {
        return 0;
    }
};
