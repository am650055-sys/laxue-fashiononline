import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Star, Sparkles, CheckCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CustomerReviewHighlight } from '../types';
import { StoryReviewViewerModal } from './StoryReviewViewerModal';

export const CustomerReviewsHighlights: React.FC = () => {
  const { customerReviews, activeReviewHighlight, openReviewHighlight, closeReviewHighlight } = useShop();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState<boolean>(false);
  const [canScrollRight, setCanScrollRight] = useState<boolean>(true);

  // Filter only published reviews and sort by displayOrder
  const publishedReviews = customerReviews
    .filter(r => r.published !== false)
    .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

  const checkScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 320;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
    setTimeout(checkScrollButtons, 350);
  };

  if (publishedReviews.length === 0) {
    return null;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#5B0F15]/10 text-[#5B0F15] flex items-center justify-center border border-[#C5A059]/40 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold tracking-tight text-[#3B0C13] uppercase font-serif-luxury flex items-center gap-1.5">
              <span>CUSTOMER REVIEWS & STORIES</span>
              <span className="text-[10px] font-sans font-bold bg-[#4A0E17] text-[#DFBA67] px-2 py-0.5 rounded-full border border-[#D4AF37]">
                ★ 4.9/5
              </span>
            </h2>
            <p className="text-[11px] text-[#7A695C] hidden sm:block">
              Tap any highlight to watch real unboxings, fitting reviews & customer photos
            </p>
          </div>
        </div>

        {/* Desktop Carousel Arrows */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="Scroll reviews left"
            className="w-7 h-7 rounded-full bg-white border border-[#EAE3D2] text-[#4A0E17] flex items-center justify-center hover:bg-[#FDFBF7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="Scroll reviews right"
            className="w-7 h-7 rounded-full bg-white border border-[#EAE3D2] text-[#4A0E17] flex items-center justify-center hover:bg-[#FDFBF7] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-2xs"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Story Highlights Horizontal Tray */}
      <div className="relative group">
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollButtons}
          className="flex items-start gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-none scroll-smooth touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {publishedReviews.map((review) => {
            const hasVideo = review.media?.some(m => m.type === 'video');
            const mediaCount = review.media?.length || 1;

            return (
              <button
                key={review.id}
                onClick={() => openReviewHighlight(review)}
                className="flex flex-col items-center gap-1.5 shrink-0 group/item focus:outline-none transition-transform active:scale-95 cursor-pointer max-w-[84px] sm:max-w-[96px]"
              >
                {/* Instagram Highlight Ring Container */}
                <div className="relative p-[2.5px] rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#5B0F15] group-hover/item:scale-105 transition-transform duration-200 shadow-md">
                  {/* Inner White Gap */}
                  <div className="p-[2px] bg-white rounded-full">
                    {/* Circle Cover Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-[#2D0B12] relative">
                      <img
                        src={review.coverImage || review.media?.[0]?.url}
                        alt={review.customerName}
                        loading="lazy"
                        className="w-full h-full object-cover object-top transition-transform duration-300 group-hover/item:scale-110"
                      />

                      {/* Video Play Badge Indicator */}
                      {hasVideo && (
                        <div className="absolute bottom-1 right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black/75 text-[#DFBA67] flex items-center justify-center border border-[#DFBA67]/60 shadow-xs">
                          <Play className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current ml-0.5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Multiple Media Badge */}
                  {mediaCount > 1 && (
                    <div className="absolute -top-1 -right-1 bg-[#4A0E17] text-[#DFBA67] text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-[#D4AF37] shadow-xs">
                      {mediaCount}
                    </div>
                  )}
                </div>

                {/* Customer Name Label */}
                <div className="text-center w-full px-0.5">
                  <p className="text-xs font-semibold text-[#3B0C13] truncate tracking-tight group-hover/item:text-[#8B1D2C] transition-colors flex items-center justify-center gap-0.5">
                    <span>{review.customerName}</span>
                  </p>
                  <div className="flex items-center justify-center gap-0.5 text-[#C5A059] mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-2 h-2 ${
                          i < (review.rating || 5)
                            ? 'fill-[#C5A059] text-[#C5A059]'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Story Viewer Fullscreen Modal */}
      {activeReviewHighlight && (
        <StoryReviewViewerModal
          reviews={publishedReviews}
          initialReviewId={activeReviewHighlight.id}
          onClose={closeReviewHighlight}
        />
      )}
    </section>
  );
};
