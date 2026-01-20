// صفحه عرض اسماء الصنايعيه

import axios from "axios";

export interface Sanaei {
    id: number;
    name: string;
    craft_type: string;
    al_sanaei_Governorate: string;
    al_sanaei_status: string;
}

export const getSanaei = async (): Promise<Sanaei[]> => {
    const response = await axios.get(
        "https://sanay3i.net/api/v1/craftsmen",
        {
            headers: {
                Accept: "application/json",
            },
        }
    );

    return response.data.data;
};

