import axios from "axios";

/**
 * Base URL for the API
 */
const BASE_URL = "https://sanay3i.net/api";

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
    const token = localStorage.getItem("token");
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
 * Update service request status (accept/reject)
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
 * Delete a service request
 */
export const deleteServiceRequest = async (requestId: number) => {
    try {
        const response = await axios.delete(
            `${BASE_URL}/service-requests/${requestId}`,
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
