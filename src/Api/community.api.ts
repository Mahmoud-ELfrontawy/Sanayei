import api from "./api";

export interface ServiceOffer {
    id: number;
    craftsman: {
        id: number;
        name: string;
        avatar: string;
        rating: number;
        completed_jobs: number;
    };
    price: number;
    description: string;
    delivery_days: number;
    status: "pending" | "accepted" | "rejected";
    created_at: string;
}

export interface CommunityPost {
    id: number;
    title: string;
    description: string;
    category: string;
    budget_min?: number;
    budget_max?: number;
    location: string;
    latitude?: number;
    longitude?: number;
    images: string[];
    status: "open" | "in_progress" | "completed" | "cancelled";
    user: {
        id: number;
        name: string;
        avatar: string;
        type: string;
    };
    accepted_offer?: ServiceOffer;
    offers_count: number;
    offers?: ServiceOffer[];
    comments_count: number;
    created_at: string;
    updated_at: string;
    is_mine: boolean;
    has_offered: boolean;
}

export interface CommunityComment {
    id: number;
    body: string;
    user: {
        id: number;
        name: string;
        avatar: string;
        type: string;
    };
    created_at: string;
}

// ── Feed ──────────────────────────────────────────────
export const getCommunityPosts = async (params?: {
    page?: number;
    category?: string;
    status?: string;
    budget_min?: number;
    budget_max?: number;
    search?: string;
}) => {
    const res = await api.get("community/posts", { params });
    return res.data;
};

export const getCommunityPost = async (id: number) => {
    const res = await api.get(`community/posts/${id}`);
    return res.data;
};

// ── Create ──────────────────────────────────────────────
export const createCommunityPost = async (formData: FormData) => {
    const res = await api.post("community/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const deleteCommunityPost = async (id: number) => {
    const res = await api.delete(`community/posts/${id}`);
    return res.data;
};

// ── Offers ──────────────────────────────────────────────
export const getPostOffers = async (postId: number) => {
    const res = await api.get(`community/posts/${postId}/offers`);
    return res.data;
};

export const submitOffer = async (postId: number, data: {
    price: number;
    description: string;
    delivery_days: number;
}) => {
    const res = await api.post(`community/posts/${postId}/offers`, data);
    return res.data;
};

export const acceptOffer = async (postId: number, offerId: number) => {
    const res = await api.post(`community/posts/${postId}/offers/${offerId}/accept`);
    return res.data;
};

// ── Comments ──────────────────────────────────────────────
export const getCommunityComments = async (postId: number) => {
    const res = await api.get(`community/posts/${postId}/comments`);
    return res.data;
};

export const addCommunityComment = async (postId: number, body: string) => {
    const res = await api.post(`community/posts/${postId}/comments`, { body });
    return res.data;
};
