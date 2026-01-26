// import axios from "axios";

// export interface RegisterWorkerPayload {
//   name: string;
//   email: string;
//   phone: string;
//   password: string;
//   password_confirmation: string;
//   profession: string;
//   city: string;
//   front_identity_photo: File;
//   back_identity_photo: File;
// }

// export const registerWorker = async (payload: RegisterWorkerPayload) => {
//   const formData = new FormData();

//   formData.append("name", payload.name);
//   formData.append("email", payload.email);
//   formData.append("phone", payload.phone);
//   formData.append("password", payload.password);
//   formData.append("password_confirmation", payload.password_confirmation);
//   formData.append("profession", payload.profession);
//   formData.append("city", payload.city);
//   formData.append("front_identity_photo", payload.front_identity_photo);
//   formData.append("back_identity_photo", payload.back_identity_photo);

//   const response = await axios.post(
//     "https://sanay3i.net/api/v1/craftsmen",
//     formData,
//     {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     }
//   );

//   return response.data;
// };
import axios from "axios";

export interface RegisterWorkerPayload {
  name: string;
  email: string;
  phone: string;
  profession: string;
  city: string;
  front_identity_photo: File;
  back_identity_photo: File;
  password: string;
  password_confirmation: string;
}

export const registerWorker = async (payload: RegisterWorkerPayload) => {
  const formData = new FormData();

  // البيانات النصية
  formData.append("name", payload.name);
  formData.append("email", payload.email);
  formData.append("phone", payload.phone);
  formData.append("password", payload.password);
  formData.append("password_confirmation", payload.password_confirmation);
  formData.append("profession", payload.profession);
  formData.append("city", payload.city);

  // ملفات الصور
  formData.append("front_identity_photo", payload.front_identity_photo);
  formData.append("back_identity_photo", payload.back_identity_photo);

  const response = await axios.post(
    "https://sanay3i.net/api/v1/craftsmen",
    formData,
    {
      headers: {
        // ⚠️ مهم جداً: لا تكتب Content-Type: multipart/form-data يدوياً
        // Axios سيقوم بوضعها تلقائياً مع الـ Boundary الصحيح
        Accept: "application/json",
      },
    }
  );

  return response.data;
};