import React from "react";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import "../CraftsmanProfile.css";

const ProfileSkeleton: React.FC = () => {
    return (
        <div className="profile-page-wrapper">
            {/* 1. Cover Skeleton */}
            <Skeleton height="350px" className="profile-cover" />

            <div className="profile-container">
                {/* 2. Sidebar Skeleton */}
                <aside className="profile-sidebar">
                    <div className="craftsman-card" style={{ gap: "1rem" }}>
                        <div className="craftsman-img-wrapper">
                            <Skeleton variant="circular" width={140} height={140} />
                        </div>
                        <Skeleton height="32px" width="70%" style={{ margin: "1rem auto 0.5rem" }} />
                        <Skeleton height="20px" width="50%" style={{ margin: "0 auto 1rem" }} />

                        <div className="craftsman-rating" style={{ justifyContent: "center", marginBottom: "1rem" }}>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} variant="circular" width={20} height={20} />
                            ))}
                        </div>

                        <Skeleton height="18px" width="40%" style={{ margin: "0 auto 1.5rem" }} />

                        <div className="card-actions" style={{ flexDirection: "column", gap: "10px" }}>
                            <Skeleton height="45px" />
                            <Skeleton height="45px" />
                        </div>
                    </div>
                </aside>

                {/* 3. Content Area Skeleton */}
                <main className="profile-content-area">
                    <div className="profile-tabs" style={{ display: "flex", gap: "2rem", marginBottom: "2rem", padding: "0 1rem" }}>
                        <Skeleton height="40px" width="80px" />
                        <Skeleton height="40px" width="80px" />
                        <Skeleton height="40px" width="80px" />
                        <Skeleton height="40px" width="80px" />
                    </div>

                    <div className="tab-content-wrapper" style={{ padding: "1rem" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            <div style={{ padding: "20px", border: "1px solid #eee", borderRadius: "12px" }}>
                                <Skeleton height="24px" width="40%" style={{ marginBottom: "15px" }} />
                                <Skeleton height="20px" width="100%" />
                            </div>
                            <div style={{ padding: "20px", border: "1px solid #eee", borderRadius: "12px" }}>
                                <Skeleton height="24px" width="40%" style={{ marginBottom: "15px" }} />
                                <Skeleton height="20px" width="100%" />
                            </div>
                        </div>
                        <Skeleton height="150px" style={{ marginTop: "20px" }} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfileSkeleton;
