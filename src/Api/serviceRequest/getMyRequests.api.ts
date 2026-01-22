import axios from "axios";

export const getMyServiceRequests = async () => {
    const token = localStorage.getItem("token");

    const res = await axios.get("https://sanay3i.net/api/service-requests", {
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
        },
    });

    return res.data;
};
