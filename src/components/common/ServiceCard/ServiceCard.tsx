import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

import type { Service } from "../../../constants/service";

import "./ServiceCard.css";

interface Props {
    service: Service;
    onRequestClick?: (service: Service) => void;
}

const ServiceCard: React.FC<Props> = ({ service, onRequestClick }) => {
    return (
        <article className="service-card">
            {/* أيقونة الخدمة */}
            <div className="service-icon">
                <img
                    src={service.icon}
                    alt={service.name}
                    loading="lazy"
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                            "/fallback-icon.png";
                    }}
                />
            </div>

            <div className="service-body">
                <h3 className="service-title">{service.name}</h3>

                <p className="service-desc">{service.description}</p>

                {onRequestClick ? (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onRequestClick(service);
                        }}
                        className="service-link-card"
                        style={{ cursor: "pointer", background: "none", border: "none" }}
                    >
                        طلب الخدمة
                        <FaArrowRight className="service-arrow" />
                    </button>
                ) : (
                    <Link
                        to="/request-service"
                        className="service-link-card"
                        state={{
                            service_type: service.id.toString(),
                            service_name: service.name,
                        }}
                    >
                        طلب الخدمة
                        <FaArrowRight className="service-arrow" />
                    </Link>
                )}


            </div>
        </article>
    );
};

export default ServiceCard;
