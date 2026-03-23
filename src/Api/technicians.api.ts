import api from "./api";
import type { Technician } from "../constants/technician";

export const getTechnicians = async (serviceId?: number, filter?: string): Promise<Technician[]> => {
  const params: Record<string, any> = {};
  if (serviceId !== undefined) params.service_id = serviceId;
  if (filter) params.filter = filter;

  const res = await api.get("/craftsmen", { params });

  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.data)) return res.data.data;
  return [];
};



export const getTechnicianById = async (id: string | number): Promise<any> => {
    const res = await api.get(`/craftsmen/${id}`);
    return res.data?.data || res.data;
};

export const updateCraftsmanLocation = async (lat: number, lng: number): Promise<any> => {
    const res = await api.post("/craftsmen/update-location", {
        latitude: lat,
        longitude: lng
    });
    return res.data;
};

export const getNearestTechnicians = async (lat: number, lng: number, serviceId: number): Promise<Technician[]> => {
    const res = await api.get("/craftsmen/nearest", {
        params: {
            latitude: lat,
            longitude: lng,
            service_id: serviceId
        }
    });
    return res.data?.data || res.data || [];
};
