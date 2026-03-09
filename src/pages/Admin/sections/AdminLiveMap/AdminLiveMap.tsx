import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { adminApi } from '../../../../Api/admin/admin.api';
import { getAvatarUrl } from '../../../../utils/imageUrl';
import { FaUserFriends, FaHardHat } from 'react-icons/fa';
import './AdminLiveMap.css';

// Component to handle map center updates
const ChangeView: React.FC<{ center: [number, number], zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center[0] && center[1]) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
};

const AdminLiveMap: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [craftsmen, setCraftsmen] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [mapCenter, setMapCenter] = useState<[number, number]>([30.0444, 31.2357]); // EGYPT
    const [mapZoom, setMapZoom] = useState(6);

    useEffect(() => {
        const fetchLiveMapData = async () => {
            try {
                setError(null);
                const response = await adminApi.getLiveMapData();
                
                const resData = response.data;
                const fetchedUsers = resData?.data?.users || resData?.users || [];
                const fetchedCraftsmen = resData?.data?.craftsmen || resData?.craftsmen || [];

                setUsers(fetchedUsers);
                setCraftsmen(fetchedCraftsmen);

                // If we have some craftsmen or users, center map on the first one
                const firstEntity = fetchedCraftsmen[0] || fetchedUsers[0];
                if (firstEntity?.latitude && firstEntity?.longitude) {
                    setMapCenter([parseFloat(firstEntity.latitude), parseFloat(firstEntity.longitude)]);
                    setMapZoom(6);
                }
            } catch (err: any) {
                console.error("Failed to fetch live map data", err);
                const errMsg = err?.response?.data?.message || err?.message || "حدث خطأ غير معروف";
                setError(`تعذر تحميل بيانات الخريطة: ${errMsg}`);
            } finally {
                setLoading(false);
            }
        };

        fetchLiveMapData();
        
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchLiveMapData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && users.length === 0 && craftsmen.length === 0) {
        return <div className="admin-live-map-loading">جاري تحميل الخريطة...</div>;
    }

    if (error && users.length === 0 && craftsmen.length === 0) {
        return (
            <div className="admin-live-map-container" style={{ padding: '2rem', textAlign: 'center' }}>
                <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠️ خطأ في تحميل الخريطة</h2>
                <p style={{ color: '#64748b', fontSize: '1.2rem' }}>{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    style={{ marginTop: '2rem', padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem' }}
                >
                    تحديث الصفحة
                </button>
            </div>
        );
    }

    return (
        <div className="admin-live-map-container">
            <div className="admin-live-map-header">
                <h2>🌍 خريطة النظام المباشرة (Live Tracking)</h2>
                <div className="map-stats">
                    <div className="stat-badge craftsmen">
                        <FaHardHat />
                        صنايعية: {craftsmen.length}
                    </div>
                    <div className="stat-badge users">
                        <FaUserFriends />
                        مستخدمين: {users.length}
                    </div>
                </div>
            </div>

            <div className="map-wrapper">
                <MapContainer 
                    center={mapCenter} 
                    zoom={mapZoom} 
                    style={{ height: '70vh', width: '100%', borderRadius: '12px' }}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    <ChangeView center={mapCenter} zoom={mapZoom} />

                    {/* Users Markers (Blue) */}
                    {users.map(user => (
                        <React.Fragment key={`user-${user.id}`}>
                            {user.latitude && user.longitude && (
                                <CircleMarker 
                                    center={[Number(user.latitude), Number(user.longitude)]} 
                                    pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.8, weight: 3 }}
                                    radius={8}
                                >
                                    <Popup className="live-map-popup user-popup">
                                        <div className="popup-content">
                                            <img src={getAvatarUrl(user.profile_image, user.name)} alt={user.name} className="popup-avatar" />
                                            <h4>{user.name}</h4>
                                            <p>{user.phone}</p>
                                            <span className="popup-tag user">مستخدم</span>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            )}
                        </React.Fragment>
                    ))}

                    {/* Craftsmen Markers (Orange) */}
                    {craftsmen.map(tech => (
                        <React.Fragment key={`tech-${tech.id}`}>
                            {tech.latitude && tech.longitude && (
                                <CircleMarker 
                                    center={[Number(tech.latitude), Number(tech.longitude)]}
                                    pathOptions={{ color: '#eab308', fillColor: '#fbbf24', fillOpacity: 0.9, weight: 3 }}
                                    radius={12}
                                >
                                    <Popup className="live-map-popup craftsman-popup">
                                        <div className="popup-content">
                                            <img src={getAvatarUrl(tech.profile_photo, tech.name)} alt={tech.name} className="popup-avatar" />
                                            <h4>{tech.name}</h4>
                                            <p>{tech.phone}</p>
                                            <p>{tech.service?.name}</p>
                                            <span className="popup-tag craftsman">صنايعي</span>
                                        </div>
                                    </Popup>
                                </CircleMarker>
                            )}
                        </React.Fragment>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};

export default AdminLiveMap;
