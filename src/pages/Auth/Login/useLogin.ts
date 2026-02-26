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
                const role = localStorage.getItem('userType');
                const status = localStorage.getItem('user_status');

                if (role === 'company' && status === 'pending') {
                    toast.info(`مرحباً ${name}، حسابك قيد المراجعة حالياً وسيتم تفعيله قريباً.`);
                } else {
                    toast.success(`تم تسجيل الدخول بنجاح، مرحباً ${name}`);
                }
                
                // Navigate manually based on user role
                setTimeout(() => {
                    const role = localStorage.getItem('userType');
                    
                    if (role === 'admin') navigate('/admin/dashboard');
                    else navigate('/');
                }, 100);
                
            } else {
                // Specific errors (like Blocked or Pending) are handled inside useAuth.login toast
                // We don't need a generic toast here unless we want to catch specific logic.
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
