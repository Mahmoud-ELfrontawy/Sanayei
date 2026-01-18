import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useForm, useWatch } from "react-hook-form";
import { useLocation, Link } from "react-router-dom";

import type { ResetPasswordForm } from "./resetPassword.types";
import { useResetPassword } from "./useResetPassword";

import "./ResetPassword.css";

interface LocationState {
  email?: string;
}

const ResetPasswordPage = () => {
  const location = useLocation();
  const { email } = (location.state as LocationState) || {};

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>();

  const passwordValue = useWatch({
    control,
    name: "password",
  });

  const { submit } = useResetPassword({ email: email || "" });

  if (!email) {
    return (
      <div className="text-center mt-20" dir="rtl">
        <p>عذراً، يجب إدخال البريد الإلكتروني أولاً.</p>
        <Link to="/forgot-password" style={{ color: "orange" }}>
          اضغط هنا للعودة
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-reset">
        <div className="auth-form">

          <h2 className="auth-title-password">
            تعيين كلمة مرور جديدة
          </h2>

          <p className="auth-desc-password">
            أدخل رمز التحقق المرسل إلى بريدك الإلكتروني
          </p>

          <form onSubmit={handleSubmit(submit)}>

            {/* OTP */}
            <input
              className="login-input-password"
              placeholder="رمز التحقق"
              {...register("otp", {
                required: "رمز التحقق مطلوب",
              })}
            />
            {errors.otp && (
              <span className="form-error">
                {errors.otp.message}
              </span>
            )}

            {/* Password */}
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="login-input-password"
                placeholder="كلمة المرور الجديدة"
                {...register("password", {
                  required: "كلمة المرور مطلوبة",
                  minLength: {
                    value: 6,
                    message: "6 أحرف على الأقل",
                  },
                })}
              />

              <span
                className="eye-icon"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>

            {errors.password && (
              <span className="form-error">
                {errors.password.message}
              </span>
            )}

            {/* Confirm Password */}
            <div className="password-wrapper">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="login-input-password"
                placeholder="تأكيد كلمة المرور"
                {...register("confirmPassword", {
                  validate: (value) =>
                    value === passwordValue ||
                    "كلمتا المرور غير متطابقتين",
                })}
              />

              <span
                className="eye-icon"
                onClick={() =>
                  setShowConfirmPassword((prev) => !prev)
                }
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>

            {errors.confirmPassword && (
              <span className="form-error">
                {errors.confirmPassword.message}
              </span>
            )}

            <button
              className="login-btn"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "جاري الحفظ..."
                : "تغيير كلمة المرور"}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

