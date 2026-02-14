import axios from 'axios';
import { BASE_URL } from '../chat.api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
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

    // Verify/Approve a craftsman
    verifyCraftsman: async (id: string) => {
        return axios.post(`${BASE_URL}/admin/craftsmen/${id}/verify`, {}, { headers: getAuthHeader() });
    },

    // Reject a craftsman request
    rejectCraftsman: async (id: string) => {
        return axios.post(`${BASE_URL}/admin/craftsmen/${id}/reject`, {}, { headers: getAuthHeader() });
    },

    // Toggle block status for a craftsman
    toggleCraftsmanBlock: async (id: string) => {
        return axios.post(`${BASE_URL}/admin/craftsmen/${id}/block`, {}, { headers: getAuthHeader() });
    },

    // CRUD Resource Methods (from Route::apiResource)
    getCraftsman: async (id: string) => {
        return axios.get(`${BASE_URL}/admin/craftsmen/${id}`, { headers: getAuthHeader() });
    },
    createCraftsman: async (data: any) => {
        return axios.post(`${BASE_URL}/admin/craftsmen`, data, { headers: getAuthHeader() });
    },
    updateCraftsman: async (id: string, data: any) => {
        return axios.put(`${BASE_URL}/admin/craftsmen/${id}`, data, { headers: getAuthHeader() });
    },
    deleteCraftsman: async (id: string) => {
        return axios.delete(`${BASE_URL}/admin/craftsmen/${id}`, { headers: getAuthHeader() });
    }
};
