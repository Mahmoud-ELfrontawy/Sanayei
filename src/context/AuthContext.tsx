import { createContext, useEffect, useState, useContext } from "react";
import { getMyProfile } from "../Api/user/profile.api";
import { getCraftsmanProfile } from "../Api/auth/Worker/profileWorker.api";
import { getCompanyProfile } from "../Api/auth/Company/profileCompany.api";
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
    login: (phoneOrEmail: string, password: string, shouldRedirect?: boolean) => Promise<boolean>;
    logout: (shouldRedirect?: boolean) => void;
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
                const response = await getCompanyProfile();
                // Company API might return data directly or nested
                const u = response.company || response.data?.company || response.data || response;
                if (u?.id) {
                    userData = {
                        id: u.id,
                        name: u.company_name || u.name,
                        email: u.company_email || u.email,
                        avatar: getFullImageUrl(u.company_logo || u.profile_image_url)
                    };
                    setUserTypeState("company");
                }
            } else if (storedType === "admin") {
                // Try admin profile if exists, otherwise fallback to basic user profile
                try {
                } catch (e) {
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
                    }
                }
            }

            if (userData && userData.id) {
                setUser(userData);
                localStorage.setItem("user_id", userData.id.toString());
                localStorage.setItem("user_name", userData.name);

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

    const login = async (phoneOrEmail: string, password: string, shouldRedirect: boolean = true): Promise<boolean> => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phoneOrEmail);

        const attempts = [
            // 0. New Unified Admins/Store Login (High Priority)
            {
                url: `${BASE_URL}/admin/login`,
                payload: { email: phoneOrEmail, password },
                type: 'admin'
            },
            // 1. Company Login
            isEmail ? {
                url: `${BASE_URL}/companies/login`,
                payload: { company_email: phoneOrEmail, company_password: password },
                type: 'company'
            } : null,
            // 2. Craftsman Login
            {
                url: `${BASE_URL}/craftsmen/login`,
                payload: { login: phoneOrEmail, password },
                type: 'craftsman'
            },
            // 3. General User Login
            {
                url: `${BASE_URL}/auth/login`, // Corrected from /login to /auth/login
                payload: { email: phoneOrEmail, login: phoneOrEmail, password },
                type: 'user'
            }
        ].filter(Boolean) as any[];

        let lastError: any = null;
        let prioritizedError: string | null = null;

        for (const attempt of attempts) {
            try {
                const response = await axios.post(attempt.url, attempt.payload, {
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json",
                    },
                });

                if (response.data.status || response.data.success || response.data.token || response.data.data?.token) {
                    const token = response.data.token || response.data.data?.token || response.data.access_token;

                    if (!token) {
                        console.warn("Auth: Success detected but token is missing in response", response.data);
                        continue; // try next one if this one didn't give a token
                    }

                    let userData = response.data.user || response.data.craftsman || response.data.company || response.data.data?.user || response.data.data;
                    let role = response.data.role || attempt.type;

                    localStorage.setItem('token', token);
                    const detectedUserType = role === 'admin' ? 'admin' : (role === 'craftsman' ? 'craftsman' : (role === 'company' ? 'company' : 'user'));
                    localStorage.setItem('userType', detectedUserType);
                    localStorage.setItem('user_id', userData.id.toString());

                    // Normalize user data for state
                    const finalUser = {
                        id: userData.id,
                        name: userData.company_name || userData.name,
                        email: userData.company_email || userData.email,
                        avatar: getFullImageUrl(userData.company_logo || userData.profile_photo || userData.profile_image_url)
                    };

                    setUser(finalUser);
                    localStorage.setItem('user_name', finalUser.name);
                    setUserTypeState(detectedUserType as any);
                    initializeEcho(token);

                    if (shouldRedirect) {
                        if (response.data.redirect) window.location.href = response.data.redirect;
                        else {
                            switch (role) {
                                case 'admin': window.location.href = '/admin/dashboard'; break;
                                case 'craftsman': window.location.href = `/craftsman/${userData.id}`; break;
                                case 'company': window.location.href = '/dashboard/company'; break;
                                default: window.location.href = '/';
                            }
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

    const logout = (shouldRedirect: boolean = true) => {
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
        if (shouldRedirect) {
            window.location.href = '/login';
        }
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



