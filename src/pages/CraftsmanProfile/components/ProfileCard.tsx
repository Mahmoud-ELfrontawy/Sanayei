import React from "react";
import { FaUserEdit, FaWallet } from "react-icons/fa";
import { FaStar } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../hooks/useAuth";
import type { CraftsmanProfileData } from "../../../types/craftsman";
import { getAvatarUrl } from "../../../utils/imageUrl";
import Button from "../../../components/ui/Button/Button";
import PointsBadge from "../../Community/PointsBadge";

interface Props {
  craftsman: CraftsmanProfileData;
  isOwnProfile?: boolean;
}

const ProfileCard: React.FC<Props> = ({ craftsman, isOwnProfile }) => {
  const { user, userType, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleRequestService = () => {
    if (!isAuthenticated) {
      toast.info("من فضلك سجل دخولك أولاً 🔐");
      navigate("/login", { state: { from: "request-service" } });
      return;
    }

    // Restriction: Craftsmen cannot request same profession
    if (userType === 'craftsman' && user?.service_id && craftsman.serviceId && user.service_id === craftsman.serviceId) {
      toast.warning("عذراً، لا يمكنك طلب خدمة من صنايعي في نفس مجال تخصصك 🛠️");
      return;
    }

    navigate("/request-service", {
      state: {
        industrial_type: craftsman.id?.toString(),
        industrial_name: craftsman.name,
        service_type: craftsman.serviceId?.toString(),
        price: craftsman.priceRange,
      }
    });
  };

  return (
    <div className="craftsman-card">
      <div className="craftsman-img-wrapper">
        <img
          src={getAvatarUrl(craftsman.avatarUrl, craftsman.name)}
          alt={craftsman.name}
          className="craftsman-img"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = getAvatarUrl(null, craftsman.name);
          }}
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

      {/* 🏆 Points & Badge */}
      <div className="craftsman-points-row">
        <PointsBadge 
          points={craftsman.points || 0} 
          size="md"
          variant="detailed"
        />
      </div>

      <div className="craftsman-rating">
        {Array.from({ length: 5 }).map((_, i) => (
          <FaStar
            key={i}
            color={i < craftsman.rating ? "#FF8031" : "#e4e5e9"}
          />
        ))}
      </div>
      <p className="craftsman-exp">خبرة {craftsman.experienceYears} سنوات</p>

      {/* Wallet ID — shown only when available, for payment transfers */}
      {craftsman.walletId && !isOwnProfile && (
        <div className="craftsman-wallet-transfer-box">
          <div className="cwt-label">
            <FaWallet size={13} />
            <span>رقم المحفظة للتحويل</span>
          </div>
          <div className="cwt-number">#{craftsman.walletId}</div>
          <small className="cwt-hint">
            عند الدفع، حوّل قيمة الخدمة لهذا الرقم
          </small>
        </div>
      )}

      <div className="card-actions">
        {!isOwnProfile ? (
          <>
            <Button
              onClick={handleRequestService}
              variant="primary"
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
