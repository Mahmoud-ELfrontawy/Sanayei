import React, { useState } from "react";
import { FaStar, FaTimes } from "react-icons/fa";
import { submitProductReview } from "../../../Api/auth/Company/storeManagement.api";
import { toast } from "react-toastify";
import "./ProductReviewModal.css";

interface ProductReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    productId: number;
    productName: string;
    orderId: number;
    onSuccess?: () => void;
}

const ProductReviewModal: React.FC<ProductReviewModalProps> = ({
    isOpen,
    onClose,
    productId,
    productName,
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
            await submitProductReview({
                product_id: productId,
                order_id: orderId,
                rating,
                comment,
            });
            toast.success("تم إرسال تقييمك بنجاح! شكراً لك.");
            if (onSuccess) onSuccess();
            onClose();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || "فشل إرسال التقييم";
            toast.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-review-modal-overlay" onClick={onClose}>
            <div className="p-review-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="p-close-btn" onClick={onClose}>
                    <FaTimes />
                </button>

                <div className="p-review-modal-header">
                    <h3>تقييم المنتج</h3>
                    <p>أخبرنا عن رأيك في <span>{productName}</span></p>
                </div>

                <div className="p-rating-stars-container">
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
                                    className="p-star"
                                    color={ratingValue <= (hover || rating) ? "#FFC107" : "#e4e5e9"}
                                    size={32}
                                    onMouseEnter={() => setHover(ratingValue)}
                                    onMouseLeave={() => setHover(0)}
                                />
                            </label>
                        );
                    })}
                </div>

                <div className="p-review-form-group">
                    <label>تعليقك (اختياري)</label>
                    <textarea
                        placeholder="ماذا أعجبك في هذا المنتج؟"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                    />
                </div>

                <div className="p-review-modal-actions">
                    <button
                        className="p-submit-review-btn"
                        onClick={handleSubmit}
                        disabled={submitting}
                    >
                        {submitting ? "جاري الإرسال..." : "إرسال التقييم"}
                    </button>
                    <button className="p-cancel-review-btn" onClick={onClose}>
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductReviewModal;
