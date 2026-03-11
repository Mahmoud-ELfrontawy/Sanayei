import React, { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Polyline, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import type { Technician } from '../../../constants/technician';
import { getAvatarUrl } from '../../../utils/imageUrl';
import './TechnicianMap.css';

interface TechnicianMapProps {
    technicians: Technician[];
    userLocation: { lat: number, lng: number } | null;
}

// Component to handle automatic map bounds adjustment to show all parties
const AutoFitBounds: React.FC<{ userLocation: { lat: number, lng: number } | null, technicians: Technician[] }> = ({ userLocation, technicians }) => {
    const map = useMap();

    const handleFit = () => {
        const points: L.LatLngExpression[] = [];
        
        if (userLocation) {
            points.push([userLocation.lat, userLocation.lng]);
        }
        
        technicians.forEach(tech => {
            if (tech.latitude && tech.longitude) {
                points.push([Number(tech.latitude), Number(tech.longitude)]);
            }
        });

        if (points.length > 1) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { 
                padding: [70, 70], 
                maxZoom: 15,
                animate: true,
                duration: 1.5
            });
        } else if (points.length === 1) {
            map.setView(points[0], 13, { animate: true });
        }
    };

    // Initial fit and on data change
    useEffect(() => {
        handleFit();
    }, [userLocation, technicians, map]);

    // Periodic check to return view if user wandered off to a blank area
    useEffect(() => {
        const interval = setInterval(() => {
            if (technicians.length === 0) return;

            const currentBounds = map.getBounds();
            const anyTechVisible = technicians.some(tech => {
                if (tech.latitude && tech.longitude) {
                    return currentBounds.contains(L.latLng(Number(tech.latitude), Number(tech.longitude)));
                }
                return false;
            });

            // If no technician is in the current viewport, bring the view back
            if (!anyTechVisible) {
                handleFit();
            }
        }, 4000); // Check every 4 seconds

        return () => clearInterval(interval);
    }, [map, technicians, userLocation]);

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

                <AutoFitBounds userLocation={userLocation} technicians={technicians} />

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

                                        <div className="popup-actions">
                                            <button
                                                onClick={() => navigate('/request-service', { state: { serviceId: tech.service?.id, workerId: tech.id } })}
                                                className="btn-popup btn-request"
                                            >
                                                طلب خدمة الآن
                                            </button>
                                            <button
                                                onClick={() => navigate(`/craftsman/${tech.id}`)}
                                                className="btn-popup btn-profile"
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
