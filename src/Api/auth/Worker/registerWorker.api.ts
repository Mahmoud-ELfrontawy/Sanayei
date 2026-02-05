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

  await axios.post(
    "https://sanay3i.net/api/craftsmen/register",
    formData,
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
      },
    }
  );

  // ✅ AUTO LOGIN
  const loginRes = await loginCraftsman({
    email: payload.email,
    password: payload.password,
  });

  // ✅ تخزين صحيح
  localStorage.setItem("token", loginRes.token);
  localStorage.setItem("userType", "craftsman");

  return loginRes;
};
