import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { getAvatarUrl } from "../../../utils/imageUrl";
import { formatTimeAgo } from "../../../utils/timeAgo";
import type { Technician } from "../../../constants/technician";
import "./TechnicianCard.css";

interface Props {
    technician: Technician;
}

const TechnicianCard: React.FC<Props> = ({ technician }) => {
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
        setIsFavorite(stored.includes(technician.id));
    }, [technician.id]);

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const stored: number[] = JSON.parse(localStorage.getItem("favorites") || "[]");
        let updated;
        if (stored.includes(technician.id)) {
            updated = stored.filter((id) => id !== technician.id);
            setIsFavorite(false);
        } else {
            updated = [...stored, technician.id];
            setIsFavorite(true);
        }
        localStorage.setItem("favorites", JSON.stringify(updated));
    };

    const isOnline =
        technician.is_online ||
        (technician.last_seen && formatTimeAgo(technician.last_seen) === "الآن");

    return (
        <article className="tech-card">

            {/* ── Gradient Banner ── */}
            <div className="tech-card__banner">
                <button
                    className={`tech-card__fav ${isFavorite ? "active" : ""}`}
                    onClick={toggleFavorite}
                    aria-label="إضافة للمفضلة"
                >
                    {isFavorite ? <FaHeart /> : <FaRegHeart />}
                </button>
            </div>

            {/* ── Card Body ── */}
            <div className="tech-card__body">

                {/* Avatar + Name row — overlaps banner */}
                <div className="tech-card__header">
                    <div className={`tech-card__avatar-wrap ${isOnline ? "online" : ""}`}>
                        <img
                            src={getAvatarUrl(technician.profile_photo, technician.name)}
                            alt={technician.name}
                            className="tech-card__avatar"
                            loading="lazy"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = getAvatarUrl(null, technician.name);
                            }}
                        />
                    </div>
                    <div className="tech-card__info-col">
                        <h3 className="tech-card__name">{technician.name}</h3>
                        <div className={`tech-card__status ${isOnline ? "online" : ""}`}>
                            <span className={`tech-card__status-dot ${isOnline ? "online" : "offline"}`} />
                            {isOnline
                                ? "متصل الآن"
                                : technician.last_seen
                                    ? `آخر ظهور ${formatTimeAgo(technician.last_seen)}`
                                    : "غير متصل"}
                        </div>
                    </div>
                </div>

                {/* Service + Rating tags */}
                <div className="tech-card__tags">
                    <span className="tech-card__service">
                        {technician.service?.name || "خدمة عامة"}
                    </span>
                    <div className="tech-card__rating">
                        <FaStar className="tech-card__star" />
                        <span>{technician.rating || "5.0"}</span>
                        <span style={{ color: '#92400e', opacity: 0.6, fontWeight: 500 }}>
                            ({technician.reviews_count || 0})
                        </span>
                    </div>
                </div>

                {/* Bio */}
                <p className="tech-card__bio">
                    {technician.description || "لا يوجد وصف متاح لهذا الصنايعي حالياً."}
                </p>

                {/* Footer: price + actions */}
                <div className="tech-card__footer">
                    <div className="tech-card__price-row">
                        <span className="tech-card__price-label">السعر:</span>
                        <span className="tech-card__price">
                            {technician.price_range
                                ? `${technician.price_range} ج.م`
                                : "عند الاتفاق"}
                        </span>
                    </div>
                    <div className="tech-card__actions">
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
                            className="tech-card__btn tech-card__btn--primary"
                        >
                            طلب خدمة
                        </Link>
                        <Link
                            to={`/craftsman/${technician.id}`}
                            className="tech-card__btn tech-card__btn--outline"
                        >
                            الملف الشخصي
                        </Link>
                    </div>
                </div>

            </div>
        </article>
    );
};

export default TechnicianCard;
