import axios from "axios";

export interface Sanaei {
    id: number;
    name: string;
    phone: string;
    email: string;

    craft_type: string | null;
    experience_years?: string;

    description?: string;
    village?: string;
    address?: string;

    price?: number;
    price_range?: string;

    status: string;
    rating?: string;
    reviews_count?: string;

    service_id: number | string;

    service?: {
        id: number;
        name: string;
    };

    governorate?: {
        id: number;
        name: string;
    };
}

export const getSanaei = async (): Promise<Sanaei[]> => {
    const response = await axios.get(
        "https://sanay3i.net/api/craftsmen",
        {
            headers: {
                Accept: "application/json",
            },
        }
    );

    if (Array.isArray(response.data)) {
        return response.data;
    } 
    
    if (Array.isArray(response.data?.data)) {
        return response.data.data;
    }

    return [];
};
