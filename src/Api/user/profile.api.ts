import axios from "axios";

const API_BASE_URL = "https://sanay3i.net/api";

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

export const updateProfile = async (data: Record<string, unknown>) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined)
      formData.append(key, value as string | Blob);
  });

  const res = await axios.post(
    `${API_BASE_URL}/user/update-profile`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return res.data;
};
