import { createContext, useEffect, useState, useContext } from "react";
import { getMyProfile } from "../Api/user/profile.api";
import { getCraftsmanProfile } from "../Api/auth/Worker/profileWorker.api";
import { getFullImageUrl } from "../utils/imageUrl";
import { initializeEcho, disconnectEcho } from "../utils/echo";
import axios from 'axios';
import { BASE_URL } from '../Api/chat.api';

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    userType: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (phoneOrEmail: string, password: string) => Promise<boolean>;
    logout: () => void;
    register: (userData: any) => Promise<void>;
    registerWorker: (workerData: FormData) => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userTypeState, setUserTypeState] = useState<"user" | "craftsman" | "company" | null>(
        localStorage.getItem("userType") as any
    );
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        const token = localStorage.getItem("token");
        const storedType = localStorage.getItem("userType") as "user" | "craftsman" | "company";

        if (!token) {
            setUser(null);
            setUserTypeState(null);
            setLoading(false);
            return;
        }

        try {
            let userData: User | null = null;
            // 🔍 STRONGER TYPE DETECTION: Logic prioritized by stored type
            if (storedType === "craftsman") {
                const res = await getCraftsmanProfile();
                const c = res?.data?.data ?? res?.data ?? res;
                const finalAvatarUrl = c.profile_photo ? getFullImageUrl(c.profile_photo) : undefined;
                userData = { id: c.id, name: c.name, email: c.email, avatar: finalAvatarUrl };
                setUserTypeState("craftsman");
            } else if (storedType === "company") {
                const response = await getMyProfile();
                const u = response.data;
                userData = { id: u.id, name: u.name, email: u.email, avatar: getFullImageUrl(u.profile_image_url) };
                setUserTypeState("company");
            } else if (storedType === "user") {
                const response = await getMyProfile();
                const u = response.data;
                userData = { id: u.id, name: u.name, email: u.email, avatar: getFullImageUrl(u.profile_image_url) };
                setUserTypeState("user");
            } else {
                // If NO type is stored, we probe
                try {
                    const response = await getMyProfile();
                    const u = response.data;
                    userData = { id: u.id, name: u.name, email: u.email, avatar: getFullImageUrl(u.profile_image_url) };
                    localStorage.setItem("userType", "user");
                    setUserTypeState("user");
                } catch (e) {
                    const res = await getCraftsmanProfile();
                    const c = res?.data?.data ?? res?.data ?? res;
                    userData = { id: c.id, name: c.name, email: c.email, avatar: getFullImageUrl(c.profile_photo) };
                    localStorage.setItem("userType", "craftsman");
                    setUserTypeState("craftsman");
                }
            }

            if (userData) {
                setUser(userData);
                localStorage.setItem("user_id", userData.id.toString());

                // Initialize Echo for real-time messaging
                const token = localStorage.getItem("token");
                if (token) {
                    initializeEcho(token);
                }
            }
        } catch (error: any) {
            console.error("Auth: Failed to fetch profile", error);
            if (error?.response?.status === 401) {
                // Token invalid or expired
                localStorage.removeItem("token");
                localStorage.removeItem("userType");
                setUser(null);
                setUserTypeState(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const login = async (phoneOrEmail: string, password: string): Promise<boolean> => {
        try {
            // Backend expects 'email' key even if it's a phone number (based on provided backend code)
            // Ideally, backend should accept 'login' or 'identifier', but we follow current structure.
            const payload = {
                email: phoneOrEmail,
                password
            };

            // Using the new Unified Login Endpoint
            const response = await axios.post(`${BASE_URL}/login`, payload, {
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
            });

            if (response.data.status) {
                const { token, role, user, redirect } = response.data;

                // Store in localStorage
                localStorage.setItem('token', token);
                // Map backend roles to frontend types
                const userType = role === 'admin' ? 'admin' : (role === 'craftsman' ? 'craftsman' : 'user');
                localStorage.setItem('userType', userType);
                localStorage.setItem('user_id', user.id.toString());

                // Update State
                setUser(user);
                setUserTypeState(userType as any);

                // Initialize Echo
                initializeEcho(token);

                // Redirect logic
                // 1. Backend redirect takes precedence
                if (redirect) {
                    window.location.href = redirect;
                } else {
                    // 2. Fallback based on role
                    switch (role) {
                        case 'admin':
                            window.location.href = '/admin/dashboard';
                            break;
                        case 'craftsman':
                            window.location.href = `/craftsman/${user.id}`;
                            break;
                        default:
                            window.location.href = '/';
                    }
                }

                return true;
            }
            return false;
        } catch (error: any) {
            console.error("Login failed:", error);
            if (error.response && error.response.data && error.response.data.message) {
                // Handle specific backend errors (e.g. pending/rejected)
                alert(error.response.data.message);
            }
            return false;
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const logout = () => {
        // ✅ Preserve important data before clearing
        const myOrders = localStorage.getItem("myOrders");
        const appNotifications = localStorage.getItem("app_notifications");
        const chatHistory = localStorage.getItem("chatHistory");
        const deletedContacts = localStorage.getItem("deletedContacts");

        // Clear everything
        localStorage.clear();

        // Restore preserved data
        if (myOrders) localStorage.setItem("myOrders", myOrders);
        if (appNotifications) localStorage.setItem("app_notifications", appNotifications);
        if (chatHistory) localStorage.setItem("chatHistory", chatHistory);
        if (deletedContacts) localStorage.setItem("deletedContacts", deletedContacts);

        // Disconnect Echo
        disconnectEcho();

        setUser(null);
        setUserTypeState(null);
        // Page reload to clear any memory states
        window.location.href = '/login';
    };

    // Placeholder implementations for compatibility - Replace with actual API calls if needed
    const register = async (userData: any) => {
        console.log("Register: ", userData);
        // Implement actual registration logic or import from api
    };

    const registerWorker = async (workerData: FormData) => {
        console.log("Register Worker: ", workerData);
        // Implement actual worker registration logic
    };

    const token = localStorage.getItem("token");

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                userType: userTypeState,
                isAuthenticated: !!token && !!user,
                loading,
                login,
                logout,
                register,
                registerWorker,
                refreshUser: fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};



