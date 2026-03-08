import React, { useMemo } from "react";
import { FiCheckCircle, FiInfo } from "react-icons/fi";
import { motion } from "framer-motion";
import "./ProfileCompletionMeter.css";

interface ProfileField {
    id: string;
    label: string;
    isFilled: boolean;
}

interface Props {
    type: "user" | "craftsman" | "company";
    data: any;
}

const ProfileCompletionMeter: React.FC<Props> = ({ type, data }) => {
    const fields = useMemo(() => {
        const list: ProfileField[] = [];

        if (type === "user") {
            list.push({ id: "name", label: "الاسم بالكامل", isFilled: !!data.name });
            list.push({ id: "phone", label: "رقم الهاتف", isFilled: !!data.phone });
            list.push({ id: "birth_date", label: "تاريخ الميلاد", isFilled: !!data.birth_date });
            list.push({ id: "gender", label: "الجنس", isFilled: !!data.gender });
            list.push({ id: "avatar", label: "الصورة الشخصية", isFilled: !!data.avatar });
            list.push({ id: "location", label: "تحديد الموقع", isFilled: !!data.latitude && !!data.longitude });
        } else if (type === "craftsman") {
            list.push({ id: "name", label: "الاسم بالكامل", isFilled: !!data.name });
            list.push({ id: "phone", label: "رقم الهاتف", isFilled: !!data.phone });
            list.push({ id: "birth_date", label: "تاريخ الميلاد", isFilled: !!data.birth_date });
            list.push({ id: "identity", label: "رقم الهوية", isFilled: !!data.identity_number });
            list.push({ id: "gov", label: "المحافظة", isFilled: !!data.governorate_id });
            list.push({ id: "address", label: "العنوان بالتفصيل", isFilled: !!data.address });
            list.push({ id: "desc", label: "نبذة تعريفية", isFilled: !!data.description });
            list.push({ id: "exp", label: "سنوات الخبرة", isFilled: !!data.experience_years });
            list.push({ id: "price", label: "نطاق الأسعار", isFilled: !!data.price_range });
            list.push({ id: "days", label: "أيام العمل", isFilled: data.work_days && data.work_days.length > 0 });
            list.push({ id: "photos", label: "معرض الأعمال", isFilled: data.work_photos && data.work_photos.length > 0 });
            list.push({ id: "avatar", label: "الصورة الشخصية", isFilled: !!data.avatar });
            list.push({ id: "location", label: "تحديد الموقع", isFilled: !!data.latitude && !!data.longitude });
        } else if (type === "company") {
            list.push({ id: "name", label: "اسم المتجر", isFilled: !!data.company_name });
            list.push({ id: "phone", label: "رقم الهاتف", isFilled: !!data.company_phone_number });
            list.push({ id: "whatsapp", label: "رقم الواتساب", isFilled: !!data.company_whatsapp_number });
            list.push({ id: "category", label: "تصنيف المنتجات", isFilled: !!data.company_category });
            list.push({ id: "city", label: "المحافظة", isFilled: !!data.company_city });
            list.push({ id: "address", label: "العنوان", isFilled: !!data.company_specific_address });
            list.push({ id: "hint", label: "نبذة عن المتجر", isFilled: !!data.company_simple_hint });
            list.push({ id: "logo", label: "شعار المتجر", isFilled: !!data.company_logo_url || (data.company_logo && data.company_logo.length > 0) });
        }

        return list;
    }, [type, data]);

    const filledCount = fields.filter(f => f.isFilled).length;
    const totalCount = fields.length;
    const percentage = Math.round((filledCount / totalCount) * 100);
    const missingFields = fields.filter(f => !f.isFilled);

    if (percentage === 100) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="profile-completion-wrapper celebrate"
            >
                <div className="completion-celebration">
                    <div className="celebration-icon">🎉</div>
                    <div className="celebration-text">يا بطل! ملفك الشخصي مكتمل 100%</div>
                    <div className="celebration-sub">هذا يساعدك في كسب ثقة العملاء وزيادة طلباتك.</div>
                </div>
                <div className="progress-bar-track" style={{ marginTop: '15px', marginBottom: 0 }}>
                    <div className="progress-bar-fill complete" style={{ width: '100%' }}></div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="profile-completion-wrapper">
            <div className="completion-header">
                <div className="completion-title">
                    <FiCheckCircle color="var(--color-primary)" />
                    <span>نسبة اكتمال ملفك الشخصي</span>
                </div>
                <div className="completion-percentage">{percentage}%</div>
            </div>

            <div className="progress-bar-track">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            {missingFields.length > 0 && (
                <div className="completion-tips">
                    <div className="tips-header">
                        <FiInfo />
                        <span>نصائح لزيادة النسبة:</span>
                    </div>
                    <div className="tips-list">
                        {missingFields.slice(0, 2).map(field => (
                            <div key={field.id} className="tip-item">
                                <span className="tip-dot"></span>
                                <span>أضف {field.label} الخاص بك</span>
                            </div>
                        ))}
                        {missingFields.length > 2 && (
                            <div className="tip-item" style={{ opacity: 0.7, paddingRight: '14px' }}>
                                <span>+ {missingFields.length - 2} بيانات أخرى</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileCompletionMeter;
