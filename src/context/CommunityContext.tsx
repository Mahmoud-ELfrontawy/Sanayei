import React, { createContext, useContext, useState, useCallback } from "react";
import type { CommunityPost } from "../Api/community.api";
import { getCommunityPosts } from "../Api/community.api";

interface Filters {
    category: string;
    status: string;
    search: string;
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
    const [page, setPage] = useState(1);
    const [filters, setFiltersState] = useState<Filters>({ category: "", status: "", search: "" });

    const setFilters = useCallback((f: Filters) => {
        setFiltersState(f);
        setPage(1);
    }, []);

    const fetchPosts = useCallback(async (reset = false) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const currentPage = reset ? 1 : page;
            const res = await getCommunityPosts({
                page: currentPage,
                category: filters.category || undefined,
                status: filters.status || undefined,
                search: filters.search || undefined,
            });

            // Handle both paginated and plain array responses
            const newPosts: CommunityPost[] = res.data ?? res;
            const lastPage: number = res.last_page ?? 1;
            const currentPageReturned: number = res.current_page ?? currentPage;

            if (reset || currentPage === 1) {
                setPosts(newPosts);
                setPage(2);
            } else {
                setPosts((prev) => [...prev, ...newPosts]);
                setPage((p) => p + 1);
            }
            setHasMore(currentPageReturned < lastPage);
        } catch (err) {
            console.error("Failed to load community posts", err);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    }, [page, filters, isLoading]);

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
