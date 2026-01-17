import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

import { loginUser } from "../../../Api/auth/loginUser.api";
import { loginCraftsman } from "../../../Api/auth/loginCraftsman.api";
import { loginCompany } from "../../../Api/auth/loginCompany.api";

export interface LoginFormValues {
    email: string;
    password: string;
    userType: "user" | "craftsman" | "company";
}

export const useLogin = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const form = useForm<LoginFormValues>({
        defaultValues: {
            userType: "user",
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            let response;

            switch (data.userType) {
                case "craftsman":
                    response = await loginCraftsman(data);
                    break;

                case "company":
                    response = await loginCompany(data);
                    break;

                default:
                    response = await loginUser(data);
            }

            localStorage.setItem("token", response.token);
            localStorage.setItem("userType", data.userType);

            const userName = response.user?.name || "أهلاً بيك";
            toast.success(`أهلاً بيك يا ${userName} 👋`);

            navigate("/");
        } catch (error: unknown) {
            const axiosError = error as AxiosError<{ message: string }>;
            const message = axiosError?.response?.data?.message;

            if (message === "User not found") {
                toast.error("هذا الحساب غير مسجل لدينا، يرجى إنشاء حساب جديد");
                return;
            }

            if (message === "Invalid password") {
                toast.error("كلمة المرور غير صحيحة");
                return;
            }

            toast.error("حدث خطأ أثناء تسجيل الدخول، حاول مرة أخرى");
        }
    };

    return {
        ...form,
        showPassword,
        setShowPassword,
        onSubmit,
    };
};
