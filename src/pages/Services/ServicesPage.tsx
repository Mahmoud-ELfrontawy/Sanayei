// import { useMemo, useState } from "react";
// import { useRequestServiceData } from "../Home/sections/RequestServiceSection/useRequestServiceData";
// import ServicesFilters from "./ServicesFilters";
// import ServiceCard from "../shared/ServiceCard";
// import ServicesSkeleton from "../Home/sections/ServicesSection/ServicesSkeleton";

// import "./services.css";

// const ServicesPage: React.FC = () => {
//     const { services, governorates, sanaei, loading } =
//         useRequestServiceData();

//     const [search, setSearch] = useState("");
//     const [serviceFilter, setServiceFilter] = useState("all");
//     const [cityFilter, setCityFilter] = useState("all");
//     const [artisanFilter, setArtisanFilter] = useState("all");

//     const filteredServices = useMemo(() => {
//         return services.filter((service) => {
//             const matchSearch =
//                 !search ||
//                 service.name.toLowerCase().includes(search.toLowerCase());

//             const matchService =
//                 serviceFilter === "all" ||
//                 service.slug === serviceFilter;

//             const matchCity =
//                 cityFilter === "all" ||
//                 sanaei.some(
//                     (s) =>
//                         s.al_sanaei_sanaeaa_type === service.slug &&
//                         s.al_sanaei_Governorate === cityFilter
//                 );

//             const matchArtisan =
//                 artisanFilter === "all" ||
//                 sanaei.some(
//                     (s) =>
//                         s.al_sanaei_name === artisanFilter &&
//                         s.al_sanaei_sanaeaa_type === service.slug
//                 );

//             return (
//                 matchSearch &&
//                 matchService &&
//                 matchCity &&
//                 matchArtisan
//             );
//         });
//     }, [services, sanaei, search, serviceFilter, cityFilter, artisanFilter]);

//     return (
//         <section className="sanayee-root">
//             <div className="container">
//                 <div className="sanayee-head">
//                     <p className="sanayee-head__label">خدماتنا</p>
//                     <h1 className="sanayee-head__title">
//                         اختر الخدمة اللي تناسبك
//                     </h1>
//                 </div>

//                 <ServicesFilters
//                     search={search}
//                     onSearchChange={setSearch}
//                     service={serviceFilter}
//                     onServiceChange={setServiceFilter}
//                     city={cityFilter}
//                     onCityChange={setCityFilter}
//                     artisan={artisanFilter}
//                     onArtisanChange={setArtisanFilter}
//                     services={services}
//                     governorates={governorates}
//                     sanaei={sanaei}
//                 />

//                 {loading && <ServicesSkeleton />}

//                 {!loading && (
//                     <div className="sanayee-grid">
//                         {filteredServices.length ? (
//                             filteredServices.map((service) => (
//                                 <ServiceCard
//                                     key={service.id}
//                                     service={service}
//                                 />
//                             ))
//                         ) : (
//                             <div className="sanayee-empty">
//                                 لا توجد نتائج
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>
//         </section>
//     );
// };

// export default ServicesPage;




import { useMemo, useState } from "react";

import { useRequestServiceData } from "../Home/sections/RequestServiceSection/useRequestServiceData";

import ServicesFilters from "./ServicesFilters";
import ServiceCard from "../../components/common/ServiceCard/ServiceCard";
import ServicesSkeleton from "../Home/sections/ServicesSection/ServicesSkeleton";

import "./Services.css";
import LottiePlayerDataNotFound from "../../components/ui/LottiePlayerDataNotFound";
import Empty from "../../assets/lottie/empty.json";

const ServicesPage: React.FC = () => {
    const {
        services,
        governorates,
        sanaei,
        loading,
    } = useRequestServiceData();

    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState("all");
    const [cityFilter, setCityFilter] = useState("all");
    const [artisanFilter, setArtisanFilter] = useState("all");

    const filteredServices = useMemo(() => {
        return services.filter((service) => {
            const matchSearch =
                search === "" ||
                service.name.toLowerCase().includes(search.toLowerCase()) ||
                service.description
                    ?.toLowerCase()
                    .includes(search.toLowerCase());

            const matchService =
                serviceFilter === "all" ||
                service.slug === serviceFilter;

            const matchCity =
                cityFilter === "all" ||
                sanaei.some(
                    (s) =>
                        s.al_sanaei_sanaeaa_type === service.slug &&
                        s.al_sanaei_Governorate === cityFilter
                );

            const matchArtisan =
                artisanFilter === "all" ||
                sanaei.some(
                    (s) =>
                        s.al_sanaei_name === artisanFilter &&
                        s.al_sanaei_sanaeaa_type === service.slug
                );

            return (
                matchSearch &&
                matchService &&
                matchCity &&
                matchArtisan
            );
        });
    }, [
        services,
        sanaei,
        search,
        serviceFilter,
        cityFilter,
        artisanFilter,
    ]);

    return (
        <section className="services-page services-section">
            <div className="services-container">
                <p className="services-eyebrow">خدماتنا</p>

                <h1 className="sanayee-head__title services-title">
                    اختر الخدمة اللي تناسبك
                </h1>

                <ServicesFilters
                    search={search}
                    onSearchChange={setSearch}
                    service={serviceFilter}
                    onServiceChange={setServiceFilter}
                    city={cityFilter}
                    onCityChange={setCityFilter}
                    artisan={artisanFilter}
                    onArtisanChange={setArtisanFilter}
                    services={services}
                    governorates={governorates}
                    sanaei={sanaei}
                />

                {loading && <ServicesSkeleton />}

                {!loading && (
                    <div className="services-grid">
                        {filteredServices.length ? (
                            filteredServices.map((service) => (
                                <ServiceCard
                                    key={service.id}
                                    service={service}
                                />
                            ))
                        ) : (
                            <div className="services-empty">
                                <LottiePlayerDataNotFound animationData={Empty} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ServicesPage;
