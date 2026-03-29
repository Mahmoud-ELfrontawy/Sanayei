import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { StoreRegisterPayload } from "../../../../Api/auth/registerCompany.api";
import { registerCompany } from "../../../../Api/auth/registerCompany.api";
import { useQuery } from "@tanstack/react-query";
import { getCompanyRegistrationCategories } from "../../../../Api/store/publicStore.api";

export const useRegisterCompany = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["registration-categories"],
    queryFn: getCompanyRegistrationCategories,
    staleTime: 0, // Ensure we get fresh data from admin
  });

  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.data || [];
  
  const form = useForm<StoreRegisterPayload>({
    defaultValues: {
      company_category: "",
    }
  });

  const selectedCategory = form.watch("company_category");


  const onSubmit = async (data: StoreRegisterPayload) => {
    try {
      const payload = { ...data };
      
      // If 'other' is selected, use the custom_category value
      if (payload.company_category === "other") {
        payload.company_category = payload.custom_category || "";
      }
      
      const res = await registerCompany(payload);
      if (res.success) {
        toast.success("تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني لتنشيط الحساب والانتظار لموافقة الإدارة ✅", { autoClose: 7000 });
        navigate("/login", { state: { pendingCompany: true } });
      } else {
        toast.error(res.message || "فشل تسجيل المتجر");
      }
    } catch (error: any) {
      console.error("Registration error details:", error.response?.data);
      let errorMsg = error.response?.data?.message || "حدث خطأ أثناء التسجيل";
      
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        
        if (errors.company_email || errors.email) {
            errorMsg = "هذا البريد الإلكتروني مسجل بالفعل لمؤسسة أخرى ⚠️";
        } else if (errors.company_phone_number || errors.company_whatsapp_number) {
            errorMsg = "رقم الهاتف أو الواتساب غير صحيح أو مسجل مسبقاً 📱";
        } else {
            const firstKey = Object.keys(errors)[0];
            const firstMsg = errors[firstKey][0];
            errorMsg = `${firstMsg}`;
        }
      }
      
      toast.error(errorMsg);
    }
  };

  return {
    ...form,
    showPassword,
    setShowPassword,
    onSubmit,
    categories,
    isLoadingCategories,
    selectedCategory
  };
};
