import React from 'react';
import { Gift, ShieldCheck, Building2 } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const CheckoutSummary: React.FC = () => {
  const { cart, selectedGift, cartSubtotal, appliedCoupon, settings } = useShop();

  const shippingFee = cartSubtotal >= 999 ? 0 : 99;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalTotal = Math.max(0, cartSubtotal - couponDiscount + shippingFee);

  return (
    <div className="bg-white p-6 rounded-3xl border-2 border-[#EAE3D2] shadow-md space-y-4 sticky top-24">
      <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-3">
        <h3 className="font-serif-luxury text-base font-bold text-[#3B0C13]">
          ORDER SUMMARY ({cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'})
        </h3>
        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
          VERIFIED
        </span>
      </div>

      {/* Cart Items List */}
      <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-[#FAF6EE]">
        {cart.map((item, idx) => (
          <div key={idx} className="flex gap-3 items-center pt-2 first:pt-0">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-12 h-14 object-cover rounded-xl border border-[#D4AF37]/50 shadow-xs shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#2D2622] truncate">
                {item.product.name}
              </p>
              <p className="text-[11px] text-[#7A695C]">
                Size: <span className="font-bold text-[#3B0C13]">{item.selectedSize}</span> | Qty: <span className="font-bold text-[#3B0C13]">{item.quantity}</span>
              </p>
            </div>
            <span className="text-xs font-bold text-[#4A0E17] whitespace-nowrap">
              ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
            </span>
          </div>
        ))}

        {/* Free Gift */}
        {selectedGift && (
          <div className="bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-300 flex items-center gap-3 pt-2">
            <Gift className="w-5 h-5 text-emerald-800 shrink-0" />
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-extrabold bg-emerald-800 text-white px-1.5 py-0.5 rounded">
                FREE RAKHI GIFT
              </span>
              <p className="text-xs font-bold text-emerald-950 truncate mt-0.5">
                {selectedGift.name}
              </p>
            </div>
            <span className="text-xs font-black text-emerald-800 whitespace-nowrap">₹0 FREE</span>
          </div>
        )}
      </div>

      {/* Calculation Breakdowns */}
      <div className="pt-3 border-t border-[#EAE3D2] space-y-2 text-xs font-medium text-[#5A4D41]">
        <div className="flex justify-between">
          <span>Product Subtotal</span>
          <span className="font-semibold text-[#3B0C13]">₹{cartSubtotal.toLocaleString('en-IN')}</span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between text-emerald-800 font-bold">
            <span>Coupon ({appliedCoupon.code})</span>
            <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Express Delivery Charge</span>
          <span className="font-semibold text-[#3B0C13]">
            {shippingFee === 0 ? <span className="text-emerald-700 font-bold">FREE</span> : `₹${shippingFee}`}
          </span>
        </div>

        <div className="flex justify-between text-sm font-black text-[#4A0E17] pt-2 border-t-2 border-[#4A0E17]">
          <span>FINAL PAYABLE AMOUNT</span>
          <span className="text-base font-serif-luxury text-[#4A0E17]">
            ₹{finalTotal.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] text-[#8C7A6B] py-1">
        <ShieldCheck className="w-4 h-4 text-emerald-700" />
        <span>100% Genuine Handcrafted Guarantee</span>
      </div>

      {/* Sold By Official Business Info */}
      <div className="bg-[#FAF6EE] p-3.5 rounded-2xl border border-[#EAE3D2] text-[11px] text-[#5A4D41] space-y-1">
        <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-1">
          <span className="font-bold text-[#801723] uppercase text-[9px] tracking-wider flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            FULFILLED BY:
          </span>
          <span className="font-mono text-[10px] font-bold text-[#3B0C13]">
            GSTIN: {settings.gstin || '09AAMFE0502D1ZX'}
          </span>
        </div>
        <p className="font-extrabold text-[#3B0C13]">{settings.storeName || 'LUXUE FASHION ONLINE'}</p>
        <p className="text-[10px] text-[#7A695C] leading-snug">
          {settings.officeAddress || 'SD-46, Sector 45'}, {settings.city || 'Noida'}, {settings.state || 'Uttar Pradesh'} - {settings.pinCode || '201303'}
        </p>
      </div>
    </div>
  );
};
