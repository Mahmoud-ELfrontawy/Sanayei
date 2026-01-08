const ServicesSkeleton = () => {
    return (
        <div className="services-grid">
            {[1, 2, 3, 4].map((item) => (
                <div key={item} className="service-card skeleton-service">
                    <div className="skeleton-icon-service" />
                    <div className="skeleton-line-service" />
                    <div className="skeleton-line-service short" />
                </div>
            ))}
        </div>
    );
};

export default ServicesSkeleton;
