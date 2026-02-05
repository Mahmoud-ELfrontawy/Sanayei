import axios from "axios";
import type { Technician } from "../constants/technician";

export const getTechnicians = async (): Promise<Technician[]> => {
  const res = await axios.get(
    "https://sanay3i.net/api/craftsmen"
  );

  // ✅ حماية كاملة من undefined
  if (Array.isArray(res.data)) {
    return res.data;
  }

  if (Array.isArray(res.data?.data)) {
    return res.data.data;
  }

  return [];
};
