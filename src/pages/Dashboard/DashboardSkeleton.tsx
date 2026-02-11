import React from "react";
import Skeleton from "../../components/common/Skeleton/Skeleton";
import "../../layouts/DashboardLayout.css";
import "../../components/dashboard/Sidebar/Sidebar.css";

interface DashboardSkeletonProps {
    withSidebar?: boolean;
}

const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({ withSidebar = true }) => {
    const Content = (
        <div className="dashboard-inner-content" style={{ padding: "30px", width: "100%" }}>
            <div style={{ marginBottom: "30px" }}>
                <Skeleton height="40px" width="300px" style={{ marginBottom: "15px" }} />
                <Skeleton height="20px" width="200px" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "25px", marginBottom: "40px" }}>
                {[1, 2, 3].map((i) => (
                    <div key={i} style={{ padding: "24px", background: "white", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                            <Skeleton variant="circular" width={44} height={44} />
                            <Skeleton height="20px" width="70px" borderRadius="10px" />
                        </div>
                        <Skeleton height="36px" width="85%" style={{ marginBottom: "12px" }} />
                        <Skeleton height="18px" width="45%" borderRadius="8px" />
                    </div>
                ))}
            </div>

            <div style={{ padding: "28px", background: "white", borderRadius: "20px", border: "1px solid #f1f5f9", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
                <Skeleton height="32px" width="220px" style={{ marginBottom: "25px" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "18px", paddingBottom: "18px", borderBottom: "1px solid #f8fafc" }}>
                            <Skeleton variant="circular" width={48} height={48} />
                            <div style={{ flex: 1 }}>
                                <Skeleton height="20px" width="90%" style={{ marginBottom: "6px" }} />
                                <Skeleton height="16px" width="35%" />
                            </div>
                            <Skeleton height="40px" width="90px" borderRadius="12px" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (!withSidebar) return Content;

    return (
        <div className="dashboard-container">
            {/* Sidebar Skeleton */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-header" style={{ padding: "20px" }}>
                    <div className="user-info" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Skeleton variant="circular" width={50} height={50} />
                        <div style={{ flex: 1 }}>
                            <Skeleton height="18px" width="80%" style={{ marginBottom: "8px" }} />
                            <Skeleton height="14px" width="50%" />
                        </div>
                    </div>
                </div>

                <div className="sidebar-nav" style={{ padding: "24px" }}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                            <Skeleton variant="circular" width={24} height={24} />
                            <Skeleton height="20px" width="65%" borderRadius="6px" />
                        </div>
                    ))}
                </div>

                <div className="sidebar-footer" style={{ padding: "24px", marginTop: "auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <Skeleton variant="circular" width={24} height={24} />
                        <Skeleton height="20px" width="55%" borderRadius="6px" />
                    </div>
                </div>
            </aside>

            {/* Main Content Skeleton */}
            <main className="dashboard-content">
                {Content}
            </main>
        </div>
    );
};

export default DashboardSkeleton;
