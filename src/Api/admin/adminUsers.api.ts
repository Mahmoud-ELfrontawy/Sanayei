import axios from 'axios';
import { BASE_URL } from '../chat.api';

const getAuthHeader = (hasBody = false) => {
    const token = localStorage.getItem('token');
    const headers: any = { 
        Authorization: `Bearer ${token}`,
        "Accept": "application/json",
    };
    if (hasBody) {
        headers["Content-Type"] = "application/json";
    }
    return headers;
};

export const adminUsersApi = {
    // Users
    getAllUsers: async (params: { page?: number; search?: string; is_active?: boolean; is_admin?: boolean; per_page?: number }) => {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());
        if (params.is_active !== undefined) queryParams.append('is_active', params.is_active ? '1' : '0');
        if (params.is_admin !== undefined) queryParams.append('is_admin', params.is_admin ? '1' : '0');
        
        return axios.get(`${BASE_URL}/admin/users?${queryParams.toString()}`, { headers: getAuthHeader() });
    },
    
    getStatistics: async () => {
        return axios.get(`${BASE_URL}/admin/users/statistics`, { headers: getAuthHeader() });
    },

    exportUsers: async () => {
        return axios.get(`${BASE_URL}/admin/users/export`, { headers: getAuthHeader(), responseType: 'blob' });
    },

    showUser: async (userId: string | number) => {
        return axios.get(`${BASE_URL}/admin/users/${userId}`, { headers: getAuthHeader() });
    },

    createUser: async (data: any) => {
        return axios.post(`${BASE_URL}/admin/users`, data, { headers: getAuthHeader(true) });
    },

    updateUser: async (userId: string | number, data: any) => {
        return axios.put(`${BASE_URL}/admin/users/${userId}`, data, { headers: getAuthHeader(true) });
    },

    deleteUser: async (userId: string | number) => {
        return axios.post(`${BASE_URL}/admin/users/${userId}`, {}, { headers: getAuthHeader(true) });
    },

    forceDeleteUser: async (userId: string | number) => {
        return axios.delete(`${BASE_URL}/admin/users/${userId}/force`, { headers: getAuthHeader(true) });
    },

    toggleBlockUser: async (userId: string | number) => {
        return axios.post(`${BASE_URL}/admin/users/${userId}/toggle-block`, {}, { headers: getAuthHeader(true) });
    },

    getUserWallet: async (userId: string | number) => {
        return axios.get(`${BASE_URL}/admin/users/${userId}/wallet`, { headers: getAuthHeader() });
    },

    addUserBalance: async (userId: string | number, amount: number) => {
        return axios.post(`${BASE_URL}/admin/users/${userId}/add-balance`, { amount }, { headers: getAuthHeader(true) });
    },
};
