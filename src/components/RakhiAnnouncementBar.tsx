import React from 'react';
import { Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const RakhiAnnouncementBar: React.FC = () => {
  const { rakhiOffer, navigate } = useShop();

  if (!rakhiOffer.isActive) return null;

  return (
    <div
      onClick={() => navigate('shop')}
      className="bg-[#4A0E17] text-[#DFBA67] text-xs md:text-sm py-2 px-3 tracking-wider font-medium text-center cursor-pointer transition-colors duration-200 border-b border-[#5E1B26] relative overflow-hidden flex items-center justify-center gap-2 group"
    >
      <Sparkles className="w-3.5 h-3.5 text-[#DFBA67] animate-sparkle shrink-0" />
      <div className="flex items-center gap-2 truncate">
        <span className="font-bold uppercase tracking-widest text-white bg-[#6A1623] px-2 py-0.5 rounded text-[10px] border border-[#B8860B]/40">
          {rakhiOffer.title}
        </span>
        <span className="hidden sm:inline font-light text-amber-100">
          {rakhiOffer.subtitle}
        </span>
        <span className="font-semibold text-amber-200 underline underline-offset-2 decoration-[#DFBA67] group-hover:text-white transition-colors">
          Shop Rakhi Edit →
        </span>
      </div>
      <Sparkles className="w-3.5 h-3.5 text-[#DFBA67] animate-sparkle shrink-0 hidden sm:block" />
    </div>
  );
};
