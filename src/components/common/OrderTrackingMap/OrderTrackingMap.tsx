import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
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

    const uLat = Number(userLat);
    const uLng = Number(userLng);
    const cLat = Number(craftsmanLat);
    const cLng = Number(craftsmanLng);

    const hasUserLoc = !isNaN(uLat) && !isNaN(uLng) && uLat !== 0;
    const hasCraftsmanLoc = !isNaN(cLat) && !isNaN(cLng) && cLat !== 0;

    useEffect(() => {
        if (hasUserLoc && hasCraftsmanLoc) {
            setBounds([
                [uLat, uLng],
                [cLat, cLng]
            ]);
        }
    }, [hasUserLoc, hasCraftsmanLoc, uLat, uLng, cLat, cLng]);

    if (!hasUserLoc && !hasCraftsmanLoc) {
        return (
            <div className="tracking-map-empty">
                <p>بيانات الموقع الجغرافي غير متوفرة حالياً</p>
            </div>
        );
    }

    // Default center if only one is available
    const center: [number, number] = hasCraftsmanLoc ? [cLat, cLng] : [uLat, uLng];

    return (
        <div className="order-tracking-map-wrapper">
            <MapContainer center={center} zoom={13} style={{ height: '350px', width: '100%', borderRadius: '12px', zIndex: 1 }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                />

                <ChangeView bounds={bounds} />

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

                {/* User Marker */}
                {hasUserLoc && (
                    <CircleMarker 
                        center={[uLat, uLng]}
                        pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.9, weight: 3 }}
                        radius={12}
                    >
                        <Popup className="tracking-popup user">
                            <div className="tracking-popup-content">
                                <FaUser size={20} color="#0ea5e9" />
                                <strong>{userName}</strong>
                                <span>موقع طلب الخدمة (العميل)</span>
                            </div>
                        </Popup>
                    </CircleMarker>
                )}

                {/* Route Line */}
                {hasUserLoc && hasCraftsmanLoc && (
                    <Polyline 
                        positions={[[uLat, uLng], [cLat, cLng]]} 
                        pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10' }} 
                    />
                )}
            </MapContainer>
        </div>
    );
};

export default OrderTrackingMap;
