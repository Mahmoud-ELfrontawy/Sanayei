import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import ProfileFormBase from "../../base/ProfileFormBase";
import {
    getCraftsmanProfile,
    updateCraftsmanProfile,
    deleteCraftsmanAccount,
    deleteWorkPhoto,
} from "../../../../Api/auth/Worker/profileWorker.api";

import { useAuth } from "../../../../hooks/useAuth";
import { getAvatarUrl } from "../../../../utils/imageUrl";
import { toUiDate } from "../../../../utils/dateApiHelper";
import { getGovernorates } from "../../../../Api/serviceRequest/governorates.api";
import FormSkeleton from "../../base/FormSkeleton";
import { FiAlertCircle, FiCheckCircle, FiClock } from "react-icons/fi";
import ProfileCompletionMeter from "../../../../components/ui/ProfileCompletion/ProfileCompletionMeter";


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
    governorate_id?: string | number;
    latitude?: number | string;
    longitude?: number | string;
    profile_photo?: string;
    description?: string;
    experience_years?: number | string;
    price_range?: string;
    work_days?: string[];
    work_photos?: string[];
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
    governorate_id?: string | number;
    latitude?: number;
    longitude?: number;

    // العمل
    description?: string;
    experience_years?: number;
    price_range?: string;
    work_days?: string[];
    work_hours?: string;
    work_photos?: (string | File)[];
    new_work_photos?: File[];
    delete_work_photos?: string[];

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
    const { user, refreshUser } = useAuth();

    const isBlocked = user?.status === 'rejected';

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [governorates, setGovernorates] = useState<{ id: number; name: string }[]>([]);

    const [craftsman, setCraftsman] = useState<CraftsmanState>({
        name: "",
        email: "",
        phone: "",
        description: "",
        governorate_id: "",
        latitude: DEFAULT_LOCATION.latitude,
        longitude: DEFAULT_LOCATION.longitude,
    });

    /* ================= Fetch Profile ================= */

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Fetch Governorates
                const govs = await getGovernorates();
                setGovernorates(govs);

                const res = await getCraftsmanProfile();
                // 🛠️ FIX: Prioritize 'craftsman' property as seen in other responses
                let data: CraftsmanApiResponse | object = res.craftsman ?? res.data ?? res;

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

                    avatar: getAvatarUrl(d.profile_photo, d.name) + `?t=${Date.now()}`,
                    governorate_id: d.governorate_id,
                    description: d.description ?? undefined,
                    experience_years: d.experience_years ? Number(d.experience_years) : undefined,

                    price_range: d.price_range ?? undefined,
                    work_days: d.work_days ?? [],
                    work_photos: d.work_photos ?? [],

                    rating: d.rating,
                    reviews_count: d.reviews_count,
                    is_verified: d.is_verified,
                });
                setFetching(false);
            } catch {
                toast.error("فشل تحميل بيانات الصنايعي ❌");
                setFetching(false);
            }
        };

        fetchProfile();
    }, []);

    /* ================= Save ================= */

    const handleSave = async () => {
        if (isBlocked) {
            toast.error("حسابك محظور، لا يمكنك تعديل البيانات حالياً.");
            return;
        }

        if (!craftsman.id) return;

        try {
            setLoading(true);

            const res = await updateCraftsmanProfile(craftsman.id!, {
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
                governorate_id: craftsman.governorate_id,

                profile_photo: imageFile,
                work_photos: craftsman.new_work_photos,
                delete_work_photos: craftsman.delete_work_photos,
            });

            // ✅ حذف الصور يدوياً عبر الـ API لضمان الحذف من السيرفر
            if (craftsman.delete_work_photos && craftsman.delete_work_photos.length > 0) {
                await Promise.all(
                    craftsman.delete_work_photos.map(path => deleteWorkPhoto(path))
                );
            }

            // 1. Update local state with the new data from response
            // This ensures the local component sees the new image right away.
            const updatedData = res.craftsman ?? res.data ?? res;
            if (updatedData && typeof updatedData === 'object' && !Array.isArray(updatedData)) {
                const d = updatedData as CraftsmanApiResponse;
                setCraftsman(prev => {
                    const rawAvatar = d.profile_photo || prev.avatar?.split('?')[0];
                    return {
                        ...prev,
                        avatar: getAvatarUrl(rawAvatar, d.name) + `?t=${Date.now()}`,
                        work_photos: d.work_photos ?? prev.work_photos,
                        new_work_photos: [],
                        delete_work_photos: []
                    };
                });
            }

            // 2. Clear the pending image file (the UI will now switch from local preview to the new server URL)
            setImageFile(null);

            // 3. Update global auth context (Header, Sidebar)
            await refreshUser();

            toast.success("تم حفظ البيانات بنجاح ✅");
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } };
            toast.error(err.response?.data?.message || "فشل حفظ البيانات ❌");
        } finally {
            setLoading(false);
        }
    };

    /* ================= Delete ================= */

    const handleDeleteAccount = async () => {
        if (isBlocked) {
            toast.error("حسابك محظور، يرجى التواصل مع الإدارة بخصوص الحساب.");
            return;
        }

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

    if (fetching) {
        return <FormSkeleton />;
    }

    return (
        <div className="profile-worker-page">

            <ProfileCompletionMeter type="craftsman" data={craftsman} />

            {/* ===== Status Card ===== */}
            <div className={`profile-card status-display-card ${user?.status || 'pending'}`} style={{ marginBottom: '1.5rem' }}>
                <div className="status-icon-box">
                    {user?.status === 'approved' && <FiCheckCircle size={32} />}
                    {user?.status === 'rejected' && <FiAlertCircle size={32} />}
                    {(user?.status === 'pending' || !user?.status) && <FiClock size={32} />}
                </div>
                <div className="status-text-content">
                    <h3>
                        {user?.status === 'approved' ? 'حساب معتمد' :
                            user?.status === 'rejected' ? 'الحساب محظور' : 'الحساب قيد المراجعة'}
                    </h3>
                    <p>
                        {user?.status === 'approved'
                            ? 'حسابك مفعل الآن ويمكنك قبول الطلبات والتواصل مع العملاء واستخدام كافة الميزات.'
                            : user?.status === 'rejected'
                                ? (
                                    <>
                                        نأسف، تم حظر حسابك من قبل الإدارة. يرجى التواصل مع الدعم الفني لحل المشكلة:{' '}
                                        <a href="https://wa.me/201026605030" target="_blank" rel="noreferrer" style={{ color: 'var(--error-dark)', fontWeight: 'bold', textDecoration: 'underline' }}>تواصل عبر واتساب</a>
                                    </>
                                )
                                : 'جاري مراجعة بياناتك من قبل الإدارة، ستتمكن من قبول الطلبات والتواصل مع العملاء فور اعتماد الحساب.'}
                    </p>
                </div>
            </div>

            <ProfileFormBase
                isCraftsman
                data={craftsman}
                setData={setCraftsman}
                imageFile={imageFile}
                setImageFile={setImageFile}
                onSave={handleSave}
                onDelete={handleDeleteAccount}
                loading={loading}
                governorates={governorates}
            />
        </div>
    );
};

export default ProfileWorker;

