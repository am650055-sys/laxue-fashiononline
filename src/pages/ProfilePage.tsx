import React from 'react';
import { User, Package, Heart, MapPin, LogOut } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ProfilePage: React.FC = () => {
  const { navigate } = useShop();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-28">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#EAE3D2] shadow-md space-y-6">
        
        {/* User Card Header */}
        <div className="flex items-center gap-4 border-b border-[#EAE3D2] pb-6">
          <div className="w-16 h-16 rounded-full bg-[#4A0E17] text-[#DFBA67] border-2 border-[#D4AF37] flex items-center justify-center font-bold text-xl">
            PV
          </div>
          <div>
            <h2 className="font-serif-luxury text-xl font-bold text-[#3B0C13]">
              Priya Verma
            </h2>
            <p className="text-xs text-[#7A695C]">priya.verma@gmail.com | +91 98765 43210</p>
            <span className="inline-block bg-[#FAF6EE] text-[#801723] border border-[#D4AF37]/40 text-[10px] font-bold px-2 py-0.5 rounded mt-1">
              LUXUE VIP MEMBER
            </span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('orders')}
            className="w-full bg-[#FAF6EE] hover:bg-[#F2EAE0] p-4 rounded-2xl border border-[#EAE3D2] flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-[#801723]" />
              <div className="text-left">
                <span className="text-xs font-bold text-[#3B0C13] block">MY ORDERS</span>
                <span className="text-[11px] text-[#7A695C]">View order status & tracking</span>
              </div>
            </div>
            <span className="text-xs font-bold text-[#801723]">→</span>
          </button>

          <button
            onClick={() => navigate('wishlist')}
            className="w-full bg-[#FAF6EE] hover:bg-[#F2EAE0] p-4 rounded-2xl border border-[#EAE3D2] flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-[#801723]" />
              <div className="text-left">
                <span className="text-xs font-bold text-[#3B0C13] block">MY WISHLIST</span>
                <span className="text-[11px] text-[#7A695C]">Saved Kurtis & outfits</span>
              </div>
            </div>
            <span className="text-xs font-bold text-[#801723]">→</span>
          </button>

          <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#EAE3D2] space-y-1">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#801723]" />
              <span className="text-xs font-bold text-[#3B0C13]">PRIMARY SHIPPING ADDRESS</span>
            </div>
            <p className="text-xs text-[#5A4D41] pl-8">
              Flat 302, Royal Residency, 1st Cross, Indiranagar Stage 2, Bengaluru, Karnataka - 560038
            </p>
          </div>

          <button
            onClick={() => alert('You have logged out of your LUXUE account.')}
            className="w-full bg-[#FAF6EE] hover:bg-rose-50 p-4 rounded-2xl border border-[#EAE3D2] flex items-center justify-between transition-colors text-rose-800"
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-rose-700" />
              <div className="text-left">
                <span className="text-xs font-bold text-rose-900 block">LOG OUT OF ACCOUNT</span>
                <span className="text-[11px] text-rose-700/80">End your current session safely</span>
              </div>
            </div>
            <span className="text-xs font-bold">→</span>
          </button>
        </div>

      </div>
    </div>
  );
};
