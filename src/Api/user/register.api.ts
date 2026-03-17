import axios from "axios";

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

export const register = async (payload: RegisterPayload) => {
  const response = await axios.post(
    "/api/auth/register",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return response.data;
};

// يُرسل الـ OTP الذي كتبه المستخدم للتحقق منه وتسجيل الدخول
export const verifyOtp = async (email: string, otp: string) => {
  const response = await axios.post(
    "/api/auth/verify-otp",
    { email, otp },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  return response.data;
};

// يُعيد إرسال رابط التفعيل لإيميل المستخدم
export const resendVerificationEmail = async (email: string) => {
  const response = await axios.post(
    "/api/auth/resend-verification",
    { email },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );
  return response.data;
};
