import { useContext, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../context/auth/auth.context";
import { authService } from "../context/auth/auth.service";
import { authStorage } from "../context/auth/auth.storage";
import { authRedirect } from "../context/auth/auth.redirect";
import { toast } from "react-toastify";

export const useAuth = () => {
    const context = useContext(AuthContext);
    const queryClient = useQueryClient();

    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }

    const { setState, clearAuth, ...state } = context;

    const login = useCallback(async (phoneOrEmail: string, password: string, shouldRedirect: boolean = true): Promise<boolean> => {
        // Reset state and set loading
        setState({ isLoading: true, user: null, isAuthenticated: false });
        
        try {
            const result = await authService.login(phoneOrEmail, password);

            if (result.success && result.data) {
                const { token, user, role } = result.data;

                // 1. Physical Storage
                authStorage.setToken(token);
                authStorage.setUserType(role);
                
                // 2. Immediate storage for legacy lookups (toasts)
                localStorage.setItem("user_name", user.name);
                localStorage.setItem("user_id", user.id.toString());
                localStorage.setItem("userType", role);

                // 3. React Query Cache seeding
                queryClient.setQueryData(["authUser"], user);

                // 4. Update Context State - Synchronously
                setState({
                    token,
                    user,
                    userType: role,
                    isAuthenticated: true,
                    isLoading: false,
                });

                if (shouldRedirect) {
                    authRedirect.handleLoginRedirect(role);
                }
                return true;
            } else {
                setState({ isLoading: false });
                toast.error(result.error || "فشل تسجيل الدخول");
                return false;
            }
        } catch (err) {
            console.error("useAuth.login: Unexpected error", err);
            setState({ isLoading: false });
            toast.error("حدث خطأ أثناء محاولة تسجيل الدخول");
            return false;
        }
    }, [setState, queryClient]);

    const logout = useCallback(async (shouldRedirect: boolean = true) => {
        const persistentData = authStorage.savePersistentData();
        
        // Optimistic UI cleanup
        clearAuth();
        
        try {
            await authService.logout();
        } catch (err) {
            console.warn("useAuth.logout: Logout API failed, but state cleared.", err);
        } finally {
            // Restore persistent data (notifications, etc) 
            authStorage.restorePersistentData(persistentData);
            
            if (shouldRedirect) {
                authRedirect.handleLogoutRedirect();
            }
        }
    }, [clearAuth]);

    const refreshUser = useCallback(async () => {
        if (!state.userType || !state.token) return;
        
        try {
            const user = await authService.fetchProfile(state.userType);
            if (user) {
                queryClient.setQueryData(["authUser"], user);
                setState({ user, isAuthenticated: true, isLoading: false });
            }
        } catch (err) {
            // Error handling is managed by AuthProvider's useEffect observing useQuery/profileError
            console.error("useAuth.refreshUser failed", err);
        }
    }, [state.userType, state.token, setState, queryClient]);

    return {
        ...state,
        login,
        logout,
        refreshUser,
        loading: state.isLoading,
    };
};
