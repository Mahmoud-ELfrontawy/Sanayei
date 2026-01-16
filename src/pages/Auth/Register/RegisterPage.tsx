import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import { register as registerApi } from "../../../Api/auth/register.api";
import img1 from "../../../assets/images/cuate (3) 1.png";

import "./Register.css";

interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

const RegisterPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterFormValues>();

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      const res = await registerApi({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      if (res?.token) {
        localStorage.setItem("token", res.token);
      }

      toast.success(`تم إنشاء الحساب بنجاح، أهلاً بيك يا ${data.name} 👋`);
      navigate("/login");
    } catch (error: any) {
      console.log("REGISTER ERROR FULL:", error);

      toast.error(
        error?.message ||
          error?.error ||
          "حدث خطأ أثناء إنشاء الحساب ❌"
      );
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card auth-card--split">
        {/* Form */}
        <div className="auth-form">
          <h2 className="auth-title">إنشاء حساب</h2>

          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            <input
              className="login-input"
              placeholder="الاسم بالكامل"
              {...register("name", { required: "الاسم مطلوب" })}
            />
            {errors.name && (
              <span className="form-error">{errors.name.message}</span>
            )}

            <input
              className="login-input"
              placeholder="البريد الإلكتروني"
              {...register("email", {
                required: "البريد الإلكتروني مطلوب",
              })}
            />
            {errors.email && (
              <span className="form-error">{errors.email.message}</span>
            )}

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="كلمة المرور"
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
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error">{errors.password.message}</span>
            )}

            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="تأكيد كلمة المرور"
                {...register("password_confirmation", {
                  required: "تأكيد كلمة المرور مطلوب",
                  validate: (val) =>
                    val === watch("password") ||
                    "كلمتا المرور غير متطابقتين",
                })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
            {errors.password_confirmation && (
              <span className="form-error">
                {errors.password_confirmation.message}
              </span>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري الإنشاء..." : "إنشاء حساب"}
            </button>
          </form>

          <div className="login-divider">
            <span>أو</span>
          </div>

          <div className="social-buttons-container">
            <button
              type="button"
              className="social-btn"
              onClick={() =>
                toast.info("التسجيل عبر جوجل قريبًا 👀")
              }
            >
              <div className="social-icon">
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />
              </div>
              <span className="social-btn-text">عن طريق جوجل</span>
            </button>

            <button
              type="button"
              className="social-btn"
              onClick={() =>
                toast.info("التسجيل عبر فيسبوك قريبًا 👀")
              }
            >
              <div className="social-icon">
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill="#1877F2"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span className="social-btn-text">عن طريق فيسبوك</span>
            </button>
          </div>

          <div className="login-register">
            لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
          </div>
        </div>

        {/* Illustration */}
        <div className="auth-illustration">
          <img src={img1} alt="Register Illustration" />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
