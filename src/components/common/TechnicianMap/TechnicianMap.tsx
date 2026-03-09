import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Polyline, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import type { Technician } from '../../../constants/technician';
import { getAvatarUrl } from '../../../utils/imageUrl';

interface TechnicianMapProps {
    technicians: Technician[];
    userLocation: { lat: number, lng: number } | null;
}

// Component to handle map center updates
const ChangeView: React.FC<{ center: [number, number] }> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center[0] && center[1]) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const TechnicianMap: React.FC<TechnicianMapProps> = ({ technicians, userLocation }) => {
    const navigate = useNavigate();

    // Default center (Egypt) if userLocation is null
    const defaultCenter: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [30.0444, 31.2357];

    // Distance Calculation (Haversine)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    return (
        <div className="technician-map-wrapper">
            <MapContainer
                center={defaultCenter}
                zoom={13}
                style={{ height: '500px', width: '100%', borderRadius: '12px' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {userLocation && (
                    <ChangeView center={[userLocation.lat, userLocation.lng]} />
                )}

                {/* User Location Marker (Guaranteed rendering) */}
                {userLocation && (
                    <CircleMarker
                        center={[Number(userLocation.lat), Number(userLocation.lng)]}
                        pathOptions={{
                            color: '#1d4ed8',
                            fillColor: '#3b82f6',
                            fillOpacity: 1,
                            weight: 4
                        }}
                        radius={12}
                    >
                        <Popup>موقعك الحالي</Popup>
                    </CircleMarker>
                )}

                {/* Technician Markers (Yellow/Orange to stand out) */}
                {technicians.filter(t => t.latitude && t.longitude).map(tech => {
                    const tLat = Number(tech.latitude);
                    const tLng = Number(tech.longitude);
                    const distance = userLocation
                        ? calculateDistance(userLocation.lat, userLocation.lng, tLat, tLng)
                        : null;

                    return (
                        <React.Fragment key={tech.id}>
                            {/* Connecting Line from User to Craftsman with Distance Label */}
                            {userLocation && (
                                <Polyline
                                    positions={[
                                        [userLocation.lat, userLocation.lng],
                                        [tLat, tLng]
                                    ]}
                                    pathOptions={{ color: '#3b82f6', weight: 5, opacity: 0.6, dashArray: '1, 10', lineCap: 'round' }}
                                >
                                    {distance !== null && (
                                        <Tooltip permanent direction="center" className="line-distance-label">
                                            <span>{distance.toFixed(1)} كم</span>
                                        </Tooltip>
                                    )}
                                </Polyline>
                            )}

                            <CircleMarker
                                center={[tLat, tLng]}
                                pathOptions={{ color: '#eab308', fillColor: '#eab308', fillOpacity: 0.9, weight: 2 }}
                                radius={15}
                            >

                                <Popup className="tech-popup">
                                    <div className="popup-content">
                                        <img
                                            src={getAvatarUrl(tech.profile_photo, tech.name)}
                                            alt={tech.name}
                                            className="popup-avatar"
                                        />
                                        <h4>{tech.name}</h4>
                                        <p>{tech.service?.name}</p>

                                        {tech.distance !== undefined && (
                                            <p className="popup-distance">يبعد عنك: {Number(tech.distance).toFixed(2)} كم</p>
                                        )}

                                        <div className="popup-actions" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                            <button
                                                onClick={() => navigate('/request-service', { state: { serviceId: tech.service?.id, workerId: tech.id } })}
                                                className="btn-view-profile"
                                                style={{ backgroundColor: '#10b981', color: 'white', flex: 1 }}
                                            >
                                                طلب خدمة الآن
                                            </button>
                                            <button
                                                onClick={() => navigate(`/craftsman/${tech.id}`)}
                                                className="btn-view-profile"
                                                style={{ backgroundColor: '#eab308', color: 'white', flex: 1 }}
                                            >
                                                الملف الشخصي
                                            </button>
                                        </div>
                                    </div>
                                </Popup>
                            </CircleMarker>
                        </React.Fragment>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default TechnicianMap;
