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
    rejectCraftsman: async (id: string | number, reason?: string) => {
        return axios.post(`${BASE_URL}/admin/craftsmen/${id}/reject`, { reason }, { headers: getAuthHeader() });
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

    deleteCraftsman: async (id: string | number) => {
        return axios.delete(`${BASE_URL}/admin/craftsmen/${id}`, { headers: getAuthHeader() });
    }
};
