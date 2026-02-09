import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import ProfileFormBase from "../../base/ProfileFormBase";
import {
    getCraftsmanProfile,
    updateCraftsmanProfile,
    deleteCraftsmanAccount,
} from "../../../../Api/auth/Worker/profileWorker.api";

import { useAuth } from "../../../../hooks/useAuth";
import { getAvatarUrl } from "../../../../utils/imageUrl";
import { toUiDate } from "../../../../utils/dateApiHelper";

/* ================= Types ================= */

export type Gender = "male" | "female";

interface CraftsmanApiResponse {
    id?: number;
    name?: string;
    email?: string;
    phone?: string;
    birth_date?: string;
    identity_number?: string;
    address?: string;
    latitude?: number | string;
    longitude?: number | string;
    profile_photo?: string;
    description?: string;
    experience_years?: number | string;
    price_range?: string;
    work_days?: string[];
    rating?: number;
    reviews_count?: number;
    is_verified?: boolean;
}

interface CraftsmanState {
    id?: number;

    // بيانات شخصية
    name: string;
    email: string;
    phone: string;
    birth_date?: string;
    gender?: Gender;
    identity_number?: string;

    // صور
    avatar?: string;

    // الموقع
    address?: string;
    latitude?: number;
    longitude?: number;

    // العمل
    description?: string;
    experience_years?: number;
    price_range?: string;
    work_days?: string[];
    work_hours?: string;

    // عرض فقط
    rating?: number;
    reviews_count?: number;
    is_verified?: boolean;
}

/* ================= Constants ================= */

const DEFAULT_LOCATION = {
    latitude: 30.0444,
    longitude: 31.2357,
};

/* ================= Component ================= */

const ProfileWorker = () => {
    const { refreshUser } = useAuth();

    const [loading, setLoading] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [craftsman, setCraftsman] = useState<CraftsmanState>({
        name: "",
        email: "",
        phone: "",
        description: "",
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude,
    });

    /* ================= Fetch Profile ================= */

    useEffect(() => {
        if (localStorage.getItem("profileUpdated") === "true") {
            toast.success("تم حفظ بياناتك بنجاح ✅");
            localStorage.removeItem("profileUpdated");
        }

        const fetchProfile = async () => {
            try {
                const res = await getCraftsmanProfile();
                let data: CraftsmanApiResponse | object = res.data ?? res;

                if (Array.isArray(data)) {
                    data = (data as CraftsmanApiResponse[]).find((item) => item.id) || {};
                } else if (Array.isArray(res.data?.data)) {
                    data = (res.data.data as CraftsmanApiResponse[]).find((item) => item.id) || {};
                }

                const d = data as CraftsmanApiResponse;

                setCraftsman({
                    id: d.id,
                    name: d.name ?? "",
                    email: d.email ?? "",
                    phone: d.phone ?? "",

                    birth_date: toUiDate(d.birth_date),
                    identity_number: d.identity_number ?? undefined,

                    address: d.address ?? undefined,
                    latitude: Number(d.latitude) || DEFAULT_LOCATION.latitude,
                    longitude: Number(d.longitude) || DEFAULT_LOCATION.longitude,

                    avatar: getAvatarUrl(d.profile_photo, d.name),

                    description: d.description ?? undefined,
                    experience_years: d.experience_years ? Number(d.experience_years) : undefined,

                    price_range: d.price_range ?? undefined,
                    work_days: d.work_days ?? [],

                    rating: d.rating,
                    reviews_count: d.reviews_count,
                    is_verified: d.is_verified,
                });
            } catch {
                toast.error("فشل تحميل بيانات الصنايعي ❌");
            }
        };

        fetchProfile();
    }, []);

    /* ================= Save ================= */

    const handleSave = async () => {
        if (!craftsman.id) return;

        try {
            setLoading(true);

            await updateCraftsmanProfile(craftsman.id, {
                name: craftsman.name,
                phone: craftsman.phone,
                birth_date: craftsman.birth_date,
                identity_number: craftsman.identity_number,

                address: craftsman.address,
                latitude: craftsman.latitude,
                longitude: craftsman.longitude,

                description: craftsman.description,
                experience_years: craftsman.experience_years,
                price_range: craftsman.price_range,
                work_days: craftsman.work_days,

                profile_photo: imageFile,
            });

            await refreshUser();
            setImageFile(null);

            localStorage.setItem("profileUpdated", "true");
            window.location.reload();
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error("Update Error Details:", err.response?.data);
            toast.error(err.response?.data?.message || "فشل حفظ البيانات ❌");
        } finally {
            setLoading(false);
        }
    };

    /* ================= Delete ================= */

    const handleDeleteAccount = async () => {
        try {
            await deleteCraftsmanAccount();

            // ✅ حفظ الطلبات قبل مسح localStorage
            const myOrders = localStorage.getItem("myOrders");
            localStorage.clear();
            if (myOrders) {
                localStorage.setItem("myOrders", myOrders);
            }

            window.location.href = "/";
        } catch {
            toast.error("فشل حذف الحساب ❌");
        }
    };

    /* ================= Render ================= */

    return (
        <ProfileFormBase
            isCraftsman
            data={craftsman}
            setData={setCraftsman}
            imageFile={imageFile}
            setImageFile={setImageFile}
            onSave={handleSave}
            onDelete={handleDeleteAccount}
            loading={loading}
        />
    );
};

export default ProfileWorker;

