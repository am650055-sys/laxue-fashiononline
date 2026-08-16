import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Heart, Star, ShieldCheck, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useShop } from '../../context/ShopContext';

interface ProductRecommendationsProps {
  currentProduct: Product;
  recommendedProducts: Product[];
  onSelectProduct: (product: Product) => void;
  title?: string;
  subtitle?: string;
}

export const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  currentProduct,
  recommendedProducts,
  onSelectProduct,
  title = 'Similar Products',
  subtitle = 'Handcrafted Kurtis matching this silhouette, design & festive elegance',
}) => {
  const { navigate, isWishlisted, toggleWishlist } = useShop();
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  if (!recommendedProducts || recommendedProducts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-10 border-t border-[#EAE3D2]" id="similar-products-section">
      {/* Header with Title, Subtitle, Arrows, and View All */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#801723] bg-[#FAF3E0] px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
              <Sparkles className="w-3 h-3 text-[#B8860B]" />
              CURATED FOR YOU
            </span>
          </div>
          <h2 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#3B0C13]">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[#7A695C] mt-0.5 max-w-xl">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View All Button */}
          <button
            type="button"
            onClick={() => {
              navigate('shop');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4A0E17] hover:text-[#B8860B] py-1.5 px-3 rounded-xl border border-[#4A0E17]/20 hover:border-[#4A0E17] bg-white hover:bg-[#FAF6EE] transition-all cursor-pointer shadow-xs"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {/* Carousel Arrows (Visible on sm+) */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={scrollLeft}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#4A0E17] text-[#4A0E17] hover:text-[#DFBA67] border border-[#EAE3D2] hover:border-[#4A0E17] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Scroll recommendations left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={scrollRight}
              className="w-8 h-8 rounded-full bg-white hover:bg-[#4A0E17] text-[#4A0E17] hover:text-[#DFBA67] border border-[#EAE3D2] hover:border-[#4A0E17] flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Scroll recommendations right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Carousel Container (Mobile swipeable, Desktop grid-carousel) */}
      <div
        ref={carouselRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-4 pt-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recommendedProducts.map((product) => {
          const isLiked = isWishlisted(product.id);
          const brandName = product.subcategory || product.category || 'LUXUE';
          const discountPercent = product.discountPercent || (product.originalPrice > product.price 
            ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
            : 0);

          return (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="w-[170px] sm:w-[210px] md:w-[230px] shrink-0 snap-start group relative bg-white rounded-xl overflow-hidden border border-[#F0F0F0] hover:border-[#D4D4D4] hover:shadow-md transition-all duration-200 ease-out active:scale-[0.97] select-none cursor-pointer flex flex-col justify-between"
              style={{
                transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              {/* Product Image Area */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#FBFBFB]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />

                {/* Top-Right Heart / Wishlist Icon with stopPropagation */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    toggleWishlist(product.id);
                  }}
                  className={`absolute top-2 right-2 p-1.5 sm:p-2 rounded-full shadow-xs backdrop-blur-xs transition-transform duration-150 active:scale-80 z-20 cursor-pointer ${
                    isLiked
                      ? 'bg-white text-[#E53935] shadow-sm ring-1 ring-red-100'
                      : 'bg-white/80 text-[#878787] hover:text-[#E53935] hover:bg-white'
                  }`}
                  aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${isLiked ? 'fill-current' : ''}`} />
                </button>

                {/* Rating Chip */}
                {product.rating && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-[#388E3C] text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    <span>{product.rating}</span>
                    <Star className="w-2.5 h-2.5 fill-current" />
                  </div>
                )}
              </div>

              {/* Product Info Area - Clean Flipkart Layout */}
              <div className="p-2 sm:p-2.5 flex-1 flex flex-col justify-between bg-white">
                <div>
                  {/* Brand Name */}
                  <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#878787] truncate mb-0.5">
                    {brandName}
                  </div>

                  {/* Product Title (Single-line ellipsis) */}
                  <h3
                    className="text-xs sm:text-[13px] font-medium text-[#212121] truncate leading-tight mb-1.5 hover:text-[#2874F0] transition-colors"
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  {/* Price Row: Current Price, Strike-through MRP, Green Discount */}
                  <div className="flex items-center flex-wrap gap-1">
                    <span className="text-xs sm:text-sm font-bold text-[#212121]">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>

                    {product.originalPrice > product.price && (
                      <span className="text-[10px] sm:text-[11px] text-[#878787] line-through font-normal">
                        ₹{product.originalPrice.toLocaleString('en-IN')}
                      </span>
                    )}

                    {discountPercent > 0 && (
                      <span className="text-[10px] sm:text-[11px] font-bold text-[#388E3C]">
                        {discountPercent}% off
                      </span>
                    )}
                  </div>
                </div>

                {/* Special Price / Assured Footer */}
                <div className="mt-1.5 pt-1 border-t border-[#F5F5F5] flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#388E3C]">
                    Special price
                  </span>

                  <span className="inline-flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold italic text-[#2874F0] bg-[#F0F5FF] px-1 py-0.2 rounded border border-[#2874F0]/20">
                    <ShieldCheck className="w-2.5 h-2.5 text-[#2874F0]" />
                    <span>Assured</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
