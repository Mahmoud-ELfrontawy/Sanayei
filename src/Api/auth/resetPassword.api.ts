import axios from "axios";

export interface ResetPasswordApiPayload {
    email: string;
    otp: string;
    password: string;
    password_confirmation: string;
}

export interface ResetPasswordApiResponse {
    message?: string;
}

export const resetPassword = async (
    data: ResetPasswordApiPayload,
): Promise<ResetPasswordApiResponse> => {
    const response = await axios.post(
        "/api/auth/reset-password",
        data,
    );

    return response.data;
};
