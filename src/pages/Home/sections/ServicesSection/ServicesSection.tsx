import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, type Variants } from "framer-motion";

import { getServices } from "../../../../Api/services.api";
import ServiceCard from "../../../../components/common/ServiceCard/ServiceCard";
import ServicesSkeleton from "./ServicesSkeleton";

import "./ServicesSection.css";

interface ServicesSectionProps {
    limit?: number;
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ limit }) => {
    const navigate = useNavigate();

    const handleServiceClick = (service: any) => {
        navigate("/services", { state: { serviceSlug: service.slug } });
    };

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

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.4
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

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
                    <motion.div
                        className="services-grid"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.5 }}
                    >
                        {visibleServices.map((service) => (
                            <motion.div key={service.id} variants={itemVariants}>
                                <ServiceCard
                                    service={service}
                                    onRequestClick={handleServiceClick}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* CTA */}
                {limit && !loading && !error && (
                    <motion.div
                        className="services-cta"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                    >
                        <Link
                            to="/services"
                            className="btn-primary-service"
                        >
                            عرض كل الخدمات
                        </Link>
                    </motion.div>
                )}
            </div>
        </section>
    );
};

export default ServicesSection;
