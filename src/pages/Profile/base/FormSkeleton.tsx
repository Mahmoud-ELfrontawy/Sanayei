import React from "react";
import Skeleton from "../../../components/common/Skeleton/Skeleton";
import "./Profile.css";

const FormSkeleton: React.FC = () => {
    return (
        <div className="profile-edit-form" style={{ padding: "20px" }}>
            <div className="profile-header-skeleton" style={{ textAlign: "center", marginBottom: "30px" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                    <Skeleton variant="circular" width={120} height={120} />
                    <div style={{ position: "absolute", bottom: 0, right: 0 }}>
                        <Skeleton variant="circular" width={32} height={32} />
                    </div>
                </div>
                <Skeleton height="24px" width="150px" style={{ margin: "15px auto 0" }} />
            </div>

            <div className="form-sections-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", marginBottom: "30px" }}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="form-group-skeleton">
                        <Skeleton height="18px" width="100px" style={{ marginBottom: "10px" }} />
                        <Skeleton height="50px" />
                    </div>
                ))}
            </div>

            <div className="location-section-skeleton" style={{ marginBottom: "30px" }}>
                <Skeleton height="24px" width="180px" style={{ marginBottom: "15px" }} />
                <Skeleton height="300px" />
            </div>

            <div className="footer-actions-skeleton" style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
                <Skeleton height="50px" width="200px" />
                <Skeleton height="50px" width="150px" />
            </div>
        </div>
    );
};

export default FormSkeleton;
