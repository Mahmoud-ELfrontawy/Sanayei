import axios from "axios";
import type { Service } from "../constants/service";

export const getServices = async (): Promise<Service[]> => {
    const res = await axios.get("https://sanay3i.net/api/services");
    return res.data.data;
};
