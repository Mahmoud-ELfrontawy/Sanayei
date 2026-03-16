import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FaUser, FaHardHat } from 'react-icons/fa';
import './OrderTrackingMap.css';

interface OrderTrackingMapProps {
    userLat: number | string | null;
    userLng: number | string | null;
    craftsmanLat: number | string | null;
    craftsmanLng: number | string | null;
    userName?: string;
    craftsmanName?: string;
}

const ChangeView: React.FC<{ bounds: [[number, number], [number, number]] | null }> = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
    }, [bounds, map]);
    return null;
};

const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({
    userLat, userLng, craftsmanLat, craftsmanLng, userName = 'العميل', craftsmanName = 'الصنايعي'
}) => {
    const [bounds, setBounds] = useState<[[number, number], [number, number]] | null>(null);
    const [liveLoc, setLiveLoc] = useState<[number, number] | null>(null);

    const uLat = Number(userLat);
    const uLng = Number(userLng);
    const cLat = Number(craftsmanLat);
    const cLng = Number(craftsmanLng);

    const hasUserLoc = !isNaN(uLat) && !isNaN(uLng) && uLat !== 0;
    const hasCraftsmanLoc = !isNaN(cLat) && !isNaN(cLng) && cLat !== 0;

    // 1. Live Tracking Logic
    useEffect(() => {
        if (!navigator.geolocation) return;

        const handleWatch = () => {
            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    setLiveLoc([pos.coords.latitude, pos.coords.longitude]);
                },
                (err) => {
                    // Stop watching if denied or blocked
                    if (err.code === 1) {
                        navigator.geolocation.clearWatch(watchId);
                    } else if (err.code !== 3) { // Ignore timeout (3)
                        console.error("Live tracking error:", err);
                    }
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
            return watchId;
        };

        let watchId: number | null = null;

        // Check permissions first to avoid browser-level console spam
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' as PermissionName }).then(status => {
                if (status.state !== 'denied') {
                    watchId = handleWatch();
                }
                
                status.onchange = () => {
                    if (status.state === 'denied' && watchId !== null) {
                        navigator.geolocation.clearWatch(watchId);
                        watchId = null;
                    } else if (status.state !== 'denied' && watchId === null) {
                        watchId = handleWatch();
                    }
                };
            }).catch(() => {
                // Fallback for browsers that don't support the permissions API
                watchId = handleWatch();
            });
        } else {
            watchId = handleWatch();
        }

        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    // 2. Bounds Calculation
    useEffect(() => {
        const points: [number, number][] = [];
        if (hasUserLoc) points.push([uLat, uLng]);
        if (hasCraftsmanLoc) points.push([cLat, cLng]);
        if (liveLoc) points.push(liveLoc);

        if (points.length >= 2) {
            const minLat = Math.min(...points.map(p => p[0]));
            const maxLat = Math.max(...points.map(p => p[0]));
            const minLng = Math.min(...points.map(p => p[1]));
            const maxLng = Math.max(...points.map(p => p[1]));
            setBounds([[minLat, minLng], [maxLat, maxLng]]);
        }
    }, [hasUserLoc, hasCraftsmanLoc, liveLoc, uLat, uLng, cLat, cLng]);

    // 3. Distance Calculation (Haversine)
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };


    if (!hasUserLoc && !hasCraftsmanLoc && !liveLoc) {
        return (
            <div className="tracking-map-empty">
                <p>جاري تحميل بيانات الموقع...</p>
            </div>
        );
    }

    // Default center priority: Live > Craftsman > User
    const center: [number, number] = liveLoc || (hasCraftsmanLoc ? [cLat, cLng] : [uLat, uLng]);

    return (
        <div className="order-tracking-map-wrapper">
            <MapContainer center={center} zoom={13} style={{ height: '350px', width: '100%', borderRadius: '12px', zIndex: 1 }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />

                <ChangeView bounds={bounds} />

                {/* Live Location Marker (Pulsing) */}
                {liveLoc && (
                    <CircleMarker
                        center={liveLoc}
                        pathOptions={{
                            color: '#10b981',
                            fillColor: '#10b981',
                            fillOpacity: 1,
                            weight: 2,
                            className: 'live-location-pulse'
                        }}
                        radius={8}
                    >
                        <Popup className="tracking-popup live">
                            <div className="tracking-popup-content">
                                <strong>موقعي الحالي</strong>
                                <span>أنت هنا الآن</span>
                            </div>
                        </Popup>
                    </CircleMarker>
                )}

                {/* Craftsman Marker */}
                {hasCraftsmanLoc && (
                    <CircleMarker
                        center={[cLat, cLng]}
                        pathOptions={{ color: '#eab308', fillColor: '#fbbf24', fillOpacity: 0.9, weight: 3 }}
                        radius={12}
                    >
                        <Popup className="tracking-popup craftsman">
                            <div className="tracking-popup-content">
                                <FaHardHat size={20} color="#eab308" />
                                <strong>{craftsmanName}</strong>
                                <span>موقع الصنايعي الحالي</span>
                            </div>
                        </Popup>
                    </CircleMarker>
                )}

                {/* User/Service Marker (Target) */}
                {hasUserLoc && (
                    <CircleMarker
                        center={[uLat, uLng]}
                        pathOptions={{ color: '#ef4444', fillColor: '#fee2e2', fillOpacity: 0.9, weight: 3 }}
                        radius={12}
                    >
                        <Popup className="tracking-popup user">
                            <div className="tracking-popup-content">
                                <FaUser size={20} color="#ef4444" />
                                <strong>{userName}</strong>
                                <span>موقع طلب الخدمة</span>
                            </div>
                        </Popup>
                    </CircleMarker>
                )}

                {/* Route Line (Between Tech and Target) with Distance Label */}
                {hasCraftsmanLoc && (hasUserLoc || liveLoc) && (() => {
                    const targetLat = hasUserLoc ? uLat : liveLoc![0];
                    const targetLng = hasUserLoc ? uLng : liveLoc![1];
                    const d = calculateDistance(targetLat, targetLng, cLat, cLng);

                    return (
                        <Polyline
                            positions={[[targetLat, targetLng], [cLat, cLng]]}
                            pathOptions={{ color: '#3b82f6', weight: 6, opacity: 0.8, dashArray: '1, 12', lineCap: 'round' }}
                        >
                            <Tooltip permanent direction="center" className="line-distance-label">
                                <span>{d.toFixed(2)} كم</span>
                            </Tooltip>
                        </Polyline>
                    );
                })()}

                {/* Secondary Line (Viewer to Service) ONLY if both exist and different */}
                {liveLoc && hasUserLoc && (
                    <Polyline
                        positions={[liveLoc, [uLat, uLng]]}
                        pathOptions={{ color: '#10b981', weight: 3, opacity: 0.4, dashArray: '5, 10' }}
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default OrderTrackingMap;
