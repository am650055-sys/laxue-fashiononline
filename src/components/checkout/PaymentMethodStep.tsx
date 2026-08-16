import React from 'react';
import { QrCode, CreditCard, Lock, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import { PaymentMethod } from '../../types';
import { PhonePeIcon, GPayIcon, PaytmIcon, BhimUpiIcon, OtherUpiCollageIcon } from './UpiBrandIcons';

interface PaymentMethodStepProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  onBack: () => void;
  onContinue: () => void;
}

export const PaymentMethodStep: React.FC<PaymentMethodStepProps> = ({
  selectedMethod,
  onSelectMethod,
  onBack,
  onContinue,
}) => {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE3D2] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-[#FAF6EE] text-[#4A0E17] hover:bg-[#F2EADB] flex items-center justify-center transition-colors"
            title="Edit Delivery Address"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-serif-luxury text-xl font-bold text-[#3B0C13]">
              SELECT PAYMENT METHOD
            </h2>
            <p className="text-xs text-[#7A695C]">
              Fast, secure & encrypted checkout options
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-[#801723] uppercase tracking-wider bg-[#FAF6EE] px-3 py-1 rounded-full border border-[#D4AF37]/30">
          STEP 2 OF 2
        </span>
      </div>

      <div className="space-y-3">
        {/* Option 1: UPI (Recommended) */}
        <div
          onClick={() => onSelectMethod('UPI')}
          className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            selectedMethod === 'UPI'
              ? 'border-[#4A0E17] bg-[#FFFBF2] shadow-sm'
              : 'border-[#EAE3D2] bg-white hover:border-[#D4AF37]/60'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#4A0E17]/10 text-[#4A0E17] flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#3B0C13]">
                    UPI (DIRECT APP & QR CODE)
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" />
                    RECOMMENDED
                  </span>
                </div>
                <p className="text-[11px] text-[#7A695C] mt-0.5">
                  Direct Pay with PhonePe, Google Pay, Paytm, BHIM or Scan Dynamic QR
                </p>
                <div className="flex items-center gap-1.5 mt-2.5">
                  <PhonePeIcon size={24} />
                  <GPayIcon size={24} />
                  <PaytmIcon size={24} />
                  <BhimUpiIcon size={24} />
                  <OtherUpiCollageIcon size={24} />
                </div>
              </div>
            </div>

            <div className="flex items-center h-full pt-1">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === 'UPI'
                    ? 'border-[#4A0E17] bg-[#4A0E17]'
                    : 'border-[#C4B4A5]'
                }`}
              >
                {selectedMethod === 'UPI' && (
                  <div className="w-2 h-2 rounded-full bg-[#DFBA67]" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Option 2: Credit / Debit Card */}
        <div
          onClick={() => onSelectMethod('Card')}
          className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
            selectedMethod === 'Card'
              ? 'border-[#4A0E17] bg-[#FFFBF2] shadow-sm'
              : 'border-[#EAE3D2] bg-white hover:border-[#D4AF37]/60'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#4A0E17]/10 text-[#4A0E17] flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black text-[#3B0C13] block">
                  CREDIT / DEBIT CARD
                </span>
                <p className="text-[11px] text-[#7A695C] mt-0.5">
                  Visa, MasterCard, RuPay, American Express
                </p>
              </div>
            </div>

            <div className="flex items-center h-full pt-1">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedMethod === 'Card'
                    ? 'border-[#4A0E17] bg-[#4A0E17]'
                    : 'border-[#C4B4A5]'
                }`}
              >
                {selectedMethod === 'Card' && (
                  <div className="w-2 h-2 rounded-full bg-[#DFBA67]" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Option 3: Cash on Delivery (LOCKED) */}
        <div className="p-4 sm:p-5 rounded-2xl border border-dashed border-[#D5CBC2] bg-[#F7F4EF] opacity-75 cursor-not-allowed select-none">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#E6DFD6] text-[#8C7A6B] flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#8C7A6B] line-through">
                    CASH ON DELIVERY (COD)
                  </span>
                  <span className="bg-rose-100 text-rose-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    LOCKED
                  </span>
                </div>
                <p className="text-[11px] text-rose-700 font-semibold mt-0.5">
                  Currently unavailable — prepaid orders only
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={onContinue}
        className="w-full bg-[#4A0E17] hover:bg-[#62121E] text-[#DFBA67] font-bold text-xs py-4 px-6 rounded-xl border border-[#D4AF37] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
      >
        <span>
          PROCEED TO {selectedMethod === 'UPI' ? 'UPI QR SCAN & PAY' : 'CARD DETAILS'} →
        </span>
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-[#7A695C] pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
        <span>Prepaid orders qualify for Priority Handcrafted Dispatch</span>
      </div>
    </div>
  );
};
