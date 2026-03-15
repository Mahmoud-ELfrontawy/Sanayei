import api from "./api";

export interface CommunityPost {
    id: number;
    title: string;
    description: string;
    category: string;
    urgency: "urgent" | "normal";
    location: string;
    latitude?: number;
    longitude?: number;
    images: string[];
    before_images?: string[];
    after_images?: string[];
    status: "open" | "in_progress" | "completed" | "verified";
    user: {
        id: number;
        name: string;
        avatar: string;
        type: string;
    };
    acceptor?: {
        id: number;
        name: string;
        avatar: string;
    };
    comments_count: number;
    interested_count: number;
    points_reward: number;
    created_at: string;
    updated_at: string;
    is_mine: boolean;
    user_has_accepted: boolean;
}

export interface CommunityComment {
    id: number;
    body: string;
    user: {
        id: number;
        name: string;
        avatar: string;
    };
    created_at: string;
}

export interface LeaderboardEntry {
    rank: number;
    user: {
        id: number;
        name: string;
        avatar: string;
    };
    total_points: number;
    verified_jobs: number;
    badge: "bronze" | "silver" | "gold" | "platinum";
}

export interface PointsHistory {
    id: number;
    action: string;
    points: number;
    post_title?: string;
    created_at: string;
}

export interface MyPoints {
    total_points: number;
    verified_jobs: number;
    badge: "bronze" | "silver" | "gold" | "platinum";
    history: PointsHistory[];
    next_draw_date: string;
    draw_entries: number;
}

// ── Feed ──────────────────────────────────────────────
export const getCommunityPosts = async (params?: {
    page?: number;
    category?: string;
    urgency?: string;
    governorate?: string;
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

// ── Accept / Complete / Verify ──────────────────────────
export const acceptCommunityPost = async (id: number) => {
    const res = await api.post(`community/posts/${id}/accept`);
    return res.data;
};

export const completeCommunityPost = async (id: number, formData: FormData) => {
    const res = await api.post(`community/posts/${id}/complete`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

export const verifyCommunityPost = async (id: number) => {
    const res = await api.post(`community/posts/${id}/verify`);
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

// ── Points & Leaderboard ──────────────────────────────────
export const getCommunityLeaderboard = async () => {
    const res = await api.get("community/leaderboard");
    return res.data;
};

export const getMyPoints = async () => {
    const res = await api.get("community/my-points");
    return res.data;
};
