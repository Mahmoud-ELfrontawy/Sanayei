import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { getServices } from "../../../../Api/services.api";
import ServiceCard from "../../../../components/common/ServiceCard/ServiceCard";
import ServicesSkeleton from "./ServicesSkeleton";

import "./ServicesSection.css";

interface ServicesSectionProps {
    limit?: number;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ limit }) => {
    const {
        data: services = [],
        isLoading: loading,
        isError: error
    } = useQuery({
        queryKey: ['services'],
        queryFn: getServices,
    });

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

                {/* Skeleton */}
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
                            <ServiceCard
                                key={service.id}
                                service={service}
                            />
                        ))}
                    </div>
                )}

                {/* CTA */}
                {limit && !loading && !error && (
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
