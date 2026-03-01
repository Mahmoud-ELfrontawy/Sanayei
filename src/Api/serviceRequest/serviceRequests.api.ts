import axios from "axios";
import { authStorage } from "../../context/auth/auth.storage";

/**
 * Base URL for the API
 */
const BASE_URL = "/api";

/**
 * Error handling helper
 */
const handleError = (error: any) => {
    if (error.response) {
        return {
            message: error.response.data.message || 'حدث خطأ أثناء العملية',
            errors: error.response.data.errors || {},
            status: error.response.status,
        };
    } else if (error.request) {
        return {
            message: 'لا يمكن الاتصال بالسيرفر',
            errors: {},
        };
    } else {
        return {
            message: error.message || 'حدث خطأ غير متوقع',
            errors: {},
        };
    }
};

/**
 * API Instance configuration
 */
const getHeaders = () => {
    const token = authStorage.getToken();
    return {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
    };
};

/**
 * Get user's own service requests
 */
export const getMyServiceRequests = async (filters = {}) => {
    try {
        const response = await axios.get(`${BASE_URL}/user/service-requests`, {
            params: filters,
            headers: getHeaders(),
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

/**
 * Get craftsman's incoming service requests
 */
export const getIncomingServiceRequests = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/craftsmen/service-requests`, {
            headers: getHeaders(),
        });
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

/**
 * Update service request status by craftsman (accept/reject only)
 */
export const updateServiceRequestStatus = async (
    requestId: number,
    status: "accepted" | "rejected"
) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/craftsmen/service-requests/${requestId}/status`,
            { status },
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

/**
 * Complete service request by user (mark as completed)
 */
export const completeServiceRequest = async (requestId: number) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/user/service-requests/${requestId}/complete`,
            { user_confirmation: "confirmed" },
            { headers: getHeaders() }
        );
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

/**
 * Create a new service request
 */
export const createServiceRequest = async (payload: any) => {
    try {
        const headers = getHeaders();
        // If payload is FormData, don't set Content-Type
        if (payload instanceof FormData) {
            delete (headers as any)["Content-Type"];
        }

        const response = await axios.post(
            `${BASE_URL}/service-requests`,
            payload,
            { headers }
        );
        return response.data;
    } catch (error) {
        throw handleError(error);
    }
};

/**
 * Check if there's an accepted service request between a user and craftsman.
 * Used by chat providers to determine if messaging is allowed.
 * @param role - 'user' fetches from /user/service-requests, 'craftsman' from /craftsmen/service-requests
 * @param otherId - The ID of the other party (craftsman_id for user, user_id for craftsman)
 */
export const getActiveServiceRequest = async (
    role: 'user' | 'craftsman',
    otherId: number
): Promise<{ status: 'accepted' | 'completed' | 'pending' | 'rejected' | null }> => {
    try {
        let requests: any[] = [];

        if (role === 'user') {
            const res = await getMyServiceRequests();
            requests = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
            const match = requests.find((r: any) => r.craftsman_id === otherId);
            return { status: match?.status ?? null };
        } else {
            const res = await getIncomingServiceRequests();
            requests = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
            const match = requests.find((r: any) => r.user_id === otherId || r.user?.id === otherId);
            return { status: match?.status ?? null };
        }
    } catch {
        return { status: null };
    }
};

