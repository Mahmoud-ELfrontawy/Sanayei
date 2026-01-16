import axios from "axios";

export interface LoginPayload {
  email: string;
  password: string;
  userType: string; 
}

export const login = async (payload: LoginPayload) => {
  const response = await axios.post(
    "https://sanay3i.net/api/auth/login",
    {
      email: payload.email,
      password: payload.password,
      user_type: payload.userType, 
    },
    {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};
