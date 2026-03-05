import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import type { StoreRegisterPayload } from "../../../../Api/auth/registerCompany.api";
import { registerCompany } from "../../../../Api/auth/registerCompany.api";

export const useRegisterCompany = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<StoreRegisterPayload>({
    defaultValues: {}
  });

  const onSubmit = async (data: StoreRegisterPayload) => {
    try {
      const res = await registerCompany(data);
      if (res.success) {
        toast.info("تم تسجيل الحساب! سيتم تفعيله من الإدارة قريباً ✅", { autoClose: 5000 });
        navigate("/login", { state: { pendingCompany: true } });
      } else {
        toast.error(res.message || "فشل تسجيل المتجر");
      }
    } catch (error: any) {
      console.error("Registration error details:", error.response?.data);
      let errorMsg = error.response?.data?.message || "حدث خطأ أثناء التسجيل";
      
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const firstKey = Object.keys(errors)[0];
        const firstMsg = errors[firstKey][0];
        errorMsg = `${firstMsg}`; // Show the specific validation error
      }
      
      toast.error(errorMsg);
    }
  };

  return {
    ...form,
    showPassword,
    setShowPassword,
    onSubmit,
  };
};
