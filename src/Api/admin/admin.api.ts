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

export const adminApi = {
    getDashboardStatistics: async () => {
        return axios.get(`${BASE_URL}/admin/dashboard`, { headers: getAuthHeader() });
    },
    
    getProfile: async () => {
        return axios.get(`${BASE_URL}/admin/me`, { headers: getAuthHeader() });
    }
};
