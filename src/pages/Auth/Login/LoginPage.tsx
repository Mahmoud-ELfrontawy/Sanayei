import { Link } from "react-router-dom";
import {
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebookF,
} from "react-icons/fa";

import img1 from "../../../assets/images/cuate (2) 1.png";
import { useLogin } from "./useLogin";

import "../AuthShared.css";
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
      <div className="auth-card login-card-custom">
        <div className="login-content-wrapper">

          <h2 className="auth-title">تسجيل الدخول</h2>

          <form className="auth-form-element" onSubmit={handleSubmit(onSubmit)}>


            {/* Phone Number or Email */}
            {isSubmitting ? (
              <RequestServiceInputSkeleton />
            ) : (
              <div className="input-group">
                <input
                  type="text"
                  placeholder="رقم الهاتف أو البريد الإلكتروني"
                  className="auth-input"
                  {...register("email", {
                    required: "رقم الهاتف أو البريد الإلكتروني مطلوب"
                  })}
                />
                {errors.email && (
                  <span className="form-error">{errors.email.message}</span>
                )}
              </div>
            )}

            {/* Password */}
            <div className="input-group">
              <div className="password-wrapper">
                {isSubmitting ? (
                  <RequestServiceInputSkeleton />
                ) : (
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="كلمة المرور"
                    className="auth-input"
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
            </div>

            <div className="login-options">
              <Link to="/forgot-password-options" className="forgot-password">
                نسيت كلمة المرور؟
              </Link>

              <label className="remember-me">
                <input type="checkbox" />
                <span>تذكرني</span>
              </label>
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري تسجيل الدخول..." : "سجل الآن"}
            </button>
          </form>

          <div className="auth-divider">
            <span>أو</span>
          </div>

          {/* Social login */}
          <div className="auth-social-container">
            <button type="button" className="auth-social-btn"
              onClick={() => {
                window.location.href =
                  "/api/auth/google-login";
              }}
            >
              <FaGoogle />
              <span>عن طريق جوجل</span>
            </button>

            <button type="button" className="auth-social-btn">
              <FaFacebookF />
              <span>عن طريق فيسبوك</span>
            </button>
          </div>

          <div className="auth-footer-link">
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
