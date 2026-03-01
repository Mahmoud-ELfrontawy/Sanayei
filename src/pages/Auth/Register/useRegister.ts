import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { register as registerApi } from "../../../Api/user/register.api";
import { setToastAfterReload } from "../../../utils/toastAfterReload";

export interface RegisterFormValues {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    terms: boolean;
    pledge: boolean;
}

export const useRegister = () => {
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<RegisterFormValues>();

    const onSubmit = async (data: RegisterFormValues) => {
        try {
            const res = await registerApi({
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: data.password,
                password_confirmation: data.password_confirmation,
            });

            if (res?.token) {
                localStorage.setItem("token", res.token);
                localStorage.setItem("userType", "user"); // Default for this register
                if (res.data?.id) localStorage.setItem("user_id", res.data.id.toString());
                
                setToastAfterReload("تم إنشاء الحساب بنجاح 🎉");
                window.location.replace("/"); // Go to home/dashboard directly
            } else {
                setToastAfterReload("تم إنشاء الحساب بنجاح 🎉");
                window.location.replace("/login");
            }
        } catch (error: any) {
            console.error("Register Error:", error);
            let message = "حدث خطأ أثناء إنشاء الحساب ❌";
            
            if (error.response?.data?.errors) {
                const errors = error.response.data.errors;
                const firstError = Object.values(errors)[0] as string[];
                message = firstError[0] || message;
            } else if (error.response?.data?.message) {
                message = error.response.data.message;
            }

            toast.error(message);
        }
    };

    return {
        ...form,
        showPassword,
        setShowPassword,
        onSubmit,
    };
};
