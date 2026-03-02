import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { authStorage } from "../../../context/auth/auth.storage";
import { authService } from "../../../context/auth/auth.service";

const GoogleCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [statusMsg, setStatusMsg] = useState("جاري التحقق من الحساب...");

    useEffect(() => {
        const handleLogin = async () => {
            const token = searchParams.get("token") || searchParams.get("access_token");
            console.log("🔍 GoogleCallback: Token received:", token ? "Yes (starts with " + token.substring(0, 5) + "...)" : "No");

            if (!token) {
                const error = searchParams.get("error");
                console.error("❌ GoogleCallback: No token found. Error:", error);

                if (error === "no_account") {
                    toast.warning("ليس لديك حساب بعد! يرجى إنشاء حساب جديد أولاً 🔔", { autoClose: 5000 });
                    setTimeout(() => { window.location.href = "/join"; }, 1500);
                } else {
                    toast.error(error === "google_auth_failed" ? "فشل تسجيل الدخول عبر جوجل ❌" : "حدث خطأ في المصادقة");
                    setTimeout(() => { window.location.href = "/login"; }, 1000);
                }
                return;
            }

            const isNewUser = searchParams.get("is_new") === "1";

            try {
                setStatusMsg("جاري حفظ بيانات الدخول...");

                // 1. Storage Utility Sync
                authStorage.setToken(token);
                // Try to get role from URL first (if backend provides it), otherwise default and update later
                const queryRole = searchParams.get("role") as any;
                if (queryRole) {
                    authStorage.setUserType(queryRole);
                    localStorage.setItem("userType", queryRole);
                }

                console.log("✅ GoogleCallback: Initial Token set.");

                // 2. Profile Hydration
                setStatusMsg("جاري جلب بيانات الملف الشخصي...");

                const rolesToTry: any[] = queryRole ? [queryRole] : ["user", "craftsman", "company"];
                let detectedUser = null;
                let detectedRole = queryRole || "user";

                for (const r of rolesToTry) {
                    try {
                        const user = await authService.fetchProfile(r);
                        if (user) {
                            detectedUser = user;
                            detectedRole = r;
                            break;
                        }
                    } catch (e) {
                        continue;
                    }
                }

                if (detectedUser) {
                    console.log("👤 GoogleCallback: Profile fetched successfully:", detectedUser.name, "Role:", detectedRole);
                    authStorage.setUserType(detectedRole);
                    localStorage.setItem("userType", detectedRole);
                    authStorage.setUser(detectedUser);
                    localStorage.setItem("user_name", detectedUser.name);
                    localStorage.setItem("user_id", detectedUser.id.toString());
                    localStorage.setItem("token", token);
                    localStorage.setItem("user_status", detectedUser.status || "");

                    toast.success(`مرحباً ${detectedUser.name} 🎉`);

                    if (isNewUser) {
                        toast.warning("يرجى إكمال بيانات ملفك الشخصي في أقرب وقت وإلا قد يتم تعليق حسابك ⚠️", {
                            autoClose: 10000,
                            position: "top-center"
                        });
                    }
                } else {
                    console.warn("⚠️ GoogleCallback: Could not fetch profile or detect role.");
                }

                setStatusMsg("تم بنجاح! جاري تحويلك...");

                // 3. Final Redirect
                setTimeout(() => {
                    const finalRole = authStorage.getUserType() || "user";
                    console.log("🚀 GoogleCallback: Redirecting to Dashboard... Role:", finalRole);

                    // Redirect to the correct dashboard based on role
                    if (finalRole === 'admin') window.location.href = "/admin/dashboard";
                    else if (finalRole === 'company') window.location.href = "/dashboard/company";
                    else if (finalRole === 'craftsman') window.location.href = "/dashboard/craftsman";
                    else window.location.href = "/dashboard";
                }, 800);

            } catch (err) {
                console.error("🚨 GoogleCallback: Critical Error during sync:", err);
                toast.error("حدث خطأ أثناء إعداد الجلسة");
                window.location.href = "/";
            }
        };

        handleLogin();
    }, [searchParams]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: '20px',
            background: 'var(--color-bg-light)'
        }}>
            <div className="spinner-mini" style={{ width: '50px', height: '50px', borderTopColor: 'var(--color-primary)' }}></div>
            <p style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: '1.2rem' }}>{statusMsg}</p>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>يمكنك مراجعة الـ Console للتفاصيل في حالة حدوث مشكلة</p>
        </div>
    );
};

export default GoogleCallback;