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
        staleTime: 1000 * 60 * 10,
        retry: (count, error) => {
            // Allow 1 retry on 401 to handle transient cases (e.g. after Paymob redirect)
            if (axios.isAxiosError(error) && error.response?.status === 403) return false;
            if (axios.isAxiosError(error) && error.response?.status === 401) return count < 1;
            return count < 1;
        },
        retryDelay: 2000,
    });

    
    useEffect(() => {
        if (profileError && axios.isAxiosError(fetchError)) {
            const status = fetchError.response?.status;
            if (status === 401 || status === 403) {
                console.warn("🔐 AuthProvider: Profile fetch failed with 401/403. Will clear auth in 3s if no recovery...");
                console.warn("   Token used:", authStorage.getToken()?.substring(0, 10) + "...");
                const timer = setTimeout(() => {
                    // Double-check token still invalid before clearing
                    const currentToken = authStorage.getToken();
                    if (!currentToken) {
                        console.warn("🔐 AuthProvider: Token already cleared, skipping.");
                        return;
                    }
                    authStorage.clearAuth();
                    setState({
                        user: null,
                        token: null,
                        userType: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                    queryClient.removeQueries({ queryKey: ["authUser"] });
                    disconnectEcho();
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [profileError, fetchError, queryClient]);

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
