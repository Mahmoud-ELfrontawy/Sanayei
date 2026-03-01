import React from "react";
import { FiEye, FiEyeOff, FiUpload } from "react-icons/fi";
import { Link } from "react-router-dom";

import imgWorker from "../../../../assets/images/image-register.png";
import { useRegisterWorker } from "./useRegisterWorker";
import "../../AuthShared.css";
import "./RegisterWorker.css";
import TermsModal from "../../../../components/ui/TermsModal/TermsModal";
import { useState } from "react";

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
    services,
    isLoadingData,
    setValue,
  } = useRegisterWorker();

  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);

  const frontFile = watch("front_identity_photo");
  const backFile = watch("back_identity_photo");

  return (
    <div className="auth-page-wrapper worker-page">
      <div className="auth-card auth-card--split worker-card-custom">
        <div className="auth-form">
          <h2 className="auth-title">انضم كصنايعي محترف</h2>

          <form className="auth-form-element" onSubmit={handleSubmit(onSubmit)}>
            {/* الاسم */}
            <div className="input-group">
              <input
                className="auth-input"
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
            <div className="input-group">
              <input
                className="auth-input"
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
            <div className="input-group">
              <input
                className="auth-input"
                type="tel"
                placeholder="رقم الهاتف"
                maxLength={11}
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, "");
                }}
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
            {/* نطاق الأسعار */}
            <div className="input-group">
              <input
                className="auth-input"
                placeholder="نطاق الأسعار (مثال: 1000-3000)"
                {...register("price_range", {
                  required: "نطاق الأسعار مطلوب",
                  pattern: {
                    value: /^\d+\s*-\s*\d+$/,
                    message: "اكتب السعر بالشكل: 1000-3000",
                  },
                  validate: (value) => {
                    const [min, max] = value.split("-").map(Number);
                    if (min >= max) {
                      return "السعر الأول يجب أن يكون أقل من الثاني";
                    }
                    return true;
                  },
                })}
              />

              {errors.price_range && (
                <span className="form-error">
                  {errors.price_range.message}
                </span>
              )}
            </div>


            {/* المهنة - ✅ نستخدم service_id */}
            <div className="auth-row">
              <div className="input-group flex-1">
                <select
                  className="auth-input"
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
              <div className="input-group flex-1">
                <select
                  className="auth-input"
                  {...register("governorate_id", { required: "اختر المحافظة" })}
                  disabled={isLoadingData}
                >
                  <option value="">
                    {isLoadingData ? "جاري التحميل..." : "اختر المحافظة"}
                  </option>

                  {governorates.map((gov) => (
                    <option key={gov.id} value={gov.id}>
                      {gov.name}
                    </option>
                  ))}
                </select>

                {errors.governorate_id && (
                  <span className="form-error">{errors.governorate_id.message}</span>
                )}
              </div>
            </div>

            {/* بطاقة أمام */}
            <div className="auth-row">
              <div className="input-group flex-1">
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
              <div className="input-group flex-1">
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
            <div className="auth-row">
              <div className="input-group flex-1">
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input"
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
              <div className="input-group flex-1">
                <div className="password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="auth-input"
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
              <label className={`worker-checkbox ${!hasReadTerms ? "terms-locked" : ""}`}>
                <input
                  type="checkbox"
                  disabled={!hasReadTerms}
                  {...register("terms", { required: "يجب الموافقة على الشروط" })}
                />
                <span>
                  أوافق على <Link to="/terms" target="_blank">الشروط والأحكام</Link> و{" "}
                  <Link to="/privacy" target="_blank">سياسة الخصوصية</Link>
                </span>
              </label>
              {!hasReadTerms && (
                <button
                  type="button"
                  className="read-terms-btn"
                  onClick={() => setIsTermsModalOpen(true)}
                  style={{ fontSize: '13px' }}
                >
                  يرجى قراءة تعليمات المنصة أولاً لتفعيل الموافقة
                </button>
              )}
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
              className="auth-btn"
              disabled={isSubmitting || isLoadingData}
            >
              {isSubmitting ? "جاري التسجيل..." : "انضم لفريق العمل"}
            </button>
          </form>



          <div className="auth-footer-link">
            لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
          </div>
        </div>

        <div className="worker-illustration-container">
          <img src={imgWorker} alt="صنايعي محترف" />
        </div>
      </div>

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onAgree={() => {
          setHasReadTerms(true);
          setValue("terms", true);
        }}
      />
    </div>
  );
};

export default RegisterWorkerPage;
