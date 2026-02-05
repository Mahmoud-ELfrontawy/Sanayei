import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../../../Api/user/loginUser.api";
import { loginCraftsman } from "../../../Api/auth/Worker/loginWorker.api";
import { loginCompany } from "../../../Api/auth/loginCompany.api";

import { useAuth } from "../../../hooks/useAuth";

/* ================= Types ================= */

export interface LoginFormValues {
    email: string;
    password: string;
    userType: "user" | "craftsman" | "company";
}

interface UserLoginResponse {
    token: string;
    data: {
        name: string;
    };
}

interface CraftsmanLoginResponse {
    status: boolean;
    token: string;
    data: {
        id: number;
        name: string;
        email: string;
        profile_photo?: string;
    };
}

interface CompanyLoginResponse {
    token: string;
    company: {
        name: string;
    };
}

type LoginResponse =
    | UserLoginResponse
    | CraftsmanLoginResponse
    | CompanyLoginResponse;

/* ================= Hook ================= */

export const useLogin = () => {
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<LoginFormValues>({
        defaultValues: {
            userType: "user",
        },
    });

    const navigate = useNavigate();        // ⭐ جديد
    const { refreshUser } = useAuth();     // ⭐ جديد

    const onSubmit = async (data: LoginFormValues) => {
        try {
            let response: LoginResponse;

            switch (data.userType) {
                case "craftsman": {
                    // Check if input is phone or email
                    const isPhone = /^[0-9+]+$/.test(data.email);
                    const payload = isPhone 
                        ? { phone: data.email, password: data.password }
                        : { email: data.email, password: data.password };

                    response = await loginCraftsman(payload) as CraftsmanLoginResponse;
                    break;
                }

                case "company":
                    response = await loginCompany({
                        email: data.email,
                        password: data.password,
                    }) as CompanyLoginResponse;
                    break;

                default:
                    response = await loginUser({
                        email: data.email,
                        password: data.password,
                    }) as UserLoginResponse;
            }

            /* ===== Token ===== */
            localStorage.setItem("token", response.token);
            localStorage.setItem("userType", data.userType);

            /* ===== Name ===== */
            let userName: string | undefined;

            if (data.userType === "craftsman") {
                userName = (response as CraftsmanLoginResponse).data.name;
            } else if (data.userType === "company") {
                userName = (response as CompanyLoginResponse).company.name;
            } else {
                userName = (response as UserLoginResponse).data.name;
            }

            /* ===== تحديث بيانات المستخدم في الكونتكست ===== */
            await refreshUser();   // ⭐ أهم خطوة

            /* ===== Toast ===== */
             // ✅ FIX: استخدام Toast عادية لأننا نستخدم navigate ولا نعيد تحميل الصفحة
            toast.success(`أهلاً بيك يا ${userName ?? "أهلاً بيك"} 👋`);

            /* ===== التحويل حسب نوع الحساب ===== */
            if (data.userType === "user") {
                navigate("/profile"); 
            } else if (data.userType === "craftsman") {
                navigate("/craftsman/profile");
            } else {
                navigate("/company/profile");
            }

        } catch (error: unknown) {
            const axiosError = error as AxiosError<{ message?: string; error?: string }>;
            const message = axiosError.response?.data?.message || axiosError.response?.data?.error;

            if (message === "User not found") {
                toast.error("هذا الحساب غير مسجل لدينا، يرجى إنشاء حساب جديد");
                return;
            }

            // ✅ إضافة تنبيه عند محاولة الدخول بنوع حساب خاطئ
            if (message === "Account already exists as craftsman" || message?.includes("craftsman")) {
                toast.warning("هذا الحساب مسجل كـ 'صنايعي'. من فضلك اختر نوع العضوية 'صنايعي' وسجل دخولك.");
                return;
            }

            if (message === "Account already exists as user" || (message?.includes("user") && data.userType !== "user")) {
                toast.warning("هذا الحساب مسجل كـ 'مستخدم'. من فضلك اختر نوع العضوية 'مستخدم' وسجل دخولك.");
                return;
            }

            if (message === "Account already exists as company" || message?.includes("company")) {
                toast.warning("هذا الحساب مسجل كـ 'شركة'. من فضلك اختر نوع العضوية 'شركة' وسجل دخولك.");
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
        setValue: form.setValue,
        watch: form.watch,
        showPassword,
        setShowPassword,
        onSubmit,
    };

};
