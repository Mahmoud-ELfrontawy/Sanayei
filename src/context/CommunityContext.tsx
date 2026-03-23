import React, { createContext, useContext, useState, useCallback } from "react";
import type { CommunityPost } from "../Api/community.api";
import { MOCK_POSTS } from "../pages/Community/mockData";

interface Filters {
    category: string;
    status: string;
    search: string;
    budget_min?: number;
    budget_max?: number;
}

interface CommunityContextValue {
    posts: CommunityPost[];
    isLoading: boolean;
    hasMore: boolean;
    filters: Filters;
    setFilters: (f: Filters) => void;
    fetchPosts: (reset?: boolean) => Promise<void>;
    updatePost: (post: CommunityPost) => void;
    removePost: (id: number) => void;
    prependPost: (post: CommunityPost) => void;
}

const CommunityContext = createContext<CommunityContextValue | null>(null);

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [filters, setFilters] = useState<Filters>({ category: "", status: "", search: "" });

    // ── MOCK MODE: Use static data instead of API ──
    const fetchPosts = useCallback(async (reset = false) => {
        setIsLoading(true);
        // Simulate network delay
        await new Promise((r) => setTimeout(r, 300));

        let filtered = [...MOCK_POSTS];

        // Apply filters
        if (filters.category) {
            filtered = filtered.filter((p) => p.category === filters.category);
        }
        if (filters.status) {
            filtered = filtered.filter((p) => p.status === filters.status);
        }
        if (filters.search) {
            const q = filters.search.toLowerCase();
            filtered = filtered.filter(
                (p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
            );
        }

        if (reset) {
            setPosts(filtered);
        } else {
            setPosts(filtered);
        }
        setHasMore(false);
        setIsLoading(false);
    }, [filters]);

    // ── TODO: Replace mock mode with real API calls ──
    // const fetchPosts = useCallback(async (reset = false) => {
    //     setIsLoading(true);
    //     try {
    //         const currentPage = reset ? 1 : page;
    //         const res = await getCommunityPosts({
    //             page: currentPage,
    //             category: filters.category || undefined,
    //             status: filters.status || undefined,
    //             search: filters.search || undefined,
    //             budget_min: filters.budget_min || undefined,
    //             budget_max: filters.budget_max || undefined,
    //         });
    //         const newPosts: CommunityPost[] = res.data ?? res;
    //         if (reset) {
    //             setPosts(newPosts);
    //             setPage(2);
    //         } else {
    //             setPosts((prev) => [...prev, ...newPosts]);
    //             setPage((p) => p + 1);
    //         }
    //         setHasMore(newPosts.length >= 10);
    //     } catch {
    //         setHasMore(false);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // }, [page, filters]);

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
                posts, isLoading, hasMore, filters,
                setFilters, fetchPosts,
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
