import { IoIosArrowDown } from "react-icons/io";
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
        <form className="sf-filters-container" onSubmit={(e) => e.preventDefault()}>
            {/* Reset */}
            <button
                type="button"
                className="sf-reset-action-btn"
                onClick={() => {
                    onSearchChange("");
                    onServiceChange("all");
                    onCityChange?.("all");
                }}
            >
                إعادة ضبط
            </button>

            {/* Service */}
            <div className="sf-select-group">
                <select
                    className="sf-custom-select"
                    value={service}
                    onChange={(e) => onServiceChange(e.target.value)}
                >
                    <option value="all">اختر الخدمة</option>
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

            {/* Governorate */}
            {showCity && (
                <div className="sf-select-group">
                    <select
                        className="sf-custom-select"
                        value={city}
                        onChange={(e) =>
                            onCityChange?.(e.target.value)
                        }
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
            )}
            {children}

            {/* Search */}
            <div className="sf-search-input-box">
                <input
                    placeholder="ابحث"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
        </form>
    );
};

export default ServicesFilters;
