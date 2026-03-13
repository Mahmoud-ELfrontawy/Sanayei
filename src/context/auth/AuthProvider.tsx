import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { authService } from "./auth.service";
import { authStorage } from "./auth.storage";
import { AuthContext } from "./auth.context";
import type { AuthState } from "./auth.types";
import { initializeEcho, disconnectEcho } from "../../utils/echo";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();

    // Core State - Hydrate from storage immediately
    const [state, setState] = useState<AuthState>(() => {
        const token = authStorage.getToken();
        const userType = authStorage.getUserType();
        const storedUser = authStorage.getUser();
        return {
            user: storedUser,
            token,
            userType,
            isAuthenticated: !!token && !!userType,
            isLoading: !!token && !storedUser, // Loading if we have a token but no stored user
        };
    });

    // Profile Fetching Logic (React Query)
    const {
        data: userProfile,
        isLoading: isFetchingProfile,
        isError: profileError,
        error: fetchError,
    } = useQuery({
        queryKey: ["authUser"],
        queryFn: () => (state.userType && state.token ? authService.fetchProfile(state.userType) : null),
        enabled: !!state.token && !!state.userType,
        staleTime: 1000 * 60 * 5, // Profile is fresh for 5 mins
        refetchInterval: 1000 * 30, // 🔄 Check every 30 seconds to catch blocked accounts faster
        retry: (count, error) => {
            // No retry on 403 (Blocked/Banned)
            if (axios.isAxiosError(error) && error.response?.status === 403) return false;
            // Allow 1 retry on 401 for transient network drops
            if (axios.isAxiosError(error) && error.response?.status === 401) return count < 1;
            return false;
        },
        retryDelay: 2000,
    });


    useEffect(() => {
        if (profileError && axios.isAxiosError(fetchError)) {
            const status = fetchError.response?.status;

            // 🛑 403: Banned/Blocked (Instant logout)
            if (status === 403) {
                // If we're already on login/register, don't redirect (let local form handle it)
                if (window.location.pathname.includes("/login") || window.location.pathname.includes("/register")) {
                    return;
                }

                console.error("⛔ Account restriction or conflict detected.");
                
                const errorMessage = fetchError.response?.data?.message?.toLowerCase() || "";
                // If it explicitly says banned/rejected, show the banned message. 
                // Otherwise, assume it's a session conflict (another device login) 
                // as that's the common case for 403s in this app's lifecycle.
                const isBanned = errorMessage.includes("banned") || 
                                 errorMessage.includes("rejected") || 
                                 errorMessage.includes("محظور") || 
                                 errorMessage.includes("غير مفعل");

                authStorage.clearAuth();
                window.location.href = `/login?${isBanned ? 'blocked=true' : 'concurrent=true'}`;
                return;
            }

            // 🔐 401: Unauthorized (Graceful logout with delay)
            if (status === 401) {
                console.warn("🔐 AuthProvider: Profile fetch failed with 401. Will clear auth in 2s...");
                const timer = setTimeout(() => {
                    if (!authStorage.getToken()) return;
                    authStorage.clearAuth();
                    window.location.href = "/login";
                }, 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [profileError, fetchError]);

    // Side Effects: Echo and LocalStorage Sync
    useEffect(() => {
        if (state.token && state.user) {
            initializeEcho(state.token);
            localStorage.setItem("user_id", state.user.id.toString());
            localStorage.setItem("user_name", state.user.name);
        } else if (!state.token && state.isAuthenticated === false) {
            disconnectEcho();
        }
    }, [state.token, state.user, state.isAuthenticated]);

    // Synchronize Query Result to Local State
    useEffect(() => {
        if (userProfile) {
            // Save to storage to persist across refreshes
            authStorage.setUser(userProfile);

            if (userProfile.id !== state.user?.id) {
                setState(prev => ({
                    ...prev,
                    user: userProfile,
                    isLoading: false,
                    isAuthenticated: true
                }));
            }
        } else if (!isFetchingProfile && !state.token && state.isAuthenticated) {
            setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false, user: null }));
        } else if (!isFetchingProfile && state.token && !userProfile && !isFetchingProfile) {
            // Case where fetching finished but no user returned and no explicit error yet
            // Wait for profileError effect above to handle it if it's a 401
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userProfile, isFetchingProfile, state.token]);

    const updateState = useCallback((updates: Partial<AuthState>) => {
        if (updates.user) {
            authStorage.setUser(updates.user);
        }
        setState(prev => ({ ...prev, ...updates }));
    }, []);

    const clearAuth = useCallback(() => {
        authStorage.clearAuth(); // Physical clear
        setState({
            user: null,
            token: null,
            userType: null,
            isAuthenticated: false,
            isLoading: false,
        });
        queryClient.removeQueries({ queryKey: ["authUser"] });
        disconnectEcho();
    }, [queryClient]);

    const value = useMemo(() => ({
        ...state,
        isLoading: state.isLoading || isFetchingProfile,
        setState: updateState,
        clearAuth
    }), [state, isFetchingProfile, updateState, clearAuth]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
