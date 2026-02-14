import { createContext, useEffect, useState, useContext } from "react";
import { getMyProfile } from "../Api/user/profile.api";
import { getCraftsmanProfile } from "../Api/auth/Worker/profileWorker.api";
// import { getAdminProfile } from "../Api/admin/admin.api";
import { getFullImageUrl } from "../utils/imageUrl";
import { initializeEcho, disconnectEcho } from "../utils/echo";
import { toast } from "react-toastify";
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
    const [userTypeState, setUserTypeState] = useState<"user" | "craftsman" | "company" | "admin" | null>(
        localStorage.getItem("userType") as any
    );
    const [loading, setLoading] = useState(true);

    const fetchUser = async () => {
        const token = localStorage.getItem("token");
        const storedType = localStorage.getItem("userType") as "user" | "craftsman" | "company" | "admin";

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
                // 🛠️ FIX: Check 'craftsman' property directly on the response object (res IS the data)
                const c = res?.craftsman ?? res?.data ?? res;
                // Ensure ID exists before setting
                if (c?.id) {
                    const finalAvatarUrl = c.profile_photo ? getFullImageUrl(c.profile_photo) : undefined;
                    userData = { id: c.id, name: c.name, email: c.email, avatar: finalAvatarUrl };
                    setUserTypeState("craftsman");
                }
            } else if (storedType === "company") {
                const response = await getMyProfile();
                const u = response.data;
                if (u?.id) {
                    userData = { id: u.id, name: u.name, email: u.email, avatar: getFullImageUrl(u.profile_image_url) };
                    setUserTypeState("company");
                }
            } else if (storedType === "admin") {
                // Try admin profile if exists, otherwise fallback to basic user profile
                try {
                    // const response = await getAdminProfile();
                    // Admin API might return data directly or wrapped in data property
                    // const u = response.data || response;
                    // if (u?.id) {
                    //     userData = { id: u.id, name: u.name, email: u.email, avatar: getFullImageUrl(u.profile_image_url) };
                    //     setUserTypeState("admin");
                    // }
                } catch (e) {
                    // Silently fail
                }
            } else if (storedType === "user") {
                const response = await getMyProfile();
                const u = response.data;
                if (u?.id) {
                    userData = { id: u.id, name: u.name, email: u.email, avatar: getFullImageUrl(u.profile_image_url) };
                    setUserTypeState("user");
                }
            } else {
                // If NO type is stored, we probe
                try {
                    const response = await getMyProfile();
                    const u = response.data;
                    if (u?.id) {
                        userData = { id: u.id, name: u.name, email: u.email, avatar: getFullImageUrl(u.profile_image_url) };
                        localStorage.setItem("userType", "user");
                        setUserTypeState("user");
                    }
                } catch (e) {
                    try {
                        const res = await getCraftsmanProfile();
                        const c = res?.data?.data ?? res?.data ?? res;
                        if (c?.id) {
                            userData = { id: c.id, name: c.name, email: c.email, avatar: getFullImageUrl(c.profile_photo) };
                            localStorage.setItem("userType", "craftsman");
                            setUserTypeState("craftsman");
                        }
                    } catch (e2) {
                        // Silently fail
                    }
                }
            }

            if (userData && userData.id) {
                setUser(userData);
                localStorage.setItem("user_id", userData.id.toString());

                // Initialize Echo for real-time messaging
                const token = localStorage.getItem("token");
                if (token) {
                    initializeEcho(token);
                }
            }
        } catch (error: any) {
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
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phoneOrEmail);
        const normalizedPhone = phoneOrEmail.startsWith('0') ? phoneOrEmail.substring(1) : phoneOrEmail;

        const attempts = [
            // 0. Admin Login (High Priority if Email)
            isEmail ? {
                url: `${BASE_URL}/admin/login`,
                payload: { email: phoneOrEmail, password },
                type: 'admin'
            } : null,
            // 1. New Craftsman Login (Unified)
            {
                url: `${BASE_URL}/craftsmen/login`,
                payload: { login: phoneOrEmail, password },
                type: 'craftsman'
            },
            // 2. User/General Login (Unified)
            {
                url: `${BASE_URL}/login`,
                payload: { login: phoneOrEmail, password },
                type: 'user'
            },
            // 3. User Login Fallback (Normalized Phone)
            !isEmail ? {
                url: `${BASE_URL}/login`,
                payload: { login: normalizedPhone, password },
                type: 'user'
            } : null,
            // 4. Old Auth Endpoint (Unified)
            {
                url: `${BASE_URL}/auth/login`,
                payload: { login: phoneOrEmail, password },
                type: 'user'
            },
        ].filter(Boolean) as any[];

        let lastError: any = null;
        let prioritizedError: string | null = null; // Store specific errors like "Not Approved"

        for (const attempt of attempts) {
            try {
                const response = await axios.post(attempt.url, attempt.payload, {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                });

                if (response.data.status) {
                    // Handle different response structures
                    const token = response.data.token;
                    let userData = response.data.user || response.data.craftsman;
                    let role = response.data.role;

                    // If it was the craftsman endpoint and success, force craftsman role
                    if (attempt.type === 'craftsman' && response.data.craftsman) {
                        userData = response.data.craftsman;
                        role = 'craftsman';
                    }

                    // If it was the admin endpoint and success
                    if (attempt.type === 'admin') {
                        role = 'admin';
                        // Admin data might be directly in response.data.user or just response.data depending on API
                        // tailored based on standard Laravel pattern, but fallback to existing logic if needed
                    }

                    if (!userData && response.data.data) {
                        userData = response.data.data;
                    }

                    localStorage.setItem('token', token);
                    const userType = role === 'admin' ? 'admin' : (role === 'craftsman' ? 'craftsman' : 'user');
                    localStorage.setItem('userType', userType);
                    localStorage.setItem('user_id', userData.id.toString());

                    // Normalize user data for state
                    const finalUser = {
                        id: userData.id,
                        name: userData.name,
                        email: userData.email,
                        avatar: userData.profile_photo ? getFullImageUrl(userData.profile_photo) : getFullImageUrl(userData.profile_image_url)
                    };

                    setUser(finalUser);
                    setUserTypeState(userType as any);
                    initializeEcho(token);

                    if (response.data.redirect) window.location.href = response.data.redirect;
                    else {
                        switch (role) {
                            case 'admin': window.location.href = '/admin/dashboard'; break;
                            case 'craftsman': window.location.href = `/craftsman/${userData.id}`; break;
                            default: window.location.href = '/';
                        }
                    }
                    return true;
                }
            } catch (error: any) {
                lastError = error;

                // 🛑 CRITICAL: Capture "Not Approved" (403) errors specifically
                if (error.response?.status === 403) {
                    prioritizedError = error.response?.data?.message || "حسابك غير مفعل بعد.";
                }

                // 🛑 Capture pending account (422) on craftsman endpoint
                if (error.response?.status === 422 && attempt.type === 'craftsman') {
                    const msg = error.response?.data?.message || "";
                    // Check if this is a pending approval error (not just validation)
                    if (
                        msg.includes("انتظار") ||
                        msg.includes("مراجعة") ||
                        msg.includes("معلق") ||
                        msg.includes("غير مفعل") ||
                        msg.includes("pending")
                    ) {
                        prioritizedError = msg;
                    }
                }
            }
        }

        console.error("Auth: Final Failure", lastError?.response?.data || lastError?.message);

        // Show prioritized error (pending/not approved) with info toast
        if (prioritizedError) {
            toast.info(`${prioritizedError} ⏳\nيرجى عدم تسجيل الدخول لحين موافقة الإدارة.`);
        } else {
            const errorMsg = lastError?.response?.data?.message || "فشل تسجيل الدخول، يرجى التحقق من البيانات";
            toast.error(errorMsg);
        }
        return false;
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

    const register = async (_userData: any) => {
        // Implementation moved to separate API files
    };

    const registerWorker = async (_workerData: FormData) => {
        // Implementation moved to separate API files
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



