import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  type CraftsmanProfileData,
  mockCraftsmanData,
} from "./craftsmanData"; // ✅ الاستيراد من ملف الموك الجديد

export const useCraftsmanProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [craftsman, setCraftsman] = useState<CraftsmanProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    // محاكاة طلب للسيرفر
    const fetchProfile = () => {
      setLoading(true);
      setTimeout(() => {
        try {
          // هنا بنرجع الداتا الوهمية مباشرة
          // ممكن تعمل شرط على الـ id لو عايز تغير الداتا حسب الرقم
          if (id) {
            setCraftsman(mockCraftsmanData);
          } else {
            setError("معرف المستخدم غير موجود");
          }
        } catch (err) {
          console.error(err);
          setError("حدث خطأ أثناء تحميل البيانات");
        } finally {
          setLoading(false);
        }
      }, 500); // تأخير نصف ثانية لإظهار اللودر
    };

    fetchProfile();
  }, [id]);

  return {
    craftsman,
    loading,
    error,
    activeTab,
    setActiveTab,
  };
};
