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
