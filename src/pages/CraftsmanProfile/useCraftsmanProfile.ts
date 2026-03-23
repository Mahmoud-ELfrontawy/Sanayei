import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getCraftsmanProfile } from "../../Api/auth/Worker/profileWorker.api";
import { getTechnicianById } from "../../Api/technicians.api";
import { getAvatarUrl, getFullImageUrl } from "../../utils/imageUrl";

import { getGovernorates } from "../../Api/serviceRequest/governorates.api";

import {
  type CraftsmanProfileData,
} from "../../types/craftsman"; 

export const useCraftsmanProfile = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [craftsman, setCraftsman] = useState<CraftsmanProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("about");

  const isOwnProfile = location.pathname.includes("/craftsman/profile") && !id;

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        let rawResponse: any;
        let data: any;
        if (isOwnProfile) {
          rawResponse = await getCraftsmanProfile();
          // Profile API usually returns { craftsman: { ... } } or just { ... }
          data = rawResponse?.craftsman ?? rawResponse?.data ?? rawResponse;
        } else if (id) {
          rawResponse = await getTechnicianById(id);
          // Public API might return the object directly via getTechnicianById
          // If rawResponse is already the data object, don't try to go deeper if it has a 'data' property that isn't the wrapper
          if (rawResponse && (rawResponse.id || rawResponse.name)) {
            data = rawResponse;
          } else {
            data = rawResponse?.data ?? rawResponse;
          }
        } else {
          setError("معرف المستخدم غير موجود");
          setLoading(false);
          return;
        }

        if (Array.isArray(data)) {
          data = data.find((item: any) => item.id) || {};
        }

        if (!data || Object.keys(data).length === 0) {
           setError("لم يتم العثور على بيانات المستخدم");
           setLoading(false);
           return;
        }

        // ✅ Check approval status for public profiles
        if (!isOwnProfile) {
          const status = data.status;
          if (status && status !== 'approved') {
            setError("هذا الحساب لم يتم تفعيله بعد من قبل الإدارة");
            setLoading(false);
            return;
          }
        }

        // Mapping API data to UI structure

        // ✅ FIX: If own profile, fetch public profile data to get richer fields
        if (isOwnProfile && data.id) {
          try {
            const publicData = await getTechnicianById(data.id);
            if (publicData) {
               // Merge public data into private data to fill gaps
               data = {
                 ...data,
                 service: publicData.service || data.service,
                 service_name: publicData.service?.name || publicData.service_name || data.service_name,
                 governorate_id: publicData.governorate_id || data.governorate_id,
                 last_reviews: publicData.last_reviews || data.last_reviews,
                 rating: publicData.rating || data.rating,
                 work_photos: publicData.work_photos || data.work_photos,
                 experience_years: publicData.experience_years || data.experience_years,
               };
            }
          } catch (e) {
            console.warn("Failed to merge public profile data", e);
          }
        }

        // ✅ Fetch governorates for mapping
        let govName = "غير محدد";
        try {
          const govs = await getGovernorates();
          if (Array.isArray(govs)) {
            const gov = govs.find(g => g.id.toString() === data.governorate_id?.toString());
            if (gov) govName = gov.name;
          }
        } catch (e) {
          // Fallback
        }

        const avatar = getAvatarUrl(data.profile_photo, data.name);
        // Mapping API data to UI structure
        const mappedData: CraftsmanProfileData = {
          id: data.id || 0,
          name: data.name || "بدون اسم",
          jobTitle: data.service?.name || data.service_name || data.craft_type || "صنايعي محترف",
          serviceId: data.service?.id || data.service_id,
          avatarUrl: avatar,
          coverUrl: avatar, 
          rating: Number(data.rating) || 0,
          experienceYears: Number(data.experience_years) || 0,
          address: data.address || "غير محدد",
          governorate: govName,
          phone: data.phone || "غير متاح",
          about: data.description || "لا يوجد وصف حالياً",
          priceRange: data.price_range,
          workDays: Array.isArray(data.work_days) ? data.work_days : [],
          specialization: data.service?.name ? [data.service.name] : [],
          paymentMethods: ["الدفع النقدي (كاش)"],
          services: data.service?.name ? [data.service.name] : [],
          walletId: data.wallet?.id || data.wallet_id || null,
          reviews: Array.isArray(data.last_reviews) ? data.last_reviews.map((r: any) => {
            const reviewer = r.user || r.company || r.reviewable || r.reviewer || r.client || {};
            const reviewerName = 
                r.user_name || r.company_name || r.userName || 
                r.client_name || r.clientName || reviewer.company_name || 
                reviewer.name || reviewer.full_name || r.name ||
                (r.user_id ? `عميل رقم ${r.user_id}` : "عميل");
            
            const photoPath = 
                r.user_image || r.user_avatar || r.company_logo || 
                r.client_image || reviewer.profile_image_url || 
                reviewer.profile_photo || reviewer.company_logo || 
                reviewer.logo || reviewer.avatar || r.image;

            return {
              id: r.id,
              clientName: reviewerName,
              clientImage: getAvatarUrl(photoPath, reviewerName),
              rating: Number(r.rating) || 0,
              comment: r.comment || "",
              date: typeof r.created_at === 'string' ? r.created_at.split("T")[0] : ""
            };
          }) : [],
          portfolio: Array.isArray(data.work_photos) 
            ? data.work_photos
                .map((p: any) => typeof p === 'string' ? p : p?.photo_path || p?.path || p?.image_url || p?.imageUrl || "")
                .filter((path: string) => !!path && path !== "")
                .map((path: string, index: number) => ({
                    id: index,
                    title: `عمل رقم ${index + 1}`,
                    imageUrl: getFullImageUrl(path)
                })) 
            : []
        };

        setCraftsman(mappedData);
      } catch (err) {
        console.error("Craftsman Profile Fetch Error:", err);
        setError("حدث خطأ أثناء تحميل البيانات");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, isOwnProfile]);

  return {
    craftsman,
    loading,
    error,
    activeTab,
    setActiveTab,
    isOwnProfile
  };
};
