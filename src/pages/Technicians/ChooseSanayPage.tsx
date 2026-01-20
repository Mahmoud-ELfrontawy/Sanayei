import { useEffect, useMemo, useState } from "react";
import { getTechnicians } from "../../Api/technicians.api";
import type { Technician } from "../../constants/technician";

import TechnicianCard from "../../components/common/TechniciansCard/TechnicianCard";
import TechniciansSkeleton from "../Home/sections/ServicesSection/ServicesSkeleton";

import ServicesFilters from "../Services/ServicesFilters";
import { useRequestServiceData } from "../Home/sections/RequestServiceSection/useRequestServiceData";

import "./ChooseSanay.css";
import { IoIosArrowDown } from "react-icons/io";

const getPriceLevel = (priceRange: string | null) => {
    if (!priceRange) return "unknown";

    const [, max] = priceRange.split("-").map(Number);

    if (max <= 500) return "low";
    if (max <= 1000) return "mid";
    return "high";
};

const ChooseSanayPage: React.FC = () => {
    const { services, governorates } = useRequestServiceData();

    const [data, setData] = useState<Technician[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState("all");
    const [cityFilter, setCityFilter] = useState("all");
    const [priceFilter, setPriceFilter] = useState("all");

    useEffect(() => {
        getTechnicians()
            .then(setData)
            .finally(() => setLoading(false));
    }, []);

    const filteredTechnicians = useMemo(() => {
        return data.filter((t) => {
            const matchSearch =
                search === "" ||
                t.name.toLowerCase().includes(search.toLowerCase());

            const matchService =
                serviceFilter === "all" ||
                t.service?.id.toString() === serviceFilter;

            const matchCity =
                cityFilter === "all" ||
                t.governorate?.name === cityFilter;

            const matchPrice =
                priceFilter === "all" ||
                getPriceLevel(t.price_range) === priceFilter;

            return (
                matchSearch &&
                matchService &&
                matchCity &&
                matchPrice
            );
        });
    }, [data, search, serviceFilter, cityFilter, priceFilter]);

    return (
        <section className="workers-section">
            <div className="workers-container">

                <ServicesFilters
                    search={search}
                    onSearchChange={setSearch}
                    service={serviceFilter}
                    onServiceChange={setServiceFilter}
                    city={cityFilter}
                    onCityChange={setCityFilter}
                    services={services}
                    governorates={governorates}
                    serviceValueType="id"
                    showCity
                >
                    {/* السعر */}
                    <div className="services-select-wrapper">
                        <select
                            className="services-select price-select"
                            value={priceFilter}
                            onChange={(e) =>
                                setPriceFilter(e.target.value)
                            }
                        >
                            <option value="all">السعر</option>
                            <option value="low">اقتصادي</option>
                            <option value="mid">متوسط</option>
                            <option value="high">مرتفع</option>
                        </select>
                        <IoIosArrowDown className="select-arrow" />
                    </div>
                </ServicesFilters>

                {loading ? (
                    <TechniciansSkeleton />
                ) : (
                    <div className="workers-grid">
                        {filteredTechnicians.map((t) => (
                            <TechnicianCard
                                key={t.id}
                                technician={t}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default ChooseSanayPage;
