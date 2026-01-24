
export interface ServiceRequestPayload {
    id : number;
    name: string;
    email: string;
    phone: string;
    province: string;
    address: string;
    date: string;
    time: string;

    service_type: string;
    service_name: string; 

    industrial_type: string;
    industrial_name: string;
    
    status : string;
    price?: string;
}