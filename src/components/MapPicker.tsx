import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { FaLocationArrow } from "react-icons/fa";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

const LocationMarker = ({ onChange }: { onChange: MapPickerProps["onChange"] }) => {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map]);

  return null;
};

const MapPicker = ({ latitude, longitude, onChange }: MapPickerProps) => {
  const [locating, setLocating] = useState(false);
  const safeLat = latitude || 30.0444;
  const safeLng = longitude || 31.2357;

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  return (
    <div className="map-picker-container" style={{ height: "100%", width: "100%", position: "relative" }}>
      <button
        type="button"
        onClick={handleLocateMe}
        className="locate-me-btn"
        disabled={locating}
        title="تحديد موقعي الحالي"
      >
        <FaLocationArrow />
        {locating ? "جاري التحديد..." : "موقعي الحالي"}
      </button>

      <MapContainer
        center={[safeLat, safeLng]}
        zoom={13}
        style={{ height: "400px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {latitude && longitude && (
          <Marker position={[latitude, longitude]} icon={markerIcon} />
        )}

        <LocationMarker onChange={onChange} />
        <RecenterMap lat={safeLat} lng={safeLng} />
      </MapContainer>

      <style>{`
        .map-picker-container {
          position: relative;
        }
        .locate-me-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 1000;
          background: #fff;
          border: 1px solid #ccc;
          padding: 8px 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 600;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          color: #2563eb;
        }
        .locate-me-btn:hover {
          background: #f3f4f6;
        }
        .locate-me-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default MapPicker;
