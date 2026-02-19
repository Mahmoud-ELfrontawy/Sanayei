import axios from "axios";
import type { ContactPayload } from "../constants/contact";

export const sendContactMessage = async (data: ContactPayload) => {
    const res = await axios.post("/api/contact", data, {
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
    });

    return res.data;
};
