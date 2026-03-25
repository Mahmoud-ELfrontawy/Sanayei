import { toast } from "react-toastify";
import { AxiosError } from "axios";

import ProfileFormBase from "../base/ProfileFormBase";
import {
    getMyProfile,
    updateProfile,
    deleteUserAccount,
} from "../../../Api/user/profile.api";
import { toUiDate } from "../../../utils/dateApiHelper";
import { useAuth } from "../../../hooks/useAuth";
import { useEffect, useState } from "react";
import FormSkeleton from "../base/FormSkeleton";
import { useNavigate, Link } from "react-router-dom";
import { FiAlertCircle } from "react-icons/fi";
import ProfileCompletionMeter from "../../../components/ui/ProfileCompletion/ProfileCompletionMeter";

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
    const { user: authUser, refreshUser, userType } = useAuth();
    const isBlocked = authUser?.status === 'rejected';
    const navigate = useNavigate();

    // 🛑 Redirect if Company
    useEffect(() => {
        if (userType === "company") {
            navigate("/dashboard/company/profile", { replace: true });
        }
    }, [userType, navigate]);

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
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
            toast.success("تم حفظ البيانات بنجاح ✅");
            localStorage.removeItem("profileUpdated");
        }

        const fetchProfile = async () => {
            try {
                const response = await getMyProfile();
                const data = response.data; // Access the inner 'data' object

                // Match the simplified logic used for craftsmen - standardized via helper
                const birthDate = toUiDate(data.birth_date);

                setUser({
                    name: data.name ?? "",
                    email: data.email ?? "",
                    phone: data.phone ?? "",
                    birth_date: birthDate,
                    gender: data.gender ?? "male",
                    latitude: data.latitude ? Number(data.latitude) : 30.0444,
                    longitude: data.longitude ? Number(data.longitude) : 31.2357,
                    avatar: data.profile_image_url
                        ? `${data.profile_image_url}?t=${Date.now()}`
                        : undefined,
                });
            } catch (error) {
                toast.error("فشل تحميل البيانات ❌");
            } finally {
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

            const response = await updateProfile({
                name: user.name.trim(),
                phone: user.phone.trim(),
                birth_date: user.birth_date || undefined,
                gender: user.gender || "male",
                latitude: user.latitude || undefined,
                longitude: user.longitude || undefined,
                profile_image: imageFile,
            });

            // 1. Update local state with the new data from response (if provided by API)
            // This ensures the local component sees the new image right away.
            const data = response.data;
            if (data) {
                const birthDate = data.birth_date ? toUiDate(data.birth_date) : user.birth_date;
                setUser({
                    name: data.name ?? user.name,
                    email: data.email ?? user.email,
                    phone: data.phone ?? user.phone,
                    birth_date: birthDate,
                    gender: data.gender ?? user.gender,
                    latitude: data.latitude ? Number(data.latitude) : user.latitude,
                    longitude: data.longitude ? Number(data.longitude) : user.longitude,
                    avatar: data.profile_image_url
                        ? `${data.profile_image_url.split("?")[0]}?t=${Date.now()}`
                        : user.avatar,
                });
            }

            // 2. Clear the pending image file (the UI will now switch from local preview to the new server URL)
            setImageFile(null);

            // 3. Update global auth context (Header, Sidebar)
            await refreshUser();

            toast.success("تم حفظ البيانات بنجاح ✅");
        } catch (error: unknown) {
            const axiosError = error as AxiosError<ApiErrorResponse>;
            toast.error(axiosError.response?.data?.message || "فشل حفظ التعديلات ❌");
        } finally {
            setLoading(false);
        }
    };

    /* ================= Delete Account ================= */
    const handleDeleteAccount = async () => {
        if (isBlocked) {
            toast.error("حسابك محظور، يرجى التواصل مع الإدارة بخصوص الحساب.");
            return;
        }

        try {
            await deleteUserAccount();

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

    if (fetching) {
        return <FormSkeleton />;
    }

    return (
        <div className="profile-user-page">

            <ProfileCompletionMeter type="user" data={user} />

            {isBlocked && (
                <div className="status-display-card blocked">
                    <div className="status-icon-box">
                        <FiAlertCircle />
                    </div>
                    <div className="status-text-content">
                        <h3>حساب محظور</h3>
                        <p>
                            حسابك محظور من قبل الإدارة حالياً. يرجى التواصل مع <Link to="/contact" style={{ textDecoration: 'underline', color: 'inherit' }}>الدعم الفني</Link> لمعرفة التفاصيل وحل المشكلة.
                        </p>
                    </div>
                </div>
            )}



            <ProfileFormBase
                data={user}
                setData={setUser}
                imageFile={imageFile}
                setImageFile={setImageFile}
                onSave={handleSave}
                onDelete={handleDeleteAccount}
                loading={loading}
            />
        </div>
    );
};
export default ProfileUser;
