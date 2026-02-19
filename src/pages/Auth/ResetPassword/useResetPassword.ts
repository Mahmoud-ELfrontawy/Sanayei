import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import type {
    ResetPasswordForm,
    ResetPasswordRequest,
    ResetPasswordErrorResponse,
} from "./resetPassword.types";

interface UseResetPasswordProps {
    email: string;
}

export const useResetPassword = ({ email }: UseResetPasswordProps) => {
    const navigate = useNavigate();

    const submit = async (data: ResetPasswordForm) => {
        const payload: ResetPasswordRequest = {
            email,
            otp: data.otp,
            password: data.password,
            password_confirmation: data.confirmPassword,
        };

        try {
            await axios.post("/api/auth/reset-password", payload);

            toast.success("تم تغيير كلمة المرور بنجاح ✅");
            navigate("/login");
        } catch (error) {
            const err = error as AxiosError<ResetPasswordErrorResponse>;

            if (err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors)[0][0];
                toast.error(firstError);
                return;
            }

            if (err.response?.data?.message) {
                toast.error(err.response.data.message);
                return;
            }

            toast.error("حدث خطأ، يرجى المحاولة مرة أخرى");
        }
    };

    return { submit };
};
