import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link } from "react-router-dom";

import img1 from "../../../assets/images/cuate (3) 1.png";
import { useRegister } from "./useRegister";

import "../AuthShared.css";
import "./Register.css";
import { FaFacebookF, FaGoogle } from "react-icons/fa6";
import { RequestServiceInputSkeleton } from "../../Home/sections/RequestServiceSection/RequestServiceSkeleton";

const RegisterPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    showPassword,
    setShowPassword,
    onSubmit,
  } = useRegister();

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card auth-card--split">

        {/* Form */}
        <div className="auth-form">
          <h2 className="auth-title">إنشاء حساب</h2>

          <form className="auth-form-element" onSubmit={handleSubmit(onSubmit)}>

            {isSubmitting ? (
              <RequestServiceInputSkeleton />
            ) : (
              <div className="input-group">
                <input
                  className="auth-input"
                  placeholder="الاسم بالكامل"
                  {...register("name", { required: "الاسم مطلوب" })}
                />
                {errors.name && (
                  <span className="form-error">{errors.name.message}</span>
                )}
              </div>
            )}

            {isSubmitting ? (
              <RequestServiceInputSkeleton />
            ) : (
              <div className="input-group">
                <input
                  className="auth-input"
                  placeholder="البريد الإلكتروني"
                  {...register("email", {
                    required: "البريد الإلكتروني مطلوب",
                  })}
                />
                {errors.email && (
                  <span className="form-error">{errors.email.message}</span>
                )}
              </div>
            )}

            {/* Phone */}
            {isSubmitting ? (
              <RequestServiceInputSkeleton />
            ) : (
              <div className="input-group">
                <input
                  type="tel"
                  inputMode="numeric"
                  className="auth-input"
                  placeholder="رقم الهاتف"
                  maxLength={11}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                  }}
                  {...register("phone", {
                    required: "رقم الهاتف مطلوب",
                    pattern: {
                      value: /^01[0-2,5][0-9]{8}$/,
                      message: "رقم الهاتف غير صحيح",
                    },
                  })}
                />
                {errors.phone && (
                  <span className="form-error">
                    {errors.phone.message}
                  </span>
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
                    className="auth-input"
                    placeholder="كلمة المرور"
                    {...register("password", {
                      required: "كلمة المرور مطلوبة",
                      minLength: {
                        value: 6,
                        message: "6 أحرف على الأقل",
                      },
                    })}
                  />
                )}

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
              {errors.password && (
                <span className="form-error">
                  {errors.password.message}
                </span>
              )}
            </div>

            {/* Confirm password */}
            <div className="input-group">
              <div className="password-wrapper">
                {isSubmitting ? (
                  <RequestServiceInputSkeleton />
                ) : (
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input"
                    placeholder="تأكيد كلمة المرور"
                    {...register("password_confirmation", {
                      required: "تأكيد كلمة المرور مطلوب",
                      validate: (val) =>
                        val === watch("password") ||
                        "كلمتا المرور غير متطابقتين",
                    })}
                  />
                )}

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>

              {errors.password_confirmation && (
                <span className="form-error">
                  {errors.password_confirmation.message}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="auth-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "جاري الإنشاء..." : "إنشاء حساب"}
            </button>
          </form>

          <div className="auth-divider">
            <span>أو</span>
          </div>

          {/* Social */}
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
            لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
          </div>
        </div>

        {/* Illustration */}
        <div className="auth-illustration">
          <img src={img1} alt="Register Illustration" className="register-img-custom" />
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
