import axios from "axios";
import { authStorage } from "../context/auth/auth.storage";

/* ================= Base Config ================= */

export const BASE_URL = "/api";

const getHeaders = () => {
    const token = authStorage.getToken();

    return {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    };
};

const getFormDataHeaders = () => {
    const token = authStorage.getToken();

    return {
        Authorization: `Bearer ${token}`,
    };
};

/* ================= Types ================= */

export interface ChatMessage {
    id: number;
    sender_id: number;
    sender_type: string;
    receiver_id: number;
    receiver_type: string;
    message?: string;
    message_type?: "text" | "image" | "audio";
    media_path?: string | null;
    duration?: number | null;
    is_read?: boolean;
    created_at: string;
}

export interface ChatContact {
    id: number;
    name: string;
    type: string; // Will contain class names like 'App\\Models\\User'
    profile_photo?: string;
    profile_image?: string;
    profile_image_url?: string;
    unread_count?: number;
    updated_at?: string;
}

/* ================= Get Workers ================= */

export const getChatWorkers = async () => {
    const response = await axios.get(`${BASE_URL}/chat/workers`, {
        headers: getHeaders(),
    });

    return response.data;
};

/* ================= Get Messages ================= */

export const getMessages = async (userId: number, workerId: number, userType: string) => {
    // نمرر الـ user_type للمطابقة مع الباك إند (يجب أن يكون user أو company أو worker)
    const mappedType = userType === "craftsman" ? "worker" : userType;
    
    const response = await axios.get(`${BASE_URL}/chat/messages`, {
        params: {
            user_id: userId,
            worker_id: workerId,
            user_type: mappedType
        },
        headers: getHeaders(),
    });

    return response.data;
};

/* ================= Send Text Message ================= */

export const sendChatMessage = async (
    senderId: number,
    senderType: string,
    receiverId: number,
    receiverType: string,
    message: string
) => {
    const response = await axios.post(
        `${BASE_URL}/chat/messages/send`,
        {
            sender_id: senderId,
            sender_type: senderType === "craftsman" ? "worker" : senderType,
            receiver_id: receiverId,
            receiver_type: receiverType === "craftsman" ? "worker" : receiverType,
            message,
        },
        { headers: getHeaders() }
    );

    return response.data;
};

/* ================= Send Image ================= */

export const sendChatImage = async (
    senderId: number,
    senderType: string,
    receiverId: number,
    receiverType: string,
    file: File,
    message?: string
) => {
    const formData = new FormData();
    formData.append("sender_id", String(senderId));
    formData.append("sender_type", senderType === "craftsman" ? "worker" : senderType);
    formData.append("receiver_id", String(receiverId));
    formData.append("receiver_type", receiverType === "craftsman" ? "worker" : receiverType);
    formData.append("image", file);
    
    if (message) {
        formData.append("message", message);
    }

    const response = await axios.post(`${BASE_URL}/chat/messages/image`, formData, {
        headers: getFormDataHeaders(),
    });

    return response.data;
};

/* ================= Send Audio ================= */

export const sendChatAudio = async (
    senderId: number,
    senderType: string,
    receiverId: number,
    receiverType: string,
    blob: Blob,
    duration?: number
) => {
    const formData = new FormData();
    formData.append("sender_id", String(senderId));
    formData.append("sender_type", senderType === "craftsman" ? "worker" : senderType);
    formData.append("receiver_id", String(receiverId));
    formData.append("receiver_type", receiverType === "craftsman" ? "worker" : receiverType);
    formData.append("audio", blob, "record.webm");
    
    if (duration) {
        formData.append("duration", String(duration));
    }

    const response = await axios.post(`${BASE_URL}/chat/messages/audio`, formData, {
        headers: getFormDataHeaders(),
    });

    return response.data;
};

/* ================= Worker Chats ================= */

export const getWorkerChats = async (workerId: number) => {
    const response = await axios.get(`${BASE_URL}/chat/worker-chats`, {
        params: { worker_id: workerId },
        headers: getHeaders(),
    });
    return response.data;
};

/* ================= User Chats ================= */

export const getUserChats = async (userId: number, userType: string) => {
    const mappedType = userType === "craftsman" ? "worker" : userType;
    const response = await axios.get(`${BASE_URL}/chat/user-chats`, {
        params: { 
            user_id: userId,
            user_type: mappedType
        },
        headers: getHeaders(),
    });
    return response.data;
};

/* ================= Mark As Read ================= */

export const markMessagesAsRead = async (
    id: number,
    type: string
) => {
    const mappedType = type === "craftsman" ? "worker" : type;
    const response = await axios.post(
        `${BASE_URL}/chat/messages/mark-read`,
        {
            id,
            type: mappedType,
        },
        { headers: getHeaders() }
    );

    return response.data;
};

/* ================= Unread Count ================= */

export const getUnreadMessagesCount = async (
    id: number,
    type: string
) => {
    const mappedType = type === "craftsman" ? "worker" : type;
    const response = await axios.get(`${BASE_URL}/chat/unread-count`, {
        params: {
            id,
            type: mappedType,
        },
        headers: getHeaders(),
    });

    return response.data;
};
