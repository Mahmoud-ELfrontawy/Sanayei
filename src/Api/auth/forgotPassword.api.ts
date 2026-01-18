import axios from "axios";

export interface ForgotPasswordPayload {
    email: string;
}

export const forgotPassword = async (data: ForgotPasswordPayload) => {
    const response = await axios.post(
        "https://sanay3i.net/api/auth/send-otp",
        data,
    );

    return response.data;
};
