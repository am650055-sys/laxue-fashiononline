import React, { useState } from 'react';
import {
  X,
  Search,
  Heart,
  ShoppingBag,
  User,
  Crown,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { RakhiAnnouncementBar } from './RakhiAnnouncementBar';

export const Header: React.FC = () => {
  const {
    cart,
    wishlist,
    currentView,
    navigate,
    products,
    categories,
    setActiveCategoryFilter,
  } = useShop();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const searchResults = searchInput.trim()
    ? products.filter(
        p =>
          p.name.toLowerCase().includes(searchInput.toLowerCase()) ||
          p.category.toLowerCase().includes(searchInput.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setIsSearchOpen(false);
      navigate('shop');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EAE3D2] shadow-xs">
      {/* Top Announcement Strip */}
      <RakhiAnnouncementBar />

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => navigate('home')}
          className="cursor-pointer text-left flex flex-col justify-center select-none"
        >
          <div className="flex items-center justify-start gap-1.5">
            <Crown className="w-4 h-4 text-[#D4AF37] block" />
            <span className="font-serif-luxury text-xl sm:text-2xl lg:text-3xl font-bold tracking-[0.18em] text-[#3B0C13] uppercase leading-none">
              LUXUE
            </span>
          </div>
          <span className="text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-[#7A695C] font-semibold mt-0.5">
            FASHION ONLINE
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 text-xs lg:text-sm font-medium uppercase tracking-widest text-[#3D332A]">
          <button
            onClick={() => navigate('home')}
            className={`transition-colors hover:text-[#B8860B] cursor-pointer ${
              currentView === 'home' ? 'text-[#3B0C13] font-bold border-b-2 border-[#D4AF37] pb-1' : ''
            }`}
          >
            HOME
          </button>
          <button
            onClick={() => {
              setActiveCategoryFilter('All');
              navigate('shop');
            }}
            className={`transition-colors hover:text-[#B8860B] cursor-pointer ${
              currentView === 'shop' ? 'text-[#3B0C13] font-bold border-b-2 border-[#D4AF37] pb-1' : ''
            }`}
          >
            SHOP
          </button>
          <button
            onClick={() => navigate('categories')}
            className={`transition-colors hover:text-[#B8860B] cursor-pointer ${
              currentView === 'categories' ? 'text-[#3B0C13] font-bold border-b-2 border-[#D4AF37] pb-1' : ''
            }`}
          >
            COLLECTIONS
          </button>
          <button
            onClick={() => {
              setActiveCategoryFilter('New Arrivals');
              navigate('shop');
            }}
            className="transition-colors hover:text-[#B8860B] text-[#801723] font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
            NEW ARRIVALS
          </button>
          <button
            onClick={() => navigate('about')}
            className={`transition-colors hover:text-[#B8860B] cursor-pointer ${
              currentView === 'about' ? 'text-[#3B0C13] font-bold border-b-2 border-[#D4AF37] pb-1' : ''
            }`}
          >
            ABOUT
          </button>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center space-x-1 sm:space-x-3">
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-[#2D2622] hover:text-[#B8860B] transition-colors cursor-pointer"
            title="Search Kurtis"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist Button */}
          <button
            onClick={() => navigate('wishlist')}
            className="p-2 text-[#2D2622] hover:text-[#B8860B] transition-colors relative cursor-pointer"
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 bg-[#4A0E17] text-[#DFBA67] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-[#DFBA67]">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Account Button (Desktop) */}
          <button
            onClick={() => navigate('profile')}
            className="hidden md:block p-2 text-[#2D2622] hover:text-[#B8860B] transition-colors cursor-pointer"
            title="My Profile"
          >
            <User className="w-5 h-5" />
          </button>

          {/* Cart Button */}
          <button
            onClick={() => navigate('cart')}
            className="p-2 bg-[#4A0E17] text-[#DFBA67] rounded-full hover:bg-[#62121E] transition-all flex items-center gap-1.5 px-3 py-1.5 shadow-xs border border-[#B8860B]/50 cursor-pointer"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-4 h-4 text-[#DFBA67]" />
            <span className="text-xs font-bold text-white">{totalCartCount}</span>
          </button>
        </div>
      </div>

      {/* Search Modal Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 px-4">
          <div className="bg-[#FAF8F5] w-full max-w-2xl rounded-2xl shadow-2xl border border-[#D4AF37]/30 overflow-hidden">
            <div className="p-4 border-b border-[#EAE3D2] flex items-center gap-3">
              <Search className="w-5 h-5 text-[#801723]" />
              <form onSubmit={handleSearchSubmit} className="flex-1">
                <input
                  type="text"
                  placeholder="Search Kurtis, Anarkali, Cotton, Festive..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-base text-[#2D2622] focus:outline-none placeholder:text-[#A09082]"
                />
              </form>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-1.5 text-[#5A4D41] hover:text-black rounded-full hover:bg-[#EAE3D2]/50 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Suggestions */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {searchInput.trim() ? (
                searchResults.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-[#801723] uppercase tracking-wider">
                      Matching Kurtis ({searchResults.length})
                    </p>
                    {searchResults.map(prod => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          setIsSearchOpen(false);
                          navigate('product-detail', prod.id);
                        }}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F2EFE9] cursor-pointer transition-colors"
                      >
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-12 h-14 object-cover rounded-lg border border-[#D4AF37]/30"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#2D2622] truncate">
                            {prod.name}
                          </p>
                          <p className="text-xs text-[#7A695C]">{prod.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-[#4A0E17]">
                            ₹{prod.price}
                          </p>
                          <p className="text-[10px] text-emerald-700 font-semibold">
                            {prod.discountPercent}% OFF
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-[#7A695C]">No Kurtis found for "{searchInput}"</p>
                    <p className="text-xs text-[#A09082] mt-1">Try searching for "Anarkali", "Silk", or "Cotton"</p>
                  </div>
                )
              ) : (
                <div>
                  <p className="text-xs font-semibold text-[#7A695C] uppercase tracking-wider mb-2">
                    Popular Categories
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {categories.slice(0, 6).map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setActiveCategoryFilter(cat.name);
                          setIsSearchOpen(false);
                          navigate('shop');
                        }}
                        className="px-3 py-1.5 bg-[#F2EFE9] hover:bg-[#E2DCD0] text-xs font-medium text-[#3D332A] rounded-full border border-[#D4AF37]/30 transition-colors cursor-pointer"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
