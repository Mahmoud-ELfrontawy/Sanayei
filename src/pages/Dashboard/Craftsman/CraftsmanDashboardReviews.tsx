import React from "react";
import { useCraftsmanProfile } from "../../CraftsmanProfile/useCraftsmanProfile";
import ReviewsTab from "../../CraftsmanProfile/components/tabs/ReviewsTab";
import "../../CraftsmanProfile/CraftsmanProfile.css"; // Reuse existing styles
import DashboardSkeleton from "../DashboardSkeleton";

const CraftsmanDashboardReviews: React.FC = () => {
    const { craftsman, loading, error } = useCraftsmanProfile();

    if (loading) {
        return <DashboardSkeleton withSidebar={false} />;
    }

    if (error) {
        return (
            <div className="text-center p-8 text-red-500">
                {error || "حدث خطأ أثناء تحميل التقييمات"}
            </div>
        );
    }

    // Reuse the styles from CraftsmanProfile.css which ReviewsTab expects
    // We wrap it in a container that might need similar classes if they depend on parent
    return (
        <div className="dashboard-reviews-container">
            <ReviewsTab reviews={craftsman?.reviews || []} />
        </div>
    );
};

export default CraftsmanDashboardReviews;
