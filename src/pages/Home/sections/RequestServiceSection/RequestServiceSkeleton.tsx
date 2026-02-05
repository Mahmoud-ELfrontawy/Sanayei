interface SubmitSkeletonProps {
    isloading: boolean;
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
    isloading,
}: SubmitSkeletonProps) => {
    if (isloading) {
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
