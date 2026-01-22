
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
}


// export interface ServiceRequestPayload {
//     id: number;
//     service_type: string;   // slug
//     service_name: string;   // العربي
//     province: string;
//     address: string;
//     date: string;
//     time: string;
//     phone: string;
//     status: string;
// }