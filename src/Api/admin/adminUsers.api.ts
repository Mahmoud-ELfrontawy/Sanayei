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
    showUser: async (userId: string) => {
        return axios.get(`${BASE_URL}/admin/users/${userId}`, { headers: getAuthHeader() });
    },
    createUser: async (data: any) => {
        return axios.post(`${BASE_URL}/admin/users`, data, { headers: getAuthHeader(true) });
    },
    updateUser: async (userId: string, data: any) => {
        return axios.put(`${BASE_URL}/admin/users/${userId}`, data, { headers: getAuthHeader(true) });
    },
    deleteUser: async (userId: string) => {
        return axios.delete(`${BASE_URL}/admin/users/${userId}`, { headers: getAuthHeader(true) });
    },
    toggleBlockUser: async (userId: string) => {
        return axios.patch(`${BASE_URL}/admin/users/${userId}/toggle-block`, {}, { headers: getAuthHeader(true) });
    },
};
