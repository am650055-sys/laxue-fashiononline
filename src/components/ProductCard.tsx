import React, { useState } from 'react';
import { Heart, Star, ShoppingBag, Gift, Zap, Check } from 'lucide-react';
import { Product, Size } from '../types';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
}

const DEFAULT_SIZES: Size[] = ['S', 'M', 'L', 'XL', 'XXL'];

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigate, addToCart, isWishlisted, toggleWishlist } = useShop();

  const availableSizes: Size[] =
    product.sizes && product.sizes.length > 0 ? product.sizes : DEFAULT_SIZES;

  const [selectedSize, setSelectedSize] = useState<Size>(availableSizes[0] || 'M');
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  const isLiked = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1400);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, selectedSize);
    navigate('checkout');
  };

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden border border-[#E8E2D5] hover:border-[#D4AF37]/70 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
      {/* 1. Product Image Area */}
      <div
        className="relative aspect-[3/4] w-full overflow-hidden bg-[#F7F4EE] cursor-pointer"
        onClick={() => navigate('product-detail', product.id)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isNewArrival && (
            <span className="bg-[#4A0E17] text-[#DFBA67] text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md shadow-xs border border-[#D4AF37]/50">
              NEW
            </span>
          )}
          {product.isBestSeller && !product.isNewArrival && (
            <span className="bg-[#B8860B] text-white text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-md shadow-xs">
              BESTSELLER
            </span>
          )}
          {product.isRakhiGiftEligible && (
            <span className="bg-emerald-900 text-emerald-100 text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1 border border-emerald-400/40">
              <Gift className="w-3 h-3 text-emerald-300" />
              GIFT ELIGIBLE
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full shadow-md backdrop-blur-xs transition-all z-10 cursor-pointer ${
            isLiked
              ? 'bg-[#4A0E17] text-rose-400 border border-[#D4AF37]'
              : 'bg-white/85 text-[#5A4D41] hover:text-[#4A0E17] hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
        </button>

        {/* Discount Tag */}
        {product.discountPercent > 0 && (
          <div className="absolute bottom-2.5 left-2.5 bg-[#801723] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            {product.discountPercent}% OFF
          </div>
        )}
      </div>

      {/* 2. Product Information Area */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between bg-white">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-[#7A695C] mb-1">
            <span className="font-semibold uppercase tracking-wider text-[10px] text-[#801723]">
              {product.category || 'Kurtis'}
            </span>
            <div className="flex items-center gap-1 bg-[#FAF6EE] px-1.5 py-0.5 rounded border border-[#EAD8B8] text-[10px] font-bold text-[#3B0C13]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
              <span>{product.rating || 4.9}</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => navigate('product-detail', product.id)}
            className="font-medium text-xs sm:text-sm text-[#2D2622] line-clamp-2 hover:text-[#801723] cursor-pointer transition-colors leading-snug mb-2 font-serif"
          >
            {product.name}
          </h3>

          {/* 3. Price Row: ₹699 */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-base sm:text-lg font-extrabold text-[#4A0E17]">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-[#9E8E81] line-through font-normal">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {product.discountPercent > 0 && (
              <span className="text-[11px] font-bold text-emerald-700">
                ({product.discountPercent}% OFF)
              </span>
            )}
          </div>

          {/* 4. Size Selection */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] text-[#6B5E52] mb-1.5">
              <span className="font-semibold">Select Size:</span>
              <span className="font-bold text-[#4A0E17]">{selectedSize}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSize(sz);
                  }}
                  className={`min-w-[32px] h-7 px-2 text-[11px] font-bold rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
                    selectedSize === sz
                      ? 'bg-[#4A0E17] text-[#DFBA67] border-[#4A0E17] shadow-xs scale-105'
                      : 'bg-[#FBF9F4] text-[#4A3E36] border-[#E2DACB] hover:border-[#B8860B] hover:bg-white'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 5. Action Buttons: Add to Cart & Buy Now */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-[#F0EBE0]">
          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`py-2 px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer border ${
              addedAnimation
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-[#FAF6EE] hover:bg-[#4A0E17] text-[#4A0E17] hover:text-[#DFBA67] border-[#D4AF37]/50'
            }`}
          >
            {addedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>ADDED</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-[#B8860B]" />
                <span>ADD TO CART</span>
              </>
            )}
          </button>

          {/* Buy Now Button */}
          <button
            type="button"
            onClick={handleBuyNow}
            className="py-2 px-2 bg-gradient-to-r from-[#4A0E17] to-[#801723] hover:from-[#3B0C13] hover:to-[#6B121C] text-[#DFBA67] rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs border border-[#D4AF37]/40 hover:scale-[1.02] active:scale-95"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>BUY NOW</span>
          </button>
        </div>
      </div>
    </div>
  );
};

