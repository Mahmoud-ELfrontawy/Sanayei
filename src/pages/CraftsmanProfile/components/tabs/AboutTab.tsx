import React from "react";
import { FiCheck, FiMapPin, FiCreditCard, FiPhone } from "react-icons/fi";
import type { CraftsmanProfileData } from "../../../../types/craftsman";

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
          <li>• {data.jobTitle}</li>
          {data.specialization &&
            data.specialization.map((spec, idx) => <li key={idx}>• {spec}</li>)}
        </ul>
      </div>

      {/* نبذة */}
      <div className="info-section">
        <h3 className="info-title">
          <FiCheck /> نبذة عن الصنايعي
        </h3>
        <p className="description-text">{data.about}</p>
      </div>

      <div className="info-grid-row">
        {/* العنوان */}
        <div className="info-section half">
          <h3 className="info-title">
            <FiMapPin /> العنوان بالتفصيل
          </h3>
          <p className="info-text-val">{data.address}</p>
        </div>

        {/* رقم الهاتف */}
        <div className="info-section half">
          <h3 className="info-title">
            <FiPhone /> رقم الهاتف
          </h3>
          <p className="info-text-val ltr-text">{data.phone || "غير متاح"}</p>
        </div>
      </div>

      <div className="info-grid-row">
        {/* نطاق الأسعار */}
        <div className="info-section half">
          <h3 className="info-title">
            <FiCreditCard /> نطاق الأسعار
          </h3>
          <p className="info-text-val">{data.priceRange || "حسب الاتفاق"}</p>
        </div>

        {/* أيام العمل */}
        <div className="info-section half">
          <h3 className="info-title">
            <FiCheck /> أيام العمل
          </h3>
          <p className="info-text-val">
            {data.workDays && data.workDays.length > 0
              ? data.workDays.join(" - ")
              : "طوال أيام الأسبوع"}
          </p>
        </div>
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
