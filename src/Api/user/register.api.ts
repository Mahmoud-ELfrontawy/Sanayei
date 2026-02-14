export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

export const register = async (payload: RegisterPayload) => {
  const response = await fetch(
    "https://sanay3i.net/api/auth/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw data; // نرجّع الخطأ كامل
  }

  return data; // غالبًا بيرجع token + user
};
