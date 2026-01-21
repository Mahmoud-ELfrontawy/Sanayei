import { createContext, useEffect, useState } from "react";
import { getMyProfile } from "../Api/user/profile.api";

export interface User {
    name: string;
    email: string;
    profile_image_url?: string;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    const fetchUser = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const data = await getMyProfile();
            setUser(data);
        } catch {
            localStorage.removeItem("token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
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
