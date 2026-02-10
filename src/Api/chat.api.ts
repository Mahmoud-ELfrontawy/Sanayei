import axios, { AxiosError } from "axios";

/* ================= Base Config ================= */

const BASE_URL = "https://sanay3i.net/api";

const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
    };
};

/* ================= Types ================= */

export interface ChatMessage {
    id: number;
    sender_id: number;
    receiver_id: number;
    message?: string;
    message_type?: "text" | "image" | "audio";
    media_path?: string | null;
    created_at: string;
}

export interface ChatContact {
    id: number;
    name: string;
    profile_photo?: string;
    profile_image?: string;
    unread_count?: number;
}

/* ================= Get Workers ================= */

export const getChatWorkers = async () => {
    const response = await axios.get(`${BASE_URL}/workers`, {
        headers: getHeaders(),
    });

    return response.data;
};

/* ================= Get Messages ================= */

export const getMessages = async (userId: number, workerId: number) => {
    const response = await axios.post(
        `${BASE_URL}/messages/chat`,
        {
            user_id: userId,
            worker_id: workerId,
        },
        { headers: getHeaders() }
    );

    return response.data;
};

/* ================= Send Text Message ================= */

export const sendChatMessage = async (
    senderId: number,
    senderType: "user" | "worker",
    receiverId: number,
    receiverType: "user" | "worker",
    message: string
) => {
    const response = await axios.post(
        `${BASE_URL}/messages/send`,
        {
            sender_id: senderId,
            sender_type: senderType,
            receiver_id: receiverId,
            receiver_type: receiverType,
            message,
        },
        { headers: getHeaders() }
    );

    return response.data;
};

/* ================= Send Image ================= */

export const sendChatImage = async (
    senderId: number,
    senderType: "user" | "worker",
    receiverId: number,
    receiverType: "user" | "worker",
    file: File
) => {
    const formData = new FormData();
    formData.append("sender_id", String(senderId));
    formData.append("sender_type", senderType);
    formData.append("receiver_id", String(receiverId));
    formData.append("receiver_type", receiverType);
    formData.append("image", file);

    const response = await axios.post(`${BASE_URL}/messages/send-image`, formData, {
        headers: getHeaders(),
    });


    return response.data;
};

/* ================= Send Audio ================= */

export const sendChatAudio = async (
    senderId: number,
    senderType: "user" | "worker",
    receiverId: number,
    receiverType: "user" | "worker",
    blob: Blob
) => {
    const formData = new FormData();
    formData.append("sender_id", String(senderId));
    formData.append("sender_type", senderType);
    formData.append("receiver_id", String(receiverId));
    formData.append("receiver_type", receiverType);
    formData.append("audio", blob, "record.webm");

    const response = await axios.post(`${BASE_URL}/messages/send-audio`, formData, {
        headers: getHeaders(),
    });

    return response.data;
};

/* ================= Worker Chats ================= */

export const getWorkerChats = async (workerId: number) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/messages/worker-chats`,
            { worker_id: workerId },
            { headers: getHeaders() }
        );

        return response.data;
    } catch (error) {
        const err = error as AxiosError;

        if (err.response?.status === 404) {
            return { data: [] };
        }

        throw err;
    }
};

/* ================= User Chats ================= */

export const getUserChats = async (userId: number) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/messages/user-chats`,
            { user_id: userId },
            { headers: getHeaders() }
        );

        return response.data;
    } catch (error) {
        const err = error as AxiosError;

        if (err.response?.status === 404) {
            return { data: [] };
        }

        throw err;
    }
};

/* ================= Mark As Read ================= */

export const markMessagesAsRead = async (
    userId: number,
    workerId: number,
    type: "user" | "worker"
) => {
    const response = await axios.post(
        `${BASE_URL}/messages/mark-as-read`,
        {
            user_id: userId,
            worker_id: workerId,
            type,
        },
        { headers: getHeaders() }
    );

    return response.data;
};

/* ================= Unread Count ================= */

export const getUnreadMessagesCount = async (
    params?: { user_id?: number; worker_id?: number }
) => {
    const response = await axios.get(`${BASE_URL}/messages/unread-count`, {
        params,
        headers: getHeaders(),
    });

    return response.data;
};

