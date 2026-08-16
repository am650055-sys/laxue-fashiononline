import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CategoriesPage: React.FC = () => {
  const { categories, setActiveCategoryFilter, navigate } = useShop();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
      <div className="border-b border-[#EAE3D2] pb-4 mb-6">
        <h1 className="font-serif-luxury text-2xl font-bold text-[#3B0C13]">
          KURTI COLLECTIONS
        </h1>
        <p className="text-xs text-[#7A695C]">
          Browse our curated Indian ethnic fashion edits.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div
            key={cat.id}
            onClick={() => {
              setActiveCategoryFilter(cat.name);
              navigate('shop');
            }}
            className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer shadow-lg border-2 border-[#D4AF37]/40"
          >
            <img
              src={cat.image}
              alt={cat.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2B090E]/90 via-[#2B090E]/30 to-transparent"></div>

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#DFBA67] block mb-1">
                {cat.itemCount} STYLES AVAILABLE
              </span>
              <h3 className="font-serif-luxury text-xl font-bold leading-tight">
                {cat.name}
              </h3>
              <div className="flex items-center gap-1 text-xs font-bold text-[#DFBA67] mt-2 group-hover:translate-x-1 transition-transform">
                <span>VIEW COLLECTION</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
