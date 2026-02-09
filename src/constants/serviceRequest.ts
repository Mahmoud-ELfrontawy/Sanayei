
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
    service_name?: string; 

    craftsman_id?: string | number;
    industrial_type?: string;
    industrial_name?: string;
    
    status : string;
    price?: string;
    user_id?: number | string;
    // Relation objects (from 'with' in Laravel)
    craftsman?: {
        id: number;
        name: string;
        phone: string;
    };
    service?: {
        id: number;
        name: string;
    };
}