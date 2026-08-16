import React from 'react';
import { Heart, Star, ShieldCheck } from 'lucide-react';
import { Product } from '../types';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigate, isWishlisted, toggleWishlist } = useShop();

  const isLiked = isWishlisted(product.id);

  const handleCardClick = () => {
    navigate('product-detail', product.id);
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleWishlist(product.id);
  };

  const brandName = product.subcategory || product.category || 'LUXUE';
  const discountPercent = product.discountPercent || (product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0);

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-xl overflow-hidden border border-[#F0F0F0] hover:border-[#D4D4D4] hover:shadow-md transition-all duration-200 ease-out active:scale-[0.97] select-none cursor-pointer flex flex-col justify-between"
      style={{
        transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)',
      }}
      id={`product-card-${product.id}`}
    >
      {/* 1. Product Image Area (Standard 3:4 / 4:5 vertical aspect ratio) */}
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
          onClick={handleWishlistClick}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-xs backdrop-blur-xs transition-transform duration-150 active:scale-80 z-20 cursor-pointer ${
            isLiked
              ? 'bg-white text-[#E53935] shadow-sm ring-1 ring-red-100'
              : 'bg-white/80 text-[#878787] hover:text-[#E53935] hover:bg-white'
          }`}
          aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Optional Rating Chip (Flipkart Green Pill) */}
        {product.rating && (
          <div className="absolute bottom-2 left-2 flex items-center gap-0.5 bg-[#388E3C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
            <span>{product.rating}</span>
            <Star className="w-2.5 h-2.5 fill-current" />
          </div>
        )}
      </div>

      {/* 2. Product Details Area - Clean Flipkart Mobile Hierarchy */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Brand Name */}
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#878787] truncate mb-0.5">
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
          <div className="flex items-center flex-wrap gap-1.5">
            <span className="text-sm sm:text-base font-bold text-[#212121]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>

            {product.originalPrice > product.price && (
              <span className="text-[11px] sm:text-xs text-[#878787] line-through font-normal">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}

            {discountPercent > 0 && (
              <span className="text-[11px] sm:text-xs font-bold text-[#388E3C]">
                {discountPercent}% off
              </span>
            )}
          </div>
        </div>

        {/* Flipkart-style Special Price / Assured Badge */}
        <div className="mt-1.5 pt-1.5 border-t border-[#F5F5F5] flex items-center justify-between">
          <span className="text-[10px] sm:text-[11px] font-bold text-[#388E3C]">
            Special price
          </span>

          <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold italic text-[#2874F0] bg-[#F0F5FF] px-1.5 py-0.5 rounded border border-[#2874F0]/20">
            <ShieldCheck className="w-3 h-3 text-[#2874F0]" />
            <span>Assured</span>
          </span>
        </div>
      </div>
    </div>
  );
};
