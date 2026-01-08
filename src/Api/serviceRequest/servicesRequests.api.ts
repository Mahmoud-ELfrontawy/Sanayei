import axios from "axios";
import type { ServiceRequestPayload } from "../../constants/serviceRequest";

/* =========================
    جلب أنواع الخدمات (GET)
========================= */
export interface ServiceType {
    id: number | string;
    name: string;
}

export const getServiceTypes = async () => {
    const response = await axios.get("https://sanay3i.net/api/service-requests", {
        headers: {
            Accept: "application/json",
        },
    });

    return response.data.data;
};

/* =========================
    إرسال طلب خدمة (POST)
========================= */
export const createServiceRequest = async (payload: ServiceRequestPayload) => {
    const response = await axios.post(
        "https://sanay3i.net/api/service-requests",
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
