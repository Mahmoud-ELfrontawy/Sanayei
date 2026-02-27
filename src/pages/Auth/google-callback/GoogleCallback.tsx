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
                toast.error(error === "google_auth_failed" ? "فشل تسجيل الدخول عبر جوجل ❌" : "حدث خطأ في المصادقة");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1000);
                return;
            }

            try {
                setStatusMsg("جاري حفظ بيانات الدخول...");

                // 1. Direct LocalStorage Sync (Deep Sync)
                // We set multiple keys to ensure compatibility with different service/storage patterns
                localStorage.setItem("auth_token", token);
                localStorage.setItem("token", token);
                localStorage.setItem("userType", "user");

                // Storage Utility Sync
                authStorage.setToken(token);
                authStorage.setUserType("user" as any);

                console.log("✅ GoogleCallback: Storage synced. Tokens and Type 'user' set.");

                // 2. Profile Hydration
                setStatusMsg("جاري جلب بيانات الملف الشخصي...");
                try {
                    const user = await authService.fetchProfile("user");
                    if (user) {
                        console.log("👤 GoogleCallback: Profile fetched successfully:", user.name);
                        authStorage.setUser(user);
                        localStorage.setItem("user_name", user.name);
                        localStorage.setItem("user_id", user.id.toString());
                        localStorage.setItem("user_status", user.status || "");
                        toast.success(`مرحباً ${user.name} 🎉`);
                    } else {
                        console.warn("⚠️ GoogleCallback: Profile fetched but data was null.");
                    }
                } catch (profileErr) {
                    console.error("❌ GoogleCallback: Profile fetch failed:", profileErr);
                    // We don't block the login if profile fetch fails here, 
                    // the AuthProvider will try again on the home page.
                }

                setStatusMsg("تم بنجاح! جاري تحويلك...");

                // 3. Final Redirect
                setTimeout(() => {
                    console.log("🚀 GoogleCallback: Redirecting to Home...");
                    window.location.href = "/";
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