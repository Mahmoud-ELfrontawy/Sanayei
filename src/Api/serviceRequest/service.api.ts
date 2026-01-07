import axios from "axios";

export interface Service {
    id: number;
    name: string;
    description: string;
    slug: string;
    icon: string;
}

export const getServices = async (): Promise<Service[]> => {
    const response = await axios.get(
        "https://sanay3i.net/api/services",
        { headers: { Accept: "application/json" } }
    );

    return Array.isArray(response.data.data)
        ? response.data.data
        : [];
};
