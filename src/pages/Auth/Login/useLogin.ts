import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";

/* ================= Types ================= */

export interface LoginFormValues {
    email: string;
    password: string;
}

/* ================= Hook ================= */

export const useLogin = () => {
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<LoginFormValues>();
    const { login } = useAuth(); // Use the unified login function

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const success = await login(data.email, data.password);
            
            if (success) {
                toast.success("تم تسجيل الدخول بنجاح");
                
            } else {
                // If login returns false without throwing (shouldn't happen with current implementation but for safety)
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
