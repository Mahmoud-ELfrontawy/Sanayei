import axios from "axios";

const BASE_URL = "/api";

const getAuthHeaders = (isMultipart = false) => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.error("Store API: No token found");
        return null;
    }
    return {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        ...(isMultipart ? { "Content-Type": "multipart/form-data" } : {})
    };
};

/* ================= Management (Store Owner) ================= */
export const getStoreCategories = async () => {
    const headers = getAuthHeaders();
    if (!headers) throw new Error("Unauthorized");
    try {
        const res = await axios.get(`${BASE_URL}/company/store/categories`, { headers });
        return res.data;
    } catch (error: any) {
        console.error("Store API Error (Get Categories):", error.response?.data || error.message);
        throw error;
    }
};

export const addStoreCategory = async (data: { name: string, description?: string, icon?: string }) => {
    const headers = getAuthHeaders();
    if (!headers) throw new Error("Unauthorized");
    try {
        const res = await axios.post(`${BASE_URL}/company/store/categories`, data, { headers });
        return res.data;
    } catch (error: any) {
        console.error("Store API Error (Add Category):", error.response?.data || error.message);
        throw error;
    }
};

export const updateStoreCategory = async (id: number, data: { name: string, description?: string, icon?: string }) => {
    const headers = getAuthHeaders();
    if (!headers) throw new Error("Unauthorized");
    const res = await axios.put(`${BASE_URL}/company/store/categories/${id}`, data, { headers });
    return res.data;
};

export const deleteStoreCategory = async (id: number) => {
    const headers = getAuthHeaders();
    if (!headers) throw new Error("Unauthorized");
    const res = await axios.delete(`${BASE_URL}/company/store/categories/${id}`, { headers });
    return res.data;
};

/* ================= Products ================= */
export const getStoreProducts = async () => {
    const headers = getAuthHeaders();
    if (!headers) throw new Error("Unauthorized");
    const res = await axios.get(`${BASE_URL}/company/store/products`, { headers });
    return res.data;
};

export const addStoreProduct = async (formData: FormData) => {
    const headers = getAuthHeaders(true);
    if (!headers) throw new Error("Unauthorized");
    const res = await axios.post(`${BASE_URL}/company/store/products`, formData, { headers });
    return res.data;
};

export const updateStoreProduct = async (id: number, formData: FormData) => {
    const headers = getAuthHeaders(true);
    if (!headers) throw new Error("Unauthorized");
    // For PHP/Laravel to handle files with PUT, we use POST + _method=PUT
    formData.append("_method", "PUT");
    const res = await axios.post(`${BASE_URL}/company/store/products/${id}`, formData, { headers });
    return res.data;
};

export const deleteStoreProduct = async (id: number) => {
    const headers = getAuthHeaders();
    if (!headers) throw new Error("Unauthorized");
    const res = await axios.delete(`${BASE_URL}/company/store/products/${id}`, { headers });
    return res.data;
};

/* ================= Orders ================= */
export const getStoreOrders = async () => {
    const headers = getAuthHeaders();
    if (!headers) throw new Error("Unauthorized");
    try {
        const res = await axios.get(`${BASE_URL}/company/store/orders`, { headers });
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
    const headers = getAuthHeaders();
    if (!headers) throw new Error("Unauthorized");
    try {
        const res = await axios.patch(`${BASE_URL}/company/store/orders/${orderId}`, { status }, { headers });
        return res.data;
    } catch (error: any) {
        console.error("Store API Error (Update Order):", error.response?.data || error.message);
        throw error;
    }
};

/* ================= Public View (Users/Craftsmen) ================= */
export const getPublicStoreCategories = async () => {
    const res = await axios.get(`${BASE_URL}/store/categories`, {
        headers: { Accept: "application/json" }
    });
    return res.data;
};

export const getPublicStoreProducts = async () => {
    const res = await axios.get(`${BASE_URL}/store/products`, {
        headers: { Accept: "application/json" }
    });
    return res.data;
};

export const getPublicStoreProductDetails = async (productId: number) => {
    const res = await axios.get(`${BASE_URL}/store/products/${productId}`, {
        headers: { Accept: "application/json" }
    });
    return res.data;
};
