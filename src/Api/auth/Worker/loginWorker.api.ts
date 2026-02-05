import axios from "axios";

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}

export const loginCraftsman = async (data: LoginPayload) => {
  const res = await axios.post(
    "https://sanay3i.net/api/craftsmen/login",
    data,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  // ✅ رجّع data كاملة
  return res.data;
};
