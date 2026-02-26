import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { authStorage } from "../../../context/auth/auth.storage";

const GoogleCallback: React.FC = () => {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token") || searchParams.get("access_token");

        if (!token) {
            toast.error("فشل تسجيل الدخول عبر جوجل");
            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
            return;
        }

        // استخدام التخزين الموحد لضمان تعرف النظام على التوكن
        authStorage.setToken(token);
        authStorage.setUserType("user");

        // استخدام window.location لإجبار التطبيق على إعادة تحميل الحالة (Hydration)
        // هذا يضمن أن AuthProvider يقرأ التوكن الجديد فوراً
        window.location.href = "/";
    }, [searchParams]);

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            flexDirection: 'column',
            gap: '20px'
        }}>
            <div className="spinner-mini" style={{ width: '40px', height: '40px' }}></div>
            <p style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>جاري تسجيل الدخول...</p>
        </div>
    );
};

export default GoogleCallback;