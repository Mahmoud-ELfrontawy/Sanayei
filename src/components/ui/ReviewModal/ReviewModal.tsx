import React, { useState } from "react";
import { FaStar, FaTimes } from "react-icons/fa";
import { submitReview } from "../../../Api/reviews.api";
import { toast } from "react-toastify";
import "./ReviewModal.css";

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    craftsmanId: number;
    craftsmanName: string;
    orderId: number;
    onSuccess?: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
    isOpen,
    onClose,
    craftsmanId,
    craftsmanName,
    orderId,
    onSuccess
}) => {
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.warn("الرجاء اختيار تقييم أولاً");
            return;
        }

        try {
            setSubmitting(true);
            await submitReview({
                craftsman_id: craftsmanId,
                service_request_id: orderId,
                rating,
                comment,
            });
            toast.success("تم إرسال تقييمك بنجاح! شكراً لك.");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "فشل إرسال التقييم");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="review-modal-overlay" onClick={onClose}>
            <div className="review-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="review-modal-header">
                    <h3>تقييم الخدمة</h3>
                    <p>أخبرنا عن تجربتك مع <span>{craftsmanName}</span></p>
                </div>

                <div className="rating-stars-container">
                    {[...Array(5)].map((_, index) => {
                        const ratingValue = index + 1;
                        return (
                            <label key={index}>
                                <input
                                    type="radio"
                                    name="rating"
                                    value={ratingValue}
                                    onClick={() => setRating(ratingValue)}
                                />
                                <FaStar
                                    className="star"
                                    color={ratingValue <= (hover || rating) ? "#FFC107" : "#e4e5e9"}
                                    size={32}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                />
                            </label>
                        );
                    })}
                </div>

                <div className="review-form-group">
                    <label>تعليقك (اختياري)</label>
                    <textarea
                        placeholder="كيف كانت جودة العمل؟ المواعيد؟ التعامل؟"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                    />
                </div>

                <div className="review-modal-actions">
                    <button
                        className="submit-review-btn"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
                    </button>
                    <button className="cancel-review-btn" onClick={onClose}>
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
