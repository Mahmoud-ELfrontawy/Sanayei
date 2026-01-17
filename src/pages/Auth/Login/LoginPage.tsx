import { Link } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebookF,
} from "react-icons/fa";

import img1 from "../../../assets/images/cuate (2) 1.png";
import { useLogin } from "./useLogin";

import "./Login.css";
import { RequestServiceInputSkeleton } from "../../Home/sections/RequestServiceSection/RequestServiceSkeleton";

const LoginPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    showPassword,
    setShowPassword,
    onSubmit,
  } = useLogin();

  return (
    <div className="auth-page-wrapper">
      <div className="login-card">
        <div className="login-card-decoration">

          <h2 className="login-title">تسجيل الدخول</h2>

          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>

            {/* نوع الحساب */}
            <div className="side-select-container">
              <label className="select-label">اختار نوع عضويتك</label>
              <select
                className="login-input select-input"
                {...register("userType")}
              >
                <option value="user">مستخدم</option>
                <option value="craftsman">صنايعي</option>
                <option value="company">شركة</option>
              </select>
            </div>

            {/* Email */}
            {isSubmitting ? (
              <RequestServiceInputSkeleton />
            ) : (
              <input
                type="email"
                placeholder="البريد الإلكتروني"
                className="login-input"
                {...register("email", {
                  required: "البريد الإلكتروني مطلوب",
                })}
              />
            )}
            {errors.email && (
              <span className="form-error">{errors.email.message}</span>
            )}

            {/* Password */}
            <div className="password-wrapper">
              {isSubmitting ? (
                <RequestServiceInputSkeleton />
              ) : (
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="كلمة المرور"
                  className="login-input"
                  {...register("password", {
                    required: "كلمة المرور مطلوبة",
                  })}
                />
              )}

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>

            {errors.password && (
              <span className="form-error">{errors.password.message}</span>
            )}

            <div className="login-options">
              <Link to="/forgot-password" className="forgot-password">
                نسيت كلمة المرور؟
              </Link>

              <label className="remember-me">
                <input type="checkbox" />
                <span>تذكرني</span>
              </label>
            </div>

            <button
              type="submit"
              className="login-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري تسجيل الدخول..." : "سجل الآن"}
            </button>
          </form>

          <div className="login-divider">
            <span>أو</span>
          </div>

          {/* Social login */}
          <div className="social-buttons-container">
            <button type="button" className="social-btn"
              onClick={() => {
                window.location.href =
                  "https://sanay3i.net/api/auth/google-login";
              }}
            >
              <FaGoogle />
              <span>عن طريق جوجل</span>
            </button>

            <button type="button" className="social-btn">
              <FaFacebookF />
              <span>عن طريق فيسبوك</span>
            </button>
          </div>

          <div className="login-register">
            <span>ليس لديك حساب؟</span>
            <Link to="/join"> أنشئ حساب جديد</Link>
          </div>

          <div className="login-illustration">
            <img src={img1} alt="Login" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
