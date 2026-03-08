import api from "../api";
import { toApiDate } from "../../utils/dateApiHelper";

/* ================= Interfaces ================= */
export interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone: string;
    birth_date?: string | null;  
    gender?: "male" | "female";
    latitude?: number;
    longitude?: number;
    profile_image?: string;
    profile_image_url?: string;
}

export interface ProfileResponse {
    status: boolean;
    message: string;
    data: UserProfile;
}

/* ================= Get Profile ================= */
export const getMyProfile = async () => {
  const res = await api.get(`/user/me`);
  return res.data;
};

/* ================= Update Profile ================= */
export const updateProfile = async (data: {
  name: string;
  phone: string;
  birth_date?: string; // YYYY-MM-DD من الـ UI
  gender?: "male" | "female";
  latitude?: number;
  longitude?: number;
  profile_image?: File | null;
}) => {
  const formData = new FormData();

  // 👈 Laravel workaround
  formData.append("_method", "PUT");

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    // 🟢 تحويل التاريخ قبل الإرسال للسيرفر
    if (key === "birth_date") {
        const formatted = toApiDate(String(value));
        if (formatted) formData.append("birth_date", formatted);
        return;
    }

    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  const res = await api.post(
    `/user/profile`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return res.data;
};

/* ================= Get User Profile by ID (Public) ================= */
export const getUserProfileById = async (id: string | number) => {
  const res = await api.get(`/auth/user/${id}`);
  return res.data;
};

/* ================= Delete Account ================= */
export const deleteUserAccount = async () => {
  const res = await api.delete(`/user/delete-account`);
  return res.data;
}
