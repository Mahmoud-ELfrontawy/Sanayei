import axios from "axios";
import { getAuthHeader } from "./adminServices.api";

const BASE_URL = "/api";

export interface CompanyData {
    id: number;
    company_name: string;
    company_email: string;
    company_phone_number?: string;
    company_whatsapp_number?: string;
    company_city?: string;
    company_specific_address?: string;
    company_category?: string;
    company_simple_hint?: string;
    tax_card?: string;
    commercial_register?: string;
    status: 'approved' | 'pending' | 'rejected';
    company_logo?: string;
    created_at: string;
}

export const adminCompaniesApi = {
    getAllCompanies: async (page = 1, search = "", status = "") => {
        const params = new URLSearchParams();
        params.append("page", String(page));
        if (search) params.append("search", search);
        if (status) params.append("status", status);
        
        return axios.get(`${BASE_URL}/admin/companies?${params.toString()}`, {
            headers: getAuthHeader(),
        });
    },

    getCompanyDetails: async (id: number) => {
        return axios.get(`${BASE_URL}/admin/companies/${id}`, {
            headers: getAuthHeader(),
        });
    },

    toggleApproval: async (id: number) => {
        return axios.post(`${BASE_URL}/admin/companies/${id}/toggle-approval`, {}, {
            headers: getAuthHeader(),
        });
    },

    toggleBlockCompany: async (id: number) => {
        return axios.post(`${BASE_URL}/admin/companies/${id}/toggle-block`, {}, {
            headers: getAuthHeader(),
        });
    },

    deleteCompany: async (id: number) => {
        return axios.delete(`${BASE_URL}/admin/companies/${id}`, {
            headers: getAuthHeader(),
        });
    },
};
