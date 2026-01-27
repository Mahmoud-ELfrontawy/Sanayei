import React from "react";
import { FiEye, FiEyeOff, FiUpload } from "react-icons/fi";
import { FaGoogle, FaFacebookF } from "react-icons/fa6";
import { Link } from "react-router-dom";

import imgWorker from "../../../../assets/images/image-register.png";
import { useRegisterWorker } from "./useRegisterWorker";
import "./RegisterWorker.css";

const RegisterWorkerPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    showPassword,
    setShowPassword,
    onSubmit,
    governorates,
    services, // ✅ استقبال services بدل professions
    isLoadingData,
  } = useRegisterWorker();

  const frontFile = watch("front_identity_photo");
  const backFile = watch("back_identity_photo");

  return (
    <div className="auth-page-wrapper worker-page">
      <div className="auth-card auth-card--split worker-card">
        <div className="auth-form">
          <h2 className="auth-title">انضم كصنايعي محترف</h2>

          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            {/* الاسم */}
            <div>
              <input
                className="login-input"
                placeholder="الاسم بالكامل"
                {...register("name", {
                  required: "الاسم مطلوب",
                  minLength: { value: 3, message: "الاسم يجب أن يكون 3 أحرف على الأقل" },
                })}
              />
              {errors.name && (
                <span className="form-error">{errors.name.message}</span>
              )}
            </div>

            {/* البريد */}
            <div>
              <input
                className="login-input"
                type="email"
                placeholder="البريد الإلكتروني"
                {...register("email", {
                  required: "البريد مطلوب",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "صيغة البريد الإلكتروني غير صحيحة",
                  },
                })}
              />
              {errors.email && (
                <span className="form-error">{errors.email.message}</span>
              )}
            </div>

            {/* الهاتف */}
            <div>
              <input
                className="login-input"
                type="tel"
                placeholder="رقم الهاتف"
                {...register("phone", {
                  required: "رقم الهاتف مطلوب",
                  pattern: {
                    value: /^01[0125][0-9]{8}$/,
                    message: "رقم الهاتف غير صحيح (مثال: 01012345678)",
                  },
                })}
              />
              {errors.phone && (
                <span className="form-error">{errors.phone.message}</span>
              )}
            </div>

            {/* المهنة - ✅ نستخدم service_id */}
            <div className="req-row">
            <div>
              <select
                className="login-input"
                {...register("service_id", { required: "اختر المهنة" })}
                disabled={isLoadingData}
              >
                <option value="">
                  {isLoadingData ? "جاري التحميل..." : "اختر المهنة"}
                </option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              {errors.service_id && (
                <span className="form-error">{errors.service_id.message}</span>
              )}
            </div>

            {/* المحافظة */}
            <div>
              <select
                className="login-input"
                {...register("city", { required: "اختر المحافظة" })}
                disabled={isLoadingData}
              >
                <option value="">
                  {isLoadingData ? "جاري التحميل..." : "اختر المحافظة"}
                </option>
                {governorates.map((gov) => (
                  <option key={gov.id} value={gov.slug || gov.name}>
                    {gov.name}
                  </option>
                ))}
              </select>
              {errors.city && (
                <span className="form-error">{errors.city.message}</span>
              )}
            </div>
            </div>

            {/* بطاقة أمام */}
            <div className="req-row">
            <div>
              <label
                className={`worker-file-label ${frontFile?.length ? "has-file" : ""}`}
              >
                <span>
                  {frontFile?.length
                    ? frontFile[0].name
                    : "صورة البطاقة (أمام)"}
                </span>
                <FiUpload />
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  {...register("front_identity_photo", {
                    required: "صورة البطاقة (أمام) مطلوبة",
                    validate: {
                      fileSize: (files: FileList) => {
                        if (!files || files.length === 0) return true;
                        const maxSize = 5 * 1024 * 1024;
                        return (
                          files[0].size <= maxSize ||
                          "حجم الصورة يجب أن يكون أقل من 5 ميجا"
                        );
                      },
                      fileType: (files: FileList) => {
                        if (!files || files.length === 0) return true;
                        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                        return (
                          validTypes.includes(files[0].type) ||
                          "نوع الملف غير مدعوم (استخدم jpg, png, webp)"
                        );
                      },
                    },
                  })}
                />
              </label>
              {errors.front_identity_photo && (
                <span className="form-error">
                  {errors.front_identity_photo.message}
                </span>
              )}
            </div>

            {/* بطاقة خلف */}
            <div>
              <label
                className={`worker-file-label ${backFile?.length ? "has-file" : ""}`}
              >
                <span>
                  {backFile?.length ? backFile[0].name : "صورة البطاقة (خلف)"}
                </span>
                <FiUpload />
                <input
                  type="file"
                  hidden
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  {...register("back_identity_photo", {
                    required: "صورة البطاقة (خلف) مطلوبة",
                    validate: {
                      fileSize: (files: FileList) => {
                        if (!files || files.length === 0) return true;
                        const maxSize = 5 * 1024 * 1024;
                        return (
                          files[0].size <= maxSize ||
                          "حجم الصورة يجب أن يكون أقل من 5 ميجا"
                        );
                      },
                      fileType: (files: FileList) => {
                        if (!files || files.length === 0) return true;
                        const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
                        return (
                          validTypes.includes(files[0].type) ||
                          "نوع الملف غير مدعوم (استخدم jpg, png, webp)"
                        );
                      },
                    },
                  })}
                />
              </label>
              {errors.back_identity_photo && (
                <span className="form-error">
                  {errors.back_identity_photo.message}
                </span>
              )}
            </div>
            </div>

            {/* Password */}
            <div className="req-row">
            <div>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="كلمة المرور"
                  {...register("password", {
                    required: "كلمة المرور مطلوبة",
                    minLength: {
                      value: 8,
                      message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل",
                    },
                  })}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
              {errors.password && (
                <span className="form-error">{errors.password.message}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  className="login-input"
                  placeholder="تأكيد كلمة المرور"
                  {...register("password_confirmation", {
                    required: "تأكيد كلمة المرور مطلوب",
                    validate: (value) =>
                      value === watch("password") || "كلمة المرور غير متطابقة",
                  })}
                />
              </div>
              {errors.password_confirmation && (
                <span className="form-error">
                  {errors.password_confirmation.message}
                </span>
              )}
            </div>
            </div>

            {/* Terms */}
            <div className="worker-terms-wrapper">
              <label className="worker-checkbox">
                <input
                  type="checkbox"
                  {...register("terms", { required: "يجب الموافقة على الشروط" })}
                />
                <span>
                  أوافق على <Link to="/terms">الشروط والأحكام</Link> و{" "}
                  <Link to="/privacy">سياسة الخصوصية</Link>
                </span>
              </label>
              {errors.terms && (
                <span className="form-error">{errors.terms.message}</span>
              )}

              <label className="worker-checkbox">
                <input
                  type="checkbox"
                  {...register("pledge", {
                    required: "يجب التعهد بصحة البيانات",
                  })}
                />
                <span>أتعهد بأن جميع البيانات المدخلة صحيحة</span>
              </label>
              {errors.pledge && (
                <span className="form-error">{errors.pledge.message}</span>
              )}
            </div>

            <button
              className="login-btn"
              disabled={isSubmitting || isLoadingData}
            >
              {isSubmitting ? "جاري التسجيل..." : "انضم لفريق العمل"}
            </button>
          </form>

          <div className="login-divider">
            <span>أو</span>
          </div>

          <div className="social-buttons-container">
            <button className="social-btn" type="button">
              <FaGoogle /> <span>عن طريق جوجل</span>
            </button>
            <button className="social-btn" type="button">
              <FaFacebookF /> <span>عن طريق فيسبوك</span>
            </button>
          </div>

          <div className="login-register">
            لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
          </div>
        </div>

        <div className="worker-illustration">
          <img src={imgWorker} alt="صنايعي محترف" />
        </div>
      </div>
    </div>
  );
};

export default RegisterWorkerPage;