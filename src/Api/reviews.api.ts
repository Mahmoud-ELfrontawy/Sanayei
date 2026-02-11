import axios from "axios";

const BASE_URL = "https://sanay3i.net/api";

const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
    };
};

export interface ReviewPayload {
    craftsman_id: number;
    service_request_id: number;
    rating: number; 
    comment: string;
}

/**
 * Submit a new review for a craftsman
 */
export const submitReview = async (payload: ReviewPayload) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/reviews`,
            payload,
            { headers: getHeaders() }
        );

        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw {
                message: error.response.data.message || "حدث خطأ أثناء إرسال التقييم",
                status: error.response.status,
            };
        }
        throw { message: "تعذر الاتصال بالسيرفر" };
    }
};

export interface UserReview {
    id: number;
    craftsman: {
        id: number;
        name: string;
        profile_photo?: string;
    };
    rating: number;
    comment: string;
    created_at: string;
}

/**
 * Get all reviews written by the current user
 * Uses GET /api/reviews which returns authenticated user's reviews
 */
export const getUserReviews = async (): Promise<UserReview[]> => {
    try {
        const response = await axios.get(
            `${BASE_URL}/reviews`,
            { headers: getHeaders() }
        );

        // Handle both response.data.data and response.data formats
        const data = response.data?.data || response.data || [];
        
        return Array.isArray(data) ? data : [];
    } catch (error: any) {
        console.error("Error fetching user reviews:", error);
        
        if (error.response) {
            throw {
                message: error.response.data.message || "حدث خطأ أثناء جلب التقييمات",
                status: error.response.status,
            };
        }
        throw { message: "تعذر الاتصال بالسيرفر" };
    }
};
