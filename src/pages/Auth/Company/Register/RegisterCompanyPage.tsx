import React, { useState } from "react";
import { FiEye, FiEyeOff, FiUpload, FiCheck, FiArrowRight, FiArrowLeft, FiGlobe, FiFileText, FiPhone, FiMapPin, FiCheckCircle } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useRegisterCompany } from "./useRegisterCompany";
import "../../AuthShared.css";
import "./RegisterCompany.css";
import TermsModal from "../../../../components/ui/TermsModal/TermsModal";

const RegisterCompanyPage: React.FC = () => {
    const {
        register,
        handleSubmit,
        watch,
        trigger,
        formState: { errors, isSubmitting },
        showPassword,
        setShowPassword,
        onSubmit,
        setValue,
    } = useRegisterCompany();

    const [currentStep, setCurrentStep] = useState(1);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
    const [hasReadTerms, setHasReadTerms] = useState(false);

    const logoFile = watch("company_logo") as unknown as FileList;
    const taxFile = watch("tax_card") as unknown as FileList;
    const commFile = watch("commercial_register") as unknown as FileList;

    const steps = [
        { id: 1, title: "البيانات الأساسية", icon: <FiGlobe /> },
        { id: 2, title: "التوثيق", icon: <FiFileText /> },
        { id: 3, title: "التواصل", icon: <FiPhone /> },
        { id: 4, title: "العنوان", icon: <FiMapPin /> },
        { id: 5, title: "التأكيد", icon: <FiCheckCircle /> },
    ];

    const nextStep = async () => {
        let fieldsToValidate: any[] = [];
        if (currentStep === 1) fieldsToValidate = ["company_name", "company_email", "company_password", "ensure_password"];
        else if (currentStep === 2) fieldsToValidate = []; // Add file fields if they become required
        else if (currentStep === 3) fieldsToValidate = ["company_phone_number", "company_whatsapp_number", "company_category"];
        else if (currentStep === 4) fieldsToValidate = ["company_city", "company_specific_address", "company_simple_hint"];

        const isStepValid = await trigger(fieldsToValidate);
        if (isStepValid) {
            setCurrentStep((prev) => Math.min(prev + 1, steps.length));
        }
    };

    const prevStep = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 1));
    };

    return (
        <div className="auth-page-wrapper company-page">
            <div className="auth-card company-card-centered">
                <div className="auth-form-content">
                    <h2 className="auth-title">تسجيل متجر جديد</h2>
                    <p className="auth-subtitle">انضم إلينا كمتجر معتمد وابدأ بيع منتجاتك حسب نشاط متجرك</p>

                    {/* --- Stepper Indicator --- */}
                    <div className="stepper-container">
                        <div className="stepper-progress" style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}></div>
                        {steps.map((step) => (
                            <div key={step.id} className={`step-item ${currentStep >= step.id ? "active" : ""} ${currentStep > step.id ? "completed" : ""}`}>
                                <div className="step-circle">
                                    {currentStep > step.id ? <FiCheck /> : step.icon}
                                </div>
                                <span className="step-label">{step.title}</span>
                            </div>
                        ))}
                    </div>

                    <form className="auth-form-element company-register-form" onSubmit={handleSubmit(onSubmit)}>

                        {/* Step 1: البيانات الأساسية */}
                        {currentStep === 1 && (
                            <div className="form-section fade-in">
                                <h3 className="section-title">بيانات المتجر الأساسية</h3>
                                <div className="auth-row">
                                    <div className="input-group flex-1">
                                        <input
                                            className="auth-input"
                                            placeholder="اسم المتجر / المعرض"
                                            {...register("company_name", { required: "اسم المتجر مطلوب" })}
                                        />
                                        {errors.company_name && <span className="form-error">{errors.company_name.message}</span>}
                                    </div>
                                    <div className="input-group flex-1">
                                        <input
                                            className="auth-input"
                                            type="email"
                                            placeholder="البريد الإلكتروني التجاري"
                                            {...register("company_email", {
                                                required: "البريد الإلكتروني مطلوب",
                                                pattern: { value: /^\S+@\S+$/i, message: "بريد إلكتروني غير صحيح" }
                                            })}
                                        />
                                        {errors.company_email && <span className="form-error">{errors.company_email.message}</span>}
                                    </div>
                                </div>

                                <div className="auth-row">
                                    <div className="input-group flex-1">
                                        <div className="password-wrapper">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                className="auth-input"
                                                placeholder="كلمة المرور"
                                                {...register("company_password", { required: "كلمة المرور مطلوبة", minLength: { value: 8, message: "8 أحرف على الأقل" } })}
                                            />
                                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                                {showPassword ? <FiEye /> : <FiEyeOff />}
                                            </button>
                                        </div>
                                        {errors.company_password && <span className="form-error">{errors.company_password.message}</span>}
                                    </div>
                                    <div className="input-group flex-1">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            className="auth-input"
                                            placeholder="تأكيد كلمة المرور"
                                            {...register("ensure_password", {
                                                required: "تأكيد كلمة المرور مطلوب",
                                                validate: (val) => val === watch("company_password") || "كلمتا المرور غير متطابقتين"
                                            })}
                                        />
                                        {errors.ensure_password && <span className="form-error">{errors.ensure_password.message}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: التوثيق */}
                        {currentStep === 2 && (
                            <div className="form-section fade-in">
                                <h3 className="section-title">بيانات التوثيق والتحقق</h3>
                                <div className="input-group">
                                    <label className={`worker-file-label ${logoFile?.length ? "has-file" : ""}`}>
                                        <span>{logoFile?.length ? logoFile[0].name : "شعار المتجر (Logo)"}</span>
                                        <FiUpload />
                                        <input
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            {...register("company_logo")}
                                        />
                                    </label>
                                </div>
                                <div className="auth-row">
                                    <div className="input-group flex-1">
                                        <label className={`worker-file-label ${taxFile?.length ? "has-file" : ""}`}>
                                            <span>{taxFile?.length ? taxFile[0].name : "البطاقة الضريبية"}</span>
                                            <FiUpload />
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                {...register("tax_card")}
                                            />
                                        </label>
                                    </div>
                                    <div className="input-group flex-1">
                                        <label className={`worker-file-label ${commFile?.length ? "has-file" : ""}`}>
                                            <span>{commFile?.length ? commFile[0].name : "السجل التجاري"}</span>
                                            <FiUpload />
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/*,.pdf"
                                                {...register("commercial_register")}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: التواصل */}
                        {currentStep === 3 && (
                            <div className="form-section fade-in">
                                <h3 className="section-title">بيانات التواصل والعمل</h3>
                                <div className="auth-row">
                                    <div className="input-group flex-1">
                                        <input
                                            className="auth-input"
                                            placeholder="رقم هاتف المتجر"
                                            {...register("company_phone_number", { required: "رقم الهاتف مطلوب" })}
                                        />
                                        {errors.company_phone_number && <span className="form-error">{errors.company_phone_number.message}</span>}
                                    </div>
                                    <div className="input-group flex-1">
                                        <input
                                            className="auth-input"
                                            placeholder="رقم الواتساب"
                                            {...register("company_whatsapp_number", { required: "رقم الواتساب مطلوب" })}
                                        />
                                        {errors.company_whatsapp_number && <span className="form-error">{errors.company_whatsapp_number.message}</span>}
                                    </div>
                                </div>

                                <div className="auth-row">
                                    <div className="input-group flex-1">
                                        <input
                                            className="auth-input"
                                            placeholder="تصنيف المنتجات (مثل: فلاتر مياه، قطع غيار)"
                                            {...register("company_category", { required: "التصنيف مطلوب" })}
                                        />
                                        {errors.company_category && <span className="form-error">{errors.company_category.message}</span>}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: العنوان */}
                        {currentStep === 4 && (
                            <div className="form-section fade-in">
                                <h3 className="section-title">العنوان والموقع</h3>
                                <div className="auth-row">
                                    <div className="input-group flex-1">
                                        <input
                                            className="auth-input"
                                            placeholder="المحافظة"
                                            {...register("company_city", { required: "المحافظة مطلوبة" })}
                                        />
                                    </div>
                                    <div className="input-group flex-1">
                                        <input
                                            className="auth-input"
                                            placeholder="المدينة / المنطقة"
                                            {...register("company_specific_address", { required: "العنوان مطلوب" })}
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <textarea
                                        className="auth-input"
                                        placeholder="نبذة بسيطة عن المتجر والمنتجات المتوفرة"
                                        {...register("company_simple_hint", { required: "النبذة مطلوبة" })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 5: التأكيد */}
                        {currentStep === 5 && (
                            <div className="form-section fade-in">
                                <h3 className="section-title">الموافقة والتعهد</h3>
                                <div className="auth-terms-wrapper" style={{ marginBottom: '20px' }}>
                                    <label className={`auth-checkbox-label ${!hasReadTerms ? "terms-locked" : ""}`}>
                                        <input
                                            type="checkbox"
                                            disabled={!hasReadTerms}
                                            {...register("terms" as any, { required: "يجب الموافقة على الشروط" })}
                                        />
                                        <span>
                                            أوافق على <Link to="/terms" target="_blank">الشروط والأحكام</Link> و <Link to="/privacy" target="_blank">سياسة الخصوصية</Link> للمتاجر
                                        </span>
                                    </label>
                                    {!hasReadTerms && (
                                        <button
                                            type="button"
                                            className="read-terms-btn"
                                            onClick={() => setIsTermsModalOpen(true)}
                                        >
                                            يرجى قراءة تعليمات المنصة أولاً لتفعيل الموافقة
                                        </button>
                                    )}
                                    {(errors as any).terms && <span className="form-error">{(errors as any).terms.message}</span>}

                                    <label className="auth-checkbox-label">
                                        <input
                                            type="checkbox"
                                            {...register("pledge" as any, { required: "يجب التعهد بصحة البيانات" })}
                                        />
                                        <span>أتعهد بصحة جميع بيانات المتجر المرفقة</span>
                                    </label>
                                    {(errors as any).pledge && <span className="form-error">{(errors as any).pledge.message}</span>}
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="stepper-navigation">
                            {currentStep > 1 && (
                                <button type="button" className="stepper-btn prev-btn" onClick={prevStep}>
                                    <FiArrowRight />
                                    السابق
                                </button>
                            )}

                            {currentStep < steps.length ? (
                                <button type="button" className="stepper-btn next-btn" onClick={nextStep}>
                                    التالي
                                    <FiArrowLeft />
                                </button>
                            ) : (
                                <button type="submit" className="auth-btn submit-btn" disabled={isSubmitting}>
                                    {isSubmitting ? "جاري تسجيل البيانات..." : "إتمـام التسجيـل"}
                                </button>
                            )}
                        </div>
                        <div className="company-footer-link">
                            لديك حساب متجر بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
                        </div>
                    </form>
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

export default RegisterCompanyPage;


