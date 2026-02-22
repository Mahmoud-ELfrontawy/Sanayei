import axios from "axios";
import { authStorage } from "../../../context/auth/auth.storage";

const BASE_URL = "/api";

export interface CompanyProfile {
  id: number;
  company_name: string;
  company_email: string;
  company_phone_number: string;
  company_whatsapp_number: string;
  company_city: string;
  company_specific_address: string;
  company_simple_hint: string;
  company_category: string;
  company_logo?: string;
  tax_card?: string;
  commercial_register?: string;
  created_at?: string;
}

export const getCompanyProfile = async () => {
    const token = authStorage.getToken();
    const res = await axios.get(`${BASE_URL}/company/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });
    return res.data;
};

export const updateCompanyProfile = async (data: any) => {
    const token = authStorage.getToken();
    const formData = new FormData();

    // Workaround for Laravel PUT with multipart/form-data
    formData.append("_method", "PUT");

    Object.entries(data).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;

        if (["company_logo", "tax_card", "commercial_register"].includes(key)) {
            if (value instanceof FileList && value.length > 0) {
                formData.append(key, value[0]);
            } else if (value instanceof File) {
                formData.append(key, value);
            }
        } else {
            formData.append(key, String(value));
        }
    });

    const res = await axios.post(`${BASE_URL}/company/update`, formData, {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
        },
    });

    return res.data;
};
