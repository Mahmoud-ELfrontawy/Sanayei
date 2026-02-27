import axios from "axios";
import { authStorage } from "../context/auth/auth.storage";

const BASE_URL = "/api";

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
