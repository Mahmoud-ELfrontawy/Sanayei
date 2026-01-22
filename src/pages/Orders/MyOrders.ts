// pages/Orders/types.ts

export interface ServiceRequest {
    id: number;
    service_type: string;
    industrial_type: string;
    province: string;
    address: string;
    date: string;
    time: string;
    phone: string;
    status: "pending" | "approved" | "rejected";
}
