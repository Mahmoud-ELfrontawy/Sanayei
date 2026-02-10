import React, { useState, useEffect } from "react";
import type { PortfolioItem } from "../../craftsmanData"; // ✅

interface Props {
  portfolio: PortfolioItem[];
}

const PortfolioTab: React.FC<Props> = ({ portfolio }) => {
  const allWorks = portfolio || [];

  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerPage(1);
      } else {
        setItemsPerPage(6);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const totalPages = Math.ceil(allWorks.length / itemsPerPage);
  const currentWorks = allWorks.slice(
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

  if (allWorks.length === 0) return <p>لا توجد أعمال مضافة في المعرض.</p>;

  return (
    <div>
      <div
        className="portfolio-grid fade-enter"
        key={currentPage}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {currentWorks.map((work) => (
          <div key={work.id} className="portfolio-item">
            <img src={work.imageUrl} alt={work.title} />
            <div className="portfolio-overlay">
              <span>{work.title}</span>
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

export default PortfolioTab;
