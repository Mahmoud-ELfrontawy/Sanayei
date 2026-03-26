import axios from "axios";
import { authStorage } from "../context/auth/auth.storage";

const getBaseUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    
    // If it's a relative path or missing, and we are not on localhost, force the absolute backend domain
    if (!envUrl || envUrl.startsWith("/") || envUrl.includes("vercel.app")) {
        return "https://sanay3i.net/api";
    }
    
    return envUrl;
};

const RAW_BASE_URL = getBaseUrl();
export const BASE_URL = RAW_BASE_URL.endsWith("/") ? RAW_BASE_URL : `${RAW_BASE_URL}/`;


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
        const isWalletRecharge = window.location.pathname.includes("/wallet") && 
                                (window.location.search.includes("status=success") || 
                                 document.referrer.includes("paymob") || 
                                 document.referrer.includes("accept.paymob"));

        if ((error.response?.status === 401 || error.response?.status === 403)) {
            // 🔍 DEBUG: Log the full error to see why it's failing
            console.error(' [API Auth Error]:', {
                status: error.response?.status,
                data: error.response?.data,
                url: error.config?.url,
                method: error.config?.method
            });

            // Specific exception: if we are in a wallet recharge flow, don't clear session on the first 401
            if (isWalletRecharge && error.config?.url?.includes("wallet")) {
                console.warn("Transient 401 detected in Wallet Recharge flow. Preventing hard logout.");
                return Promise.reject(error);
            }

            // 🛑 TEMPORARILY DISABLED REDIRECT FOR DEBUGGING
            // console.warn("Auth failure or Blocked account detected. Logging out...");
            // authStorage.clearAuth();
            
            // const currentPath = window.location.pathname;
            // if (!currentPath.includes("/login") && !currentPath.includes("/register")) {
            //     window.location.href = "/login?blocked=true";
            // }
        }
        return Promise.reject(error);
    }
);

export default api;
