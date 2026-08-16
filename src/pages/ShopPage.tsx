import React, { useState, useMemo } from 'react';
import { ArrowLeft, SlidersHorizontal, ArrowUpDown, Search, X, Check } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from '../components/ProductCard';
import { Size } from '../types';
import { EmptyState } from '../components/EmptyState';

export const ShopPage: React.FC = () => {
  const {
    products,
    categories,
    navigate,
    activeCategoryFilter,
    setActiveCategoryFilter,
  } = useShop();

  const [sortOption, setSortOption] = useState<string>('recommended');
  const [selectedCategory, setSelectedCategory] = useState<string>(activeCategoryFilter || 'All');
  const [searchQueryInput, setSearchQueryInput] = useState<string>('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);
  const [selectedSizes, setSelectedSizes] = useState<Size[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [giftEligibleOnly, setGiftEligibleOnly] = useState<boolean>(false);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Category
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'New Arrivals') {
        list = list.filter(p => p.isNewArrival);
      } else if (selectedCategory === 'Best Sellers') {
        list = list.filter(p => p.isBestSeller);
      } else {
        list = list.filter(
          p => p.category.toLowerCase() === selectedCategory.toLowerCase()
        );
      }
    }

    // Search Query
    if (searchQueryInput.trim()) {
      const q = searchQueryInput.toLowerCase().trim();
      list = list.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q)
      );
    }

    // Sizes
    if (selectedSizes.length > 0) {
      list = list.filter(p => p.sizes.some(s => selectedSizes.includes(s)));
    }

    // Price
    list = list.filter(p => p.price <= maxPrice);

    // Gift Eligible
    if (giftEligibleOnly) {
      list = list.filter(p => p.isRakhiGiftEligible);
    }

    // Sorting
    if (sortOption === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortOption === 'discount') {
      list.sort((a, b) => b.discountPercent - a.discountPercent);
    } else if (sortOption === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [products, selectedCategory, searchQueryInput, selectedSizes, maxPrice, giftEligibleOnly, sortOption]);

  const toggleSize = (size: Size) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSearchQueryInput('');
    setSelectedSizes([]);
    setMaxPrice(3000);
    setGiftEligibleOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Top Mobile Shopping Header Bar */}
      <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-4 mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('home')}
            className="p-2 text-[#4A0E17] hover:bg-[#FAF6EE] rounded-full transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif-luxury text-lg sm:text-2xl font-bold text-[#3B0C13]">
              Kurtis for Women
            </h1>
            <p className="text-[11px] text-[#7A695C]">
              Showing {filteredProducts.length} handcrafted styles
            </p>
          </div>
        </div>

        {/* Quick Search Input */}
        <div className="relative hidden sm:block w-64">
          <Search className="w-4 h-4 text-[#801723] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Kurtis..."
            value={searchQueryInput}
            onChange={e => setSearchQueryInput(e.target.value)}
            className="w-full bg-[#FAF6EE] text-xs pl-9 pr-3 py-2 rounded-xl border border-[#D4AF37]/40 focus:outline-none focus:border-[#4A0E17]"
          />
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-4">
        <button
          onClick={() => {
            setSelectedCategory('All');
            setActiveCategoryFilter('All');
          }}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === 'All'
              ? 'bg-[#4A0E17] text-[#DFBA67] border border-[#D4AF37] shadow-xs'
              : 'bg-[#FAF6EE] text-[#3D332A] hover:bg-[#EAE3D2] border border-[#EAE3D2]'
          }`}
        >
          ALL KURTIS
        </button>
        {categories.map(cat => {
          const isActive = selectedCategory === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.name);
                setActiveCategoryFilter(cat.name);
              }}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#4A0E17] text-[#DFBA67] border border-[#D4AF37] shadow-xs'
                  : 'bg-[#FAF6EE] text-[#3D332A] hover:bg-[#EAE3D2] border border-[#EAE3D2]'
              }`}
            >
              {cat.name.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Controls Bar: Sort & Filter Buttons */}
      <div className="flex items-center justify-between bg-[#FAF6EE] p-3 rounded-2xl border border-[#EAE3D2] mb-6">
        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="flex items-center gap-2 text-xs font-bold text-[#4A0E17] bg-white px-4 py-2 rounded-xl border border-[#D4AF37]/50 shadow-xs cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#B8860B]" />
          <span>FILTER ({selectedSizes.length + (giftEligibleOnly ? 1 : 0)})</span>
        </button>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-[#801723]" />
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className="bg-white text-xs font-bold text-[#3B0C13] px-3 py-2 rounded-xl border border-[#D4AF37]/50 focus:outline-none cursor-pointer"
          >
            <option value="recommended">Sort: Recommended</option>
            <option value="newest">Sort: Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="discount">Biggest Discount</option>
          </select>
        </div>
      </div>

      {/* Main Grid + Desktop Filter Sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Desktop Sidebar Filter (col-span-3) */}
        <div className="hidden md:block md:col-span-3 space-y-6 bg-white p-5 rounded-2xl border border-[#EAE3D2] shadow-xs h-fit sticky top-24">
          <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-3">
            <h3 className="font-bold text-sm text-[#3B0C13] uppercase tracking-wider">
              FILTERS
            </h3>
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#801723] hover:underline font-semibold"
            >
              Clear All
            </button>
          </div>

          {/* Size Filter */}
          <div>
            <h4 className="text-xs font-bold text-[#5A4D41] uppercase tracking-wider mb-2">
              SELECT SIZE
            </h4>
            <div className="flex flex-wrap gap-2">
              {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as Size[]).map(sz => {
                const isSelected = selectedSizes.includes(sz);
                return (
                  <button
                    key={sz}
                    onClick={() => toggleSize(sz)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#4A0E17] text-[#DFBA67] border-[#D4AF37]'
                        : 'bg-[#FAF6EE] text-[#3D332A] hover:border-[#D4AF37]'
                    }`}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <div className="flex justify-between items-center text-xs font-bold text-[#5A4D41] mb-2">
              <span>MAX PRICE:</span>
              <span className="text-[#4A0E17]">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="500"
              max="3500"
              step="100"
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#4A0E17] cursor-pointer"
            />
          </div>

          {/* Rakhi Gift Filter */}
          <div className="pt-2 border-t border-[#EAE3D2]">
            <label className="flex items-center gap-2 text-xs font-bold text-[#4A0E17] cursor-pointer">
              <input
                type="checkbox"
                checked={giftEligibleOnly}
                onChange={e => setGiftEligibleOnly(e.target.checked)}
                className="accent-[#4A0E17] w-4 h-4 rounded"
              />
              <span>🎁 FREE RAKHI GIFT ELIGIBLE ONLY</span>
            </label>
          </div>
        </div>

        {/* Product Grid Area (col-span-9 on desktop, col-span-12 on mobile) */}
        <div className="md:col-span-9">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              type="no-search-results"
              searchQuery={searchQueryInput}
              onAction={clearAllFilters}
              actionText="CLEAR ALL FILTERS"
            />
          )}
        </div>

      </div>

      {/* Mobile Bottom-Sheet Filter Drawer */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end">
          <div className="bg-[#FAF8F5] w-full max-h-[85vh] rounded-t-3xl p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-4 mb-6">
                <h3 className="font-serif-luxury text-lg font-bold text-[#3B0C13]">
                  FILTER KURTIS
                </h3>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1 text-[#5A4D41]"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Size Filter */}
              <div className="mb-6">
                <h4 className="text-xs font-bold text-[#5A4D41] uppercase tracking-wider mb-3">
                  SELECT SIZE
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(['XS', 'S', 'M', 'L', 'XL', 'XXL'] as Size[]).map(sz => {
                    const isSelected = selectedSizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        onClick={() => toggleSize(sz)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#4A0E17] text-[#DFBA67] border-[#D4AF37]'
                            : 'bg-[#FAF6EE] text-[#3D332A]'
                        }`}
                      >
                        {sz}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mobile Price Slider */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs font-bold text-[#5A4D41] mb-2">
                  <span>MAX PRICE:</span>
                  <span className="text-[#4A0E17] text-sm">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="3500"
                  step="100"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#4A0E17]"
                />
              </div>

              {/* Mobile Gift Filter */}
              <div className="mb-6 bg-[#FFF8EC] p-3 rounded-xl border border-[#E8D8B8]">
                <label className="flex items-center gap-2 text-xs font-bold text-[#4A0E17]">
                  <input
                    type="checkbox"
                    checked={giftEligibleOnly}
                    onChange={e => setGiftEligibleOnly(e.target.checked)}
                    className="accent-[#4A0E17] w-4 h-4"
                  />
                  <span>🎁 SHOW FREE RAKHI GIFT ELIGIBLE ONLY</span>
                </label>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex gap-3 pt-4 border-t border-[#EAE3D2]">
              <button
                onClick={() => {
                  clearAllFilters();
                  setIsFilterDrawerOpen(false);
                }}
                className="flex-1 py-3 text-xs font-bold text-[#4A0E17] bg-[#FAF6EE] rounded-xl border border-[#D4AF37]/40"
              >
                RESET
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-3 text-xs font-bold text-[#DFBA67] bg-[#4A0E17] rounded-xl border border-[#D4AF37] shadow-md"
              >
                APPLY FILTERS ({filteredProducts.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
