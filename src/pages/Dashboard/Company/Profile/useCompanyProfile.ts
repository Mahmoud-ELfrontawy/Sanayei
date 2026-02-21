import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { getCompanyProfile, updateCompanyProfile } from "../../../../Api/auth/Company/profileCompany.api";

export const useCompanyProfile = () => {
    const [loading, setLoading] = useState(true);
    const form = useForm();
    const { reset } = form;

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const res = await getCompanyProfile();
            if (res.success && res.data) {
                reset(res.data);
            }
        } catch (error: any) {
            console.error("Error fetching company profile:", error);
            toast.error("حدث خطأ أثناء جلب بيانات المتجر");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (data: any) => {
        try {
            const res = await updateCompanyProfile(data);
            if (res.success) {
                toast.info("جاري مراجعة البيانات وسيتم الموافقة عليها ⏳");
                fetchProfileData(); // Reload
            } else {
                toast.error(res.message || "فشل تحديث البيانات");
            }
        } catch (error: any) {
            console.error("Error updating company profile:", error);
            const msg = error.response?.data?.message || "حدث خطأ أثناء التحديث";
            toast.error(msg);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    return {
        ...form,
        loading,
        handleUpdate,
        refresh: fetchProfileData,
    };
};
