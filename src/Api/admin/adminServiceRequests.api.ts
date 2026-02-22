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

export const adminServiceRequestsApi = {
    // Fetch all service requests
    getAllServiceRequests: async () => {
        return axios.get(`${BASE_URL}/admin/service-requests`, { headers: getAuthHeader() });
    },

    // Fetch a single service request
    getServiceRequest: async (id: string) => {
        return axios.get(`${BASE_URL}/admin/service-requests/${id}`, { headers: getAuthHeader() });
    },

    // Create a new service request
    createServiceRequest: async (data: any) => {
        return axios.post(`${BASE_URL}/admin/service-requests`, data, { headers: getAuthHeader() });
    },

    // Update an existing service request
    updateServiceRequest: async (id: string, data: any) => {
        return axios.put(`${BASE_URL}/admin/service-requests/${id}`, data, { headers: getAuthHeader() });
    },

    // Delete a service request
    deleteServiceRequest: async (id: string) => {
        return axios.delete(`${BASE_URL}/admin/service-requests/${id}`, { headers: getAuthHeader() });
    }
};
