import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../../../Api/user/loginUser.api";
import { loginCraftsman } from "../../../Api/auth/Worker/loginWorker.api";
import { loginCompany } from "../../../Api/auth/loginCompany.api";
import { useAuth } from "../../../hooks/useAuth";

/* ================= Types ================= */

export interface LoginFormValues {
    email: string;
    password: string;
}

type UserType = "user" | "craftsman" | "company";

interface BaseLoginResponse {
    token: string;
}

interface UserResponse extends BaseLoginResponse {
    data?: {
        id?: number | string;
        name?: string;
    };
}

interface CraftsmanResponse extends BaseLoginResponse {
    data?: {
        id?: number | string;
        name?: string;
    };
}

interface CompanyResponse extends BaseLoginResponse {
    company?: {
        id?: number | string;
        name?: string;
    };
    data?: {
        id?: number | string;
        name?: string;
    };
}

type LoginResponse = UserResponse | CraftsmanResponse | CompanyResponse;

interface ApiError {
    response?: {
        status?: number;
        data?: {
            message?: string;
            error?: string;
        };
    };
}

/* ================= Hook ================= */

export const useLogin = () => {
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<LoginFormValues>();
    const navigate = useNavigate();
    const { refreshUser } = useAuth();

    const onSubmit = async (data: LoginFormValues) => {
        try {
            let response: LoginResponse;
            let userType: UserType = "user";

            const isPhone = /^[0-9+]+$/.test(data.email.trim());

            /* ===== Login Flow ===== */

            if (isPhone) {
                try {
                    response = await loginCraftsman({
                        phone: data.email,
                        password: data.password,
                    });
                    userType = "craftsman";
                } catch (err) {
                    const error = err as ApiError;

                    if (error.response?.status === 401) throw error;

                    try {
                        response = await loginCompany({
                            email: data.email,
                            password: data.password,
                        });
                        userType = "company";
                    } catch {
                        throw error;
                    }
                }
            } else {
                try {
                    response = await loginUser({
                        email: data.email,
                        password: data.password,
                    });
                    userType = "user";
                } catch (err) {
                    const error = err as ApiError;

                    if (error.response?.status === 401) throw error;

                    try {
                        response = await loginCraftsman({
                            email: data.email,
                            phone: data.email,
                            password: data.password,
                        });
                        userType = "craftsman";
                    } catch (craftErr) {
                        const craftsmanError = craftErr as ApiError;

                        if (craftsmanError.response?.status === 401) throw craftsmanError;

                        try {
                            response = await loginCompany({
                                email: data.email,
                                password: data.password,
                            });
                            userType = "company";
                        } catch {
                            throw error;
                        }
                    }
                }
            }

            /* ===== Success Handling ===== */

            let userName = "أهلاً بيك";

            if (userType === "company") {
                userName =
                    (response as CompanyResponse).company?.name ||
                    (response as CompanyResponse).data?.name ||
                    "أهلاً بيك";
            } else {
                userName =
                    (response as UserResponse | CraftsmanResponse).data?.name ||
                    "أهلاً بيك";
            }

            localStorage.setItem("token", response.token);
            localStorage.setItem("userType", userType);

            const resId =
                (response as UserResponse | CraftsmanResponse).data?.id ||
                (response as CompanyResponse).company?.id ||
                (response as CompanyResponse).data?.id;

            if (resId) localStorage.setItem("user_id", String(resId));

            await refreshUser();

            toast.success(`أهلاً بيك يا ${userName} 👋`);

            if (userType === "user") navigate("/profile");
            else if (userType === "craftsman") navigate("/craftsman/profile");
            else navigate("/company/profile");
        } catch (err) {
            const error = err as ApiError;

            const status = error.response?.status;
            const message =
                error.response?.data?.message || error.response?.data?.error;

            if (status === 404 || message?.toLowerCase().includes("not found")) {
                toast.error("هذا الحساب غير مسجل لدينا، يرجى إنشاء حساب جديد");
            } else if (status === 401) {
                toast.error("بيانات الدخول غير صحيحة (الإيميل أو كلمة المرور)");
            } else {
                toast.error("حدث خطأ أثناء تسجيل الدخول، حاول مرة أخرى");
                console.error("Login Submission Error:", error);
            }
        }
    };

    return {
        ...form,
        showPassword,
        setShowPassword,
        onSubmit,
    };
};
