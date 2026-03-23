import React, { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, Tooltip, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import type { Technician } from '../../../constants/technician';
import { getAvatarUrl } from '../../../utils/imageUrl';
import './TechnicianMap.css';

interface TechnicianMapProps {
    technicians: Technician[];
    userLocation: { lat: number, lng: number } | null;
    displayMode: "all" | "online" | "nearest";
    user?: any;
}

// Custom Marker Creator
const createMarkerIcon = (photoUrl: string | null | undefined, name: string, color: string, isUser = false) => {
    const avatar = getAvatarUrl(photoUrl, name);
    return L.divIcon({
        className: 'custom-marker-wrapper',
        html: `
            <div class="marker-container ${isUser ? 'user-marker' : ''}" style="border-color: ${color}">
                <img src="${avatar}" alt="${name}" />
                <div class="marker-pointer" style="background-color: ${color}"></div>
            </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48]
    });
};

const AutoFitBounds: React.FC<{ userLocation: { lat: number, lng: number } | null, technicians: Technician[] }> = ({ userLocation, technicians }) => {
    const map = useMap();

    useEffect(() => {
        const points: L.LatLngExpression[] = [];
        if (userLocation) points.push([userLocation.lat, userLocation.lng]);
        technicians.forEach(tech => {
            if (tech.latitude && tech.longitude) {
                points.push([Number(tech.latitude), Number(tech.longitude)]);
            }
        });

        if (points.length > 1) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [100, 100], maxZoom: 15 });
        } else if (points.length === 1) {
            map.setView(points[0], 13);
        }
    }, [userLocation, technicians, map]);

    return null;
};

const TechnicianMap: React.FC<TechnicianMapProps> = ({ technicians, userLocation, displayMode, user }) => {
    const navigate = useNavigate();

    const defaultCenter: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : [30.0444, 31.2357];

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    return (
        <div className="technician-map-wrapper">
            <MapContainer center={defaultCenter} zoom={13} style={{ height: '550px', width: '100%', borderRadius: '15px' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                <AutoFitBounds userLocation={userLocation} technicians={technicians} />

                {/* Logged in User Location (with photo and pulse) */}
                {userLocation && (
                    <React.Fragment>
                        <CircleMarker
                            center={[userLocation.lat, userLocation.lng]}
                            pathOptions={{
                                color: '#3b82f6',
                                fillColor: '#3b82f6',
                                fillOpacity: 0.2,
                                weight: 2,
                                className: 'user-location-pulse'
                            }}
                            radius={25}
                        />
                        <Marker
                            position={[userLocation.lat, userLocation.lng]}
                            icon={createMarkerIcon(
                                user?.avatar || user?.profile_photo || user?.profile_image, 
                                user?.name || "أنا", 
                                '#1d4ed8', 
                                true
                            )}
                            zIndexOffset={1000}
                        >
                            <Popup>
                                <div className="tracking-popup-content" style={{ textAlign: 'center' }}>
                                    <strong>موقعي</strong>
                                    <span>موقعك المحدد في الملف الشخصي</span>
                                </div>
                            </Popup>
                        </Marker>
                    </React.Fragment>
                )}

                {/* Technician Markers (with photos) */}
                {technicians.filter(t => t.latitude && t.longitude).map(tech => {
                    const tLat = Number(tech.latitude);
                    const tLng = Number(tech.longitude);
                    const isOnline = tech.is_online || (tech.last_seen && (new Date().getTime() - new Date(tech.last_seen).getTime() < 300000));
                    
                    const markerColor = isOnline ? '#22c55e' : '#f59e0b';
                    const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, tLat, tLng) : null;

                    return (
                        <React.Fragment key={tech.id}>
                            {/* Stylized connectivity line from user to craftsman */}
                            {userLocation && (displayMode === 'nearest' || technicians.length < 5) && (
                                <Polyline
                                    positions={[[userLocation.lat, userLocation.lng], [tLat, tLng]]}
                                    pathOptions={{
                                        color: markerColor,
                                        weight: 4,
                                        opacity: 0.6,
                                        dashArray: '8, 12',
                                        className: 'connecting-line-stylized'
                                    }}
                                >
                                    {distance !== null && (
                                        <Tooltip permanent direction="center" className="line-distance-label">
                                            <span>{distance.toFixed(1)} كم</span>
                                        </Tooltip>
                                    )}
                                </Polyline>
                            )}

                            <Marker
                                position={[tLat, tLng]}
                                icon={createMarkerIcon(tech.profile_photo, tech.name, markerColor)}
                                zIndexOffset={500}
                            >
                                <Popup className="tech-popup">
                                    <div className="popup-content">
                                        <div style={{ position: 'relative', display: 'inline-block' }}>
                                            <img
                                                src={getAvatarUrl(tech.profile_photo, tech.name)}
                                                alt={tech.name}
                                                className="popup-avatar"
                                                style={{ borderColor: markerColor }}
                                            />
                                            {isOnline && <span className="online-badge-map" />}
                                        </div>
                                        <h4>{tech.name}</h4>
                                        <p>{tech.service?.name}</p>
                                        
                                        {distance !== null && <p className="popup-distance">{distance.toFixed(2)} كم</p>}

                                        <div className="popup-actions">
                                            <button onClick={() => navigate('/request-service', { state: { serviceId: tech.service?.id, workerId: tech.id } })} className="btn-popup btn-request">طلب خدمة</button>
                                            <button onClick={() => navigate(`/craftsman/${tech.id}`)} className="btn-popup btn-profile">ملف</button>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        </React.Fragment>
                    );
                })}
            </MapContainer>
        </div>
    );
};

export default TechnicianMap;
