import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getCraftsmanProfile } from "../../Api/auth/Worker/profileWorker.api";
import { getTechnicianById, getTechnicians } from "../../Api/technicians.api";
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

        // ✅ IMPORTANT: Public Detail API (/craftsmen/{id}) doesn't return price_range/work_days
        // But the List API (/craftsmen) does. We fetch them if missing.
        if (id && !isOwnProfile && (!data.price_range || !data.work_days)) {
          try {
             const allTechs = await getTechnicians(data.service_id || data.service?.id);
             const matched = allTechs.find((t: any) => String(t.id) === String(id));
             if (matched) {
                data = { ...data, ...matched };
             }
          } catch (e) {
             console.warn("Failed to enrichment craftsman data from list", e);
          }
        }

        // ✅ FIX: If own profile, fetch public profile data to get richer fields
        if (isOwnProfile && data.id) {
          try {
            const publicData = await getTechnicianById(data.id);
            if (publicData) {
               // Merge public data into private data to fill gaps
               data = {
                 ...data,
                 ...publicData,
                 rating: publicData.rating || data.rating,
                 work_photos: publicData.work_photos || data.work_photos,
                 experience_years: publicData.experience_years || data.experience_years,
                 price_range: publicData.price_range || data.price_range,
                 work_days: publicData.work_days || data.work_days,
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
          about: data.description || data.about || data.bio || "لا يوجد وصف حالياً",
          priceRange: data.price_range || data.priceRange || data.rate || data.price || "حسب الاتفاق",
          workDays: (() => {
            const days = data.work_days || data.workDays || data.working_days || data.workingDays || data.schedule;
            if (Array.isArray(days)) return days;
            if (typeof days === 'string' && days) {
              try {
                const parsed = JSON.parse(days);
                return Array.isArray(parsed) ? parsed : [];
              } catch (e) {
                return days.includes(',') ? days.split(',').map(d => d.trim()) : (days ? [days] : []);
              }
            }
            return [];
          })(),
          specialization: data.service?.name ? [data.service.name] : [],
          paymentMethods: ["الدفع النقدي (كاش)"],
          services: data.service?.name ? [data.service.name] : [],
          walletId: data.wallet?.id || data.wallet_id || null,
          reviews: Array.isArray(data.last_reviews) ? data.last_reviews.map((r: any) => {
            const reviewer = r.company || r.user || r.reviewable || r.reviewer || r.client || {};
            
            // ✅ Prioritize Company Name then User Name
            const reviewerName = 
                r.company_name || reviewer.company_name || 
                r.user_name || r.userName || reviewer.name || 
                r.client_name || r.clientName || reviewer.full_name || 
                r.name || (r.company_id ? "شركة شريكة" : (r.user_id ? `عميل رقم ${r.user_id}` : "عميل"));
            
            // ✅ Prioritize Company Logo then User Image
            const photoPath = 
                r.company_logo || reviewer.company_logo || 
                r.user_image || r.user_avatar || reviewer.avatar || 
                r.client_image || reviewer.profile_image_url || 
                reviewer.profile_photo || reviewer.logo || r.image;

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
