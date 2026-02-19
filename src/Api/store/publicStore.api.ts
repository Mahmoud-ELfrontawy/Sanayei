import axios from "axios";

const BASE_URL = "/api";

/**
 * جلب جميع الأقسام العامة التي تحتوي على منتجات
 */
export const getPublicCategories = async () => {
    try {
        const res = await axios.get(`${BASE_URL}/store/categories`);
        return res.data;
    } catch (error: any) {
        console.error("Store API Error (Public Categories):", error.response?.data || error.message);
        return [];
    }
};

/**
 * جلب المنتجات العامة مع دعم الفلترة والبحث
 */
export const getPublicProducts = async (params: { category_id?: number, search?: string, page?: number } = {}) => {
    try {
        const res = await axios.get(`${BASE_URL}/store/products`, { params });
        return res.data; // ملاحطة: الباك-إند يستخدم paginate لذا سيعود كائن يحتوي على data و links
    } catch (error: any) {
        console.error("Store API Error (Public Products):", error.response?.data || error.message);
        return { data: [] };
    }
};

/**
 * جلب تفاصيل منتج معين
 */
export const getPublicProductDetails = async (id: number) => {
    try {
        const res = await axios.get(`${BASE_URL}/store/products/${id}`);
        return res.data;
    } catch (error: any) {
        console.error("Store API Error (Product Details):", error.response?.data || error.message);
        throw error;
    }
};
