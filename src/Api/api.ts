import axios from "axios";
import { authStorage } from "../context/auth/auth.storage";

const RAW_BASE_URL = import.meta.env.VITE_API_URL || "https://sanay3i.net/api";
export const BASE_URL = RAW_BASE_URL.endsWith("/") ? RAW_BASE_URL : `${RAW_BASE_URL}/`;

console.log("🌐 API Base URL:", BASE_URL);

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
    },
});

// Request Interceptor: Attach token automatically
api.interceptors.request.use(
    (config) => {
        const token = authStorage.getToken();
        
        // Final protection against "null"/"undefined" strings
        if (token && token !== "null" && token !== "undefined") {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized request detected. Authentication may be stale.");
            // We could trigger a global logout here, but let's keep it safe for now
        }
        return Promise.reject(error);
    }
);

export default api;
