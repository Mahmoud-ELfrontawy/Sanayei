import api from "../api";

export interface LoginPayload {
  email: string;
  password: string;
}

export const loginUser = async (data: LoginPayload) => {
  const res = await api.post(
    "auth/login",
    data,
    {
      headers: { Accept: "application/json" },
    }
  );

  return res.data;
};
