import React, { useRef } from 'react';
import { History, ChevronLeft, ChevronRight, Trash2, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';
import { clearRecentlyViewed } from '../../utils/recentHistory';

interface RecentlyViewedSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onClearHistory?: () => void;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  products,
  onSelectProduct,
  onClearHistory,
}) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  const handleClear = () => {
    clearRecentlyViewed();
    if (onClearHistory) onClearHistory();
  };

  return (
    <section className="mt-12 pt-8 border-t border-[#EAE3D2]/70">
      <div className="flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FAF6EE] border border-[#EAE3D2] text-[#801723]">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif-luxury text-lg sm:text-xl font-bold text-[#3B0C13]">
              Recently Viewed
            </h3>
            <p className="text-[11px] text-[#7A695C]">
              Quickly jump back to pieces you browsed earlier
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onClearHistory && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] font-semibold text-[#8C7A6B] hover:text-red-700 flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              title="Clear browsing history"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline">Clear History</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1">
            <button
              type="button"
              onClick={scrollLeft}
              className="w-7 h-7 rounded-full bg-white hover:bg-[#4A0E17] text-[#4A0E17] hover:text-[#DFBA67] border border-[#EAE3D2] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Scroll history left"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="w-7 h-7 rounded-full bg-white hover:bg-[#4A0E17] text-[#4A0E17] hover:text-[#DFBA67] border border-[#EAE3D2] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Scroll history right"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={carouselRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map(p => {
          const discountPercent = p.discountPercent || (p.originalPrice > p.price 
            ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100) 
            : 0);

          return (
            <div
              key={p.id}
              onClick={() => onSelectProduct(p)}
              className="w-[145px] sm:w-[165px] shrink-0 snap-start bg-white rounded-xl overflow-hidden border border-[#F0F0F0] hover:border-[#D4D4D4] hover:shadow-md transition-all duration-200 ease-out active:scale-[0.97] cursor-pointer group flex flex-col justify-between"
              style={{
                transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FBFBFB]">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                {discountPercent > 0 && (
                  <span className="absolute top-1.5 left-1.5 bg-[#388E3C] text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    {discountPercent}% off
                  </span>
                )}
              </div>

              <div className="p-2">
                <span className="text-[9px] uppercase font-bold text-[#878787] block truncate">
                  {p.subcategory || p.category}
                </span>
                <h4 className="text-[11px] font-medium text-[#212121] truncate group-hover:text-[#2874F0] transition-colors leading-tight mb-1">
                  {p.name}
                </h4>
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-[#212121]">
                    ₹{p.price.toLocaleString('en-IN')}
                  </span>
                  {p.originalPrice > p.price && (
                    <span className="text-[9px] text-[#878787] line-through">
                      ₹{p.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
