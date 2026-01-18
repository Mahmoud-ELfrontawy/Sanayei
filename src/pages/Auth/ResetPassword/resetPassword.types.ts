export interface ResetPasswordForm {
    otp: string;
    password: string;
    confirmPassword: string;
}

export interface ResetPasswordRequest {
    email: string;
    otp: string;
    password: string;
    password_confirmation: string;
}

export interface ResetPasswordErrorResponse {
    message?: string;
    errors?: Record<string, string[]>;
}
