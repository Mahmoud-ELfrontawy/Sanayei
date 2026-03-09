import { IoIosArrowDown } from "react-icons/io";
import { FaSearch, FaMapMarkerAlt, FaToolbox, FaSyncAlt } from "react-icons/fa";
import type { Service } from "../../constants/service";
import type { Governorate } from "../../Api/serviceRequest/governorates.api";

interface Props {
    search: string;
    onSearchChange: (v: string) => void;

    service: string;
    onServiceChange: (v: string) => void;

    /** مهم جدًا */
    serviceValueType?: "id" | "slug";

    city?: string;
    onCityChange?: (v: string) => void;

    services: Service[];
    governorates?: Governorate[];

    showCity?: boolean;
    children?: React.ReactNode;
}

const ServicesFilters: React.FC<Props> = ({
    search,
    onSearchChange,
    service,
    onServiceChange,
    serviceValueType = "slug",
    city,
    onCityChange,
    services,
    governorates = [],
    showCity = false,
    children,
}) => {
    return (
        <form className="sf-premium-filters" onSubmit={(e) => e.preventDefault()}>
            <div className="sf-filters-wrapper">
                {/* Reset Button */}
                <button
                    type="button"
                    className="sf-btn-reset"
                    onClick={() => {
                        onSearchChange("");
                        onServiceChange("all");
                        onCityChange?.("all");
                    }}
                    title="إعادة ضبط الفلاتر"
                >
                    <FaSyncAlt />
                </button>

                {/* Service Select */}
                <div className="sf-filter-item select-item">
                    <FaToolbox className="field-icon" />
                    <select
                        className="sf-select-field"
                        value={service}
                        onChange={(e) => onServiceChange(e.target.value)}
                    >
                        <option value="all">كل الخدمات</option>
                        {services.map((s) => (
                            <option
                                key={s.id}
                                value={
                                    serviceValueType === "id"
                                        ? s.id.toString()
                                        : s.slug
                                }
                            >
                                {s.name}
                            </option>
                        ))}
                    </select>
                    <IoIosArrowDown className="select-arrow" />
                </div>

                {/* Governorate Select */}
                {showCity && (
                    <div className="sf-filter-item select-item">
                        <FaMapMarkerAlt className="field-icon" />
                        <select
                            className="sf-select-field"
                            value={city}
                            onChange={(e) =>
                                onCityChange?.(e.target.value)
                            }
                        >
                            <option value="all">كل المحافظات</option>
                            {governorates.map((g) => (
                                <option key={g.id} value={g.name}>
                                    {g.name}
                                </option>
                            ))}
                        </select>
                        <IoIosArrowDown className="select-arrow" />
                    </div>
                )}
                {/* Children (e.g., Price Filter) */}
                {children}

                {/* Search Input */}
                <div className="sf-filter-item search-item">
                    <FaSearch className="field-icon" />
                    <input
                        type="text"
                        className="sf-input-field"
                        placeholder="ابحث عن خدمة أو صنايعي..."
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
        </form>
    );
};

export default ServicesFilters;
