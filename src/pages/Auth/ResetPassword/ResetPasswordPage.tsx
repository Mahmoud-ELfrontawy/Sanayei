import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import "./ResetPassword.css";

interface ResetPasswordPayload {
  otp: string;
  password: string;
  confirmPassword: string;
}

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordPayload>();

  const onSubmit = async (data: ResetPasswordPayload) => {
    if (data.password !== data.confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }

    // تجربة فقط
    console.log({
      email,
      otp: data.otp,
      password: data.password,
    });

    toast.success("تم تغيير كلمة المرور بنجاح ✅");

    navigate("/login");
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-password">

        <div className="auth-form">

          <h2 className="auth-title-password">
            تعيين كلمة مرور جديدة
          </h2>

          <p className="auth-desc-password">
            أدخل رمز التحقق المرسل إلى بريدك الإلكتروني
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>

            {/* OTP */}
            <input
              type="text"
              placeholder="رمز التحقق (OTP)"
              className="login-input-password"
              {...register("otp", {
                required: "رمز التحقق مطلوب",
                minLength: {
                  value: 4,
                  message: "رمز غير صالح",
                },
              })}
            />

            {errors.otp && (
              <span className="form-error">
                {errors.otp.message}
              </span>
            )}

            {/* Password */}
            <input
              type="password"
              placeholder="كلمة المرور الجديدة"
              className="login-input-password"
              {...register("password", {
                required: "كلمة المرور مطلوبة",
                minLength: {
                  value: 6,
                  message: "على الأقل 6 أحرف",
                },
              })}
            />

            {errors.password && (
              <span className="form-error">
                {errors.password.message}
              </span>
            )}

            {/* Confirm Password */}
            <input
              type="password"
              placeholder="تأكيد كلمة المرور"
              className="login-input-password"
              {...register("confirmPassword", {
                required: "تأكيد كلمة المرور مطلوب",
                validate: (value) =>
                  value === watch("password") ||
                  "كلمتا المرور غير متطابقتين",
              })}
            />

            {errors.confirmPassword && (
              <span className="form-error">
                {errors.confirmPassword.message}
              </span>
            )}

            <button
              type="submit"
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
