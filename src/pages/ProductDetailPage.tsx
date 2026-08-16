import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  Star,
  ShoppingBag,
  Zap,
  Truck,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  AlertCircle,
  Check,
  Share2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Product, Size } from '../types';
import { ProductImageGallery } from '../components/product/ProductImageGallery';
import { ProductRecommendations } from '../components/product/ProductRecommendations';
import { RecentlyViewedSection } from '../components/product/RecentlyViewedSection';
import { ProductDetailSkeleton } from '../components/product/ProductDetailSkeleton';
import { getRecommendedProducts, getTrendingAlternates } from '../utils/recommendationEngine';
import { addToRecentlyViewed, getRecentlyViewedProductIds } from '../utils/recentHistory';

export const ProductDetailPage: React.FC = () => {
  const {
    products,
    selectedProductId,
    navigate,
    addToCart,
  } = useShop();

  // Find active product
  const product: Product = useMemo(() => {
    if (!products || products.length === 0) {
      return {} as Product;
    }
    const found = products.find(
      p => p.id === selectedProductId || (p.slug && p.slug === selectedProductId)
    );
    return found || products[0];
  }, [products, selectedProductId]);

  // Page interactive state
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);
  const [isProductTransitioning, setIsProductTransitioning] = useState<boolean>(false);
  const [shareSuccess, setShareSuccess] = useState<boolean>(false);

  // Delivery checker state
  const [pincode, setPincode] = useState<string>('');
  const [pincodeStatus, setPincodeStatus] = useState<{ message: string; success: boolean } | null>(null);

  // Accordion open/close states
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    description: true,
    highlights: true,
    details: true,
    shipping: false,
    returns: false,
    sizeGuide: false,
  });

  // Recently viewed products state
  const [recentProductIds, setRecentProductIds] = useState<string[]>([]);

  // Top page container ref for smooth auto-scroll on product change
  const topContainerRef = useRef<HTMLDivElement>(null);

  // Track product view and update recently viewed list
  useEffect(() => {
    if (product && product.id) {
      addToRecentlyViewed(product.id);
      setRecentProductIds(getRecentlyViewedProductIds(product.id));
      setSelectedSize(null);
      setSelectedColor(product.colors?.[0] || 'Original');
      setQuantity(1);
      setActiveImageIdx(0);
      setSizeError(null);
    }
  }, [product?.id]);

  // Calculate dynamic recommendations for this specific product
  const similarProducts = useMemo(() => {
    if (!product || !product.id) return [];
    return getRecommendedProducts(product, products, 10);
  }, [product, products]);

  // Trending alternates if similar is low
  const trendingAlternates = useMemo(() => {
    if (!product || !product.id) return [];
    return getTrendingAlternates(product, products, 8);
  }, [product, products]);

  // Resolve recently viewed product items
  const recentlyViewedProducts = useMemo(() => {
    if (!recentProductIds || recentProductIds.length === 0) return [];
    return recentProductIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => Boolean(p && p.id !== product.id));
  }, [recentProductIds, products, product?.id]);

  // Handler to smoothly transition to a new recommended or recently viewed product
  const handleSelectProduct = (newProduct: Product) => {
    if (!newProduct || newProduct.id === product.id) return;

    setIsProductTransitioning(true);

    // Save previous product into recent history
    if (product?.id) {
      addToRecentlyViewed(product.id);
    }

    // Scroll to top of product detail smoothly
    if (topContainerRef.current) {
      topContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Trigger navigate and reset local transition state with 250ms fluid delay
    navigate('product-detail', newProduct.id);

    setTimeout(() => {
      setIsProductTransitioning(false);
      setRecentProductIds(getRecentlyViewedProductIds(newProduct.id));
    }, 280);
  };

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length === 6 && /^\d{6}$/.test(pincode)) {
      setPincodeStatus({
        message: `Delivery available for ${pincode}! Free Express Courier delivery in 2-4 business days. Cash on Delivery is available.`,
        success: true,
      });
    } else {
      setPincodeStatus({
        message: 'Please enter a valid 6-digit Indian Postal PIN code.',
        success: false,
      });
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      setSizeError('Please select a size first');
      const sizeElem = document.getElementById('size-selector-area');
      if (sizeElem) {
        sizeElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setSizeError(null);
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize, selectedColor);
    }
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setSizeError('Please select a size first');
      const sizeElem = document.getElementById('size-selector-area');
      if (sizeElem) {
        sizeElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setSizeError(null);
    for (let i = 0; i < quantity; i++) {
      addToCart(product, selectedSize, selectedColor);
    }
    navigate('checkout');
  };

  const handleShareProduct = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} at LUXUE FASHION:`,
          url: url,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 2500);
      } catch {}
    }
  };

  if (!product || !product.id) {
    return <ProductDetailSkeleton />;
  }

  if (isProductTransitioning) {
    return <ProductDetailSkeleton />;
  }

  const availableSizes: Size[] =
    product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL', 'XXL'];

  return (
    <div
      ref={topContainerRef}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 transition-opacity duration-300"
    >
      {/* Top Breadcrumb & Action Row */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate('shop')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#4A0E17] hover:text-[#B8860B] transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>BACK TO ALL KURTIS</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShareProduct}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5A4D41] hover:text-[#4A0E17] bg-white border border-[#EAE3D2] hover:border-[#D4AF37] px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
            title="Share this product"
          >
            {shareSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Product Layout (2 Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Product Gallery */}
        <div className="lg:col-span-6">
          <ProductImageGallery
            product={product}
            activeImageIdx={activeImageIdx}
            setActiveImageIdx={setActiveImageIdx}
          />
        </div>

        {/* Right Column: Product Info, Pricing, Sizes & Checkout */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header info */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#801723] bg-[#FAF3E0] px-2.5 py-0.5 rounded-md border border-[#D4AF37]/30">
                {product.category || 'Kurti'}
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

            <h1 className="font-serif-luxury text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3B0C13] leading-snug">
              {product.name}
            </h1>

            {/* Rating, Reviews and SKU */}
            <div className="flex flex-wrap items-center gap-3 mt-2.5">
              <div className="flex items-center gap-1.5 bg-[#FAF6EE] px-2.5 py-1 rounded-lg border border-[#E8D8B8] text-xs font-bold text-[#3B0C13]">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span>{product.rating || 4.9}</span>
                <span className="text-[#8C7A6B] font-normal">
                  ({product.reviewsCount || 48} verified ratings)
                </span>
              </div>
              <span className="text-xs text-[#8C7A6B]">SKU: {product.sku || 'LUX-KURTI'}</span>
              {product.stock && product.stock <= 10 && (
                <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 animate-pulse">
                  ⚡ Only {product.stock} items left in stock
                </span>
              )}
            </div>
          </div>

          {/* Pricing Box (₹699 Special) */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-[#FAF6EE] to-[#FFFDF9] rounded-2xl border border-[#EAE3D2] shadow-xs">
            <div className="flex items-baseline flex-wrap gap-3">
              <span className="text-3xl sm:text-4xl font-black text-[#4A0E17]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-lg text-[#9E8E81] line-through font-normal">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              {product.discountPercent > 0 && (
                <span className="bg-[#801723] text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                  SAVE {product.discountPercent}%
                </span>
              )}
            </div>
            <p className="text-xs text-[#7A695C] mt-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>
                Inclusive of all GST taxes • <strong>Free Express Shipping</strong> across India
              </span>
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
          <div id="size-selector-area">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3D332A]">
                SELECT SIZE:{' '}
                {selectedSize ? (
                  <span className="text-[#4A0E17] font-black text-sm">{selectedSize}</span>
                ) : (
                  <span className="text-red-600 font-extrabold text-xs">* Select a size</span>
                )}
              </span>
              <button
                type="button"
                onClick={() => toggleAccordion('sizeGuide')}
                className="text-xs font-bold text-[#801723] hover:text-[#B8860B] underline underline-offset-2 cursor-pointer"
              >
                Size Chart (Inches)
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {availableSizes.map(sz => {
                const isSelected = selectedSize === sz;
                return (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      setSelectedSize(sz);
                      setSizeError(null);
                    }}
                    className={`w-12 h-12 rounded-xl text-xs font-extrabold border transition-all cursor-pointer flex items-center justify-center ${
                      isSelected
                        ? 'bg-[#4A0E17] text-[#DFBA67] border-[#D4AF37] shadow-md scale-105 ring-2 ring-[#DFBA67]/50'
                        : 'bg-white text-[#3D332A] border-[#EAE3D2] hover:border-[#D4AF37] hover:bg-[#FAF6EE]'
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
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-[#4A0E17] hover:bg-[#FAF6EE] rounded-lg cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center text-xs font-bold text-[#1A1A1A]">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(q => Math.min(product.stock || 50, q + 1))}
                className="w-9 h-9 flex items-center justify-center text-[#4A0E17] hover:bg-[#FAF6EE] rounded-lg cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons: Add to Cart & Buy Now */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 font-bold text-sm py-4 px-6 rounded-2xl border-2 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                addedAnimation
                  ? 'bg-emerald-700 text-white border-emerald-700'
                  : 'bg-[#FAF6EE] hover:bg-[#FAF0DC] text-[#4A0E17] border-[#4A0E17]'
              }`}
            >
              {addedAnimation ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>ADDED TO CART!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5 text-[#801723]" />
                  <span>ADD TO CART</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 bg-[#4A0E17] hover:bg-[#62121E] text-[#DFBA67] font-bold text-sm py-4 px-6 rounded-2xl border-2 border-[#D4AF37] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Zap className="w-5 h-5 text-[#DFBA67] fill-current" />
              <span>BUY NOW</span>
            </button>
          </div>

          {/* Trust Guarantees Row */}
          <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-[#FAF6EE]/80 rounded-xl border border-[#EAE3D2] text-[11px] text-[#5A4D41]">
            <div className="flex items-center gap-1.5 justify-center text-center">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-semibold">100% Genuine</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center text-center border-x border-[#EAE3D2]">
              <RefreshCw className="w-4 h-4 text-[#801723] shrink-0" />
              <span className="font-semibold">7-Day Return</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center text-center">
              <Lock className="w-4 h-4 text-[#B8860B] shrink-0" />
              <span className="font-semibold">Verified UPI</span>
            </div>
          </div>

          {/* Pincode Delivery Checker */}
          <div className="p-4 bg-white rounded-2xl border border-[#EAE3D2] shadow-xs">
            <span className="text-xs font-bold text-[#3B0C13] uppercase tracking-wider block mb-2">
              ESTIMATED DELIVERY CHECKER
            </span>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 6-digit PIN code (e.g. 110001)"
                maxLength={6}
                value={pincode}
                onChange={e => setPincode(e.target.value)}
                className="flex-1 bg-[#FAF6EE] text-xs px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 focus:outline-none focus:ring-1 focus:ring-[#4A0E17]"
              />
              <button
                type="submit"
                className="bg-[#4A0E17] text-[#DFBA67] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#D4AF37] hover:bg-[#62121E] transition-colors cursor-pointer"
              >
                CHECK
              </button>
            </form>
            {pincodeStatus && (
              <p
                className={`text-xs font-semibold mt-2.5 p-2.5 rounded-xl border ${
                  pincodeStatus.success
                    ? 'text-emerald-900 bg-emerald-50 border-emerald-200'
                    : 'text-red-900 bg-red-50 border-red-200'
                }`}
              >
                {pincodeStatus.message}
              </p>
            )}
          </div>

          {/* Expandable Specifications & Information Accordions */}
          <div className="space-y-3 pt-4 border-t border-[#EAE3D2]">
            {/* 1. Description */}
            <div className="border border-[#EAE3D2] rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => toggleAccordion('description')}
                className="w-full p-4 text-left font-bold text-xs uppercase tracking-wider text-[#3B0C13] flex items-center justify-between cursor-pointer"
              >
                <span>PRODUCT DESCRIPTION</span>
                {openAccordions.description ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {openAccordions.description && (
                <div className="p-4 pt-0 text-xs text-[#5A4D41] leading-relaxed border-t border-[#EAE3D2]/50 whitespace-pre-line">
                  {product.description || product.shortDescription}
                </div>
              )}
            </div>

            {/* 2. Key Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="border border-[#EAE3D2] rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => toggleAccordion('highlights')}
                  className="w-full p-4 text-left font-bold text-xs uppercase tracking-wider text-[#3B0C13] flex items-center justify-between cursor-pointer"
                >
                  <span>KEY HIGHLIGHTS</span>
                  {openAccordions.highlights ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {openAccordions.highlights && (
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

            {/* 3. Product Specifications */}
            <div className="border border-[#EAE3D2] rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => toggleAccordion('details')}
                className="w-full p-4 text-left font-bold text-xs uppercase tracking-wider text-[#3B0C13] flex items-center justify-between cursor-pointer"
              >
                <span>PRODUCT SPECIFICATIONS</span>
                {openAccordions.details ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {openAccordions.details && (
                <div className="p-4 pt-0 text-xs text-[#5A4D41] leading-relaxed border-t border-[#EAE3D2]/50 space-y-1.5">
                  <p>
                    • <strong>Category & Style:</strong>{' '}
                    {product.style || product.subcategory || product.category || 'Ethnic Kurti'}
                  </p>
                  <p>
                    • <strong>Color:</strong>{' '}
                    {product.color || product.colors?.join(', ') || 'Multicolor'}
                  </p>
                  <p>
                    • <strong>Pattern / Print:</strong>{' '}
                    {product.pattern || 'Designer Print / Handcrafted Detailing'}
                  </p>
                  <p>
                    • <strong>Neckline:</strong>{' '}
                    {product.neck || 'Mandarin Collar / Round Notch Neck'}
                  </p>
                  <p>
                    • <strong>Sleeve Type:</strong>{' '}
                    {product.sleeves || '3/4th Sleeves with Border Accent'}
                  </p>
                  {product.setIncludes && (
                    <p>
                      • <strong>Set Includes:</strong> {product.setIncludes}
                    </p>
                  )}
                  <p>
                    • <strong>Fit:</strong> {product.fit || 'Regular Straight Fit'}
                  </p>
                  <p>
                    • <strong>Fabric Composition:</strong>{' '}
                    {product.fabric || '100% Breathable Pure Cotton'}
                  </p>
                  <p>
                    • <strong>Occasion:</strong>{' '}
                    {product.occasion || 'Office, College, Casual Outings & Festive Gatherings'}
                  </p>
                </div>
              )}
            </div>

            {/* 4. Shipping Info */}
            <div className="border border-[#EAE3D2] rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => toggleAccordion('shipping')}
                className="w-full p-4 text-left font-bold text-xs uppercase tracking-wider text-[#3B0C13] flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#801723]" />
                  <span>DELIVERY & SHIPPING INFORMATION</span>
                </div>
                {openAccordions.shipping ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {openAccordions.shipping && (
                <div className="p-4 pt-0 text-xs text-[#5A4D41] leading-relaxed border-t border-[#EAE3D2]/50 space-y-1.5">
                  <p>• <strong>Dispatched within 24 Hours:</strong> Every order is carefully hand-inspected and packed in high-grade protective packaging.</p>
                  <p>• <strong>Transit Duration:</strong> Metro cities arrive in 2-3 business days; Rest of India within 3-5 business days.</p>
                  <p>• <strong>Free Shipping:</strong> Free express doorstep delivery across all Indian pin codes.</p>
                </div>
              )}
            </div>

            {/* 5. Return & Exchange Policy */}
            <div className="border border-[#EAE3D2] rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => toggleAccordion('returns')}
                className="w-full p-4 text-left font-bold text-xs uppercase tracking-wider text-[#3B0C13] flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-[#801723]" />
                  <span>7-DAY EASY RETURN & EXCHANGE</span>
                </div>
                {openAccordions.returns ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {openAccordions.returns && (
                <div className="p-4 pt-0 text-xs text-[#5A4D41] leading-relaxed border-t border-[#EAE3D2]/50 space-y-1.5">
                  <p>• Hassle-free 7-day doorstep exchange for size or design changes.</p>
                  <p>• Reverse pickup arranged straight from your location.</p>
                  <p>• Item must be unused, unwashed with original brand tags attached.</p>
                </div>
              )}
            </div>

            {/* 6. Size Guide Table */}
            <div className="border border-[#EAE3D2] rounded-xl overflow-hidden bg-white">
              <button
                type="button"
                onClick={() => toggleAccordion('sizeGuide')}
                className="w-full p-4 text-left font-bold text-xs uppercase tracking-wider text-[#3B0C13] flex items-center justify-between cursor-pointer"
              >
                <span>KURTI SIZE CHART (INCHES)</span>
                {openAccordions.sizeGuide ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              {openAccordions.sizeGuide && (
                <div className="p-4 pt-0 text-xs text-[#5A4D41] border-t border-[#EAE3D2]/50 overflow-x-auto">
                  <table className="w-full text-left border-collapse mt-2">
                    <thead>
                      <tr className="bg-[#FAF6EE] border-b border-[#EAE3D2]">
                        <th className="p-2.5 font-bold text-[#3B0C13]">Size</th>
                        <th className="p-2.5 font-bold text-[#3B0C13]">Bust (in)</th>
                        <th className="p-2.5 font-bold text-[#3B0C13]">Waist (in)</th>
                        <th className="p-2.5 font-bold text-[#3B0C13]">Hip (in)</th>
                        <th className="p-2.5 font-bold text-[#3B0C13]">Length (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#EAE3D2]/50"><td className="p-2.5 font-bold">XS</td><td className="p-2.5">34"</td><td className="p-2.5">30"</td><td className="p-2.5">36"</td><td className="p-2.5">44"</td></tr>
                      <tr className="border-b border-[#EAE3D2]/50"><td className="p-2.5 font-bold">S</td><td className="p-2.5">36"</td><td className="p-2.5">32"</td><td className="p-2.5">38"</td><td className="p-2.5">44"</td></tr>
                      <tr className="border-b border-[#EAE3D2]/50"><td className="p-2.5 font-bold">M</td><td className="p-2.5">38"</td><td className="p-2.5">34"</td><td className="p-2.5">40"</td><td className="p-2.5">44"</td></tr>
                      <tr className="border-b border-[#EAE3D2]/50"><td className="p-2.5 font-bold">L</td><td className="p-2.5">40"</td><td className="p-2.5">36"</td><td className="p-2.5">42"</td><td className="p-2.5">45"</td></tr>
                      <tr className="border-b border-[#EAE3D2]/50"><td className="p-2.5 font-bold">XL</td><td className="p-2.5">42"</td><td className="p-2.5">38"</td><td className="p-2.5">44"</td><td className="p-2.5">45"</td></tr>
                      <tr className="border-b border-[#EAE3D2]/50"><td className="p-2.5 font-bold">XXL</td><td className="p-2.5">44"</td><td className="p-2.5">40"</td><td className="p-2.5">46"</td><td className="p-2.5">46"</td></tr>
                      <tr><td className="p-2.5 font-bold">3XL</td><td className="p-2.5">46"</td><td className="p-2.5">42"</td><td className="p-2.5">48"</td><td className="p-2.5">46"</td></tr>
                    </tbody>
                  </table>
                  <p className="text-[11px] text-[#8C7A6B] mt-2 italic">
                    Tip: If you fall between sizes, we recommend ordering one size up for a relaxed fit.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Recommendation Section 1: Similar Products for THIS specific product */}
      {similarProducts.length > 0 && (
        <ProductRecommendations
          currentProduct={product}
          recommendedProducts={similarProducts}
          onSelectProduct={handleSelectProduct}
          title="Similar Products"
          subtitle={`Styles curated to match ${product.subcategory || product.category || 'Kurti'} designs and shades`}
        />
      )}

      {/* Dynamic Recommendation Section 2: Trending Alternates / You May Also Like */}
      {trendingAlternates.length > 0 && (
        <ProductRecommendations
          currentProduct={product}
          recommendedProducts={trendingAlternates.filter(p => !similarProducts.slice(0, 4).some(sp => sp.id === p.id))}
          onSelectProduct={handleSelectProduct}
          title="You May Also Like"
          subtitle="Top trending bestselling festive kurtis loved by customers"
        />
      )}

      {/* Recently Viewed Browsing History Section */}
      {recentlyViewedProducts.length > 0 && (
        <RecentlyViewedSection
          products={recentlyViewedProducts}
          onSelectProduct={handleSelectProduct}
          onClearHistory={() => setRecentProductIds([])}
        />
      )}
    </div>
  );
};
