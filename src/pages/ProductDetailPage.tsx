import React, { useState } from 'react';
import {
  ArrowLeft,
  Star,
  Heart,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Gift,
  Plus,
  Minus,
  AlertCircle,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Size } from '../types';
import { ProductCard } from '../components/ProductCard';

export const ProductDetailPage: React.FC = () => {
  const { products, selectedProductId, navigate, addToCart, isWishlisted, toggleWishlist } = useShop();

  const product = products.find(p => p.id === selectedProductId || p.slug === selectedProductId) || products[0];

  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(product?.colors?.[0] || 'Maroon / Wine');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const [pincode, setPincode] = useState<string>('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  // Accordion states
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    description: true,
    details: true,
    fabric: false,
    shipping: false,
    returns: false,
    sizeGuide: false,
  });

  if (!product) return null;

  const isLiked = isWishlisted(product.id);

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      setPincodeStatus(`Available for Delivery at ${pincode} by Express Courier in 3-4 Days.`);
    } else {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code.');
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError('Please select your size');
      return;
    }
    setSizeError(null);
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize, selectedColor);
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError('Please select your size');
      return;
    }
    setSizeError(null);
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize, selectedColor);
    }
    navigate('checkout');
  };

  const images = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  // Related products (same category or top trending)
  const relatedProducts = products
    .filter(p => p.id !== product.id && (p.category === product.category || p.isFeatured))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Back Link */}
      <button
        onClick={() => navigate('shop')}
        className="inline-flex items-center gap-2 text-xs font-bold text-[#4A0E17] hover:text-[#B8860B] mb-6 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>BACK TO SHOP</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Gallery Column (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#F7F4EE] border border-[#EAE3D2] shadow-md group">
            <img
              src={images[activeImageIdx]}
              alt={product.name}
              className="w-full h-full object-cover object-top transition-all duration-300"
              referrerPolicy="no-referrer"
            />

            {/* Wishlist Heart */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full shadow-lg backdrop-blur-xs transition-all z-10 cursor-pointer ${
                isLiked ? 'bg-[#4A0E17] text-rose-400 border border-[#D4AF37]' : 'bg-white/90 text-[#3D332A] hover:bg-white'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current text-rose-400' : ''}`} />
            </button>

            {product.isRakhiGiftEligible && (
              <div className="absolute top-4 left-4 bg-emerald-900 text-emerald-100 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400 flex items-center gap-1 shadow-md">
                <Gift className="w-3.5 h-3.5 text-emerald-300" />
                <span>RAKHI GIFT ELIGIBLE</span>
              </div>
            )}

            {/* Image counter for gallery */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm">
              {activeImageIdx + 1} / {images.length}
            </div>
          </div>

          {/* Swipeable Mobile / Desktop Thumbnails */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 snap-x">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`w-20 h-24 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer snap-start ${
                    activeImageIdx === idx
                      ? 'border-[#4A0E17] scale-105 shadow-md'
                      : 'border-[#EAE3D2] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info Column (lg:col-span-6) */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#801723]">
                {product.category}
              </span>
              {product.subcategory && (
                <>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs font-semibold text-[#8C7A6B]">
                    {product.subcategory}
                  </span>
                </>
              )}
            </div>

            <h1 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3B0C13] leading-snug mt-1">
              {product.name}
            </h1>

            {/* Rating & SKU */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1 bg-[#FAF6EE] px-2.5 py-1 rounded-md border border-[#E8D8B8] text-xs font-bold text-[#3B0C13]">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{product.rating}</span>
                <span className="text-[#8C7A6B]">({product.reviewsCount} reviews)</span>
              </div>
              <span className="text-xs text-[#8C7A6B]">SKU: {product.sku}</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-[#FAF6EE] rounded-2xl border border-[#EAE3D2]">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-[#4A0E17]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-base text-[#9E8E81] line-through font-normal">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="bg-[#801723] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  SAVE {product.discountPercent}%
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#7A695C] mt-1">
              Inclusive of all taxes • Free Express Shipping across India
            </p>
          </div>

          {/* Size Error Notification */}
          {sizeError && (
            <div className="p-3 bg-red-50 border-2 border-red-500/80 rounded-xl flex items-center gap-2.5 text-red-700 animate-bounce">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span className="text-xs font-extrabold uppercase tracking-wide">{sizeError}</span>
            </div>
          )}

          {/* Size Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3D332A]">
                SELECT SIZE:{' '}
                {selectedSize ? (
                  <span className="text-[#4A0E17] font-extrabold">{selectedSize}</span>
                ) : (
                  <span className="text-red-600 font-extrabold">* Required</span>
                )}
              </span>
              <button
                onClick={() => toggleAccordion('sizeGuide')}
                className="text-xs font-bold text-[#801723] underline underline-offset-2 cursor-pointer"
              >
                Size Guide
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map(sz => {
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    onClick={() => {
                      setSelectedSize(sz);
                      setSizeError(null);
                    }}
                    className={`w-12 h-12 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#4A0E17] text-[#DFBA67] border-[#D4AF37] shadow-md scale-105'
                        : 'bg-white text-[#3D332A] border-[#EAE3D2] hover:border-[#D4AF37]'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#3D332A] block mb-2">
              QUANTITY
            </span>
            <div className="inline-flex items-center bg-white border border-[#EAE3D2] rounded-xl p-1 shadow-xs">
              <button
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-[#4A0E17] hover:bg-[#FAF6EE] rounded-lg cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-xs font-bold text-[#1A1A1A]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                className="w-9 h-9 flex items-center justify-center text-[#4A0E17] hover:bg-[#FAF6EE] rounded-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-[#FAF6EE] hover:bg-[#FAF0DC] text-[#4A0E17] font-bold text-sm py-4 px-6 rounded-2xl border-2 border-[#4A0E17] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-5 h-5 text-[#801723]" />
              <span>ADD TO CART</span>
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 bg-[#4A0E17] hover:bg-[#62121E] text-[#DFBA67] font-bold text-sm py-4 px-6 rounded-2xl border-2 border-[#D4AF37] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Zap className="w-5 h-5 text-[#DFBA67]" />
              <span>BUY NOW</span>
            </button>
          </div>

          {/* Pincode Delivery Checker */}
          <div className="p-4 bg-white rounded-2xl border border-[#EAE3D2] shadow-xs">
            <span className="text-xs font-bold text-[#3B0C13] uppercase tracking-wider block mb-2">
              ESTIMATED DELIVERY CHECKER
            </span>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                className="flex-1 bg-[#FAF6EE] text-xs px-3 py-2 rounded-xl border border-[#D4AF37]/40 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#4A0E17] text-[#DFBA67] text-xs font-bold px-4 py-2 rounded-xl border border-[#D4AF37] cursor-pointer"
              >
                CHECK
              </button>
            </form>
            {pincodeStatus && (
              <p className="text-xs font-semibold text-emerald-800 mt-2 bg-emerald-50 p-2 rounded border border-emerald-200">
                {pincodeStatus}
              </p>
            )}
          </div>

          {/* Expandable Information Accordions */}
          <div className="space-y-3 pt-4 border-t border-[#EAE3D2]">
            {/* Description */}
            <div className="border border-[#EAE3D2] rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion('description')}
                className="w-full p-4 text-left font-bold text-xs uppercase tracking-wider text-[#3B0C13] flex items-center justify-between cursor-pointer"
              >
                <span>PRODUCT DESCRIPTION</span>
                {openAccordions.description ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordions.description && (
                <div className="p-4 pt-0 text-xs text-[#5A4D41] leading-relaxed border-t border-[#EAE3D2]/50 whitespace-pre-line">
                  {product.description}
                </div>
              )}
            </div>

            {/* Product Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="border border-[#EAE3D2] rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => toggleAccordion('highlights')}
                  className="w-full p-4 text-left font-bold text-xs uppercase tracking-wider text-[#3B0C13] flex items-center justify-between cursor-pointer"
                >
                  <span>KEY HIGHLIGHTS</span>
                  {openAccordions.highlights !== false ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openAccordions.highlights !== false && (
                  <div className="p-4 pt-0 text-xs text-[#5A4D41] leading-relaxed border-t border-[#EAE3D2]/50 space-y-1.5">
                    {product.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-[#801723] font-bold mt-0.5">•</span>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Product Details Specs */}
            <div className="border border-[#EAE3D2] rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion('details')}
                className="w-full p-4 text-left font-bold text-xs uppercase tracking-wider text-[#3B0C13] flex items-center justify-between cursor-pointer"
              >
                <span>PRODUCT SPECIFICATIONS</span>
                {openAccordions.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordions.details && (
                <div className="p-4 pt-0 text-xs text-[#5A4D41] leading-relaxed border-t border-[#EAE3D2]/50 space-y-1">
                  <p>• <strong>Product Type / Style:</strong> {product.style || product.category || 'Ethnic Wear'}</p>
                  <p>• <strong>Color:</strong> {product.color || product.colors?.join(', ') || 'Multicolor'}</p>
                  <p>• <strong>Pattern:</strong> {product.pattern || 'Solid / Designer Detailing'}</p>
                  <p>• <strong>Neckline:</strong> {product.neck || 'V-Neck / Round Neck'}</p>
                  <p>• <strong>Sleeve:</strong> {product.sleeves || 'Full Sleeves'}</p>
                  {product.setIncludes && (
                    <p>• <strong>Set Includes:</strong> {product.setIncludes}</p>
                  )}
                  <p>• <strong>Fit:</strong> {product.fit || 'Regular / Flared'}</p>
                  <p>• <strong>Fabric:</strong> {product.fabric || 'Premium Fabric'}</p>
                  <p>• <strong>Occasion:</strong> {product.occasion || 'Festive, Party & Wedding Wear'}</p>
                </div>
              )}
            </div>

            {/* Shipping Info */}
            <div className="border border-[#EAE3D2] rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion('shipping')}
                className="w-full p-4 text-left font-bold text-xs uppercase tracking-wider text-[#3B0C13] flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#801723]" />
                  <span>SHIPPING INFORMATION</span>
                </div>
                {openAccordions.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordions.shipping && (
                <div className="p-4 pt-0 text-xs text-[#5A4D41] leading-relaxed border-t border-[#EAE3D2]/50 space-y-1">
                  <p>• Express shipping dispatched within 24 hours.</p>
                  <p>• Delivery across Metro cities in 2-4 business days.</p>
                  <p>• Cash on Delivery (COD) available nationwide.</p>
                </div>
              )}
            </div>

            {/* Return Information */}
            <div className="border border-[#EAE3D2] rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion('returns')}
                className="w-full p-4 text-left font-bold text-xs uppercase tracking-wider text-[#3B0C13] flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#801723]" />
                  <span>RETURNS & EXCHANGE POLICY</span>
                </div>
                {openAccordions.returns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordions.returns && (
                <div className="p-4 pt-0 text-xs text-[#5A4D41] leading-relaxed border-t border-[#EAE3D2]/50 space-y-1">
                  <p>• 7-day hassle-free return and exchange policy.</p>
                  <p>• Pickup arranged right from your doorstep.</p>
                  <p>• Tags and original packaging must be intact.</p>
                </div>
              )}
            </div>

            {/* Size Guide */}
            <div className="border border-[#EAE3D2] rounded-xl overflow-hidden bg-white">
              <button
                onClick={() => toggleAccordion('sizeGuide')}
                className="w-full p-4 text-left font-bold text-xs uppercase tracking-wider text-[#3B0C13] flex items-center justify-between cursor-pointer"
              >
                <span>KURTI SIZE GUIDE (INCHES)</span>
                {openAccordions.sizeGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {openAccordions.sizeGuide && (
                <div className="p-4 pt-0 text-xs text-[#5A4D41] border-t border-[#EAE3D2]/50 overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAF6EE] border-b border-[#EAE3D2]">
                        <th className="p-2">Size</th>
                        <th className="p-2">Bust</th>
                        <th className="p-2">Waist</th>
                        <th className="p-2">Length</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#EAE3D2]/50"><td className="p-2 font-bold">S</td><td className="p-2">36"</td><td className="p-2">32"</td><td className="p-2">44"</td></tr>
                      <tr className="border-b border-[#EAE3D2]/50"><td className="p-2 font-bold">M</td><td className="p-2">38"</td><td className="p-2">34"</td><td className="p-2">44"</td></tr>
                      <tr className="border-b border-[#EAE3D2]/50"><td className="p-2 font-bold">L</td><td className="p-2">40"</td><td className="p-2">36"</td><td className="p-2">45"</td></tr>
                      <tr className="border-b border-[#EAE3D2]/50"><td className="p-2 font-bold">XL</td><td className="p-2">42"</td><td className="p-2">38"</td><td className="p-2">45"</td></tr>
                      <tr className="border-b border-[#EAE3D2]/50"><td className="p-2 font-bold">XXL</td><td className="p-2">44"</td><td className="p-2">40"</td><td className="p-2">46"</td></tr>
                      <tr><td className="p-2 font-bold">3XL</td><td className="p-2">46"</td><td className="p-2">42"</td><td className="p-2">46"</td></tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t border-[#EAE3D2]">
          <h2 className="font-serif-luxury text-2xl font-bold text-[#3B0C13] mb-6">
            YOU MAY ALSO LIKE
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
