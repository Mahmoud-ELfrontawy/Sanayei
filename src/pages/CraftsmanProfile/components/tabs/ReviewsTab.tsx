import React, { useState, useEffect } from "react";
import { FaStar, FaQuoteRight } from "react-icons/fa6";

import defaultUserImg from "../../../../assets/images/image5.png";

import type { Review } from "../../../../types/craftsman";

interface Props {
  reviews: Review[];
}

const ReviewsTab: React.FC<Props> = ({ reviews }) => {
  const allReviews = reviews || [];

  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(0);

  // التجاوب
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else {
        setItemsPerPage(6);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(allReviews.length / itemsPerPage);
  const currentReviews = allReviews.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage,
  );

  // منطق السحب
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e: React.TouchEvent) =>
    setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentPage > 0) setCurrentPage((prev) => prev - 1);
    if (isRightSwipe && currentPage < totalPages - 1)
      setCurrentPage((prev) => prev + 1);
  };

  if (allReviews.length === 0) return <p className="no-reviews-msg">لا توجد تقييمات بعد.</p>;

  return (
    <div className="reviews-tab-wrapper">
      <div className="reviews-tab-header">
        <h3 className="reviews-tab-title">مراجعات العملاء</h3>
        <span className="reviews-count">({allReviews.length} تقييم)</span>
      </div>

      <div
        className="reviews-grid fade-enter"
        key={currentPage}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {currentReviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-quote-icon">
              <FaQuoteRight />
            </div>

            <div className="reviewer-info">
              <div className="reviewer-avatar">
                <img
                  src={review.clientImage || defaultUserImg}
                  alt={review.clientName}
                  className="reviewer-img"
                />
              </div>
              <div className="reviewer-meta">
                <h4 className="reviewer-name">{review.clientName}</h4>
                <div className="review-stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <FaStar
                      key={i}
                      color={i < review.rating ? "#FF8031" : "#e4e5e9"}
                    />
                  ))}
                </div>
              </div>
              {review.date && (
                <span className="review-date">{review.date}</span>
              )}
            </div>

            <div className="review-content">
              <p className="review-text">{review.comment}</p>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination-container">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`pagination-dot ${index === currentPage ? "active" : ""}`}
              onClick={() => setCurrentPage(index)}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsTab;
