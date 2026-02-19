import axios from "axios";

export interface CompanyLoginPayload {
  company_email: string;
  company_password: string;
}

export const loginCompany = async (data: CompanyLoginPayload) => {
  const res = await axios.post(
    "/api/companies/login",
    data,
    {
      headers: { Accept: "application/json" },
    }
  );

  return res.data;
};
