import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { register as registerApi, resendVerificationEmail } from "../../../Api/user/register.api";

export interface RegisterFormValues {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    terms: boolean;
    pledge: boolean;
}

// مراحل التسجيل:
// 'form'    → عرض فورم التسجيل
// 'pending' → تم التسجيل، في انتظار التحقق
export type RegisterStep = "form" | "pending";

export const useRegister = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState<RegisterStep>("form");
    const [registeredEmail, setRegisteredEmail] = useState("");
    const [isResending, setIsResending] = useState(false);
    const navigate = useNavigate();

    const form = useForm<RegisterFormValues>();

    // الخطوة الأولى: إرسال بيانات التسجيل
    const onSubmit = async (data: RegisterFormValues) => {
        try {
            await registerApi({
                name: data.name,
                email: data.email,
                phone: data.phone,
                password: data.password,
                password_confirmation: data.password_confirmation,
            });

            // OTP بيتبعت مباشرة → نحول المستخدم لصفحة إدخال الـ OTP
            setRegisteredEmail(data.email);
            navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);

        } catch (error: any) {
            console.error("Register Error:", error);

            const errors = error.response?.data?.errors || {};
            const message = error.response?.data?.message || "";

            // ✅ لو الإيميل موجود مسبقاً → بعت OTP جديد وحوّله لصفحة التفعيل
            if (errors.email || message.toLowerCase().includes('email')) {
                const emailVal = data.email;
                try {
                    await resendVerificationEmail(emailVal);
                    toast.info("هذا الحساب موجود بالفعل. تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني 📧");
                    navigate(`/verify-otp?email=${encodeURIComponent(emailVal)}`);
                } catch {
                    toast.error("هذا البريد الإلكتروني مسجل بالفعل ⚠️ يرجى تسجيل الدخول أو استخدام بريد آخر.");
                }
                return;
            }

            // باقي الأخطاء
            let errorMessage = "حدث خطأ أثناء إنشاء الحساب ❌";
            if (errors.phone) {
                errorMessage = "رقم الهاتف غير صحيح أو مسجل مسبقاً 📱 يرجى التأكد من كتابة 11 رقم تبدأ بـ 01";
            } else if (Object.values(errors).length > 0) {
                const firstError = Object.values(errors)[0] as string[];
                errorMessage = firstError[0] || errorMessage;
            } else if (message) {
                errorMessage = message;
            }

            toast.error(errorMessage);
        }
    };

    // إعادة إرسال رابط التفعيل
    const onResend = async () => {
        setIsResending(true);
        try {
            await resendVerificationEmail(registeredEmail);
            toast.success("تم إرسال رابط التفعيل مرة أخرى 📧");
        } catch {
            toast.error("تعذر إعادة الإرسال، يرجى الانتظار قليلاً");
        } finally {
            setIsResending(false);
        }
    };

    // التوجيه لصفحة الـ OTP
    const goToOtpPage = () => {
        if (registeredEmail) {
            navigate(`/verify-otp?email=${encodeURIComponent(registeredEmail)}`);
        }
    };

    return {
        ...form,
        showPassword,
        setShowPassword,
        onSubmit,
        step,
        setStep,
        registeredEmail,
        isResending,
        onResend,
        goToOtpPage,
    };
};

