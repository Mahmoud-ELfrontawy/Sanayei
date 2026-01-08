import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";

import { getServices } from "../../../../Api/services.api";
import type { Service } from "../../../../constants/service";

import ServicesSkeleton from "./ServicesSkeleton";
import "./ServicesSection.css";

interface ServicesSectionProps {
    limit?: number;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ limit }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        getServices()
            .then((data) => setServices(data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    const visibleServices = limit
        ? services.slice(0, limit)
        : services;

    return (
        <section className="services-section" aria-labelledby="services-title">
            <div className="services-container">
                <p className="services-eyebrow">خدماتنا</p>

                <h2 id="services-title" className="services-title">
                    اختر الخدمة اللي تناسبك
                </h2>

                {/* Loader */}
                {loading && <ServicesSkeleton />}

                {/* Error */}
                {error && (
                    <p className="services-error">
                        حصل خطأ أثناء تحميل الخدمات
                    </p>
                )}

                {/* Services */}
                {!loading && !error && (
                    <div className="services-grid">
                        {visibleServices.map((service) => (
                            <article className="service-card" key={service.id}>
                                {/* أيقونة الخدمة من الـ API */}
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
                                    <h3 className="service-title">
                                        {service.name}
                                    </h3>

                                    <p className="service-desc">
                                        {service.description}
                                    </p>

                                    <Link
                                        to={`/services/${service.slug}`}
                                        className="service-link"
                                    >
                                        طلب الخدمة
                                        <FaArrowRight className="service-arrow" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {limit && (
                    <div className="services-cta">
                        <Link
                            to="/services"
                            className="btn-primary-service"
                        >
                            عرض كل الخدمات
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ServicesSection;
