import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { authStorage } from "../../../context/auth/auth.storage";
import { authService } from "../../../context/auth/auth.service";

const GoogleCallback: React.FC = () => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const handleLogin = async () => {
            const token = searchParams.get("token") || searchParams.get("access_token");

            if (!token) {
                const error = searchParams.get("error");
                toast.error(error === "google_auth_failed" ? "فشل تسجيل الدخول عبر جوجل ❌" : "حدث خطأ في المصادقة");
                setTimeout(() => {
                    window.location.href = "/login";
                }, 1000);
                return;
            }

            try {
                // 1. Physical Storage of token
                authStorage.setToken(token);
                localStorage.setItem("token", token); // Compatibility key

                // 2. Default to 'user' type as per backend logic
                authStorage.setUserType("user");
                localStorage.setItem("userType", "user");

                // 3. Fetch user profile to complete the login state synchronization
                // This ensures Header and other components have data immediately
                const user = await authService.fetchProfile("user");

                if (user) {
                    authStorage.setUser(user);
                    localStorage.setItem("user_name", user.name);
                    localStorage.setItem("user_id", user.id.toString());
                    localStorage.setItem("user_status", user.status || "");

                    toast.success(`مرحباً ${user.name} 🎉`);
                } else {
                    toast.success("تم تسجيل الدخول بنجاح! جاري تحويلك... 🎉");
                }

                // 4. Force a full redirect to ensure the AuthProvider re-initializes with the new state
                setTimeout(() => {
                    window.location.href = "/";
                }, 500);

            } catch (err) {
                console.error("Google Callback Error:", err);
                // Fallback: reload home if we have a token even if profile fetch fails
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
            <p style={{ fontWeight: '600', color: 'var(--color-primary)', fontSize: '1.2rem' }}>جاري التحقق من الحساب...</p>
        </div>
    );
};

export default GoogleCallback;