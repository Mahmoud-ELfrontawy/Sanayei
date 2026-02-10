import React from "react";
import { FaStar } from "react-icons/fa6";
import type { CraftsmanProfileData } from "../craftsmanData"; // ✅
import defaultAvatar from "../../../assets/images/image5.png";

interface Props {
  craftsman: CraftsmanProfileData;
}

const ProfileCard: React.FC<Props> = ({ craftsman }) => {
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
      <p className="craftsman-job">{craftsman.jobTitle}</p>

      <div className="craftsman-rating">
        {Array.from({ length: 5 }).map((_, i) => (
          <FaStar
            key={i}
            color={i < craftsman.rating ? "#FFC107" : "#e4e5e9"}
          />
        ))}
      </div>
      <p className="craftsman-exp">خبرة {craftsman.experienceYears} سنوات</p>

      <div className="card-actions">
        <button className="btn-primary">طلب خدمة</button>
        <button className="btn-outline">إرسال رسالة</button>
      </div>
    </div>
  );
};

export default ProfileCard;
