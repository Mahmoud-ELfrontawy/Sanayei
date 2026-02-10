import React from "react";
import { FiCheck, FiMapPin, FiCreditCard } from "react-icons/fi";
import type { CraftsmanProfileData } from "../../craftsmanData"; // ✅

interface Props {
  data: CraftsmanProfileData;
}

const AboutTab: React.FC<Props> = ({ data }) => {
  return (
    <div className="tab-content">
      {/* التخصص */}
      <div className="info-section">
        <h3 className="info-title">
          <FiCheck /> التخصص المهني
        </h3>
        <ul className="info-list">
          {data.specialization &&
            data.specialization.map((spec, idx) => <li key={idx}>• {spec}</li>)}
        </ul>
      </div>

      {/* نبذة */}
      <div className="info-section">
        <h3 className="info-title">
          <FiCheck /> نبذة عن الصنايعي
        </h3>
        <p style={{ color: "#555", lineHeight: "1.6" }}>{data.about}</p>
      </div>

      {/* العنوان */}
      <div className="info-section">
        <h3 className="info-title">
          <FiMapPin /> العنوان
        </h3>
        <p style={{ color: "#555" }}>{data.address}</p>
      </div>

      {/* الدفع */}
      <div className="info-section">
        <h3 className="info-title">
          <FiCreditCard /> طرق الدفع المفضلة
        </h3>
        <ul className="info-list">
          {data.paymentMethods &&
            data.paymentMethods.map((method, idx) => (
              <li key={idx}>• {method}</li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default AboutTab;
