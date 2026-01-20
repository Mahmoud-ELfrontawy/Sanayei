import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import { useEffect, useState } from "react";
import type { Technician } from "../../../constants/technician";

interface Props {
    technician: Technician;
}

const TechnicianCard: React.FC<Props> = ({ technician }) => {

    const [isFavorite, setIsFavorite] = useState(false);

    // اقرأ من localStorage أول ما الكارد يفتح
    useEffect(() => {
        const stored = JSON.parse(
            localStorage.getItem("favorites") || "[]"
        );

        setTimeout(() => {
            setIsFavorite(stored.includes(technician.id));
        }, 0);
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
        <article className="worker-card">

            {/* Favorite */}
            <button
                className="worker-fav"
                aria-label="favorite"
                onClick={toggleFavorite}
            >
                {isFavorite ? <FaHeart /> : <FaRegHeart />}
            </button>

            <div className="worker-media">
                <img
                    src={technician.work_photos || "/placeholder.jpg"}
                    alt={technician.name}
                    loading="lazy"
                />
            </div>

            <div className="worker-body">

                <span className="worker-tag">
                    {technician.service?.name}
                </span>

                <div className="worker-header">
                    <h3 className="worker-name-sanay">
                        {technician.name}
                    </h3>

                    <span className="worker-location">
                        ({technician.governorate?.name})
                    </span>
                </div>

                <p className="worker-bio">
                    {technician.description || "لا يوجد وصف"}
                </p>

                <div className="worker-price">
                    {technician.price_range
                        ? `من ${technician.price_range} جنيه`
                        : "السعر غير محدد"}
                </div>

                <div className="worker-meta">
                    <ul className="worker-stars">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <li
                                key={i}
                                className={
                                    i < Math.round(technician.rating || 0)
                                        ? "on"
                                        : ""
                                }
                            >
                                <FaStar />
                            </li>
                        ))}
                    </ul>

                    <span className="worker-reviews">
                        ({technician.reviews_count || 0})
                    </span>
                </div>

                <Link
                    to={`/technician/${technician.id}`}
                    className="service-link"
                >
                    طلب خدمة
                    <FaArrowRight className="service-arrow" />
                </Link>

            </div>
        </article>
    );
};

export default TechnicianCard;
