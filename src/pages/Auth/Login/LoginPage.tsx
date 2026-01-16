import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

import img1 from "../../../assets/images/cuate (2) 1.png";
import { loginUser } from "../../../Api/auth/loginUser.api";
import { loginCraftsman } from "../../../Api/auth/loginCraftsman.api";
import { loginCompany } from "../../../Api/auth/loginCompany.api";

import "./Login.css";

interface LoginFormValues {
  email: string;
  password: string;
  userType: string;
}

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

const onSubmit = async (data: LoginFormValues) => {
  try {
    let res;

    switch (data.userType) {
      case "craftsman":
        res = await loginCraftsman(data);
        break;

      case "company":
        res = await loginCompany(data);
        break;

      default:
        res = await loginUser(data);
    }

    localStorage.setItem("token", res.token);
    localStorage.setItem("userType", data.userType);

    const userName = res.user?.name || "أهلاً بيك";
    toast.success(`أهلاً بيك يا ${userName} 👋`);

    navigate("/");
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ||
        "البريد الإلكتروني أو كلمة المرور غير صحيحة ❌"
    );
  }
};


  return (
    <div className="auth-page-wrapper">
      <div className="login-card">
        <div className="login-card-decoration">
          <h2 className="login-title">تسجيل دخول</h2>

          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            {/* Email + user type */}
            <div className="email-wrapper-relative">
              <div className="side-select-container">
                <label className="select-label">اختار نوع عضويتك</label>
                <select
                  className="login-input select-input"
                  {...register("userType")}
                  defaultValue="user"
                >
                  <option value="user">مستخدم</option>
                  <option value="craftsman">صنايعي</option>
                  <option value="company">شركة</option>
                </select>
              </div>

              <input
                type="email"
                placeholder="البريد الإلكتروني"
                className="login-input"
                {...register("email", {
                  required: "البريد الإلكتروني مطلوب",
                })}
              />
              {errors.email && (
                <span className="form-error">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="كلمة المرور"
                className="login-input"
                {...register("password", {
                  required: "كلمة المرور مطلوبة",
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
              {isSubmitting ? "جاري الدخول..." : "سجل الآن"}
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
                toast.info("تسجيل الدخول عبر جوجل قريبًا 👀")
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
                toast.info("تسجيل الدخول عبر فيسبوك قريبًا 👀")
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
