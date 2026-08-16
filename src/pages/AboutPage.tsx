import React from 'react';
import { Crown, Award, Heart, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const AboutPage: React.FC = () => {
  const { navigate, settings } = useShop();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 pb-28 space-y-12">
      
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-1.5 bg-[#FAF6EE] px-4 py-1.5 rounded-full border border-[#D4AF37]/50 text-xs font-bold text-[#801723]">
          <Crown className="w-4 h-4 text-[#B8860B]" />
          <span>HERITAGE & CRAFTSMANSHIP</span>
        </div>
        <h1 className="font-serif-luxury text-3xl sm:text-5xl font-bold text-[#3B0C13]">
          THE STORY BEHIND LUXUE
        </h1>
        <p className="text-xs sm:text-base text-[#7A695C] italic leading-relaxed">
          “LUXUE FASHION ONLINE brings together modern silhouettes, timeless Indian design, and elegant everyday fashion.”
        </p>
      </div>

      {/* Editorial Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-6 sm:p-10 rounded-3xl border border-[#EAE3D2] shadow-sm">
        <div className="space-y-4 text-xs sm:text-sm text-[#5A4D41] leading-relaxed">
          <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#3B0C13]">
            Elegance Woven Into Every Style
          </h2>
          <p>
            Founded with a passion for modern Indian ethnic heritage, LUXUE FASHION ONLINE celebrates the contemporary woman who seeks grace, comfort, and distinction in her everyday wardrobe.
          </p>
          <p>
            Each Kurti in our collection is handcrafted by master artisans across Rajasthan, Lucknow, and West Bengal, blending age-old Zardozi embroidery, Chanderi weave, Chikankari shadow work, and Gota Patti mirror details.
          </p>
          <p>
            Whether preparing for a grand Rakhi family celebration or dressing for a powerful day at work, LUXUE offers effortless royal sophistication.
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden aspect-[4/3] border-2 border-[#D4AF37]/40 shadow-md">
          <img
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=800"
            alt="LUXUE Heritage Fashion Craftsmanship"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[#FAF6EE] p-6 rounded-2xl border border-[#EAE3D2] text-center space-y-2">
          <Award className="w-8 h-8 text-[#801723] mx-auto" />
          <h3 className="font-bold text-sm text-[#3B0C13] uppercase">Pure Premium Fabrics</h3>
          <p className="text-xs text-[#7A695C]">
            Selected 100% breathable organic cottons, pure Chanderi silks, and soft georgette blends.
          </p>
        </div>

        <div className="bg-[#FAF6EE] p-6 rounded-2xl border border-[#EAE3D2] text-center space-y-2">
          <Sparkles className="w-8 h-8 text-[#801723] mx-auto" />
          <h3 className="font-bold text-sm text-[#3B0C13] uppercase">Master Artisans</h3>
          <p className="text-xs text-[#7A695C]">
            Empowering traditional Indian embroiderers with ethical wages and sustainable design.
          </p>
        </div>

        <div className="bg-[#FAF6EE] p-6 rounded-2xl border border-[#EAE3D2] text-center space-y-2">
          <Heart className="w-8 h-8 text-[#801723] mx-auto" />
          <h3 className="font-bold text-sm text-[#3B0C13] uppercase">Uncompromised Quality</h3>
          <p className="text-xs text-[#7A695C]">
            Every garment passes strict 7-point quality inspection before reaching your doorstep.
          </p>
        </div>
      </div>

      {/* Official Registered Entity Info */}
      <div className="bg-[#FAF6EE] p-6 rounded-2xl border border-[#D4AF37]/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5A4D41]">
        <div>
          <span className="text-[10px] uppercase font-bold text-[#801723] tracking-widest block">REGISTERED INDIAN E-COMMERCE ENTITY</span>
          <p className="font-serif-luxury font-bold text-sm text-[#3B0C13]">{settings.storeName || 'LUXUE FASHION ONLINE'}</p>
          <p>{settings.city || 'Noida'}, {settings.state || 'Uttar Pradesh'}, {settings.country || 'India'}</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-[#EAE3D2] text-right font-mono text-xs">
          <span className="text-[10px] text-[#7A695C] block font-sans font-bold">GSTIN</span>
          <span className="font-extrabold text-[#3B0C13]">{settings.gstin || '09AAMFE0502D1ZX'}</span>
        </div>
      </div>

    </div>
  );
};
