import api from "../../api";

/* ================= Management (Store Owner) ================= */
export const getStoreCategories = async () => {
    try {
        const res = await api.get(`/company/store/categories`);
        return res.data;
    } catch (error: any) {
        console.error("Store API Error (Get Categories):", error.response?.data || error.message);
        throw error;
    }
};

export const addStoreCategory = async (data: { name: string, description?: string, icon?: string }) => {
    try {
        const res = await api.post(`/company/store/categories`, data);
        return res.data;
    } catch (error: any) {
        console.error("Store API Error (Add Category):", error.response?.data || error.message);
        throw error;
    }
};

export const updateStoreCategory = async (id: number, data: { name: string, description?: string, icon?: string }) => {
    const res = await api.put(`/company/store/categories/${id}`, data);
    return res.data;
};

export const deleteStoreCategory = async (id: number) => {
    const res = await api.delete(`/company/store/categories/${id}`);
    return res.data;
};

/* ================= Products ================= */
export const getStoreProducts = async () => {
    const res = await api.get(`/company/store/products`);
    return res.data;
};

export const addStoreProduct = async (formData: FormData) => {
    const res = await api.post(`/company/store/products`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
};

export const updateStoreProduct = async (id: number, formData: FormData) => {
    // For PHP/Laravel to handle files with PUT, we use POST + _method=PUT
    formData.append("_method", "PUT");
    const res = await api.post(`/company/store/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
    return res.data;
};

export const deleteStoreProduct = async (id: number) => {
    const res = await api.delete(`/company/store/products/${id}`);
    return res.data;
};

/* ================= Orders ================= */
export const getStoreOrders = async () => {
    try {
        const res = await api.get(`/company/store/orders`);
        const data = res.data;
        if (Array.isArray(data)) return data;
        if (data && Array.isArray(data.data)) return data.data;
        if (data && Array.isArray(data.orders)) return data.orders;
        return data || [];
    } catch (error: any) {
        console.error("Store API Error (Get Orders):", error.response?.data || error.message);
        throw error;
    }
};

export const updateOrderStatus = async (orderId: number, status: string) => {
    try {
        const res = await api.patch(`/company/store/orders/${orderId}`, { status });
        return res.data;
    } catch (error: any) {
        console.error("Store API Error (Update Order):", error.response?.data || error.message);
        throw error;
    }
};

/* ================= Public View (Users/Craftsmen) ================= */
export const getPublicStoreCategories = async () => {
    const res = await api.get(`/store/categories`);
    return res.data;
};

export interface PublicProductsParams {
    category_id?: number | string;
    company_id?: number | string;
    search?: string;
    sort?: "price" | "rating" | "created_at";
    dir?: "asc" | "desc";
    page?: number;
}

export const getPublicStoreProducts = async (params: PublicProductsParams = {}) => {
    const query = new URLSearchParams();
    if (params.category_id) query.append("category_id", String(params.category_id));
    if (params.company_id) query.append("company_id", String(params.company_id));
    if (params.search) query.append("search", params.search);
    if (params.sort) query.append("sort", params.sort);
    if (params.dir) query.append("dir", params.dir);
    if (params.page) query.append("page", String(params.page));

    const res = await api.get(`/store/products?${query.toString()}`);
    return res.data;
};

export const getPublicStoreProductDetails = async (productId: number) => {
    const res = await api.get(`/store/products/${productId}`);
    return res.data;
};
