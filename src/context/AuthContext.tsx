import { createContext, useEffect, useState } from "react";
import { getMyProfile } from "../Api/user/profile.api";
import { getCraftsmanProfile } from "../Api/auth/Worker/profileWorker.api";
import { getFullImageUrl } from "../utils/imageUrl";

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
}

export interface AuthContextType {
    user: User | null;
    userType: "user" | "craftsman" | "company" | null; // ✅ Reactive Type
    isAuthenticated: boolean;
    loading: boolean;
    logout: () => void;
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

        setUser(null);
        setUserTypeState(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                userType: userTypeState,
                isAuthenticated: !!user,
                loading,
                logout,
                refreshUser: fetchUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};



