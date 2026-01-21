import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

import { register as registerApi } from "../../../Api/auth/register.api";
import { setToastAfterReload } from "../../../utils/toastAfterReload";

export interface RegisterFormValues {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
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
            }

            setToastAfterReload("تم إنشاء الحساب بنجاح 🎉");
            window.location.replace("/login");
        } catch (error: unknown) {
            const message =
                error instanceof AxiosError
                    ? error?.response?.data?.message || "حدث خطأ أثناء إنشاء الحساب ❌"
                    : "حدث خطأ أثناء إنشاء الحساب ❌";

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
