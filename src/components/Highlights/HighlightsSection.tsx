import React, { useRef } from 'react';
import { useShop } from '../../context/ShopContext';
import { Highlight } from '../../types';
import { ChevronLeft, ChevronRight, Sparkles, Play, Image as ImageIcon, ArrowRight } from 'lucide-react';

export const HighlightsSection: React.FC = () => {
  const { highlights, openHighlightViewer, navigate } = useShop();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter published highlights
  const publishedHighlights = (highlights || [])
    .filter((hl) => hl.published !== false)
    .sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

  if (publishedHighlights.length === 0) {
    return null;
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
  };

  const handleCardClick = (hl: Highlight) => {
    openHighlightViewer(hl);
  };

  const handleButtonClick = (e: React.MouseEvent, hl: Highlight) => {
    e.stopPropagation();
    if (hl.buttonLink) {
      navigate(hl.buttonLink);
    } else {
      openHighlightViewer(hl);
    }
  };

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-[#140205] via-[#1F060A] to-[#140205] border-y border-[#D4AF37]/20 relative overflow-hidden">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#5B0F15]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#DFBA67] text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#DFBA67]" />
              <span>Curated Highlights</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[#F9F6EE] font-bold tracking-tight">
              Featured Collections & Stories
            </h2>
            <p className="text-sm md:text-base text-[#D4AF37]/80 mt-1">
              Tap any highlight to explore video lookbooks, styling guides & new arrivals.
            </p>
          </div>

          {/* Desktop Navigation Arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={scrollLeft}
              className="p-2.5 rounded-full bg-[#1F060A]/80 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#DFBA67] hover:bg-[#3B0C13] transition-all cursor-pointer shadow-lg"
              aria-label="Scroll highlights left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={scrollRight}
              className="p-2.5 rounded-full bg-[#1F060A]/80 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#DFBA67] hover:bg-[#3B0C13] transition-all cursor-pointer shadow-lg"
              aria-label="Scroll highlights right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Carousel / Grid */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {publishedHighlights.map((hl) => {
            const mediaCount = hl.media ? hl.media.length : 0;
            const hasVideo = hl.media?.some((m) => m.type === 'video');

            return (
              <div
                key={hl.id}
                onClick={() => handleCardClick(hl)}
                className="group relative flex-none w-[82vw] sm:w-[320px] md:w-[360px] lg:w-[380px] h-[460px] sm:h-[480px] rounded-3xl overflow-hidden cursor-pointer snap-start border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all duration-500 shadow-xl hover:shadow-[#D4AF37]/20 hover:-translate-y-1.5 flex flex-col justify-between p-6 bg-[#1F060A]"
              >
                {/* Background Image with Zoom on Hover */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={hl.coverImage || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800'}
                    alt={hl.name}
                    className="w-full h-full object-cover object-center transform group-hover:scale-108 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  {/* Luxury Multi-layer Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/20 group-hover:via-black/35 transition-colors" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#140205]/60 via-transparent to-[#140205]/90" />
                </div>

                {/* Top Badges */}
                <div className="relative z-10 flex items-center justify-between">
                  {/* Highlight Category Tag */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#D4AF37]/40 text-[#DFBA67] text-xs font-semibold tracking-wider uppercase shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                    <span>{hl.name}</span>
                  </div>

                  {/* Media Count Badge */}
                  {mediaCount > 0 && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-white/90 text-xs font-medium shadow-md">
                      {hasVideo ? (
                        <Play className="w-3 h-3 text-[#DFBA67] fill-[#DFBA67]" />
                      ) : (
                        <ImageIcon className="w-3 h-3 text-[#DFBA67]" />
                      )}
                      <span>{mediaCount} {mediaCount === 1 ? 'Look' : 'Looks'}</span>
                    </div>
                  )}
                </div>

                {/* Bottom Content Info & Action */}
                <div className="relative z-10 space-y-3">
                  {hl.title && (
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-white leading-tight drop-shadow-md group-hover:text-[#DFBA67] transition-colors">
                      {hl.title}
                    </h3>
                  )}

                  {hl.description && (
                    <p className="text-xs sm:text-sm text-gray-200 line-clamp-2 leading-relaxed drop-shadow-sm font-light">
                      {hl.description}
                    </p>
                  )}

                  {/* Action Button */}
                  <div className="pt-2 flex items-center justify-between">
                    {hl.buttonText ? (
                      <button
                        onClick={(e) => handleButtonClick(e, hl)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F26] text-[#140205] text-xs sm:text-sm font-bold uppercase tracking-wider hover:brightness-110 hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all cursor-pointer active:scale-95"
                      >
                        <span>{hl.buttonText}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#DFBA67] font-semibold tracking-wider uppercase group-hover:underline">
                        <span>View Lookbook</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    )}

                    <span className="text-[11px] text-white/60 font-mono tracking-tighter">
                      Tap to view story
                    </span>
                  </div>
                </div>

                {/* Shimmer Border Accent */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#D4AF37]/40 rounded-3xl pointer-events-none transition-colors duration-500" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
