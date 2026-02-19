import axios from "axios";
import type { Service } from "../constants/service";

export const getServices = async (): Promise<Service[]> => {
    const response = await axios.get(
        "/api/services",
        { headers: { Accept: "application/json" } }
    );

    return Array.isArray(response.data.data)
        ? response.data.data
        : [];
};


