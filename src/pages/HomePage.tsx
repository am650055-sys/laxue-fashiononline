import React from 'react';
import { ArrowRight, Sparkles, Gift } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { RakhiHeroBanner } from '../components/RakhiHeroBanner';
import { TrustSection } from '../components/TrustSection';

export const HomePage: React.FC = () => {
  const { navigate, setActiveCategoryFilter } = useShop();

  const rakhiCategories = [
    {
      id: 'rakhi-gift-edit',
      name: 'Rakhi Gift Edit',
      subtitle: 'Exclusive ₹1,000 Free Gift Selections & Festive Sets',
      image: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&q=80&w=800',
      categoryFilter: 'All',
    },
    {
      id: 'festive-kurtis',
      name: 'Festive Kurtis',
      subtitle: 'Royal Chanderi Silk & Zardozi Embroidered Ensembles',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      categoryFilter: 'Festive Kurtis',
    },
    {
      id: 'designer-kurtis',
      name: 'Designer Kurtis',
      subtitle: 'Contemporary Silhouettes & Artisan Handblock Prints',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800',
      categoryFilter: 'Designer Kurtis',
    },
    {
      id: 'gift-worthy-styles',
      name: 'Gift Worthy Styles',
      subtitle: 'Anarkalis, Straight Cut Sets & Luxe Silk Dupattas',
      image: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=800',
      categoryFilter: 'Anarkali Kurtis',
    },
  ];

  return (
    <div className="space-y-10 sm:space-y-14 pb-12">
      
      {/* 1. Premium Rakhi Hero Banner (No Human / No Model) */}
      <RakhiHeroBanner />

      {/* 2. Celebrate Rakhi With LUXUE - Premium Category Edits */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-[#5B0F15]/10 text-[#5B0F15] px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] border border-[#C5A059]/40 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>FESTIVE CURATIONS</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#5B0F15] tracking-tight">
            CELEBRATE RAKHI WITH LUXUE
          </h2>
          <p className="text-xs sm:text-base text-[#555555] mt-2 font-medium leading-relaxed">
            Thoughtful fashion gifts for the people who make every moment special.
          </p>
        </div>

        {/* 4 Premium Category Tiles (NOT Individual Product Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {rakhiCategories.map(cat => (
            <div
              key={cat.id}
              onClick={() => {
                setActiveCategoryFilter(cat.categoryFilter);
                navigate('shop');
              }}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] cursor-pointer shadow-lg border border-[#C5A059]/40 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Background Art / Decorative Image */}
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 brightness-95 group-hover:brightness-100"
                referrerPolicy="no-referrer"
              />
              
              {/* Luxury Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2D0508]/95 via-[#2D0508]/40 to-transparent"></div>
              
              {/* Top Accent Pill */}
              <div className="absolute top-3 right-3 bg-[#5B0F15]/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#C5A059]/60 flex items-center gap-1 text-[10px] font-bold text-[#D8B56F]">
                <Gift className="w-3 h-3" />
                <span>RAKHI EDIT</span>
              </div>

              {/* Bottom Tile Content */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#F9F5F0] leading-tight group-hover:text-[#D8B56F] transition-colors mb-1">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-amber-100/80 font-normal leading-snug line-clamp-2 mb-3">
                  {cat.subtitle}
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#D8B56F] group-hover:translate-x-1.5 transition-transform uppercase tracking-wider">
                  <span>EXPLORE EDIT</span>
                  <ArrowRight className="w-4 h-4 text-[#C5A059]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Customer Trust Section */}
      <TrustSection />

    </div>
  );
};
