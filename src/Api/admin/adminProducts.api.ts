import axios from "axios";
import { authStorage } from "../../context/auth/auth.storage";

/**
 * Admin Product Management API
 * Handles operations on products across all companies
 */

const BASE_URL = "/api";

const getHeaders = () => {
    const token = authStorage.getToken();
    return { 
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json"
    };
};

export const adminProductsApi = {
    /**
     * Fetch all products for admin
     */
    getAllProducts: async (params?: { page?: number; search?: string }) => {
        try {
            const response = await axios.get(`${BASE_URL}/admin/products`, {
                headers: getHeaders(),
                params: params,
            });
            return response.data;
        } catch (error) {
            console.error("Failed to fetch admin products", error);
            throw error;
        }
    },

    /**
     * Delete a product (Admin cleanup)
     */
    deleteProduct: async (id: number) => {
        try {
            const response = await axios.delete(`${BASE_URL}/admin/products/${id}`, {
                headers: getHeaders(),
            });
            return response.data;
        } catch (error) {
            console.error("Failed to delete product (Admin)", error);
            throw error;
        }
    },

    /**
     * Toggle product activation status (Admin)
     */
    toggleProductStatus: async (id: number) => {
        try {
            const response = await axios.post(`${BASE_URL}/admin/products/${id}/toggle`, {}, {
                headers: getHeaders(),
            });
            return response.data;
        } catch (error) {
            console.error("Failed to toggle product status (Admin)", error);
            throw error;
        }
    }
};
