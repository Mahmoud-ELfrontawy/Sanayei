import React from "react";
import { FaUserEdit } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
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


      <div className="craftsman-img-wrapper">
        <img
          src={craftsman.avatarUrl || defaultAvatar}
          alt={craftsman.name}
          className="craftsman-img"
        />
      </div>

      <h2 className="craftsman-name">{craftsman.name}</h2>
      <p className="craftsman-job">
        {craftsman.jobTitle}
        {craftsman.governorate && (
          <span style={{ fontSize: "0.9rem", color: "#777", marginRight: "5px" }}>
            ({craftsman.governorate})
          </span>
        )}
      </p>

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
                industrial_type: craftsman.id?.toString(),
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
          <div style={{ marginTop: '10px', width: "100%" }}>
            <Button
              to="/craftsman/profile/edit"
              variant="outline"
              className="w-100 btn-sm"
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
                <FaUserEdit size={18} />
                تعديل بياناتي
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
