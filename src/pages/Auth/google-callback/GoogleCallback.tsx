import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

const GoogleCallback: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token") || searchParams.get("access_token");

        if (!token) {
            toast.error("فشل تسجيل الدخول عبر جوجل");
            setTimeout(() => navigate("/login"), 1500);
            return;
        }

        // تخزين التوكن
        localStorage.setItem("auth_token", token);
        localStorage.setItem("userType", "user");

        toast.success(`تم إنشاء الحساب بنجاح 👋`);

        // تحويل المستخدم للصفحة الرئيسية بعد 500ms
        setTimeout(() => navigate("/"));
    }, [navigate, searchParams]);

    return (
        <></>
    );
};

export default GoogleCallback;