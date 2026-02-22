import axios from 'axios';
import { authStorage } from '../../context/auth/auth.storage';

const BASE_URL = '/api';

const getAuthHeader = () => {
    const token = authStorage.getToken();
    return { 
        Authorization: `Bearer ${token}`,
        "Accept": "application/json",
        "Content-Type": "application/json"
    };
};

export const adminCraftsmenApi = {
    // Fetch all craftsmen with pagination and search
    getAllCraftsmen: async (params: { page?: number; search?: string; status?: string }) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.status) queryParams.append('status', params.status);
        
        return axios.get(`${BASE_URL}/admin/craftsmen?${queryParams.toString()}`, { headers: getAuthHeader() });
    },

    getStatistics: async () => {
        return axios.get(`${BASE_URL}/admin/craftsmen/statistics`, { headers: getAuthHeader() });
    },

    // Verify/Approve a craftsman
    verifyCraftsman: async (id: string | number) => {
        return axios.post(`${BASE_URL}/admin/craftsmen/${id}/verify`, {}, { headers: getAuthHeader() });
    },

    // Reject a craftsman request
    rejectCraftsman: async (id: string | number) => {
        return axios.post(`${BASE_URL}/admin/craftsmen/${id}/reject`, {}, { headers: getAuthHeader() });
    },

    // Toggle block status for a craftsman
    toggleCraftsmanBlock: async (id: string | number) => {
        return axios.post(`${BASE_URL}/admin/craftsmen/${id}/toggle-block`, {}, { headers: getAuthHeader() });
    },

    getCraftsmanWallet: async (id: string | number) => {
        return axios.get(`${BASE_URL}/admin/craftsmen/${id}/wallet`, { headers: getAuthHeader() });
    },

    addCraftsmanBalance: async (id: string | number, amount: number) => {
        return axios.post(`${BASE_URL}/admin/craftsmen/${id}/add-balance`, { amount }, { headers: getAuthHeader() });
    },

    // CRUD Resource Methods (from Route::apiResource)
    getCraftsman: async (id: string | number) => {
        return axios.get(`${BASE_URL}/admin/craftsmen/${id}`, { headers: getAuthHeader() });
    },
    createCraftsman: async (data: any) => {
        return axios.post(`${BASE_URL}/admin/craftsmen`, data, { headers: getAuthHeader() });
    },
    updateCraftsman: async (id: string | number, data: any) => {
        return axios.put(`${BASE_URL}/admin/craftsmen/${id}`, data, { headers: getAuthHeader() });
    },
    deleteCraftsman: async (id: string | number) => {
        return axios.delete(`${BASE_URL}/admin/craftsmen/${id}`, { headers: getAuthHeader() });
    }
};
