import { useState } from "react";
import { useLocation as useGeoLocation } from "../../../../hooks/useLocation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

import { registerWorker } from "../../../../Api/auth/Worker/registerWorker.api";
import { useRequestServiceData } from
  "../../../../pages/Home/sections/RequestServiceSection/useRequestServiceData";


export interface RegisterWorkerFormValues {
  name: string;
  email: string;
  phone: string;
  service_id: string;
  custom_service?: string;
  governorate_id: string;
  front_identity_photo: FileList;
  back_identity_photo: FileList;
  price_range: string;
  password: string;
  password_confirmation: string;
  terms: boolean;
  pledge: boolean;
}

interface ErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export const useRegisterWorker = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { location: geoCoords } = useGeoLocation();

  const form = useForm<RegisterWorkerFormValues>();

  const {
    services,
    governorates,
    loading: isLoadingData,
  } = useRequestServiceData();

  const onSubmit = async (data: RegisterWorkerFormValues) => {
    // ✅ تحقق من الصور
    if (!data.front_identity_photo?.[0] || !data.back_identity_photo?.[0]) {
      toast.error("يرجى رفع صور البطاقة (الأمام والخلف)");
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (data.front_identity_photo[0].size > maxSize) {
      toast.error("حجم صورة البطاقة (أمام) يجب أن يكون أقل من 5 ميجا");
      return;
    }

    if (data.back_identity_photo[0].size > maxSize) {
      toast.error("حجم صورة البطاقة (خلف) يجب أن يكون أقل من 5 ميجا");
      return;
    }

    try {
      const response = await registerWorker({
        name: data.name,
        email: data.email,
        phone: data.phone,

        service_id: data.service_id === "other" ? "other" : Number(data.service_id),
        custom_service: data.service_id === "other" ? data.custom_service : undefined,
        governorate_id: Number(data.governorate_id),

        price_range: data.price_range,

        password: data.password,
        password_confirmation: data.password_confirmation,

        front_identity_photo: data.front_identity_photo[0],
        back_identity_photo: data.back_identity_photo[0],
        
        latitude: geoCoords?.lat,
        longitude: geoCoords?.lng,
      });

      console.log('✅ Registration completed:', response);

      // Account creation success — show mail check toast and go to login
      toast.success(
        response.message || "تم إنشاء الحساب بنجاح! يرجى التحقق من بريدك الإلكتروني لتنشيط الحساب. 📧"
      );
      form.reset();
      navigate("/login");

    } catch (error: unknown) {
      const err = error as AxiosError<ErrorResponse>;

      console.error("Register Error:", err.response);

      if (err.response?.status === 403) {
        toast.info(
          err.response?.data?.message ||
          "حسابك قيد المراجعة وسيتم تفعيله خلال 24 ساعة ⏳"
        );
        return;
      }

      if (err.response?.status === 422 && err.response?.data?.errors) {
        const errors = err.response.data.errors;
        console.log("❌ Validation Errors:", errors); // سطر إضافي لرؤية كل الأخطاء في الكونسول
        if (errors.email) {
          toast.error("هذا البريد الإلكتروني مسجل بالفعل ⚠️ يرجى استخدام بريد آخر.");
        } else if (errors.phone) {
          toast.error("رقم الهاتف غير صحيح أو مسجل مسبقاً 📱 يرجى التأكد من كتابة 11 رقم تبدأ بـ 01");
        } else {
          const firstKey = Object.keys(errors)[0];
          const firstMsg = errors[firstKey][0];
          toast.error(`${firstKey}: ${firstMsg}`);
        }
      } else {
        toast.error(err.response?.data?.message || "حدث خطأ أثناء التسجيل ❌");
      }
    }
  };

  return {
    ...form,
    showPassword,
    setShowPassword,
    onSubmit,
    governorates,
    services,
    isLoadingData,
  };
};
