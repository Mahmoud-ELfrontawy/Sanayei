import axios from "axios";

const BASE_URL = "https://sanay3i.net/api";

const getHeaders = () => {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    };
};

export const getChatWorkers = async () => {
    // Changed from /craftsmen to /workers to match backend
    const response = await axios.get(`${BASE_URL}/workers`, { headers: getHeaders() });
    return response.data;
};

export const getMessages = async (userId: number, workerId: number) => {
    const response = await axios.post(`${BASE_URL}/messages/chat`, {
        user_id: userId,
        worker_id: workerId
    }, { headers: getHeaders() });
    return response.data;
};

export const sendChatMessage = async (
    senderId: number,
    senderType: string,
    receiverId: number,
    receiverType: string,
    message: string
) => {
    const response = await axios.post(`${BASE_URL}/messages/send`, {
        sender_id: senderId,
        sender_type: senderType, // 'user' or 'worker'
        receiver_id: receiverId,
        receiver_type: receiverType, // 'user' or 'worker'
        message: message
    }, { headers: getHeaders() });
    return response.data;
};

export const getWorkerChats = async (workerId: number) => {
    try {
        const response = await axios.post(`${BASE_URL}/messages/worker-chats`, {
            worker_id: workerId
        }, { headers: getHeaders() });
        return response.data;
    } catch (e: any) {
        if (e.response?.status === 404) return { data: [] };
        throw e;
    }
};

export const markMessagesAsRead = async (userId: number, workerId: number, type: string) => {
    const response = await axios.post(`${BASE_URL}/messages/mark-as-read`, {
        user_id: userId,
        worker_id: workerId,
        type: type // 'user' or 'worker'
    }, { headers: getHeaders() });
    return response.data;
};

export const getUnreadMessagesCount = async (params?: any) => {
    // Backend expects 'user_id' or 'worker_id' as query params (for GET) or body (for POST).
    // The route provided is GET /messages/unread-count.
    const response = await axios.get(`${BASE_URL}/messages/unread-count`, { 
        params: params,
        headers: getHeaders() 
    });
    return response.data;
};

export const getUserChats = async (userId: number) => {
    try {
        const response = await axios.post(`${BASE_URL}/messages/user-chats`, {
             user_id: userId 
        }, { headers: getHeaders() });
        return response.data;
    } catch (e: any) {
        // Silently return empty if endpoints are missing or 404
        if (e.response?.status === 404 || e.status === 404) {
            return { data: [] };
        }
        throw e;
    }
};
