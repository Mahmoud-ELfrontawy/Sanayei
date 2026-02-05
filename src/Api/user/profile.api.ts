// import axios from "axios";

// const API_BASE_URL = "https://sanay3i.net/api";

// /* ================= Get Profile ================= */
// export const getMyProfile = async () => {
//   const token = localStorage.getItem("token");

//   const res = await axios.get(`${API_BASE_URL}/user/me`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//       Accept: "application/json",
//     },
//   });

//   return res.data;
// };

// /* ================= Update Profile ================= */
// export const updateProfile = async (data: {
//   name: string;
//   phone: string;
//   birth_date?: string;
//   gender?: "male" | "female";
//   latitude?: number;
//   longitude?: number;
//   profile_image?: File | null;
// }) => {
//   const token = localStorage.getItem("token");
//   const formData = new FormData();

//   // 👈 Laravel يحتاجها
//   formData.append("_method", "PUT");

//   Object.entries(data).forEach(([key, value]) => {
//     if (value === undefined || value === null || value === "") return;

//     if (value instanceof File) {
//       formData.append(key, value);
//     } else {
//       formData.append(key, String(value));
//     }
//   });

//   const res = await axios.post(
//     `${API_BASE_URL}/user/profile`,
//     formData,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Accept: "application/json",
//       },
//     }
//   );

//   return res.data;
// };


// /* ================= Delete Account ================= */
// export const deleteUserAccount = async () => {
//   const token = localStorage.getItem("token");

//   const res = await axios.delete(
//     `${API_BASE_URL}/user/delete-account`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//         Accept: "application/json",
//       },
//     }
//   );

//   return res.data;
// };










import axios from "axios";

const API_BASE_URL = "https://sanay3i.net/api";

/* ================= Helpers ================= */
/* ================= Helpers ================= */
// Input: YYYY-MM-DD (from HTML date input)
// Output: DD/MM/YYYY (for Backend)
const formatDateToDDMMYYYY = (date?: string) => {
  if (!date) return undefined;

  const parts = date.split("-");
  if (parts.length !== 3) return undefined;

  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

/* ================= Interfaces ================= */
export interface UserProfile {
    id: number;
    name: string;
    email: string;
    phone: string;
    birth_date?: string | null;  // comes as DD/MM/YYYY from backend
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
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API_BASE_URL}/user/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

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
  const token = localStorage.getItem("token");
  const formData = new FormData();

  // 👈 Laravel workaround
  formData.append("_method", "PUT");

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;

    // 🟢 تحويل التاريخ قبل الإرسال
    if (key === "birth_date" && typeof value === "string") {
      const formattedDate = formatDateToDDMMYYYY(value);
      if (formattedDate) {
        formData.append("birth_date", formattedDate);
      }
      return;
    }

    if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  const res = await axios.post(
    `${API_BASE_URL}/user/profile`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        // ❌ متحطش Content-Type يدوي
      },
    }
  );

  return res.data;
};

/* ================= Delete Account ================= */
export const deleteUserAccount = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.delete(
    `${API_BASE_URL}/user/delete-account`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  return res.data;
}