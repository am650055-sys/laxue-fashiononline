import React from 'react';
import { ShieldCheck, Award, RotateCcw, Zap } from 'lucide-react';

export const TrustSection: React.FC = () => {
  return (
    <section className="bg-[#F9F5F0] border-y border-[#C5A059]/30 py-10 my-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          
          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/60 border border-[#C5A059]/20 shadow-xs hover:border-[#C5A059]/60 transition-all">
            <div className="w-13 h-13 rounded-full bg-[#5B0F15] text-[#C5A059] flex items-center justify-center mb-4 shadow-md border border-[#C5A059]">
              <ShieldCheck className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h4 className="font-serif font-bold text-xs sm:text-sm text-[#5B0F15] uppercase tracking-widest mb-1.5">
              SECURE PAYMENTS
            </h4>
            <p className="text-[11px] text-[#555555] leading-relaxed">
              100% Encrypted UPI, Cards & COD available
            </p>
          </div>

          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/60 border border-[#C5A059]/20 shadow-xs hover:border-[#C5A059]/60 transition-all">
            <div className="w-13 h-13 rounded-full bg-[#5B0F15] text-[#C5A059] flex items-center justify-center mb-4 shadow-md border border-[#C5A059]">
              <Award className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h4 className="font-serif font-bold text-xs sm:text-sm text-[#5B0F15] uppercase tracking-widest mb-1.5">
              QUALITY ASSURED
            </h4>
            <p className="text-[11px] text-[#555555] leading-relaxed">
              Pure silk & cotton fabrics, double-inspected
            </p>
          </div>

          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/60 border border-[#C5A059]/20 shadow-xs hover:border-[#C5A059]/60 transition-all">
            <div className="w-13 h-13 rounded-full bg-[#5B0F15] text-[#C5A059] flex items-center justify-center mb-4 shadow-md border border-[#C5A059]">
              <RotateCcw className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h4 className="font-serif font-bold text-xs sm:text-sm text-[#5B0F15] uppercase tracking-widest mb-1.5">
              EASY RETURNS
            </h4>
            <p className="text-[11px] text-[#555555] leading-relaxed">
              15-Day hassle-free return & doorstep exchange
            </p>
          </div>

          <div className="flex flex-col items-center p-4 rounded-2xl bg-white/60 border border-[#C5A059]/20 shadow-xs hover:border-[#C5A059]/60 transition-all">
            <div className="w-13 h-13 rounded-full bg-[#5B0F15] text-[#C5A059] flex items-center justify-center mb-4 shadow-md border border-[#C5A059]">
              <Zap className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h4 className="font-serif font-bold text-xs sm:text-sm text-[#5B0F15] uppercase tracking-widest mb-1.5">
              FAST DELIVERY
            </h4>
            <p className="text-[11px] text-[#555555] leading-relaxed">
              Express dispatch across India within 24-48 hours
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
