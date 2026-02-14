import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

/* ================= Types ================= */

export interface LoginFormValues {
    email: string;
    password: string;
}

/* ================= Hook ================= */

export const useLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const form = useForm<LoginFormValues>();
    const { login } = useAuth(); // Use the unified login function

    const onSubmit = async (data: LoginFormValues) => {
        try {
            // Call login with shouldRedirect: false so we can show the toast and then navigate
            const success = await login(data.email, data.password, false);
            
            if (success) {
                const name = localStorage.getItem('user_name') || "مرحباً";
                toast.success(`تم تسجيل الدخول بنجاح، مرحباً ${name}`);
                
                // Navigate manually based on user role
                setTimeout(() => {
                    const role = localStorage.getItem('userType');
                    const userId = localStorage.getItem('user_id');
                    
                    if (role === 'admin') navigate('/admin/dashboard');
                    else if (role === 'craftsman') navigate(`/craftsman/${userId}`);
                    else navigate('/');
                }, 100);
                
            } else {
                // If login returns false without throwing
                toast.error("فشل تسجيل الدخول، يرجى التحقق من البيانات");
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error("حدث خطأ غير متوقع");
        }
    };

    return {
        ...form,
        showPassword,
        setShowPassword,
        onSubmit,
    };
};
