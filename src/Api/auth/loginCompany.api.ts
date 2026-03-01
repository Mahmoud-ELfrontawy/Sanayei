import api from "../api";

export interface CompanyLoginPayload {
  company_email: string;
  company_password: string;
}

export const loginCompany = async (data: CompanyLoginPayload) => {
  const res = await api.post(
    "companies/login",
    data,
    {
      headers: { Accept: "application/json" },
    }
  );

  return res.data;
};
