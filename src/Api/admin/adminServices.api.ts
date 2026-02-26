import axios from 'axios';
import { authStorage } from '../../context/auth/auth.storage';

const BASE_URL = '/api';

export const getAuthHeader = () => {
    const token = authStorage.getToken();
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

    // Create a new service (supports FormData for icon upload)
    createService: async (data: FormData) => {
        return axios.post(`${BASE_URL}/admin/services`, data, { 
            headers: {
                ...getAuthHeader(),
                "Content-Type": "multipart/form-data" 
            } 
        });
    },

    // Update an existing service (supports FormData)
    // Note: We use POST with _method=PUT because PHP has issues with PUT multipart data
    updateService: async (id: string, data: FormData) => {
        data.append('_method', 'PUT');
        return axios.post(`${BASE_URL}/admin/services/${id}`, data, { 
            headers: {
                ...getAuthHeader(),
                "Content-Type": "multipart/form-data" 
            } 
        });
    },

    // Delete a service
    deleteService: async (id: string) => {
        return axios.delete(`${BASE_URL}/admin/services/${id}`, { headers: getAuthHeader() });
    }
};
