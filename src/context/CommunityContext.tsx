import React, { createContext, useContext, useState, useCallback } from "react";
import {
    getCommunityPosts,
    getCommunityLeaderboard,
    getMyPoints,
    type CommunityPost,
    type LeaderboardEntry,
    type MyPoints,
} from "../Api/community.api";

interface Filters {
    category: string;
    urgency: string;
    search: string;
}

interface CommunityContextValue {
    posts: CommunityPost[];
    leaderboard: LeaderboardEntry[];
    myPoints: MyPoints | null;
    isLoading: boolean;
    hasMore: boolean;
    filters: Filters;
    setFilters: (f: Filters) => void;
    fetchPosts: (reset?: boolean) => Promise<void>;
    fetchLeaderboard: () => Promise<void>;
    fetchMyPoints: () => Promise<void>;
    updatePost: (post: CommunityPost) => void;
    removePost: (id: number) => void;
    prependPost: (post: CommunityPost) => void;
}

const CommunityContext = createContext<CommunityContextValue | null>(null);

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [myPoints, setMyPoints] = useState<MyPoints | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [filters, setFilters] = useState<Filters>({ category: "", urgency: "", search: "" });

    const fetchPosts = useCallback(async (reset = false) => {
        setIsLoading(true);
        try {
            const currentPage = reset ? 1 : page;
            const res = await getCommunityPosts({
                page: currentPage,
                category: filters.category || undefined,
                urgency: filters.urgency || undefined,
                search: filters.search || undefined,
            });
            const newPosts: CommunityPost[] = res.data ?? res;
            if (reset) {
                setPosts(newPosts);
                setPage(2);
            } else {
                setPosts((prev) => [...prev, ...newPosts]);
                setPage((p) => p + 1);
            }
            setHasMore(newPosts.length >= 10);
        } catch {
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [page, filters]);

    const fetchLeaderboard = useCallback(async () => {
        try {
            const res = await getCommunityLeaderboard();
            setLeaderboard(res.data ?? res);
        } catch { /* noop */ }
    }, []);

    const fetchMyPoints = useCallback(async () => {
        try {
            const res = await getMyPoints();
            setMyPoints(res.data ?? res);
        } catch { /* noop */ }
    }, []);

    const updatePost = useCallback((updated: CommunityPost) => {
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    }, []);

    const removePost = useCallback((id: number) => {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    }, []);

    const prependPost = useCallback((post: CommunityPost) => {
        setPosts((prev) => [post, ...prev]);
    }, []);

    return (
        <CommunityContext.Provider
            value={{
                posts, leaderboard, myPoints, isLoading, hasMore, filters,
                setFilters, fetchPosts, fetchLeaderboard, fetchMyPoints,
                updatePost, removePost, prependPost,
            }}
        >
            {children}
        </CommunityContext.Provider>
    );
};

export const useCommunity = (): CommunityContextValue => {
    const ctx = useContext(CommunityContext);
    if (!ctx) throw new Error("useCommunity must be used within CommunityProvider");
    return ctx;
};
