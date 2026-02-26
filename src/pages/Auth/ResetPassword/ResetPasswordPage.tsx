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
      <div className="auth-card reset-password-card">
        <div className="auth-form">

          <h2 className="auth-title">
            تعيين كلمة مرور جديدة
          </h2>

          <p className="auth-subtitle">
            أدخل رمز التحقق المرسل إلى بريدك الإلكتروني
          </p>

          <form className="auth-form-element" onSubmit={handleSubmit(submit)}>

            {/* OTP */}
            <div className="input-group">
                <input
                className="auth-input"
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
            </div>

            {/* Password */}
            <div className="input-group">
                <div className="password-wrapper">
                <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input"
                    placeholder="كلمة المرور الجديدة"
                    {...register("password", {
                    required: "كلمة المرور مطلوبة",
                    minLength: {
                        value: 6,
                        message: "6 أحرف على الأقل",
                    },
                    })}
                />

                <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
                </div>

                {errors.password && (
                <span className="form-error">
                    {errors.password.message}
                </span>
                )}
            </div>

            {/* Confirm Password */}
            <div className="input-group">
                <div className="password-wrapper">
                <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="auth-input"
                    placeholder="تأكيد كلمة المرور"
                    {...register("confirmPassword", {
                    validate: (value) =>
                        value === passwordValue ||
                        "كلمتا المرور غير متطابقتين",
                    })}
                />

                <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                    }
                >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
                </div>

                {errors.confirmPassword && (
                <span className="form-error">
                    {errors.confirmPassword.message}
                </span>
                )}
            </div>

            <button
              className="auth-btn"
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

