import { useMemo, useState, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FaMoneyBillWave } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { useRequestServiceData } from "../Home/sections/RequestServiceSection/useRequestServiceData";
import { getTechnicians, getNearestTechnicians } from "../../Api/technicians.api";
import type { Technician } from "../../constants/technician";
import { useAuth } from "../../hooks/useAuth";

import ServicesFilters from "./ServicesFilters";
import ServiceCard from "../../components/common/ServiceCard/ServiceCard";
import ServicesSkeleton from "../Home/sections/ServicesSection/ServicesSkeleton";
import TechnicianCard from "../../components/common/TechniciansCard/TechnicianCard";
import TechnicianMap from "../../components/common/TechnicianMap/TechnicianMap";
import { useLocation as useGeoLocation } from "../../hooks/useLocation";

import "./Services.css";

const ServicesPage: React.FC = () => {
    const { services, governorates, loading } = useRequestServiceData();
    const { user } = useAuth();
    const location = useLocation();

    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"list" | "map">("list");
    const { location: userGeoLocation } = useGeoLocation();

    // Determine the effective location: saved user location first, then GPS
    const effectiveLocation = useMemo(() => {
        if (user?.latitude && user?.longitude && !isNaN(Number(user.latitude)) && !isNaN(Number(user.longitude))) {
            return { lat: Number(user.latitude), lng: Number(user.longitude) };
        }
        return userGeoLocation;
    }, [user, userGeoLocation]);

    // Handle incoming state from Home page
    useEffect(() => {
        if (location.state?.serviceSlug) {
            setServiceFilter(location.state.serviceSlug);

            // Scroll to craftsmen section
            setTimeout(() => {
                const craftsmenSection = document.getElementById("craftsmen-section");
                if (craftsmenSection) {
                    craftsmenSection.scrollIntoView({ behavior: "smooth" });
                }
            }, 500); // Give it some time to render
        }
    }, [location.state, services]); // Depend on services to ensure it's available if needed, though state is primary here
    const [cityFilter, setCityFilter] = useState("all");
    const [priceFilter, setPriceFilter] = useState("all");

    // Technicians State
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loadingTechs, setLoadingTechs] = useState(false); // Initialized to false

    // Helper for Price Level
    const getPriceLevel = (priceRange: string | null) => {
        if (!priceRange) return "unknown";
        const [, max] = priceRange.split("-").map(Number);
        if (max <= 500) return "low";
        if (max <= 1000) return "mid";
        return "high";
    };

    // Fetch Technicians
    useEffect(() => {
        const selectedService = services.find(s => s.slug === serviceFilter);

        // ✅ If we have an effective location and a specific service
        if (effectiveLocation && selectedService) {
            setLoadingTechs(true);
            getNearestTechnicians(effectiveLocation.lat, effectiveLocation.lng, selectedService.id)
                .then((nearest) => {
                    if (nearest && nearest.length > 0) {
                        setTechnicians(nearest);
                    } else {
                        // Fallback: If no one is near, get ALL technicians for this service
                        getTechnicians().then(setTechnicians);
                    }
                })
                .catch(() => getTechnicians().then(setTechnicians)) // Fallback on error
                .finally(() => setLoadingTechs(false));
            return;
        }

        // Generic fetch if no effective location or no service selected
        setLoadingTechs(true);
        getTechnicians()
            .then(setTechnicians)
            .catch(err => console.error("Failed to load technicians", err))
            .finally(() => setLoadingTechs(false));
    }, [effectiveLocation, serviceFilter, services]); // Removed viewMode dependency from fetch to keep data consistent

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

    // Map Governorates to Technicians
    const techniciansWithMappedGovernorates = useMemo(() => {
        return technicians.map(t => {
            if (!t.governorate && t.governorate_id) {
                const gov = governorates.find(g => g.id.toString() === t.governorate_id?.toString());
                if (gov) {
                    return { ...t, governorate: { id: gov.id, name: gov.name } };
                }
            }
            return t;
        });
    }, [technicians, governorates]);

    // Filter Technicians based on selected service, city, and price
    const filteredTechnicians = useMemo(() => {
        if (serviceFilter === "all") return [];

        // Find the service object to get its ID (since filter sends slug)
        const selectedService = services.find(s => s.slug === serviceFilter);
        if (!selectedService) return [];

        let result = techniciansWithMappedGovernorates.filter((t) => {
            // ✅ Only show approved technicians
            const isApproved = t.status === 'approved';
            if (!isApproved) return false;

            const matchService = t.service?.id === selectedService.id;

            const matchCity =
                cityFilter === "all" ||
                t.governorate?.name === cityFilter;

            const matchPrice =
                priceFilter === "all" ||
                getPriceLevel(t.price_range) === priceFilter;

            return matchService && matchCity && matchPrice;
        });

        // Slice the final filteredTechnicians to 10 when viewMode is 'map'
        if (viewMode === 'map' && result.length > 10) {
            return result.slice(0, 10);
        }

        return result;
    }, [techniciansWithMappedGovernorates, serviceFilter, services, cityFilter, priceFilter, viewMode]); // Added viewMode to dependencies

    // Handle request click in Service Card
    const handleServiceRequest = (service: any) => {
        setServiceFilter(service.slug);
        // Scroll to craftsmen section
        setTimeout(() => {
            const craftsmenSection = document.getElementById("craftsmen-section");
            if (craftsmenSection) {
                craftsmenSection.scrollIntoView({ behavior: "smooth" });
            }
        }, 100);
    };

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

                    // New Filters Props
                    showCity={serviceFilter !== "all"}
                    city={cityFilter}
                    onCityChange={setCityFilter}
                    governorates={governorates}
                >
                    {/* Price Filter (Only show when a service is selected) */}
                    {serviceFilter !== "all" && (
                        <div className="sf-filter-item select-item">
                            <FaMoneyBillWave className="field-icon" />
                            <select
                                className="sf-select-field"
                                value={priceFilter}
                                onChange={(e) => setPriceFilter(e.target.value)}
                                style={{ minWidth: "150px" }}
                            >
                                <option value="all">كل الأسعار</option>
                                <option value="low">اقتصادي (أقل من 500)</option>
                                <option value="mid">متوسط (500 - 1000)</option>
                                <option value="high">مرتفع (أكثر من 1000)</option>
                            </select>
                            <IoIosArrowDown className="select-arrow" />
                        </div>
                    )}
                </ServicesFilters>

                {loading ? (
                    <ServicesSkeleton />
                ) : (
                    <>
                        {/* Services Grid — hidden when a specific service is selected */}
                        {serviceFilter === "all" && (
                            <div className="services-grid">
                                {filteredServices.map((service) => (
                                    <ServiceCard
                                        key={service.id}
                                        service={service}
                                        onRequestClick={handleServiceRequest}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Craftsmen Section (Only shows if a service is selected) */}
                        {serviceFilter !== "all" && (
                            <div id="craftsmen-section" className="craftsmen-section">
                                <div className="craftsmen-section__header-row">
                                    <h2 className="craftsmen-section__title">
                                        صنايعية {services.find(s => s.slug === serviceFilter)?.name || ""}
                                    </h2>

                                    <div className="view-toggle">
                                        <button
                                            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                                            onClick={() => setViewMode('list')}
                                        >
                                            القائمة
                                        </button>
                                        <button
                                            className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                                            onClick={() => setViewMode('map')}
                                        >
                                            الخريطة
                                        </button>
                                    </div>
                                </div>

                                {loadingTechs ? (
                                    <ServicesSkeleton />
                                ) : viewMode === 'map' ? (
                                    <TechnicianMap
                                        technicians={filteredTechnicians}
                                        userLocation={effectiveLocation}
                                    />
                                ) : filteredTechnicians.length > 0 ? (
                                    <div className="workers-grid">
                                        {filteredTechnicians.map((t) => (
                                            <TechnicianCard
                                                key={t.id}
                                                technician={t}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="craftsmen-section__empty">
                                        لا يوجد صنايعية متاحين لهذه الخدمة حالياً
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
};

export default ServicesPage;
