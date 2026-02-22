import axios from "axios";
import { authStorage } from "../../context/auth/auth.storage";

export const getMyServiceRequests = async () => {
    const token = authStorage.getToken();

    try {
        const res = await axios.get("/api/user/service-requests", {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
            },
        });

        return res.data;
    } catch (error: any) {
        // Handle specific error codes
        if (error.response) {
            const status = error.response.status;
            const message = error.response.data?.message || error.response.statusText;
            
            if (status === 500) {
                throw {
                    message: "حدث خطأ في السيرفر. يرجى المحاولة لاحقاً أو التواصل مع الدعم الفني.",
                    status: 500,
                    errors: error.response.data?.errors || {}
                };
            }
            
            if (status === 401) {
                throw {
                    message: "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.",
                    status: 401
                };
            }
            
            throw {
                message: message || "حدث خطأ أثناء جلب الطلبات",
                status: status,
                errors: error.response.data?.errors || {}
            };
        }
        
        // Network error
        throw {
            message: "تعذر الاتصال بالسيرفر. تحقق من اتصالك بالإنترنت.",
            status: 0
        };
    }
};
