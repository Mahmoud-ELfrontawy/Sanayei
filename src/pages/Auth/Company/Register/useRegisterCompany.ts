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
        toast.info(
          "🎉 تم تسجيل حساب شركتك بنجاح!\nحسابك قيد المراجعة حالياً من قبل الإدارة — لن تتمكن من تسجيل الدخول حتى يتم اعتماده.",
          { autoClose: 6000 }
        );
        navigate("/login", { state: { pendingCompany: true } });
      } else {
        toast.error(res.message || "فشل تسجيل المتجر");
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "حدث خطأ أثناء التسجيل";
      toast.error(errorMsg);
      console.error("Registration error:", error);
    }
  };

  return {
    ...form,
    showPassword,
    setShowPassword,
    onSubmit,
  };
};
