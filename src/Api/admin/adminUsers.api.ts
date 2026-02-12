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

export const adminUsersApi = {
    // Fetch all users
    getAllUsers: async () => {
        return axios.get(`${BASE_URL}/admin/users`, { headers: getAuthHeader() });
    },

    // Update user status (Active, Banned, Suspended)
    updateStatus: async (userId: string, status: string) => {
        return axios.post(`${BASE_URL}/admin/users/${userId}/status`, { status }, { headers: getAuthHeader() });
    },

    // Update user role (admin, user, craftsman)
    updateRole: async (userId: string, role: string) => {
        return axios.post(`${BASE_URL}/admin/users/${userId}/role`, { role }, { headers: getAuthHeader() });
    },

    // Toggle verification
    toggleVerification: async (userId: string) => {
        return axios.post(`${BASE_URL}/admin/users/${userId}/verify`, {}, { headers: getAuthHeader() });
    },

    // Reset password (send link or temporary)
    resetPassword: async (userId: string) => {
        return axios.post(`${BASE_URL}/admin/users/${userId}/reset-password`, {}, { headers: getAuthHeader() });
    },

    // Update wallet balance
    updateWallet: async (userId: string, amount: number, type: 'add' | 'deduct') => {
        return axios.post(`${BASE_URL}/admin/users/${userId}/wallet`, { amount, type }, { headers: getAuthHeader() });
    }
};
