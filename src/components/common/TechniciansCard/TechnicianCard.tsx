import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAvatarUrl } from "../../../utils/imageUrl";
import { formatTimeAgo } from "../../../utils/timeAgo";
import type { Technician } from "../../../constants/technician";
import "./TechnicianCard.css";

interface Props {
    technician: Technician;
}

const TechnicianCard: React.FC<Props> = ({ technician }) => {

    const [isFavorite, setIsFavorite] = useState(false);

    // Load favorite status
    useEffect(() => {
        const stored = JSON.parse(
            localStorage.getItem("favorites") || "[]"
        );
        setIsFavorite(stored.includes(technician.id));
    }, [technician.id]);

    const toggleFavorite = () => {
        const stored: number[] = JSON.parse(
            localStorage.getItem("favorites") || "[]"
        );

        let updated;

        if (stored.includes(technician.id)) {
            updated = stored.filter(id => id !== technician.id);
            setIsFavorite(false);
        } else {
            updated = [...stored, technician.id];
            setIsFavorite(true);
        }

        localStorage.setItem("favorites", JSON.stringify(updated));
    };

    return (
        <article className="technician-card">

            {/* Favorite Button */}
            <button
                className="fav-btn"
                onClick={toggleFavorite}
                aria-label="Add to favorites"
            >
                {isFavorite ? <FaHeart /> : <FaRegHeart />}
            </button>

            {/* Profile Image (Floating Circle) */}
            <div className="technician-image-wrapper">
                <img
                    src={getAvatarUrl(technician.profile_photo, technician.name)}
                    alt={technician.name}
                    className="technician-image"
                    loading="lazy"
                    onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/default-avatar.png";
                    }}
                />
            </div>

            {/* Content Body */}
            <h3 className="technician-name">
                {technician.name}
            </h3>

            <span className="technician-service">
                {technician.service?.name || "خدمة عامة"}
            </span>

            {/* Online Status */}
            <div className={`technician-status ${technician.is_online ? 'online' : ''}`}>
                {technician.is_online ? (
                    <>
                        <span className="status-dot online"></span>
                        <span style={{ color: '#22c55e', fontWeight: 'bold' }}>متصل الآن</span>
                    </>
                ) : (
                    <>
                        {technician.last_seen && formatTimeAgo(technician.last_seen) === "الآن" ? (
                            <>
                                <span className="status-dot online"></span>
                                <span style={{ color: '#22c55e', fontWeight: 'bold' }}>متصل الآن</span>
                            </>
                        ) : (
                            <>
                                <span className="status-dot offline"></span>
                                {technician.last_seen
                                    ? `آخر ظهور ${formatTimeAgo(technician.last_seen)}`
                                    : "غير متصل"}
                            </>
                        )}
                    </>
                )}
            </div>

            <p className="technician-bio">
                {technician.description || "لا يوجد وصف متاح لهذا الصنايعي حالياً."}
            </p>

            {/* Meta Info */}
            <div className="technician-meta">
                <div className="meta-item">
                    <FaStar className="star-icon" />
                    <span>
                        {technician.rating || 0} ({technician.reviews_count || 0})
                    </span>
                </div>
                <div className="meta-item">
                    <span>
                        {technician.price_range
                            ? `${technician.price_range} ج.م`
                            : "السعر غير محدد"}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="technician-actions">
                <Link
                    to="/request-service"
                    state={{
                        industrial_type: technician.id.toString(),
                        industrial_name: technician.name,
                        service_type: technician.service?.id?.toString(),
                        service_name: technician.service?.name,
                        price: technician.price_range
                            ? `من ${technician.price_range} جنيه`
                            : "السعر غير محدد",
                    }}
                    className="btn-tech-request"
                >
                    طلب خدمة
                </Link>

                <Link
                    to={`/craftsman/${technician.id}`}
                    className="btn-tech-profile"
                >
                    الملف الشخصي
                </Link>
            </div>
        </article>
    );
};

export default TechnicianCard;
