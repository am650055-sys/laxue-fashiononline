import React, { useState, useRef } from 'react';
import { Heart, Gift, ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types';
import { useShop } from '../../context/ShopContext';

interface ProductImageGalleryProps {
  product: Product;
  activeImageIdx: number;
  setActiveImageIdx: (idx: number) => void;
}

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  product,
  activeImageIdx,
  setActiveImageIdx,
}) => {
  const { isWishlisted, toggleWishlist } = useShop();
  const isLiked = isWishlisted(product.id);

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [isHoverZooming, setIsHoverZooming] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((activeImageIdx - 1 + images.length) % images.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((activeImageIdx + 1) % images.length);
  };

  return (
    <div className="space-y-4 select-none">
      {/* Main Image Container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHoverZooming(true)}
        onMouseLeave={() => setIsHoverZooming(false)}
        onClick={() => setIsZoomModalOpen(true)}
        className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#F7F4EE] border border-[#EAE3D2] shadow-md group cursor-zoom-in"
      >
        {/* Base Image */}
        <img
          src={images[activeImageIdx]}
          alt={`${product.name} - View ${activeImageIdx + 1}`}
          className={`w-full h-full object-cover object-top transition-transform duration-300 ${
            isHoverZooming ? 'scale-125' : 'scale-100'
          }`}
          style={
            isHoverZooming
              ? {
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                }
              : undefined
          }
          referrerPolicy="no-referrer"
          loading="eager"
        />

        {/* Mobile Swipe Left / Right Navigation Chevrons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-opacity sm:opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition-opacity sm:opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Wishlist Heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-4 right-4 p-3 rounded-full shadow-lg backdrop-blur-xs transition-all z-20 cursor-pointer ${
            isLiked
              ? 'bg-[#4A0E17] text-rose-400 border border-[#D4AF37] scale-110'
              : 'bg-white/90 text-[#3D332A] hover:bg-white hover:text-[#4A0E17]'
          }`}
          title={isLiked ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-5 h-5 transition-transform ${isLiked ? 'fill-current text-rose-400 scale-110' : ''}`} />
        </button>

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
          {product.isRakhiGiftEligible && (
            <div className="bg-emerald-900/90 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400 flex items-center gap-1 shadow-md backdrop-blur-xs">
              <Gift className="w-3.5 h-3.5 text-emerald-300" />
              <span>RAKHI GIFT ELIGIBLE</span>
            </div>
          )}
          {product.isBestSeller && (
            <div className="bg-[#B8860B] text-white text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-md w-fit">
              BESTSELLER
            </div>
          )}
          {product.isNewArrival && !product.isBestSeller && (
            <div className="bg-[#4A0E17] text-[#DFBA67] text-[11px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border border-[#D4AF37]/40 shadow-md w-fit">
              NEW ARRIVAL
            </div>
          )}
        </div>

        {/* Bottom Bar: Zoom Hint & Image Counter */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
          <div className="hidden sm:flex items-center gap-1 bg-black/60 text-white text-[10px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            <ZoomIn className="w-3 h-3 text-[#DFBA67]" />
            <span>Hover to zoom • Click for full size</span>
          </div>

          <div className="ml-auto bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
            {activeImageIdx + 1} / {images.length}
          </div>
        </div>
      </div>

      {/* Thumbnails Gallery */}
      {images.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1 snap-x">
          {images.map((img, idx) => {
            const isSelected = activeImageIdx === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIdx(idx)}
                className={`relative w-16 sm:w-20 h-20 sm:h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer snap-start ${
                  isSelected
                    ? 'border-[#4A0E17] ring-2 ring-[#D4AF37]/50 scale-105 shadow-md'
                    : 'border-[#EAE3D2] opacity-70 hover:opacity-100 hover:border-[#D4AF37]'
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isZoomModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <button
            onClick={() => setIsZoomModalOpen(false)}
            className="absolute top-4 right-4 p-3 text-white hover:text-[#DFBA67] bg-white/10 hover:bg-white/20 rounded-full transition-all cursor-pointer z-50"
            aria-label="Close fullscreen preview"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={images[activeImageIdx]}
              alt={product.name}
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              referrerPolicy="no-referrer"
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-black/60 hover:bg-black/90 text-white rounded-full transition-all cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
