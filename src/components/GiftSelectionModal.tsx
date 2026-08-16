import React from 'react';
import { Gift, Check, X, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface GiftSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GiftSelectionModal: React.FC<GiftSelectionModalProps> = ({ isOpen, onClose }) => {
  const { products, rakhiOffer, selectedGift, selectFreeGift } = useShop();

  if (!isOpen) return null;

  const eligibleGifts = products.filter(
    p => p.isRakhiGiftEligible && p.price <= rakhiOffer.maxGiftValue
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] w-full max-w-2xl rounded-2xl shadow-2xl border-2 border-[#D4AF37] overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4A0E17] to-[#62121E] text-[#DFBA67] p-4 sm:p-6 flex items-center justify-between border-b border-[#D4AF37]/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6A1623] rounded-xl border border-[#DFBA67]/40 shadow-inner">
              <Gift className="w-6 h-6 text-[#DFBA67] animate-bounce" />
            </div>
            <div>
              <h2 className="font-serif-luxury text-lg sm:text-xl font-bold tracking-wider text-white">
                🎁 CHOOSE YOUR FREE RAKHI GIFT
              </h2>
              <p className="text-xs text-amber-200">
                Congratulations! Your order qualifies for a free fashion Kurti worth up to ₹{rakhiOffer.maxGiftValue}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-amber-200 hover:text-white rounded-full hover:bg-white/10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {eligibleGifts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {eligibleGifts.map(prod => {
                const isSelected = selectedGift?.id === prod.id;
                return (
                  <div
                    key={prod.id}
                    className={`relative rounded-xl p-3 border-2 transition-all flex items-center gap-3 bg-white ${
                      isSelected
                        ? 'border-[#4A0E17] bg-[#FFFBF2] shadow-md'
                        : 'border-[#EAE3D2] hover:border-[#D4AF37]/60'
                    }`}
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-20 h-24 object-cover rounded-lg border border-[#D4AF37]/30 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="inline-block bg-emerald-100 text-emerald-900 font-extrabold text-[9px] uppercase px-1.5 py-0.5 rounded border border-emerald-300 mb-1">
                        FREE GIFT
                      </span>
                      <h4 className="font-medium text-xs sm:text-sm text-[#2D2622] line-clamp-2 leading-snug">
                        {prod.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-[#9E8E81] line-through">
                          ₹{prod.originalPrice}
                        </span>
                        <span className="text-sm font-bold text-emerald-800">
                          ₹0 FREE
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          selectFreeGift(prod);
                          onClose();
                        }}
                        className={`mt-2 w-full text-xs font-bold py-1.5 px-3 rounded-lg border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          isSelected
                            ? 'bg-[#4A0E17] text-[#DFBA67] border-[#D4AF37]'
                            : 'bg-[#FAF6EE] text-[#4A0E17] hover:bg-[#4A0E17] hover:text-[#DFBA67] border-[#D4AF37]/50'
                        }`}
                      >
                        {isSelected ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            GIFT SELECTED
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-[#B8860B]" />
                            SELECT GIFT
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-sm text-[#7A695C]">
                No gift eligible products available at this time.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F5EFE6] border-t border-[#EAE3D2] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#4A0E17] text-[#DFBA67] text-xs font-bold px-6 py-2 rounded-xl border border-[#D4AF37] hover:bg-[#62121E]"
          >
            DONE
          </button>
        </div>
      </div>
    </div>
  );
};
