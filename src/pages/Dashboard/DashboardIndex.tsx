import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import UserDashboard from "./User/UserDashboard";
import CraftsmanDashboard from "./Craftsman/CraftsmanDashboard";
import CompanyDashboard from "./Company/CompanyDashboard";
import DashboardSkeleton from "./DashboardSkeleton";

const DashboardIndex: React.FC = () => {
    const { userType, loading, isAuthenticated } = useAuth();

    if (loading) {
        return <DashboardSkeleton withSidebar={false} />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    switch (userType) {
        case "craftsman":
            return <CraftsmanDashboard />;
        case "company":
            return <CompanyDashboard />;
        case "user":
        default:
            return <UserDashboard />;
    }
};

export default DashboardIndex;
