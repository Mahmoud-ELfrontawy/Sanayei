import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { AxiosError } from "axios";

import img from "../../../assets/images/Forgot password-rafiki (2) 1.png";
import { forgotPassword } from "../../../Api/auth/forgotPassword.api";

import { RequestServiceInputSkeleton } from
  "../../Home/sections/RequestServiceSection/RequestServiceSkeleton";

import "./ForgotPassword.css";

export interface ForgotPasswordPayload {
  email: string;
}

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordPayload>();

  const onSubmit = async (data: ForgotPasswordPayload) => {
    try {
      const res = await forgotPassword(data);

      toast.success(
        res?.message ||
        "تم إرسال رمز التحقق إلى بريدك الإلكتروني 📩"
      );

      navigate("/reset-password", {
        state: { email: data.email },
      });

    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;

      toast.error(
        axiosError?.response?.data?.message ||
        "حدث خطأ أثناء الإرسال، حاول مرة أخرى"
      );
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-password">

        {/* Form */}
        <div className="auth-form">

          <h2 className="auth-title-password">
            نسيت كلمة المرور؟
          </h2>

          <p className="auth-desc-password">
            أدخل بريدك الإلكتروني وسنرسل لك رمز التحقق
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>

            {isSubmitting ? (
              <RequestServiceInputSkeleton />
            ) : (
              <>
                <input
                  type="email"
                  className="login-input-password"
                  placeholder="البريد الإلكتروني"
                  {...register("email", {
                    required: "البريد الإلكتروني مطلوب",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "بريد إلكتروني غير صالح",
                    },
                  })}
                />

                {errors.email && (
                  <span className="form-error">
                    {errors.email.message}
                  </span>
                )}
              </>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "جاري الإرسال..."
                : "إرسال البريد الإلكتروني"}
            </button>
          </form>

          <div className="login-register-password mt-4">
            <Link to="/login">
              الرجوع لتسجيل الدخول
            </Link>
          </div>
        </div>

        {/* Illustration */}
        <div className="auth-illustration-password">
          <img src={img} alt="Forgot password" />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
