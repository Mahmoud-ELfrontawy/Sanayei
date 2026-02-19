import axios from "axios";
import { loginCraftsman } from "./loginWorker.api";

export interface RegisterWorkerPayload {
  name: string;
  email: string;
  phone: string;

  service_id: number;
  governorate_id: number;

  price_range: string;

  password: string;
  password_confirmation: string;

  front_identity_photo: File;
  back_identity_photo: File;
}

export const registerWorker = async (
  payload: RegisterWorkerPayload
) => {
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("phone", payload.phone);

  formData.append("service_id", payload.service_id.toString());
  formData.append("governorate_id", payload.governorate_id.toString());

  formData.append("price_range", payload.price_range);

  formData.append("password", payload.password);
  formData.append("password_confirmation", payload.password_confirmation);

  formData.append("front_identity_photo", payload.front_identity_photo);
  formData.append("back_identity_photo", payload.back_identity_photo);

  const registerResponse = await axios.post(
    "/api/craftsmen/register",
    formData,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const regData = registerResponse.data;

  // If account needs admin approval, do NOT auto-login — return early
  if (
    regData.message?.includes("انتظار") ||
    regData.message?.includes("مراجعة") ||
    regData.message?.includes("معلق") ||
    regData.data?.status === "pending"
  ) {
    return {
      token: null,
      message: regData.message,
      registrationData: regData,
      pendingApproval: true,
    };
  }

  // ✅ AUTO LOGIN only if registration succeeded and account is active
  try {
    const loginRes = await loginCraftsman({
      login: payload.phone,
      password: payload.password,
    });

    // ✅ تخزين صحيح
    localStorage.setItem("token", loginRes.token);
    localStorage.setItem("userType", "craftsman");

    return { ...loginRes, registrationData: regData, pendingApproval: false };
  } catch {
    // Login failed (account may need approval) — still return success
    return {
      token: null,
      message: regData.message,
      registrationData: regData,
      pendingApproval: true,
    };
  }
};
