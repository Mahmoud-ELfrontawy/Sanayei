
interface Props {
    search: string;
    onSearchChange: (v: string) => void;

    price: string;
    onPriceChange: (v: string) => void;
}

const TechniciansFilters: React.FC<Props> = ({
    search,
    onSearchChange,
    price,
    onPriceChange,
}) => {
    return (
        <form
            className="services-filters"
            onSubmit={(e) => e.preventDefault()}
        >
            {/* Search */}
            <div className="services-search">
                <input
                    placeholder="ابحث عن الصنايعي"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* Price */}
            <div className="services-select-wrapper">
                <select
                    className="services-select"
                    value={price}
                    onChange={(e) => onPriceChange(e.target.value)}
                >
                    <option value="all">اختر السعر</option>
                    <option value="low">أقل سعر</option>
                    <option value="mid">متوسط السعر</option>
                    <option value="high">أعلى سعر</option>
                </select>
            </div>
        </form>
    );
};

export default TechniciansFilters;
