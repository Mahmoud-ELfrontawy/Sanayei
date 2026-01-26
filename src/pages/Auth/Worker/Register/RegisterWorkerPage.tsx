// import { FiEye, FiEyeOff, FiUpload } from "react-icons/fi";
// import { FaGoogle, FaFacebookF } from "react-icons/fa6";
// import { Link } from "react-router-dom";

// import imgWorker from "../../../assets/images/image5.png";
// import { useRegisterWorker } from "./useRegisterWorker";
// import "./RegisterWorker.css";

// const RegisterWorkerPage: React.FC = () => {
//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors, isSubmitting },
//     showPassword,
//     setShowPassword,
//     onSubmit,
//   } = useRegisterWorker();

//   const frontFile = watch("front_identity_photo");
//   const backFile = watch("back_identity_photo");

//   return (
//     <div className="auth-page-wrapper worker-page">
//       <div className="auth-card auth-card--split worker-card">
//         {/* ===== Form ===== */}
//         <div className="auth-form">
//           <h2 className="auth-title">انضم كصنايعي محترف</h2>

//           <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
//             <input
//               className="login-input"
//               placeholder="الاسم بالكامل"
//               {...register("name", { required: "الاسم مطلوب" })}
//             />
//             {errors.name && (
//               <span className="form-error">{errors.name.message}</span>
//             )}

//             <input
//               className="login-input"
//               placeholder="البريد الإلكتروني"
//               {...register("email", { required: "البريد مطلوب" })}
//             />

//             <input
//               className="login-input"
//               placeholder="رقم الهاتف"
//               {...register("phone", { required: "رقم الهاتف مطلوب" })}
//             />

//             <select
//               className="login-input"
//               {...register("profession", { required: true })}
//             >
//               <option value="">اختر المهنة</option>
//               <option value="plumber">سباك</option>
//               <option value="electrician">كهربائي</option>
//               <option value="carpenter">نجار</option>
//             </select>

//             <select
//               className="login-input"
//               {...register("city", { required: true })}
//             >
//               <option value="">اختر المحافظة</option>
//               <option value="cairo">القاهرة</option>
//               <option value="giza">الجيزة</option>
//             </select>

//             {/* بطاقة أمام */}
//             <label
//               className={`worker-file-label ${frontFile?.length ? "has-file" : ""}`}
//             >
//               <span>
//                 {frontFile?.length ? frontFile[0].name : "صورة البطاقة (أمام)"}
//               </span>
//               <FiUpload />
//               <input
//                 type="file"
//                 hidden
//                 {...register("front_identity_photo", { required: true })}
//               />
//             </label>

//             {/* بطاقة خلف */}
//             <label
//               className={`worker-file-label ${backFile?.length ? "has-file" : ""}`}
//             >
//               <span>
//                 {backFile?.length ? backFile[0].name : "صورة البطاقة (خلف)"}
//               </span>
//               <FiUpload />
//               <input
//                 type="file"
//                 hidden
//                 {...register("back_identity_photo", { required: true })}
//               />
//             </label>

//             {/* Password */}
//             <div className="password-wrapper">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 className="login-input"
//                 placeholder="كلمة المرور"
//                 {...register("password", { required: true })}
//               />
//               <button
//                 type="button"
//                 className="password-toggle"
//                 onClick={() => setShowPassword(!showPassword)}
//               >
//                 {showPassword ? <FiEye /> : <FiEyeOff />}
//               </button>
//             </div>

//             <div className="password-wrapper">
//               <input
//                 type={showPassword ? "text" : "password"}
//                 className="login-input"
//                 placeholder="تأكيد كلمة المرور"
//                 {...register("password_confirmation", {
//                   validate: (v) => v === watch("password") || "غير متطابق",
//                 })}
//               />
//             </div>

//             <button className="login-btn" disabled={isSubmitting}>
//               {isSubmitting ? "جاري التسجيل..." : "انضم لفريق العمل"}
//             </button>
//           </form>

//           <div className="login-divider">
//             <span>أو</span>
//           </div>

//           <div className="social-buttons-container">
//             <button className="social-btn">
//               <FaGoogle /> <span>عن طريق جوجل</span>
//             </button>
//             <button className="social-btn">
//               <FaFacebookF /> <span>عن طريق فيسبوك</span>
//             </button>
//           </div>

//           <div className="login-register">
//             لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
//           </div>
//         </div>

//         {/* ===== Image ===== */}
//         <div className="worker-illustration">
//           <img src={imgWorker} alt="worker" />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterWorkerPage;
import React from "react";
import { FiEye, FiEyeOff, FiUpload } from "react-icons/fi";
import { FaGoogle, FaFacebookF } from "react-icons/fa6";
import { Link } from "react-router-dom";

