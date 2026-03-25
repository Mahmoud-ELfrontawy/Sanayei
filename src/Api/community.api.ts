import api from "./api";
import { getFullImageUrl } from "../utils/imageUrl";

// ── Base URL helper ───────────────────────────────────
export const communityImageUrl = (path: string | null | undefined): string => {
    return getFullImageUrl(path) || "";
};

// ── Interfaces ───────────────────────────────────────

export interface LeaderboardEntry {
    rank: number;
    user: { id: number; name: string; avatar: string | null };
    total_points: number;
    verified_jobs: number;
    badge: "bronze" | "silver" | "gold" | "platinum";
}

export interface ServiceOffer {
    id: number;
    craftsman: {
        id: number;
        name: string;
        avatar: string | null;
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
    service?: {
        id: number;
        name: string;
        icon: string;
    };
    category: string; // fallback or legacy
    urgency: "urgent" | "normal";
    budget_min?: number;
    budget_max?: number;
    location?: string;
    latitude?: number;
    longitude?: number;
    images: string[];          // before images
    after_images?: string[];   // after (completion) images
    status: "open" | "in_progress" | "completed" | "verified" | "cancelled";
    points_reward: number;
    user_id?: number | null;
    company_id?: number | null;
    user: {
        id: number;
        name: string;
        avatar: string | null;
        type: string;
    };
    company?: {
        id: number;
        name: string;
        avatar: string | null;
    } | null;
    acceptor?: {
        id: number;
        name: string;
        avatar: string | null;
    } | null;
    accepted_offer?: ServiceOffer;
    offers_count: number;
    offers?: ServiceOffer[];
    interests_count?: number;
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
        avatar: string | null;
        type: string;
    };
    created_at: string;
}

// ── Feed ──────────────────────────────────────────────
export const getCommunityPosts = async (params?: {
    page?: number;
    category?: string;
    status?: string;
    search?: string;
    urgency?: string;
}) => {
    const res = await api.get("community/posts", { params });
    return res.data;
};

export const getCommunityPost = async (id: number) => {
    const res = await api.get(`community/posts/${id}`);
    return res.data;
};

// ── Create / Delete ──────────────────────────────────
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

// ── Offers ────────────────────────────────────────────
export const getPostOffers = async (postId: number) => {
    const res = await api.get(`community/posts/${postId}/offers`);
    return res.data;
};

export const submitOffer = async (
    postId: number,
    data: { price: number; description: string; delivery_days: number }
) => {
    const res = await api.post(`community/posts/${postId}/offers`, data);
    return res.data;
};

export const acceptOffer = async (postId: number, offerId: number) => {
    const res = await api.post(`community/posts/${postId}/offers/${offerId}/accept`);
    return res.data;
};

export const verifyCommunityPost = async (postId: number) => {
    const res = await api.post(`community/posts/${postId}/verify`);
    return res.data;
};

// ── Chat Access Check (منفصل عن نظام الخدمات) ────────────────
/**
 * يتحقق إذا كان هناك طلب مجتمع نشط (in_progress) بين المستخدم الحالي والصنايعي
 * يُستخدم من Chat Providers بدل getActiveServiceRequest للمحادثات القادمة من المجتمع
 */
export const getActiveCommunityChat = async (
    craftsmanId: number
): Promise<{ status: "in_progress" | "verified" | "completed" | "cancelled" | null }> => {
    try {
        const res = await api.get(`community/active-chat/${craftsmanId}`);
        return { status: res.data?.status ?? null };
    } catch {
        return { status: null };
    }
};

// ── Comments ──────────────────────────────────────────
export const getCommunityComments = async (postId: number) => {
    const res = await api.get(`community/posts/${postId}/comments`);
    return res.data;
};

export const addCommunityComment = async (postId: number, body: string) => {
    const res = await api.post(`community/posts/${postId}/comments`, { body });
    return res.data;
};

// ── Leaderboard & Points ─────────────────────────────
export const getCommunityLeaderboard = async () => {
    const res = await api.get("community/leaderboard");
    return res.data;
};

export const getMyPoints = async () => {
    const res = await api.get("community/my-points");
    return res.data;
};
