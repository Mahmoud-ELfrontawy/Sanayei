import axios from "axios";

export interface RegisterWorkerPayload {
  name: string;
  email: string;
  phone: string;
  service_id: number; // ✅ بدلنا profession بـ service_id
  city: string;
  front_identity_photo: File;
  back_identity_photo: File;
  password: string;
  password_confirmation: string;
}

interface RegisterWorkerResponse {
  status: boolean;
  message: string;
  data?: unknown;
}

export const registerWorker = async (
  payload: RegisterWorkerPayload
): Promise<RegisterWorkerResponse> => {
  const formData = new FormData();

  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("phone", payload.phone);
  formData.append("password", payload.password);
  formData.append("password_confirmation", payload.password_confirmation);
  formData.append("service_id", payload.service_id.toString()); // ✅ إرسال الـ ID
  formData.append("city", payload.city);

  formData.append("front_identity_photo", payload.front_identity_photo);
  formData.append("back_identity_photo", payload.back_identity_photo);

  const response = await axios.post<RegisterWorkerResponse>(
    "https://sanay3i.net/api/v1/craftsmen",
    formData,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  return response.data;
};