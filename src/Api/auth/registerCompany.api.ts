import axios from "axios";

export interface StoreRegisterPayload {
  company_name: string;
  company_password: string;
  ensure_password: string;
  company_email: string;
  company_phone_number: string;
  company_whatsapp_number: string;
  company_city: string; // Governorate
  company_specific_address: string; // Detailed address
  company_category: string; // Product classification
  company_simple_hint: string; // About store
  company_logo?: FileList | File | null;
  tax_card?: FileList | File | null;
  commercial_register?: FileList | File | null;
}

export const registerCompany = async (data: StoreRegisterPayload) => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      if (["company_logo", "tax_card", "commercial_register"].includes(key)) {
        if (value instanceof FileList && value.length > 0) {
          formData.append(key, value[0]);
        } else if (value instanceof File) {
          formData.append(key, value);
        }
      } else {
        formData.append(key, String(value));
      }
    }
  });

  const res = await axios.post(
    "/api/companies/register",
    formData,
    {
      headers: { 
        Accept: "application/json" 
      },
    }
  );

  return res.data;
};
