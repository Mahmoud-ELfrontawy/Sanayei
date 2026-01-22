import { useEffect, useState } from "react";
import { getMyServiceRequests } from "../Api/serviceRequest/getMyRequests.api";

export interface ServiceRequest {
    id: number;
    service_type: string;
    province: string;
    address: string;
    date: string;
    time: string;
    status: "pending" | "accepted" | "rejected";
}

export const useMyServiceRequests = () => {
    const [requests, setRequests] = useState<ServiceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await getMyServiceRequests();

            // ✅ أغلب الوقت البيانات جوه data
            setRequests(res.data ?? res);
        } catch (e) {
            console.error("فشل تحميل الطلبات", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    return {
        requests,
        loading,
    };
};
