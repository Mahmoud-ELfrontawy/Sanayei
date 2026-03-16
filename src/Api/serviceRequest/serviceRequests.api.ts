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
 * Cancel service request by user (before acceptance)
 */
export const cancelServiceRequest = async (requestId: number) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/user/service-requests/${requestId}/cancel`,
            {},
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
            `${BASE_URL}/user/service-requests`,
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
    role: 'user' | 'craftsman' | 'company',
    otherId: number
): Promise<{ status: 'accepted' | 'completed' | 'pending' | 'rejected' | null }> => {
    try {
        let requests: any[] = [];

        if (role === 'user' || role === 'company') {
            const res = await getMyServiceRequests();
            const data = res.data || res || [];
            requests = Array.isArray(data) ? data : (data.data || []);
            
            // Prioritize active requests (accepted or pending) 
            // Also check that it's not already confirmed/completed by the user/company
            const activeMatch = requests.find((r: any) => 
                Number(r.craftsman_id) === Number(otherId) &&
                (r.status === 'accepted' || r.status === 'pending') &&
                r.user_confirmation !== 'confirmed' &&
                r.status !== 'completed'
            );
            if (activeMatch) return { status: activeMatch.status };

            const lastMatch = requests.find((r: any) => Number(r.craftsman_id) === Number(otherId));
            return { status: lastMatch?.status ?? null };
        } else {
            const res = await getIncomingServiceRequests();
            const data = res.data || res || [];
            requests = Array.isArray(data) ? data : (data.data || []);
            
            // البحث عن أي طلب نشط (مقبول أو قيد الانتظار) من هذا الطرف
            const activeMatch = requests.find((r: any) => 
                (Number(r.user_id) === Number(otherId) || 
                 Number(r.company_id) === Number(otherId) || 
                 Number(r.requester_craftsman_id) === Number(otherId)) &&
                (r.status === 'accepted' || r.status === 'pending') &&
                r.user_confirmation !== 'confirmed' &&
                r.status !== 'completed'
            );

            if (activeMatch) return { status: activeMatch.status };

            // إذا لم نجد طلباً نشطاً، نبحث عن آخر طلب عام
            const lastMatch = requests.find((r: any) => 
                Number(r.user_id) === Number(otherId) || 
                Number(r.company_id) === Number(otherId) || 
                Number(r.requester_craftsman_id) === Number(otherId)
            );

            return { status: lastMatch?.status ?? null };
        }
    } catch {
        return { status: null };
    }
};

