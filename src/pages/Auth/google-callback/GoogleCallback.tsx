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

        // تخزين التوكن - توحيد المفاتيح
        localStorage.setItem("token", token);
        localStorage.setItem("userType", "user");

        toast.success(`أهلاً بيك يا بطل 👋`);

        // تحويل المستخدم للصفحة الرئيسية
        navigate("/");
    }, [navigate, searchParams]);

    return (
        <></>
    );
};

export default GoogleCallback;