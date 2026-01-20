import { useMemo, useState } from "react";
import { useRequestServiceData } from "../Home/sections/RequestServiceSection/useRequestServiceData";

import ServicesFilters from "./ServicesFilters";
import ServiceCard from "../../components/common/ServiceCard/ServiceCard";
import ServicesSkeleton from "../Home/sections/ServicesSection/ServicesSkeleton";

import "./Services.css";

const ServicesPage: React.FC = () => {
    const { services, loading } = useRequestServiceData();

    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState("all");

    const filteredServices = useMemo(() => {
        return services.filter((service) => {
            const matchSearch =
                search === "" ||
                service.name.toLowerCase().includes(search.toLowerCase());

            const matchService =
                serviceFilter === "all" ||
                service.slug === serviceFilter;

            return matchSearch && matchService;
        });
    }, [services, search, serviceFilter]);

    return (
        <section className="services-section">
            <div className="services-container">


                <ServicesFilters
                    search={search}
                    onSearchChange={setSearch}
                    service={serviceFilter}
                    onServiceChange={setServiceFilter}
                    services={services}
                    serviceValueType="slug"
                />

                {loading ? (
                    <ServicesSkeleton />
                ) : (
                    <div className="services-grid">
                        {filteredServices.map((service) => (
                            <ServiceCard
                                key={service.id}
                                service={service}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ServicesPage;
