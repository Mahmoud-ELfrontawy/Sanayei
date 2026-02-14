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

export const adminGovernoratesApi = {
    // Fetch all governorates
    getAllGovernorates: async () => {
        return axios.get(`${BASE_URL}/admin/governorates`, { headers: getAuthHeader() });
    },

    // Fetch a single governorate
    getGovernorate: async (id: string) => {
        return axios.get(`${BASE_URL}/admin/governorates/${id}`, { headers: getAuthHeader() });
    },

    // Create a new governorate
    createGovernorate: async (data: { name: string; is_active?: boolean }) => {
        return axios.post(`${BASE_URL}/admin/governorates`, data, { headers: getAuthHeader() });
    },

    // Update an existing governorate
    updateGovernorate: async (id: string, data: { name?: string; is_active?: boolean }) => {
        return axios.put(`${BASE_URL}/admin/governorates/${id}`, data, { headers: getAuthHeader() });
    },

    // Delete a governorate
    deleteGovernorate: async (id: string) => {
        return axios.delete(`${BASE_URL}/admin/governorates/${id}`, { headers: getAuthHeader() });
    }
};
