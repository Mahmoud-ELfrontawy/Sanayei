import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaMapMarkerAlt, FaSync } from "react-icons/fa";

import { getNearestTechnicians } from "../../../../Api/technicians.api";
import { useLocation } from "../../../../hooks/useLocation";
import TechnicianCard from "../../../../components/common/TechniciansCard/TechnicianCard";
import type { Technician } from "../../../../constants/technician";
import "./NearestTechnicians.css";

import { useAuth } from "../../../../hooks/useAuth";

const NearestTechnicians: React.FC = () => {
    const { location: userGeoLocation, error: locationError, refreshLocation } = useLocation();
    const { user } = useAuth();
    const [selectedServiceId] = useState<number>(1); // Initial default service ID

    const effectiveLocation = React.useMemo(() => {
        if (user?.latitude && user?.longitude) {
            return { lat: Number(user.latitude), lng: Number(user.longitude) };
        }
        return userGeoLocation;
    }, [user, userGeoLocation]);

    const {
        data: technicians = [],
        isLoading: loading,
    } = useQuery({
        queryKey: ['nearest-technicians', effectiveLocation?.lat, effectiveLocation?.lng, selectedServiceId],
        queryFn: () => getNearestTechnicians(effectiveLocation!.lat, effectiveLocation!.lng, selectedServiceId),
        enabled: !!effectiveLocation,
    });

    if (locationError) {
        return (
            <div className="location-error-container">
                <FaMapMarkerAlt className="error-icon" />
                <p>يرجى تفعيل الموقع للعثور على أقرب صنايعي</p>
                <button onClick={refreshLocation} className="btn-refresh">
                    تفعيل الموقع <FaSync />
                </button>
            </div>
        );
    }

    if (!location) return null;

    return (
        <section className="nearest-section">
            <div className="nearest-container">
                <header className="nearest-header">
                    <h2 className="nearest-title">صنايعية قريبين منك</h2>
                    <p className="nearest-subtitle">
                        نعرض لك أفضل المحترفين في منطقتك الحالية
                    </p>
                </header>

                {loading && <div className="loading-spinner">جاري البحث...</div>}

                {!loading && technicians.length === 0 && (
                    <p className="no-techs">لا يوجد صنايعية متاحين في منطقتك حالياً</p>
                )}

                <div className="nearest-grid">
                    {technicians.slice(0, 10).map((tech: Technician) => (
                        <TechnicianCard key={tech.id} technician={tech} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default NearestTechnicians;
