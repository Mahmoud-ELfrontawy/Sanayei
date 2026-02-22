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

export const adminApi = {
    getDashboardStatistics: async () => {
        return axios.get(`${BASE_URL}/admin/dashboard`, { headers: getAuthHeader() });
    },
    
    getProfile: async () => {
        return axios.get(`${BASE_URL}/admin/me`, { headers: getAuthHeader() });
    }
};
