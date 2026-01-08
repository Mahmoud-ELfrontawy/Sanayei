import { useMemo } from "react";
import { IoIosArrowDown } from "react-icons/io";
import type { Service } from "../../constants/service";
import type { Governorate } from "../../Api/serviceRequest/governorates.api";
import type { Sanaei } from "../../Api/serviceRequest/sanaei.api";

interface Props {
    search: string;
    onSearchChange: (v: string) => void;

    service: string;
    onServiceChange: (v: string) => void;

    city: string;
    onCityChange: (v: string) => void;

    artisan: string;
    onArtisanChange: (v: string) => void;

    services: Service[];
    governorates: Governorate[];
    sanaei: Sanaei[];
}

const unique = <T,>(arr: T[]) => Array.from(new Set(arr));

const ServicesFilters: React.FC<Props> = ({
    search,
    onSearchChange,
    service,
    onServiceChange,
    city,
    onCityChange,
    artisan,
    onArtisanChange,
    services,
    governorates,
    sanaei,
}) => {
    const artisanNames = useMemo(
        () => unique(sanaei.map((s) => s.al_sanaei_name)),
        [sanaei]
    );

    return (
        <form className="services-filters" onSubmit={(e) => e.preventDefault()}>
            
            {/* Search */}
            <div className="services-search">
                <input
                    placeholder="ابحث عن الخدمة"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* Service */}
            <div className="services-select-wrapper">
                <select
                    className="services-select"
                    value={service}
                    onChange={(e) => onServiceChange(e.target.value)}
                >
                    <option value="all">اختر الخدمة</option>
                    {services.map((s) => (
                        <option key={s.id} value={s.slug}>
                            {s.name}
                        </option>
                    ))}
                </select>
                <IoIosArrowDown className="select-arrow" />
            </div>

            {/* Artisan */}
            <div className="services-select-wrapper">
                <select
                    className="services-select"
                    value={artisan}
                    onChange={(e) => onArtisanChange(e.target.value)}
                >
                    <option value="all">اختر الصنايعي</option>
                    {artisanNames.map((name) => (
                        <option key={name} value={name}>
                            {name}
                        </option>
                    ))}
                </select>
                <IoIosArrowDown className="select-arrow" />
            </div>

            {/* Governorate */}
            <div className="services-select-wrapper">
                <select
                    className="services-select"
                    value={city}
                    onChange={(e) => onCityChange(e.target.value)}
                >
                    <option value="all">اختر المحافظة</option>
                    {governorates.map((g) => (
                        <option key={g.id} value={g.name}>
                            {g.name}
                        </option>
                    ))}
                </select>
                <IoIosArrowDown className="select-arrow" />
            </div>

            {/* Reset */}
            <button
                type="button"
                className="services-reset-btn"
                onClick={() => {
                    onSearchChange("");
                    onServiceChange("all");
                    onCityChange("all");
                    onArtisanChange("all");
                }}
            >
                إعادة ضبط
            </button>
        </form>
    );
};

export default ServicesFilters;
