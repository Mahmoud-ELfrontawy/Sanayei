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

export const adminReviewsApi = {
    // Fetch all reviews
    getAllReviews: async () => {
        return axios.get(`${BASE_URL}/admin/reviews`, { headers: getAuthHeader() });
    },

    // Delete a review
    deleteReview: async (id: string) => {
        return axios.delete(`${BASE_URL}/admin/reviews/${id}`, { headers: getAuthHeader() });
    }
};
