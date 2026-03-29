import api from "../api";

/**
 * جلب جميع الأقسام العامة الخاصة بالتسجيل
 */
export const getCompanyRegistrationCategories = async () => {
    try {
        const res = await api.get(`/companies/registration-categories`);
        console.log("Categories loaded successfully:", res.data);
        return res.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            console.error("❌ THE ROUTE IS MISSING (404 Error!): You didn't upload `routes/api.php` to your live server. The backend doesn't know about this URL.");
        } else {
            console.error("Store API Error (Registration Categories):", error.response?.data || error.message);
        }
        return [];
    }
};

/**
 * جلب جميع الأقسام العامة التي تحتوي على منتجات
 */
export const getPublicCategories = async () => {
    try {
        const res = await api.get(`/store/categories`);
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
        const res = await api.get(`/store/products`, { params });
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
        const res = await api.get(`/store/products/${id}`);
        return res.data;
    } catch (error: any) {
        console.error("Store API Error (Product Details):", error.response?.data || error.message);
        throw error;
    }
};
