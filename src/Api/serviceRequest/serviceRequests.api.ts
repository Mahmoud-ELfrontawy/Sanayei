import axios from "axios";
import type { ServiceRequestPayload } from "../../constants/serviceRequest";

export const createServiceRequest = async (
  payload: ServiceRequestPayload
) => {
  const token = localStorage.getItem("token");

  const response = await axios.post(
    "https://sanay3i.net/api/service-requests",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};
