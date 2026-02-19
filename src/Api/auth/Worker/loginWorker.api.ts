import axios from "axios";

export interface LoginPayload {
  login: string;
  password: string;
}

export const loginCraftsman = async (data: LoginPayload) => {
  const res = await axios.post(
    "/api/craftsmen/login",
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
