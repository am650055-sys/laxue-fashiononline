import React from 'react';
import { Sparkles, Gift, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const RakhiHeroBanner: React.FC = () => {
  const { rakhiOffer, cartSubtotal, isRakhiOfferUnlocked, amountNeededForRakhiOffer, navigate } = useShop();

  if (!rakhiOffer.isActive) return null;

  const progressPercent = Math.min(100, (cartSubtotal / rakhiOffer.minCartValue) * 100);

  return (
    <section className="relative w-full max-w-7xl mx-auto my-3 sm:my-6 px-3 sm:px-6">
      {/* Container with Luxury Ivory/Cream Card & Champagne Gold Frame */}
      <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#FAF5EE] via-[#FFFDF9] to-[#F3E8D0] border-2 border-[#C5A059]/60 shadow-xl transition-all duration-300">
        
        {/* Luxury Indian Ornamental Corners */}
        <div className="absolute top-2 left-2 w-7 h-7 sm:w-10 sm:h-10 border-t-2 border-l-2 border-[#C5A059] rounded-tl pointer-events-none opacity-80 flex items-start justify-start p-1">
          <div className="w-2 h-2 rounded-full bg-[#5B0F15]" />
        </div>
        <div className="absolute top-2 right-2 w-7 h-7 sm:w-10 sm:h-10 border-t-2 border-r-2 border-[#C5A059] rounded-tr pointer-events-none opacity-80 flex items-start justify-end p-1">
          <div className="w-2 h-2 rounded-full bg-[#5B0F15]" />
        </div>
        <div className="absolute bottom-2 left-2 w-7 h-7 sm:w-10 sm:h-10 border-b-2 border-l-2 border-[#C5A059] rounded-bl pointer-events-none opacity-80 flex items-end justify-start p-1">
          <div className="w-2 h-2 rounded-full bg-[#5B0F15]" />
        </div>
        <div className="absolute bottom-2 right-2 w-7 h-7 sm:w-10 sm:h-10 border-b-2 border-r-2 border-[#C5A059] rounded-br pointer-events-none opacity-80 flex items-end justify-end p-1">
          <div className="w-2 h-2 rounded-full bg-[#5B0F15]" />
        </div>

        {/* Ambient Subtle Gold Glow Particles */}
        <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-[#5B0F15]/5 rounded-full blur-2xl pointer-events-none" />

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center min-h-[460px] sm:min-h-[500px]">
          
          {/* LEFT COLUMN: Campaign Offer Text & Action */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 z-10 flex flex-col justify-center text-center lg:text-left">
            
            {/* Top Festive Badge */}
            <div className="inline-flex items-center gap-2 self-center lg:self-start bg-wine-gradient text-[#D8B56F] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] shadow-md border border-[#C5A059]/60 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#D8B56F] animate-pulse" />
              <span>RAKHI SPECIAL</span>
            </div>

            {/* Main Offer Headline with High Typography Hierarchy */}
            <div className="mb-4">
              <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-[#5B0F15] block mb-1">
                SHOP FOR
              </span>
              <div className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-[#5B0F15] leading-none tracking-tight">
                ₹2,500
              </div>
              <div className="text-xs sm:text-base font-bold uppercase tracking-[0.2em] text-[#C5A059] my-1.5">
                & GET
              </div>
              <div className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-gold-gradient leading-none tracking-tight">
                ₹1,000
              </div>
              <div className="font-serif text-lg sm:text-2xl font-bold text-[#5B0F15] tracking-widest mt-1 uppercase">
                WORTH OF FASHION FREE
              </div>
            </div>

            {/* Supporting Text */}
            <p className="text-xs sm:text-sm text-[#4A4A4A] font-medium max-w-md mx-auto lg:mx-0 mb-5 leading-relaxed italic">
              “Celebrate the bond of love with an exclusive LUXUE Rakhi offer.”
            </p>

            {/* Offer Progress Tracker Bar */}
            <div className="bg-white/80 border border-[#C5A059]/40 rounded-2xl p-3.5 sm:p-4 mb-5 shadow-xs max-w-lg mx-auto lg:mx-0 backdrop-blur-xs">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-[#5B0F15]">
                  <Gift className="w-4 h-4 text-[#C5A059]" />
                  {isRakhiOfferUnlocked ? (
                    <span className="text-emerald-700 font-extrabold">🎁 ₹1,000 GIFT UNLOCKED IN CART!</span>
                  ) : (
                    <span>Add ₹{amountNeededForRakhiOffer} more to unlock ₹1,000 Gift</span>
                  )}
                </span>
                <span className="text-[#5B0F15] font-extrabold">₹{cartSubtotal} / ₹2,500</span>
              </div>
              <div className="w-full bg-[#EAE3D2] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#C5A059]/30">
                <div
                  className="bg-wine-gradient h-full rounded-full transition-all duration-500 shadow-xs"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* T&C Line */}
            <p className="text-[10px] sm:text-xs font-bold text-[#777777] tracking-wider uppercase mb-6">
              VALID ON ELIGIBLE PRODUCTS • T&C APPLY
            </p>

            {/* CTA Button */}
            <div className="flex justify-center lg:justify-start">
              <button
                onClick={() => navigate('shop')}
                className="w-full sm:w-auto bg-wine-gradient hover:brightness-110 text-[#F9F5F0] font-bold text-xs sm:text-sm uppercase tracking-widest px-8 py-4 rounded-xl shadow-xl border border-[#C5A059] hover:scale-[1.03] active:scale-[0.97] transition-all flex items-center justify-center gap-3 group/btn cursor-pointer"
              >
                <span>SHOP RAKHI EDIT NOW</span>
                <ArrowRight className="w-4 h-4 text-[#C5A059] group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Realistic Handcrafted Royal Rakhi Composition (NO HUMAN / NO MODEL) */}
          <div className="lg:col-span-5 relative h-72 sm:h-96 lg:h-full min-h-[320px] sm:min-h-[380px] flex items-center justify-center p-4 lg:p-8">
            {/* Soft Royal Circular Backdrop */}
            <div className="relative w-full max-w-sm h-full flex items-center justify-center">
              
              {/* Outer Glowing Mandala Ring */}
              <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full border-2 border-dashed border-[#C5A059]/40 animate-spin-slow opacity-60" />
              <div className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-[#5B0F15]/20 bg-[#5B0F15]/5" />

              {/* Handcrafted Rakhi Artwork Canvas (Pure SVG Vector Craft) */}
              <div className="relative z-10 w-full h-full flex items-center justify-center drop-shadow-2xl">
                <svg
                  viewBox="0 0 400 400"
                  className="w-72 h-72 sm:w-88 sm:h-88 max-w-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F5E0A3" />
                      <stop offset="50%" stopColor="#C5A059" />
                      <stop offset="100%" stopColor="#8F6C26" />
                    </linearGradient>
                    <linearGradient id="wineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#9B222A" />
                      <stop offset="50%" stopColor="#5B0F15" />
                      <stop offset="100%" stopColor="#2D0508" />
                    </linearGradient>
                    <radialGradient id="rubyGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#FF4D6D" />
                      <stop offset="60%" stopColor="#9B111E" />
                      <stop offset="100%" stopColor="#4A0207" />
                    </radialGradient>
                    <radialGradient id="pearlGrad" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="70%" stopColor="#F0E6D2" />
                      <stop offset="100%" stopColor="#C8B896" />
                    </radialGradient>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#2D0508" floodOpacity="0.3" />
                    </filter>
                  </defs>

                  {/* Red Silk Thread (Sweeping gracefully horizontally) */}
                  <path
                    d="M 10,200 Q 100,160 200,200 T 390,200"
                    stroke="url(#wineGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    filter="url(#shadow)"
                  />
                  <path
                    d="M 10,200 Q 100,160 200,200 T 390,200"
                    stroke="#D8B56F"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    strokeLinecap="round"
                  />

                  {/* Golden Tassels on Threads */}
                  <circle cx="40" cy="192" r="6" fill="url(#goldGrad)" />
                  <circle cx="360" cy="208" r="6" fill="url(#goldGrad)" />

                  {/* Pearl Beads along the Thread */}
                  <circle cx="100" cy="180" r="7" fill="url(#pearlGrad)" filter="url(#shadow)" />
                  <circle cx="120" cy="185" r="9" fill="url(#goldGrad)" filter="url(#shadow)" />
                  <circle cx="140" cy="190" r="11" fill="url(#pearlGrad)" filter="url(#shadow)" />

                  <circle cx="300" cy="220" r="7" fill="url(#pearlGrad)" filter="url(#shadow)" />
                  <circle cx="280" cy="215" r="9" fill="url(#goldGrad)" filter="url(#shadow)" />
                  <circle cx="260" cy="210" r="11" fill="url(#pearlGrad)" filter="url(#shadow)" />

                  {/* Outer Filigree Floral Petals (Gold & Maroon) */}
                  <g filter="url(#shadow)">
                    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
                      <g key={i} transform={`rotate(${angle} 200 200)`}>
                        <path
                          d="M 200,200 C 185,130 215,130 200,200"
                          fill="url(#goldGrad)"
                          stroke="#5B0F15"
                          strokeWidth="1"
                        />
                        <circle cx="200" cy="135" r="4" fill="url(#rubyGrad)" />
                      </g>
                    ))}
                  </g>

                  {/* Inner Concentric Rings */}
                  <circle cx="200" cy="200" r="52" fill="url(#wineGrad)" stroke="url(#goldGrad)" strokeWidth="4" filter="url(#shadow)" />
                  <circle cx="200" cy="200" r="42" fill="url(#goldGrad)" stroke="#5B0F15" strokeWidth="2" />
                  
                  {/* Pearl Ring around Center Gem */}
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                    const rad = (angle * Math.PI) / 180;
                    const x = 200 + 32 * Math.cos(rad);
                    const y = 200 + 32 * Math.sin(rad);
                    return <circle key={i} cx={x} cy={y} r="5" fill="url(#pearlGrad)" stroke="#8F6C26" strokeWidth="0.5" />;
                  })}

                  {/* Central Royal Ruby Facet Gem */}
                  <circle cx="200" cy="200" r="22" fill="url(#rubyGrad)" stroke="url(#goldGrad)" strokeWidth="3" />
                  <polygon points="200,182 214,192 208,210 192,210 186,192" fill="#FF809B" opacity="0.4" />
                  <circle cx="194" cy="194" r="3" fill="#FFFFFF" opacity="0.8" />

                  {/* Scattered Rose Petals at Bottom */}
                  <path d="M 120,310 C 100,320 110,340 130,335 C 145,330 135,305 120,310 Z" fill="#9B111E" opacity="0.85" filter="url(#shadow)" />
                  <path d="M 270,300 C 290,305 295,325 280,330 C 265,335 255,315 270,300 Z" fill="#7A0D15" opacity="0.85" filter="url(#shadow)" />
                  <path d="M 210,330 C 220,345 200,355 190,345 C 180,335 200,320 210,330 Z" fill="#B81424" opacity="0.9" filter="url(#shadow)" />

                  {/* Decorative Roli/Kumkum Brass Bowl */}
                  <g transform="translate(60, 270)" filter="url(#shadow)">
                    <ellipse cx="25" cy="25" rx="20" ry="12" fill="url(#goldGrad)" stroke="#5B0F15" strokeWidth="1" />
                    <ellipse cx="25" cy="22" rx="17" ry="8" fill="#8F101A" />
                    <ellipse cx="22" cy="21" rx="10" ry="5" fill="#C51828" />
                    <circle cx="26" cy="21" r="1.5" fill="#FFFFFF" opacity="0.9" />
                    <circle cx="28" cy="23" r="1" fill="#FFFFFF" opacity="0.9" />
                  </g>
                </svg>
              </div>

              {/* Handcrafted Caption Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#C5A059] shadow-lg text-center whitespace-nowrap z-20">
                <span className="text-[10px] font-bold text-[#5B0F15] tracking-widest uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#C5A059]" />
                  HANDCRAFTED ROYAL RAKHI
                  <Sparkles className="w-3 h-3 text-[#C5A059]" />
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
