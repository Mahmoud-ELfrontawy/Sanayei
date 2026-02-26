import React from "react";
import { FiUpload, FiSave, FiInfo, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi";
import { toast } from "react-toastify";
import { useCompanyProfile } from "./useCompanyProfile";
import { useAuth } from "../../../../hooks/useAuth";
import "./CompanyProfile.css";

const CompanyProfilePage: React.FC = () => {
    const { user } = useAuth();
    const {
        register,
        handleSubmit,
        watch,
        loading,
        handleUpdate,
        formState: { isSubmitting },
    } = useCompanyProfile();

    const logoFile = watch("company_logo") as unknown as FileList;

    if (loading) {
        return (
            <div className="profile-loading">
                <div className="spinner"></div>
                <p>جاري تحميل بيانات المتجر...</p>
            </div>
        );
    }

    return (
        <div className="company-profile-container">
            <div className="profile-header">
                <h2>إدارة بيانات المتجر</h2>
                <p>تحكم في كيفية ظهور معرضك للعملاء</p>
            </div>

            <form onSubmit={handleSubmit(handleUpdate)} className="profile-edit-form">

                {/* --- Status Card --- */}
                <div className={`profile-card status-display-card ${user?.status || 'pending'}`}>
                    <div className="status-icon-box">
                        {user?.status === 'approved' && <FiCheckCircle size={32} />}
                        {user?.status === 'rejected' && <FiAlertCircle size={32} />}
                        {(user?.status === 'pending' || !user?.status) && <FiClock size={32} />}
                    </div>
                    <div className="status-text-content">
                        <h3>
                            {user?.status === 'approved' ? 'حساب معتمد' :
                                user?.status === 'rejected' ? 'الحساب محظور' : 'الحساب قيد المراجعة'}
                        </h3>
                        <p>
                            {user?.status === 'approved' ? 'حسابك مفعل الآن ويمكنك رفع المنتجات واستخدام كافة الميزات.' :
                                user?.status === 'rejected' ? (
                                    <>
                                        نأسف، تم حظر حسابك من قبل الإدارة. يرجى التواصل مع الدعم الفني لحل المشكلة:
                                        <br />
                                        <a href="https://wa.me/201026605030" target="_blank" rel="noreferrer" style={{ color: '#dc2626', fontWeight: 'bold', textDecoration: 'underline' }}>تواصل عبر واتساب</a>
                                    </>
                                ) :
                                    'جاري مراجعة بياناتك من قبل الإدارة، ستتمكن من رفع المنتجات فور اعتماد الحساب.'}
                        </p>
                    </div>
                </div>

                {/* --- Logo Section --- */}
                <div className="profile-card logo-card">
                    <div className="card-header">
                        <FiInfo />
                        <h3>هوية المتجر</h3>
                    </div>
                    <div className="logo-upload-wrapper">
                        <div className="logo-preview">
                            {watch("company_logo_url") ? (
                                <img src={watch("company_logo_url")} alt="Logo" />
                            ) : (
                                <div className="logo-placeholder">No Logo</div>
                            )}
                        </div>
                        <label className={`upload-btn ${logoFile?.length ? "has-file" : ""}`}>
                            <FiUpload />
                            {logoFile?.length ? logoFile[0].name : "تغيير الشعار"}
                            <input type="file" hidden accept="image/*" {...register("company_logo")} />
                        </label>
                    </div>
                </div>

                {/* --- Business Details --- */}
                <div className="profile-card">
                    <div className="card-header">
                        <FiInfo />
                        <h3>البيانات الأساسية</h3>
                    </div>
                    <div className="form-grid">
                        <div className="input-field">
                            <label>اسم المتجر</label>
                            <input {...register("company_name")} placeholder="اسم المتجر" />
                        </div>
                        <div className="input-field">
                            <label>البريد الإلكتروني التجاري</label>
                            <input {...register("company_email")} type="email" readOnly disabled />
                            <small>لا يمكن تغيير البريد الإلكتروني الأساسي من هنا</small>
                        </div>
                        <div className="input-field">
                            <label>رقم الهاتف</label>
                            <input {...register("company_phone_number")} placeholder="رقم الهاتف" />
                        </div>
                        <div className="input-field">
                            <label>رقم الواتساب</label>
                            <input {...register("company_whatsapp_number")} placeholder="رقم الواتساب" />
                        </div>
                    </div>
                </div>

                {/* --- Category & Location --- */}
                <div className="profile-card">
                    <div className="card-header">
                        <FiInfo />
                        <h3>التصنيف والموقع</h3>
                    </div>
                    <div className="form-grid">
                        <div className="input-field">
                            <label>تصنيف المنتجات</label>
                            <input {...register("company_category")} placeholder="مثال: فلاتر مياه، قطع غيار" />
                        </div>
                        <div className="input-field">
                            <label>المحافظة</label>
                            <input {...register("company_city")} placeholder="المحافظة" />
                        </div>
                    </div>
                    <div className="input-field full-width">
                        <label>العنوان التفصيلي</label>
                        <input {...register("company_specific_address")} placeholder="العنوان التفصيلي" />
                    </div>
                    <div className="input-field full-width">
                        <label>نبذة عن المتجر</label>
                        <textarea {...register("company_simple_hint")} placeholder="اكتب نبذة تجذب العملاء لمعرضك..." />
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className={`save-btn ${user?.status === 'rejected' ? 'disabled' : ''}`}
                        disabled={isSubmitting}
                        onClick={(e) => {
                            if (user?.status === 'rejected') {
                                e.preventDefault();
                                toast.error("حسابك محظور، يرجى التواصل مع الدعم الفني لحل المشكلة.");
                            }
                        }}
                    >
                        <FiSave />
                        {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default CompanyProfilePage;
