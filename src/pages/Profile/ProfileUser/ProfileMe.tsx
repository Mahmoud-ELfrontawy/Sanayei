import { toast } from "react-toastify";
import { AxiosError } from "axios";

import ProfileFormBase from "../base/ProfileFormBase";
import {
    getMyProfile,
    updateProfile,
    deleteUserAccount,
} from "../../../Api/user/profile.api";

import { useAuth } from "../../../hooks/useAuth";
import { useEffect, useState } from "react";

interface UserState {
    name: string;
    email: string;
    phone: string;
    birth_date: string;
    gender: "male" | "female";
    latitude: number;
    longitude: number;
    avatar?: string;
}

interface ApiErrorResponse {
    message?: string;
    errors?: Record<string, string[]>;
}

const ProfileUser = () => {
    const { refreshUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [user, setUser] = useState<UserState>({
        name: "",
        email: "",
        phone: "",
        birth_date: "",
        gender: "male",
        latitude: 30.0444,
        longitude: 31.2357,
    });

    /* ================= Fetch Profile ================= */
    /* ================= Fetch Profile ================= */
    useEffect(() => {
        // Check for toast flag from previous reload
        if (localStorage.getItem("profileUpdated") === "true") {
            toast.success("تم حفظ التعديلات بنجاح ✅");
            localStorage.removeItem("profileUpdated");
        }

        const fetchProfile = async () => {
            try {
                const response = await getMyProfile();
                const data = response.data; // Access the inner 'data' object

                // Convert DD/MM/YYYY to YYYY-MM-DD for input
                let formattedDate = "";
                if (data.birth_date) {
                    const [day, month, year] = data.birth_date.split("/");
                    if (day && month && year) {
                        formattedDate = `${year}-${month}-${day}`;
                    }
                }

                setUser({
                    name: data.name ?? "",
                    email: data.email ?? "",
                    phone: data.phone ?? "",
                    birth_date: formattedDate,
                    gender: data.gender ?? "male",
                    latitude: data.latitude ? Number(data.latitude) : 30.0444,
                    longitude: data.longitude ? Number(data.longitude) : 31.2357,
                    avatar: data.profile_image_url
                        ? `${data.profile_image_url}?t=${Date.now()}`
                        : undefined,
                });
            } catch (error) {
                console.error("Error fetching profile:", error);
                toast.error("فشل تحميل البيانات ❌");
            }
        };

        fetchProfile();
    }, []);

    /* ================= Save ================= */
    const handleSave = async () => {
        // ✅ Frontend validation
        if (!user.name.trim()) {
            toast.error("الاسم مطلوب ❗");
            return;
        }

        if (!user.phone.trim()) {
            toast.error("رقم الهاتف مطلوب ❗");
            return;
        }

        try {
            setLoading(true);

            await updateProfile({
                name: user.name.trim(),
                phone: user.phone.trim(),

                birth_date: user.birth_date || undefined,

                gender: user.gender || "male",

                latitude: user.latitude || undefined,
                longitude: user.longitude || undefined,

                profile_image: imageFile,
            });

            await refreshUser();
            await refreshUser();
            setImageFile(null);

            // 🔄 Set flag and Force refresh to update header image
            localStorage.setItem("profileUpdated", "true");
            window.location.reload();
        } catch (error: unknown) {
            const axiosError = error as AxiosError<ApiErrorResponse>;

            console.error(
                "UPDATE PROFILE ERROR:",
                axiosError.response?.data
            );

            toast.error(
                axiosError.response?.data?.message ||
                "فشل حفظ التعديلات ❌"
            );
        } finally {
            setLoading(false);
        }
    };

    /* ================= Delete Account ================= */
    const handleDeleteAccount = async () => {
        try {
            await deleteUserAccount();
            localStorage.clear();
            window.location.href = "/";
        } catch {
            toast.error("فشل حذف الحساب ❌");
        }
    };

    return (
        <ProfileFormBase
            data={user}
            setData={setUser}
            imageFile={imageFile}
            setImageFile={setImageFile}
            onSave={handleSave}
            onDelete={handleDeleteAccount}
            loading={loading}
        />
    );
};
export default ProfileUser;