interface RequestServiceSkeletonProps {
    loading: boolean;
}

export function RequestServiceSkeleton({
    loading,
}: RequestServiceSkeletonProps) {
    if (loading) {
        return (
            <div className="req-submit skeleton-service">
                <div className="skeleton-line-service" />
            </div>
        );
    }

    return (
        <button type="submit" className="req-submit">
            تأكيد الحجز
        </button>
    );
}
