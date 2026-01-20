// Api/technicians/technicians.api.ts

import axios from "axios";
import type { Technician } from "../constants/technician";

export const getTechnicians = async (): Promise<Technician[]> => {
  const res = await axios.get("https://sanay3i.net/api/v1/craftsmen");
  return res.data.data;
};
