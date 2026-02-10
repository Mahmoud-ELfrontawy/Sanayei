import React from "react";
import { FiCheckCircle } from "react-icons/fi";

interface Props {
  services: string[];
}

const ServicesTab: React.FC<Props> = ({ services }) => {
  return (
    <div className="tab-content">
      <div className="info-section">
        <h3 className="info-title">الخدمات المقدمة</h3>
        <ul className="info-list">
          {services && services.length > 0 ? (
            services.map((srv, idx) => (
              <li key={idx}>
                <FiCheckCircle className="icon-check" />
                {srv}
              </li>
            ))
          ) : (
            <p>لا توجد خدمات مضافة حالياً.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ServicesTab;
