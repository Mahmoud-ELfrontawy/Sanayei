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

export const adminServicesApi = {
    // Fetch all services with pagination and search
    getAllServices: async (params: { page?: number; search?: string }) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.search) queryParams.append('search', params.search);
        
        return axios.get(`${BASE_URL}/admin/services?${queryParams.toString()}`, { headers: getAuthHeader() });
    },

    // Fetch a single service
    getService: async (id: string) => {
        return axios.get(`${BASE_URL}/admin/services/${id}`, { headers: getAuthHeader() });
    },

    // Create a new service
    createService: async (data: { name: string; description?: string; icon?: string; price?: number }) => {
        return axios.post(`${BASE_URL}/admin/services`, data, { headers: getAuthHeader() });
    },

    // Update an existing service
    updateService: async (id: string, data: { name?: string; description?: string; icon?: string; price?: number }) => {
        return axios.put(`${BASE_URL}/admin/services/${id}`, data, { headers: getAuthHeader() });
    },

    // Delete a service
    deleteService: async (id: string) => {
        return axios.delete(`${BASE_URL}/admin/services/${id}`, { headers: getAuthHeader() });
    }
};
