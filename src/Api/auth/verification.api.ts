import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const verifyEmail = async (id: string, hash: string, query: string) => {
    // We send the request exactly as received (including signature and expires)
    const response = await axios.get(`${API_URL}/email/verify/${id}/${hash}${query}`, {
        withCredentials: true,
        headers: {
            'Accept': 'application/json',
        }
    });
    return response.data;
};
