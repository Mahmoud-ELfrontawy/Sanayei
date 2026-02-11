import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getCraftsmanProfile } from "../../Api/auth/Worker/profileWorker.api";
import { getTechnicianById } from "../../Api/technicians.api";
import { getAvatarUrl, getFullImageUrl } from "../../utils/imageUrl";

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
        let data: any;
        if (isOwnProfile) {
          const res = await getCraftsmanProfile();
          data = res.data ?? res;
          if (Array.isArray(data)) {
            data = data.find((item: any) => item.id) || {};
          }
        } else if (id) {
          data = await getTechnicianById(id);
        } else {
          setError("معرف المستخدم غير موجود");
          setLoading(false);
          return;
        }

        // 🔍 DEBUG: Log the raw data to see what we're getting
        console.log("🔍 Raw API Response:", data);
        console.log("🔍 Reviews in response:", data.last_reviews);

        // ✅ FIX: If reviews are missing in "me" endpoint, fetch them from public profile
        if (isOwnProfile && data.id && (!data.last_reviews || data.last_reviews.length === 0)) {
          try {
            console.log("🔄 Attempting to fetch reviews from public profile...");
            const publicProfile = await getTechnicianById(data.id);
            if (publicProfile?.last_reviews?.length > 0) {
              console.log("✅ Fetched reviews from public profile fallback");
              data.last_reviews = publicProfile.last_reviews;
            }
          } catch (e) {
            console.warn("⚠️ Failed to fetch public profile fallback", e);
          }
        }

        const avatar = getAvatarUrl(data.profile_photo, data.name);
        // Mapping API data to UI structure
        const mappedData: CraftsmanProfileData = {
          id: data.id,
          name: data.name || "بدون اسم",
          jobTitle: data.service?.name || data.craft_type || "صنايعي",
          avatarUrl: avatar,
          coverUrl: avatar, // Using the same image as requested
          rating: Number(data.rating) || 0,
          experienceYears: Number(data.experience_years) || 0,
          address: data.address || "غير محدد",
          phone: data.phone || "غير متاح",
          about: data.description || "لا يوجد وصف حالياً",
          priceRange: data.price_range,
          workDays: data.work_days,
          specialization: data.service?.name ? [data.service.name] : [],
          paymentMethods: ["الدفع النقدي (كاش)"],
          services: data.service?.name ? [data.service.name] : [],
          reviews: data.last_reviews?.map((r: any) => ({
            id: r.id,
            clientName: r.user?.name || "عميل",
            rating: r.rating,
            comment: r.comment,
            date: r.created_at?.split("T")[0]
          })) || [],
          portfolio: data.work_photos?.map((p: any, index: number) => ({
            id: index,
            title: `عمل رقم ${index + 1}`,
            imageUrl: getFullImageUrl(p)
          })) || []
        };

        console.log("🔍 Mapped reviews:", mappedData.reviews);
        setCraftsman(mappedData);
      } catch (err) {
        console.error(err);
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
