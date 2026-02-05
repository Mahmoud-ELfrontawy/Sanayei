import { createContext, useEffect, useState } from "react";
import { getMyProfile } from "../Api/user/profile.api";
import { getCraftsmanProfile } from "../Api/auth/Worker/profileWorker.api";
import { getFullImageUrl } from "../utils/imageUrl";

export interface User {
    name: string;
    email: string;
    avatar?: string;
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

    const fetchUser = async () => {
        const token = localStorage.getItem("token");
        const userType = localStorage.getItem("userType");

        if (!token || !userType) {
            setUser(null);
            setLoading(false);
            return;
        }

        try {
            let userData: User;

            if (userType === "craftsman") {
                const res = await getCraftsmanProfile();

                // ✅ FIX: Extract Craftsman Data (Handle weird [{}, {id:...}] response)
                let c = res?.data?.data ?? res?.data ?? res;
                if (Array.isArray(c)) {
                    c = c.find((item: any) => item?.id) || {};
                }

                console.log("AuthContext: Craftsman Photo from API", c.profile_photo);
                const finalAvatarUrl = c.profile_photo
                    ? getFullImageUrl(c.profile_photo)
                    : undefined;

                console.log("AuthContext: FINAL COMPUTED URL:", finalAvatarUrl);

                userData = {
                    name: c.name,
                    email: c.email,
                    avatar: finalAvatarUrl,
                };
            } else {
                const response = await getMyProfile();
                const u = response.data;

                userData = {
                    name: u.name,
                    email: u.email,
                    avatar: getFullImageUrl(u.profile_image_url),
                };
            }

            setUser(userData);
        } catch (error: unknown) {
            console.error("Auth fetchUser error:", error);

            // ✅ FIX: لا تحذف التوكن إلا إذا كان الخطأ 401 (Unauthorized)
            // أي خطأ آخر (مثل انقطاع النت) لا يجب أن يسجّل خروج المستخدم

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((error as any)?.response?.status === 401) {
                localStorage.clear();
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const logout = () => {
        localStorage.clear();
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



