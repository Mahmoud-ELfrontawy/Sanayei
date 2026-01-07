import axios from "axios";

export interface Sanaei {
    id: number;
    al_sanaei_name: string;
    al_sanaei_sanaeaa_type: string;
    al_sanaei_Governorate: string;
    al_sanaei_status: string;
}

export const getSanaei = async (): Promise<Sanaei[]> => {
    const response = await axios.get(
        "https://sanay3i.net/api/get_sanaei",
        { headers: { Accept: "application/json" } }
    );

    // 👈 الداتا Array مباشرة
    return Array.isArray(response.data)
        ? response.data
        : [];
};
