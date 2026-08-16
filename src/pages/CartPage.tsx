import React, { useState } from 'react';
import {
  ShoppingBag,
  Trash2,
  Gift,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
  Plus,
  Minus,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { GiftSelectionModal } from '../components/GiftSelectionModal';
import { EmptyState } from '../components/EmptyState';

export const CartPage: React.FC = () => {
  const {
    cart,
    selectedGift,
    rakhiOffer,
    cartSubtotal,
    isRakhiOfferUnlocked,
    amountNeededForRakhiOffer,
    removeFromCart,
    updateQuantity,
    selectFreeGift,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    navigate,
  } = useShop();

  const [couponInput, setCouponInput] = useState('');
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);

  const shippingFee = cartSubtotal >= 999 || cartSubtotal === 0 ? 0 : 99;
  const couponDiscount = appliedCoupon ? appliedCoupon.discountAmount : 0;

  // Free gift value is 0 in cart total
  const finalTotal = Math.max(0, cartSubtotal - couponDiscount + shippingFee);

  const handleApplyCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim()) {
      await applyCoupon(couponInput.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28">
      <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#3B0C13] mb-6">
        SHOPPING CART ({cart.length} ITEMS)
      </h1>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cart Items Column (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Rakhi Offer Progress Banner */}
            {rakhiOffer.isActive && (
              <div className="bg-gradient-to-r from-[#FFFBF2] to-[#FAF3E6] border-2 border-[#D4AF37] p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-[#4A0E17] text-[#DFBA67] rounded-xl">
                    <Gift className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#3B0C13]">
                      {isRakhiOfferUnlocked ? '🎁 RAKHI GIFT UNLOCKED!' : 'RAKHI FESTIVE OFFER'}
                    </h3>
                    <p className="text-xs text-[#7A695C]">
                      {isRakhiOfferUnlocked
                        ? `Select 1 free fashion Kurti worth up to ₹${rakhiOffer.maxGiftValue}!`
                        : `Add ₹${amountNeededForRakhiOffer} more to unlock your ₹1,000 FREE Rakhi Gift.`}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-[#E8DCC4] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#D4AF37]/30 my-2">
                  <div
                    className="bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#801723] h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (cartSubtotal / rakhiOffer.minCartValue) * 100)}%`,
                    }}
                  ></div>
                </div>

                {/* Free Gift Selector Trigger Button */}
                {isRakhiOfferUnlocked && (
                  <div className="mt-3">
                    {selectedGift ? (
                      <div className="bg-[#FAF6EE] p-3 rounded-xl border border-emerald-300 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={selectedGift.image}
                            alt={selectedGift.name}
                            className="w-12 h-14 object-cover rounded-lg border border-[#D4AF37]"
                          />
                          <div>
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                              FREE RAKHI GIFT
                            </span>
                            <p className="text-xs font-bold text-[#2D2622] line-clamp-1">
                              {selectedGift.name}
                            </p>
                            <p className="text-xs text-emerald-700 font-extrabold">
                              ₹0 FREE (Valued at ₹{selectedGift.price})
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsGiftModalOpen(true)}
                          className="text-xs font-bold text-[#801723] underline"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsGiftModalOpen(true)}
                        className="w-full bg-[#4A0E17] hover:bg-[#62121E] text-[#DFBA67] font-bold text-xs py-3 px-4 rounded-xl border border-[#D4AF37] shadow-md flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                      >
                        <Sparkles className="w-4 h-4 text-[#DFBA67]" />
                        <span>SELECT YOUR FREE RAKHI GIFT NOW →</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Cart Items List */}
            <div className="space-y-4">
              {cart.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                  className="bg-white p-4 rounded-2xl border border-[#EAE3D2] shadow-xs flex gap-4 items-center"
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-20 h-24 object-cover rounded-xl border border-[#EAE3D2] shrink-0"
                    referrerPolicy="no-referrer"
                  />

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase text-[#801723]">
                      {item.product.category}
                    </span>
                    <h3 className="font-bold text-xs sm:text-sm text-[#2D2622] line-clamp-1">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-[#7A695C] mt-0.5">
                      Size: <strong>{item.selectedSize}</strong> | Color: <strong>{item.selectedColor}</strong>
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-black text-[#4A0E17]">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      {item.product.originalPrice > item.product.price && (
                        <span className="text-xs text-[#9E8E81] line-through">
                          ₹{(item.product.originalPrice * item.quantity).toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Counter & Delete */}
                  <div className="flex flex-col items-end gap-3">
                    <button
                      onClick={() => removeFromCart(item.productId, item.selectedSize, item.selectedColor)}
                      className="p-1.5 text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-1 bg-[#FAF6EE] border border-[#EAE3D2] rounded-lg p-1">
                      <button
                        onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity - 1)}
                        className="p-1 hover:bg-[#EAE3D2] rounded"
                      >
                        <Minus className="w-3 h-3 text-[#3B0C13]" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-[#3B0C13]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.selectedSize, item.selectedColor, item.quantity + 1)}
                        className="p-1 hover:bg-[#EAE3D2] rounded"
                      >
                        <Plus className="w-3 h-3 text-[#3B0C13]" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Order Summary Column (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Coupon Code Section */}
            <div className="bg-white p-5 rounded-2xl border border-[#EAE3D2] shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-[#3B0C13] flex items-center gap-1.5 mb-2">
                <Tag className="w-4 h-4 text-[#801723]" />
                <span>APPLY PROMO / COUPON CODE</span>
              </span>

              {appliedCoupon ? (
                <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-900">
                      COUPON: {appliedCoupon.code}
                    </span>
                    <p className="text-[11px] text-emerald-700">
                      Saved ₹{appliedCoupon.discountAmount}!
                    </p>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-rose-700 underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCouponSubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. RAKHI500 or LUXUE10"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    className="flex-1 bg-[#FAF6EE] text-xs px-3 py-2.5 rounded-xl border border-[#D4AF37]/40 focus:outline-none uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-[#4A0E17] text-[#DFBA67] font-bold text-xs px-4 py-2.5 rounded-xl border border-[#D4AF37]"
                  >
                    APPLY
                  </button>
                </form>
              )}

              {couponError && (
                <p className="text-xs text-rose-700 mt-2 font-semibold">{couponError}</p>
              )}
            </div>

            {/* Bill Summary Box */}
            <div className="bg-white p-6 rounded-2xl border-2 border-[#EAE3D2] shadow-md space-y-4">
              <h3 className="font-serif-luxury text-lg font-bold text-[#3B0C13] border-b border-[#EAE3D2] pb-3">
                ORDER SUMMARY
              </h3>

              <div className="space-y-2.5 text-xs font-medium text-[#5A4D41]">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-bold text-[#2D2622]">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-₹{appliedCoupon.discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  {shippingFee === 0 ? (
                    <span className="font-bold text-emerald-800">FREE</span>
                  ) : (
                    <span className="font-bold text-[#2D2622]">₹{shippingFee}</span>
                  )}
                </div>

                {selectedGift && (
                  <div className="flex justify-between text-emerald-800 font-bold pt-2 border-t border-dashed border-[#EAE3D2]">
                    <span className="flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5" />
                      Free Rakhi Gift ({selectedGift.name.slice(0, 18)}...)
                    </span>
                    <span>₹0 FREE</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t-2 border-[#3B0C13] flex items-baseline justify-between text-base font-black text-[#4A0E17]">
                <span>TOTAL PAYABLE</span>
                <span className="text-xl">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('checkout')}
                className="w-full bg-[#4A0E17] hover:bg-[#62121E] text-[#DFBA67] font-bold text-sm py-4 rounded-xl border border-[#D4AF37] shadow-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>PROCEED TO CHECKOUT</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-[10px] text-[#8C7A6B]">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>100% Safe & Encrypted Checkout</span>
              </div>
            </div>

          </div>

        </div>
      ) : (
        <EmptyState type="empty-cart" />
      )}

      {/* Gift Selection Modal */}
      <GiftSelectionModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
      />
    </div>
  );
};
