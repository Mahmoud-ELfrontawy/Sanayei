import React from "react";
import { FaStar } from "react-icons/fa6";
import { Link } from "react-router-dom";
import type { CraftsmanProfileData } from "../../../types/craftsman";
import defaultAvatar from "../../../assets/images/image5.png";
import Button from "../../../components/ui/Button/Button";

interface Props {
  craftsman: CraftsmanProfileData;
  isOwnProfile?: boolean;
}

const ProfileCard: React.FC<Props> = ({ craftsman, isOwnProfile }) => {
  return (
    <div className="craftsman-card">
      {isOwnProfile && (
        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
          <Link
            to="/craftsman/profile/edit"
            style={{
              color: "#5FA8D3",
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: "1.1rem",
            }}
          >
            تعديل بيانات الملف الشخصي
          </Link>
        </div>
      )}

      <div className="craftsman-img-wrapper">
        <img
          src={craftsman.avatarUrl || defaultAvatar}
          alt={craftsman.name}
          className="craftsman-img"
        />
      </div>

      <h2 className="craftsman-name">{craftsman.name}</h2>
      <p className="craftsman-job">{craftsman.jobTitle}</p>

      <div className="craftsman-rating">
        {Array.from({ length: 5 }).map((_, i) => (
          <FaStar
            key={i}
            color={i < craftsman.rating ? "#FF8031" : "#e4e5e9"}
          />
        ))}
      </div>
      <p className="craftsman-exp">خبرة {craftsman.experienceYears} سنوات</p>

      <div className="card-actions">
        {!isOwnProfile ? (
          <>
            <Button
              to="/request-service"
              variant="primary"
              state={{
                industrial_type: craftsman.id.toString(),
                industrial_name: craftsman.name,
                // Assuming service info is available or handled by the form
                service_type: craftsman.jobTitle,
                price: craftsman.priceRange,
              }}
            >
              طلب خدمة
            </Button>
            <Button
              to="/dashboard/messages"
              variant="outline"
              state={{
                contact: {
                  id: craftsman.id,
                  name: craftsman.name,
                  avatar: craftsman.avatarUrl,
                  type: "craftsman",
                },
              }}
            >
              إرسال رسالة
            </Button>
          </>
        ) : (
          <div
            className="own-profile-badge"
            style={{ color: "#777", fontSize: "0.9rem" }}
          >
            ملفك الشخصي
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
