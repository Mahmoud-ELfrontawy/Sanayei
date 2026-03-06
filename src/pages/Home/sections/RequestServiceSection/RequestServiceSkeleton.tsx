interface SubmitSkeletonProps {
    isloading: boolean;
}

/* =========================
   Input Skeleton
========================= */
export const RequestServiceInputSkeleton = () => {
    return <div className="hsq-form-input skeleton-service" />;
};

/* =========================
   Submit Button Skeleton
========================= */
export const RequestServiceSubmitSkeleton = ({
    isloading,
}: SubmitSkeletonProps) => {
    if (isloading) {
        return (
            <div className="hsq-submit-btn skeleton-service">
                <div className="skeleton-line-service" />
            </div>
        );
    }

    return (
        <button type="submit" className="hsq-submit-btn">
            تأكيد الحجز
        </button>
    );
};
