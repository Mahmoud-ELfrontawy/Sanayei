
const ServicesSkeleton: React.FC = () => {
    return (
        <div className="services-grid">
            {Array.from({ length: 4 }).map((_, i) => (
                <div className="service-card skeleton-service" key={i}>
                    <div className="skeleton-icon-service" />
                    <div className="skeleton-line-service" />
                    <div className="skeleton-line-service short" />
                </div>
            ))}
        </div>
    );
};

export default ServicesSkeleton;
