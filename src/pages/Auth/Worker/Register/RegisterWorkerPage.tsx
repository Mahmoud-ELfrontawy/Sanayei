import React, { useState } from "react";
import { FiEye, FiEyeOff, FiUpload, FiCheck, FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";

import imgWorker from "../../../../assets/images/image-register.png";
import { useRegisterWorker } from "./useRegisterWorker";
import "../../AuthShared.css";
import "./RegisterWorker.css";
import TermsModal from "../../../../components/ui/TermsModal/TermsModal";

const RegisterWorkerPage: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isSubmitting },
    showPassword,
    setShowPassword,
    onSubmit,
    governorates,
    services,
    isLoadingData,
    setValue,
  } = useRegisterWorker();

  const [currentStep, setCurrentStep] = useState(1);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [hasReadTerms, setHasReadTerms] = useState(false);

  const frontFile = watch("front_identity_photo");
  const backFile = watch("back_identity_photo");

  const steps = [
    { id: 1, title: "البيانات الشخصية" },
    { id: 2, title: "بيانات المهنة" },
    { id: 3, title: "صور البطاقة" },
    { id: 4, title: "كلمة المرور" },
    { id: 5, title: "التأكيد" },
  ];

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate = ["name", "email", "phone"];
    else if (currentStep === 2) fieldsToValidate = ["service_id", "governorate_id", "price_range"];
    else if (currentStep === 3) fieldsToValidate = ["front_identity_photo", "back_identity_photo"];
    else if (currentStep === 4) fieldsToValidate = ["password", "password_confirmation"];

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="auth-page-wrapper worker-page">
      <div className="auth-card auth-card--split worker-card-custom">
        <div className="auth-form">
          <h2 className="auth-title">انضم كصنايعي محترف</h2>
          <p className="auth-subtitle">سجل بياناتك الآن لتصل إلى آلاف العملاء في منطقتك</p>

          {/* --- Stepper Indicator --- */}
          <div className="stepper-container">
            <div className="stepper-progress" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
            {steps.map((step) => (
              <div key={step.id} className={`step-item ${currentStep >= step.id ? "active" : ""} ${currentStep > step.id ? "completed" : ""}`}>
                <div className="step-circle">
                  {currentStep > step.id ? <FiCheck /> : step.id}
                </div>
                <span className="step-label">{step.title}</span>
              </div>
            ))}
          </div>

          <form className="auth-form-element" onSubmit={handleSubmit(onSubmit)}>

            {/* Step 1: البيانات الشخصية */}
            {currentStep === 1 && (
              <div className="form-section fade-in">
                <h3 className="section-title">البيانات الشخصية</h3>
                <div className="input-group">
                  <input
                    className="auth-input"
                    placeholder="الاسم بالكامل"
                    {...register("name", {
                      required: "الاسم مطلوب",
                      minLength: { value: 3, message: "الاسم يجب أن يكون 3 أحرف على الأقل" },
                    })}
                  />
                  {errors.name && <span className="form-error">{errors.name.message}</span>}
                </div>

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
                  {errors.email && <span className="form-error">{errors.email.message}</span>}
                </div>

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
                  {errors.phone && <span className="form-error">{errors.phone.message}</span>}
                </div>
              </div>
            )}

            {/* Step 2: بيانات المهنة */}
            {currentStep === 2 && (
              <div className="form-section fade-in">
                <h3 className="section-title">بيانات المهنة والعمل</h3>
                <div className="auth-row">
                  <div className="input-group flex-1">
                    <select
                      className="auth-input"
                      {...register("service_id", { required: "اختر المهنة" })}
                      disabled={isLoadingData}
                    >
                      <option value="">{isLoadingData ? "جاري التحميل..." : "اختر المهنة"}</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>{service.name}</option>
                      ))}
                    </select>
                    {errors.service_id && <span className="form-error">{errors.service_id.message}</span>}
                  </div>

                  <div className="input-group flex-1">
                    <select
                      className="auth-input"
                      {...register("governorate_id", { required: "اختر المحافظة" })}
                      disabled={isLoadingData}
                    >
                      <option value="">{isLoadingData ? "جاري التحميل..." : "اختر المحافظة"}</option>
                      {governorates.map((gov) => (
                        <option key={gov.id} value={gov.id}>{gov.name}</option>
                      ))}
                    </select>
                    {errors.governorate_id && <span className="form-error">{errors.governorate_id.message}</span>}
                  </div>
                </div>

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
                        if (min >= max) return "السعر الأول يجب أن يكون أقل من الثاني";
                        return true;
                      },
                    })}
                  />
                  {errors.price_range && <span className="form-error">{errors.price_range.message}</span>}
                </div>
              </div>
            )}

            {/* Step 3: صور البطاقة */}
            {currentStep === 3 && (
              <div className="form-section fade-in">
                <h3 className="section-title">بيانات الهوية</h3>
                <div className="auth-row">
                  <div className="input-group flex-1">
                    <label className={`worker-file-label ${frontFile?.length ? "has-file" : ""}`}>
                      <span>{frontFile?.length ? frontFile[0].name : "صورة البطاقة (أمام)"}</span>
                      <FiUpload />
                      <input
                        type="file"
                        hidden
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        {...register("front_identity_photo", {
                          required: "صورة البطاقة (أمام) مطلوبة",
                        })}
                      />
                    </label>
                    {errors.front_identity_photo && <span className="form-error">{errors.front_identity_photo.message}</span>}
                  </div>

                  <div className="input-group flex-1">
                    <label className={`worker-file-label ${backFile?.length ? "has-file" : ""}`}>
                      <span>{backFile?.length ? backFile[0].name : "صورة البطاقة (خلف)"}</span>
                      <FiUpload />
                      <input
                        type="file"
                        hidden
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        {...register("back_identity_photo", {
                          required: "صورة البطاقة (خلف) مطلوبة",
                        })}
                      />
                    </label>
                    {errors.back_identity_photo && <span className="form-error">{errors.back_identity_photo.message}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: كلمة المرور */}
            {currentStep === 4 && (
              <div className="form-section fade-in">
                <h3 className="section-title">تأمين الحساب</h3>
                <div className="auth-row">
                  <div className="input-group flex-1">
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="auth-input"
                        placeholder="كلمة المرور"
                        {...register("password", {
                          required: "كلمة المرور مطلوبة",
                          minLength: { value: 8, message: "كلمة المرور يجب أن تكون 8 أحرف على الأقل" },
                        })}
                      />
                      <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <FiEye /> : <FiEyeOff />}
                      </button>
                    </div>
                    {errors.password && <span className="form-error">{errors.password.message}</span>}
                  </div>

                  <div className="input-group flex-1">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="auth-input"
                      placeholder="تأكيد كلمة المرور"
                      {...register("password_confirmation", {
                        required: "تأكيد كلمة المرور مطلوب",
                        validate: (value) => value === watch("password") || "كلمة المرور غير متطابقة",
                      })}
                    />
                    {errors.password_confirmation && <span className="form-error">{errors.password_confirmation.message}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: التأكيد */}
            {currentStep === 5 && (
              <div className="form-section fade-in">
                <h3 className="section-title">الموافقة والتعهد</h3>
                <div className="worker-terms-wrapper">
                  <label className={`worker-checkbox ${!hasReadTerms ? "terms-locked" : ""}`}>
                    <input
                      type="checkbox"
                      disabled={!hasReadTerms}
                      {...register("terms", { required: "يجب الموافقة على الشروط" })}
                    />
                    <span>أوافق على <Link to="/terms" target="_blank">الشروط والأحكام</Link> و <Link to="/privacy" target="_blank">سياسة الخصوصية</Link></span>
                  </label>
                  {!hasReadTerms && (
                    <button type="button" className="read-terms-btn" onClick={() => setIsTermsModalOpen(true)}>
                      يرجى قراءة تعليمات المنصة أولاً لتفعيل الموافقة
                    </button>
                  )}
                  {errors.terms && <span className="form-error">{errors.terms.message}</span>}

                  <label className="worker-checkbox">
                    <input type="checkbox" {...register("pledge", { required: "يجب التعهد بصحة البيانات" })} />
                    <span>أتعهد بأن جميع البيانات المدخلة صحيحة</span>
                  </label>
                  {errors.pledge && <span className="form-error">{errors.pledge.message}</span>}
                </div>
              </div>
            )}

            {/* Stepper Navigation */}
            <div className="stepper-navigation">
              {currentStep > 1 && (
                <button type="button" className="stepper-btn prev-btn" onClick={prevStep}>
                  <FiArrowRight /> السابق
                </button>
              )}

              {currentStep < steps.length ? (
                <button type="button" className="stepper-btn next-btn" onClick={nextStep}>
                  التالي <FiArrowLeft />
                </button>
              ) : (
                <button className="auth-btn submit-btn" disabled={isSubmitting || isLoadingData}>
                  {isSubmitting ? "جاري التسجيل..." : "إتمـام التسجيـل"}
                </button>
              )}
            </div>

            <div className="worker-footer-link">
              لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
            </div>
          </form>
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

