import React from "react";
import { FiUpload, FiSave, FiInfo } from "react-icons/fi";
import { useCompanyProfile } from "./useCompanyProfile";
import "./CompanyProfile.css";

const CompanyProfilePage: React.FC = () => {
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
                    <button type="submit" className="save-btn" disabled={isSubmitting}>
                        <FiSave />
                        {isSubmitting ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default CompanyProfilePage;
