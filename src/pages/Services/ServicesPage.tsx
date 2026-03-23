import { useMemo, useState, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { FaMoneyBillWave, FaMapMarkerAlt, FaUsers } from "react-icons/fa";
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
    const { user, refreshUser } = useAuth();
    const location = useLocation();

    // Refresh user data on mount to get latest profile location
    useEffect(() => {
        if (user) refreshUser();
    }, [refreshUser]);

    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"list" | "map">("list");
    const [displayMode, setDisplayMode] = useState<"all" | "online" | "nearest">("all");
    
    const [cityFilter, setCityFilter] = useState("all");
    const [priceFilter, setPriceFilter] = useState("all");

    const { location: userGeoLocation } = useGeoLocation();

    // Saved user location takes priority over GPS
    const effectiveLocation = useMemo(() => {
        const uLat = Number(user?.latitude);
        const uLng = Number(user?.longitude);

        if (user && !isNaN(uLat) && !isNaN(uLng) && uLat !== 0 && uLng !== 0) {
            return { lat: uLat, lng: uLng };
        }
        return userGeoLocation;
    }, [user, userGeoLocation]);


    // Scroll to craftsmen section when coming from Home page
    useEffect(() => {
        if (location.state?.serviceSlug) {
            setServiceFilter(location.state.serviceSlug);
            setTimeout(() => {
                document.getElementById("craftsmen-section")?.scrollIntoView({ behavior: "smooth" });
            }, 500);
        }
    }, [location.state, services]);

    // ─── Technicians State ────────────────────────────────────────────────────
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [loadingTechs, setLoadingTechs] = useState(false);

    const getPriceLevel = (priceRange: string | null) => {
        if (!priceRange) return "unknown";
        const [, max] = priceRange.split("-").map(Number);
        if (max <= 500) return "low";
        if (max <= 1000) return "mid";
        return "high";
    };

    // ─── Fetch Logic ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (serviceFilter === "all") {
            setTechnicians([]);
            return;
        }

        const selectedService = services.find(s => s.slug === serviceFilter);
        if (!selectedService) return;

        setLoadingTechs(true);


        if (displayMode === "nearest" && effectiveLocation) {
            getNearestTechnicians(effectiveLocation.lat, effectiveLocation.lng, selectedService.id)
                .then(setTechnicians)
                .catch(() => {
                    // Fallback to all if nearest fails
                    getTechnicians(selectedService.id).then(setTechnicians);
                })
                .finally(() => setLoadingTechs(false));
        } else {
            // "all" or "online" (server filters by 'filter=online')
            getTechnicians(selectedService.id, displayMode === "online" ? "online" : undefined)
                .then(setTechnicians)
                .catch(err => console.error("Failed to load technicians", err))
                .finally(() => setLoadingTechs(false));
        }
    }, [effectiveLocation, serviceFilter, displayMode, services.length]);

    // ─── Filtering ───────────────────────────────────────────────────────────
    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchSearch = search === "" || service.name.toLowerCase().includes(search.toLowerCase());
            const matchFilter = serviceFilter === "all" || service.slug === serviceFilter;
            return matchSearch && matchFilter;
        });
    }, [services, search, serviceFilter]);

    const techniciansWithGov = useMemo(() => {
        return technicians.map(t => {
            if (!t.governorate && t.governorate_id) {
                const gov = governorates.find(g => g.id.toString() === t.governorate_id?.toString());
                if (gov) return { ...t, governorate: { id: gov.id, name: gov.name } };
            }
            return t;
        });
    }, [technicians, governorates]);

    const filteredTechnicians = useMemo(() => {
        if (serviceFilter === "all") return [];

        const selectedService = services.find(s => s.slug === serviceFilter);
        if (!selectedService) return [];
        const selectedId = String(selectedService.id);

        return techniciansWithGov.filter((t: any) => {
            if (t.status && t.status !== 'approved') return false;

            // Extra safety: some APIs might return all techs, so we filter by service ID here too
            const techServiceId = String(t.service?.id ?? t.service_id ?? "");
            if (techServiceId !== selectedId) return false;

            const matchCity = cityFilter === "all" || t.governorate?.name === cityFilter;
            const matchPrice = priceFilter === "all" || getPriceLevel(t.price_range) === priceFilter;

            return matchCity && matchPrice;
        });
    }, [techniciansWithGov, serviceFilter, services, cityFilter, priceFilter]);

    // ─── Helpers ─────────────────────────────────────────────────────────────
    const handleServiceRequest = (service: any) => {
        setServiceFilter(service.slug);
        setTimeout(() => {
            document.getElementById("craftsmen-section")?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const hasLocation = !!effectiveLocation;

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
                    showCity={serviceFilter !== "all"}
                    city={cityFilter}
                    onCityChange={setCityFilter}
                    governorates={governorates}
                >
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

                        {serviceFilter !== "all" && (
                            <div id="craftsmen-section" className="craftsmen-section">
                                <div className="craftsmen-section__header-row">
                                    <div>
                                        <h2 className="craftsmen-section__title">
                                            صنايعية {services.find(s => s.slug === serviceFilter)?.name || ""}
                                        </h2>
                                        <p className="craftsmen-section__subtitle">
                                            {displayMode === "all" && <><FaUsers /> عرض جميع المعتمدين</>}
                                            {displayMode === "online" && <><span className="online-dot" /> عرض المتاحين الآن فقط</>}
                                            {displayMode === "nearest" && <><FaMapMarkerAlt /> مرتبون حسب الأقرب إليك</>}
                                        </p>
                                    </div>

                                    <div className="craftsmen-section__controls">
                                        <div className="display-mode-tabs">
                                            <button 
                                                className={`display-mode-btn ${displayMode === 'all' ? 'active' : ''}`}
                                                onClick={() => setDisplayMode('all')}
                                            >
                                                الكل
                                            </button>
                                            <button 
                                                className={`display-mode-btn online-btn ${displayMode === 'online' ? 'active' : ''}`}
                                                onClick={() => setDisplayMode('online')}
                                            >
                                                <span className="online-dot" />
                                                متصل الآن
                                            </button>
                                            {hasLocation && (
                                                <button 
                                                    className={`display-mode-btn ${displayMode === 'nearest' ? 'active' : ''}`}
                                                    onClick={() => setDisplayMode('nearest')}
                                                >
                                                    الأقرب
                                                </button>
                                            )}
                                        </div>

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
                                </div>

                                {loadingTechs ? (
                                    <ServicesSkeleton />
                                ) : viewMode === 'map' ? (
                                    <TechnicianMap
                                        technicians={filteredTechnicians}
                                        userLocation={effectiveLocation}
                                        displayMode={displayMode}
                                        user={user}
                                    />
                                ) : filteredTechnicians.length > 0 ? (
                                    <div className="workers-grid">
                                        {filteredTechnicians.map((t) => (
                                            <TechnicianCard key={t.id} technician={t} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="craftsmen-section__empty">
                                        {displayMode === "online" 
                                            ? "لا يوجد صنايعية متاحين حالياً" 
                                            : displayMode === "nearest" 
                                            ? "لا يوجد صنايعية قريبون منك حالياً"
                                            : "لا يوجد صنايعية متاحين لهذه الخدمة حالياً"}
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
