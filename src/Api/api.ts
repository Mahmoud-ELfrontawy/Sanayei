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

// Response Interceptor: Handle 401/403 globally (Auth failures / Blocked accounts)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn("Auth failure or Blocked account detected. Logging out...");
            
            // 🛑 Hard Logout
            authStorage.clearAuth();
            
            // Redirect only if not already on login/register page to avoid loops
            const currentPath = window.location.pathname;
            if (!currentPath.includes("/login") && !currentPath.includes("/register")) {
                window.location.href = "/login?blocked=true";
            }
        }
        return Promise.reject(error);
    }
);

export default api;
