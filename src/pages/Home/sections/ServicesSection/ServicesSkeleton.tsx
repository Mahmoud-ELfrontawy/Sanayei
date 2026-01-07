
const ServicesSkeleton: React.FC = () => {
    return (
        <div className="services-grid">
            {Array.from({ length: 4 }).map((_, i) => (
                <div className="service-card skeleton" key={i}>
                    <div className="skeleton-icon" />
                    <div className="skeleton-line" />
                    <div className="skeleton-line short" />
                </div>
            ))}
        </div>
    );
};

export default ServicesSkeleton;
