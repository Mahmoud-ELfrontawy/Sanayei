interface SubmitSkeletonProps {
    loading: boolean;
}

/* =========================
   Input Skeleton
========================= */
export const RequestServiceInputSkeleton = () => {
    return <div className="req-input skeleton-service" />;
};

/* =========================
   Submit Button Skeleton
========================= */
export const RequestServiceSubmitSkeleton = ({
    loading,
}: SubmitSkeletonProps) => {
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
};
