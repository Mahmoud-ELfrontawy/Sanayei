import axios from "axios";

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

export const register = async (payload: RegisterPayload) => {
  const response = await axios.post(
    "/api/auth/register",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return response.data;
};
