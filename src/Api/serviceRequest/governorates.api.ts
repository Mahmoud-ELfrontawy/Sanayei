// صفحه عرض المحافظات

import axios from "axios";

export interface Governorate {
    id: number;
    name: string;
    slug: string;
}

export const getGovernorates = async (): Promise<Governorate[]> => {
    const response = await axios.get(
        "/api/governorates",
        { headers: { Accept: "application/json" } }
    );

    return Array.isArray(response.data.data)
        ? response.data.data
        : [];
};
