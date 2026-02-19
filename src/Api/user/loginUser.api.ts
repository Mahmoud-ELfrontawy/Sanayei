import axios from "axios";

export interface LoginPayload {
  email: string;
  password: string;
}

export const loginUser = async (data: LoginPayload) => {
  const res = await axios.post(
    "/api/auth/login",
    data,
    {
      headers: { Accept: "application/json" },
    }
  );

  return res.data;
};