import imgWorker from "../../../../assets/images/image5.png";
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
  } = useRegisterWorker();

  const frontFile = watch("front_identity_photo");
  const backFile = watch("back_identity_photo");

  return (
    <div className="auth-page-wrapper worker-page">
      <div className="auth-card auth-card--split worker-card">
        {/* ===== Form ===== */}
        <div className="auth-form">
          <h2 className="auth-title">انضم كصنايعي محترف</h2>

          <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
            {/* الاسم */}
            <input
              className="login-input"
              placeholder="الاسم بالكامل"
              {...register("name", { required: "الاسم مطلوب" })}
            />
            {errors.name && (
              <span className="form-error">{errors.name.message}</span>
            )}

            {/* البريد */}
            <input
              className="login-input"
              placeholder="البريد الإلكتروني"
              {...register("email", {
                required: "البريد مطلوب",
                pattern: { value: /^\S+@\S+$/i, message: "صيغة غير صحيحة" },
              })}
            />
            {errors.email && (
              <span className="form-error">{errors.email.message}</span>
            )}

            {/* الهاتف */}
            <input
              className="login-input"
              type="tel"
              placeholder="رقم الهاتف"
              {...register("phone", { required: "رقم الهاتف مطلوب" })}
            />
            {errors.phone && (
              <span className="form-error">{errors.phone.message}</span>
            )}

            {/* المهنة */}
            <select
              className="login-input"
              {...register("profession", { required: "اختر المهنة" })}
            >
              <option value="">اختر المهنة</option>
              <option value="plumber">سباك</option>
              <option value="electrician">كهربائي</option>
              <option value="carpenter">نجار</option>
            </select>
            {errors.profession && (
              <span className="form-error">{errors.profession.message}</span>
            )}

            {/* المحافظة */}
            <select
              className="login-input"
              {...register("city", { required: "اختر المحافظة" })}
            >
              <option value="">اختر المحافظة</option>
              <option value="cairo">القاهرة</option>
              <option value="giza">الجيزة</option>
            </select>
            {errors.city && (
              <span className="form-error">{errors.city.message}</span>
            )}

            {/* بطاقة أمام */}
            <label
              className={`worker-file-label ${frontFile?.length ? "has-file" : ""}`}
            >
              <span>
                {frontFile?.length ? frontFile[0].name : "صورة البطاقة (أمام)"}
              </span>
              <FiUpload />
              <input
                type="file"
                hidden
                accept="image/*"
                {...register("front_identity_photo", { required: "مطلوبة" })}
              />
            </label>
            {errors.front_identity_photo && (
              <span className="form-error">
                {errors.front_identity_photo.message}
              </span>
            )}

            {/* بطاقة خلف */}
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
                accept="image/*"
                {...register("back_identity_photo", { required: "مطلوبة" })}
              />
            </label>
            {errors.back_identity_photo && (
              <span className="form-error">
                {errors.back_identity_photo.message}
              </span>
            )}

            {/* Password */}
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="كلمة المرور"
                {...register("password", {
                  required: "مطلوبة",
                  minLength: { value: 6, message: "6 أحرف عالأقل" },
                })}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEye /> : <FiEyeOff />}
              </button>
            </div>
            {errors.password && (
              <span className="form-error">{errors.password.message}</span>
            )}

            {/* Confirm Password */}
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="login-input"
                placeholder="تأكيد كلمة المرور"
                {...register("password_confirmation", {
                  validate: (v) => v === watch("password") || "غير متطابق",
                })}
              />
            </div>
            {errors.password_confirmation && (
              <span className="form-error">
                {errors.password_confirmation.message}
              </span>
            )}

            {/* Terms */}
            <div className="worker-terms-wrapper">
              <label className="worker-checkbox">
                <input
                  type="checkbox"
                  {...register("terms", { required: "مطلوب" })}
                />
                <span>
                  أوافق على <Link to="/terms">الشروط</Link> و{" "}
                  <Link to="/privacy">الخصوصية</Link>
                </span>
              </label>
              {errors.terms && (
                <span className="form-error">{errors.terms.message}</span>
              )}

              <label className="worker-checkbox">
                <input
                  type="checkbox"
                  {...register("pledge", { required: "مطلوب" })}
                />
                <span>أتعهد بصحة البيانات</span>
              </label>
              {errors.pledge && (
                <span className="form-error">{errors.pledge.message}</span>
              )}
            </div>

            <button className="login-btn" disabled={isSubmitting}>
              {isSubmitting ? "جاري التسجيل..." : "انضم لفريق العمل"}
            </button>
          </form>

          <div className="login-divider">
            <span>أو</span>
          </div>

          <div className="social-buttons-container">
            <button className="social-btn">
              <FaGoogle /> <span>عن طريق جوجل</span>
            </button>
            <button className="social-btn">
              <FaFacebookF /> <span>عن طريق فيسبوك</span>
            </button>
          </div>

          <div className="login-register">
            لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
          </div>
        </div>

        {/* ===== Image ===== */}
        <div className="worker-illustration">
          <img src={imgWorker} alt="worker" />
        </div>
      </div>
    </div>
  );
};

export default RegisterWorkerPage;
