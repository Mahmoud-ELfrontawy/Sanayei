import axios from 'axios';
import type { ForgotPasswordPayload } from "../../pages/Auth/ForgotPassword/ForgotPasswordPage";

export const forgotPassword = async (data: ForgotPasswordPayload) => {
    const res = await axios.post("/auth/forgot-password", data);

    return res.data;
};
