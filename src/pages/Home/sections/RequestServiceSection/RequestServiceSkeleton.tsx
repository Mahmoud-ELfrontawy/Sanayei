interface RequestServiceSkeletonProps {
    loading: boolean;
}

export function RequestServiceSkeleton({ loading }: RequestServiceSkeletonProps) {
    return (
        <button
            type="submit"
            className="req-submit"
            disabled={loading}
        >
            {loading ? "جارِ مراجعة الطلب..." : "تأكيد الحجز"}
        </button>
    );
}