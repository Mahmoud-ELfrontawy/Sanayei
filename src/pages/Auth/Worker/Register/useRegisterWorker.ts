// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { toast } from "react-toastify";
// import { AxiosError } from "axios";
// import { registerWorker } from "../../../Api/auth/Worker/registerWorker.api";

// export interface RegisterWorkerFormValues {
//   name: string;
//   email: string;
//   phone: string;
//   profession: string;
//   city: string;
//   front_identity_photo: FileList;
//   back_identity_photo: FileList;
//   password: string;
//   password_confirmation: string;
//   terms: boolean;
//   pledge: boolean;
// }

// export const useRegisterWorker = () => {
//   const [showPassword, setShowPassword] = useState(false);

//   const form = useForm<RegisterWorkerFormValues>();

//   const onSubmit = async (data: RegisterWorkerFormValues) => {
//     try {
//       await registerWorker({
//         name: data.name,
//         email: data.email,
//         phone: data.phone,
//         profession: data.profession,
//         city: data.city,
//         password: data.password,
//         password_confirmation: data.password_confirmation,
//         front_identity_photo: data.front_identity_photo[0],
//         back_identity_photo: data.back_identity_photo[0],
//       });

//       toast.success("تم تسجيل الصنايعي بنجاح 🎉");
//       form.reset();
//     } catch (error) {
//       const err = error as AxiosError<any>;
//       toast.error(err.response?.data?.message || "حدث خطأ أثناء التسجيل ❌");
//     }
//   };

//   return {
//     ...form,
//     showPassword,
//     setShowPassword,
//     onSubmit,
//   };
// };
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { useNavigate } from "react-router-dom"; // للتوجيه

import { registerWorker } from "../../../../Api/auth/Worker/registerWorker.api";

export interface RegisterWorkerFormValues {
  name: string;
  email: string;
  phone: string;
  profession: string;
  city: string;
  front_identity_photo: FileList;
  back_identity_photo: FileList;
  password: string;
  password_confirmation: string;
  terms: boolean;
  pledge: boolean;
}

export const useRegisterWorker = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // هوك التوجيه

  const form = useForm<RegisterWorkerFormValues>();

  const onSubmit = async (data: RegisterWorkerFormValues) => {
    // التأكد من اختيار الصور
    if (!data.front_identity_photo?.[0] || !data.back_identity_photo?.[0]) {
      toast.error("يرجى رفع صور البطاقة (الأمام والخلف)");
      return;
    }

    try {
      const response = await registerWorker({
        name: data.name,
        email: data.email,
        phone: data.phone,
        profession: data.profession,
        city: data.city,
        password: data.password,
        password_confirmation: data.password_confirmation,
        front_identity_photo: data.front_identity_photo[0],
        back_identity_photo: data.back_identity_photo[0],
      });

      // في حالة النجاح (الباك إند بيرجع status: true)
      if (response.status === true) {
        toast.success("تم تسجيل الصنايعي بنجاح 🎉");
        form.reset();
        navigate("/login"); // التوجيه لصفحة الدخول مثل اليوزر
      }

    } catch (error: unknown) {
      const err = error as AxiosError<any>;
      console.error("Register Error:", err.response);

      // معالجة أخطاء الـ Validation القادمة من Laravel (422)
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const errors = err.response.data.errors;
        // عرض أول خطأ فقط
        const firstKey = Object.keys(errors)[0];
        const firstMsg = errors[firstKey][0];
        toast.error(firstMsg);
      } else {
        // أي خطأ آخر
        toast.error(err.response?.data?.message || "حدث خطأ أثناء التسجيل ❌");
      }
    }
  };

  return {
    ...form,
    showPassword,
    setShowPassword,
    onSubmit,
  };
};