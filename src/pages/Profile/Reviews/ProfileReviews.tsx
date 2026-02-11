import React, { useEffect, useState } from "react";
import { getUserReviews, type UserReview } from "../../../Api/reviews.api";
import { FaStar } from "react-icons/fa";
import { getAvatarUrl } from "../../../utils/imageUrl";
import { toast } from "react-toastify";
import "./ProfileReviews.css";

const ProfileReviews: React.FC = () => {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await getUserReviews();
        console.log("✅ Reviews fetched successfully:", data);
        setReviews(data);
      } catch (err: any) {
        console.error("❌ Error fetching reviews:", err);
        const errorMsg = err.message || "فشل في جلب التقييمات";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="profile-reviews-container">
        <h2>المراجعات</h2>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>جاري تحميل التقييمات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-reviews-container">
        <h2>المراجعات</h2>
        <div className="error-state">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="profile-reviews-container">
        <h2>المراجعات</h2>
        <div className="empty-state">
          <FaStar size={48} color="#ddd" />
          <p>لم تكتب أي تقييمات بعد</p>
          <span>عندما تقوم بتقييم صنايعي، ستظهر تقييماتك هنا</span>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-reviews-container">
      <h2>المراجعات</h2>
      <p className="reviews-subtitle">التقييمات التي كتبتها للصناعيين</p>

      <div className="reviews-grid">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <img
                src={getAvatarUrl(review.craftsman?.profile_photo, review.craftsman?.name)}
                alt={review.craftsman?.name || "صنايعي"}
                className="craftsman-avatar"
                onError={(e) => {
                  e.currentTarget.src = getAvatarUrl(null, review.craftsman?.name);
                }}
              />
              <div className="craftsman-info">
                <h3>{review.craftsman?.name || "غير محدد"}</h3>
                <div className="rating-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar
                      key={i}
                      size={16}
                      color={i < review.rating ? "#FF8031" : "#ddd"}
                    />
                  ))}
                </div>
                <div className="review-date">
                  {new Date(review.created_at).toLocaleDateString("ar-EG", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>

            {review.comment && (
              <div className="review-comment">
                <p>{review.comment}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileReviews;