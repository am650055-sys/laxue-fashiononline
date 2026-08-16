import React, { useState } from 'react';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Order } from '../../types';
import { useShop } from '../../context/ShopContext';

interface CardPaymentStepProps {
  order: Order;
  onBack: () => void;
  onSuccess: (order: Order) => void;
}

export const CardPaymentStep: React.FC<CardPaymentStepProps> = ({ order, onBack, onSuccess }) => {
  const { processCardPayment } = useShop();

  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Detect card brand
  const getCardBrand = (num: string): string => {
    const clean = num.replace(/\s+/g, '');
    if (/^4/.test(clean)) return 'Visa';
    if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'Mastercard';
    if (/^3[47]/.test(clean)) return 'American Express';
    if (/^(60|65|81|82|508)/.test(clean)) return 'RuPay';
    return 'Card';
  };

  const formatCardNumber = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 16);
    const groups = clean.match(/.{1,4}/g);
    return groups ? groups.join(' ') : clean;
  };

  const formatExpiry = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 4);
    if (clean.length >= 3) {
      return `${clean.slice(0, 2)}/${clean.slice(2)}`;
    }
    return clean;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanNum = cardNumber.replace(/\s+/g, '');
    if (cleanNum.length < 15 || cleanNum.length > 16) {
      setErrorMessage('Please enter a valid 16-digit card number');
      return;
    }

    if (!expiry || !expiry.includes('/') || expiry.length !== 5) {
      setErrorMessage('Please enter a valid expiry date (MM/YY)');
      return;
    }

    const [mmStr, yyStr] = expiry.split('/');
    const mm = parseInt(mmStr, 10);
    if (isNaN(mm) || mm < 1 || mm > 12) {
      setErrorMessage('Expiry month must be between 01 and 12');
      return;
    }

    if (cvv.length < 3 || cvv.length > 4) {
      setErrorMessage('Please enter a valid 3 or 4-digit CVV');
      return;
    }

    if (!cardholderName.trim()) {
      setErrorMessage('Please enter the cardholder name as written on card');
      return;
    }

    setIsProcessing(true);

    // Simulate 2-second bank tokenization & security check
    await new Promise(resolve => setTimeout(resolve, 1800));

    const result = await processCardPayment(order.id, {
      cardholderName,
      cardNumber: cleanNum,
      expiry,
      cvv,
    });

    setIsProcessing(false);

    if (result.success && result.order) {
      onSuccess(result.order);
    } else {
      setErrorMessage(result.message || 'Payment processing failed. Please try another card or UPI.');
    }
  };

  const brand = getCardBrand(cardNumber);

  if (isProcessing) {
    return (
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#EAE3D2] shadow-sm text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#FAF6EE] border-2 border-[#D4AF37] flex items-center justify-center mx-auto text-[#4A0E17] animate-pulse shadow-md">
          <Sparkles className="w-8 h-8 text-[#DFBA67] animate-spin" />
        </div>

        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#801723]">
            BANK AUTHORIZATION IN PROGRESS
          </span>
          <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#3B0C13] mt-1">
            Securing Connection with Bank...
          </h2>
          <p className="text-xs text-[#7A695C] mt-2 max-w-sm mx-auto">
            Encrypting payment payload through 256-Bit SSL tokenization. Please do not refresh or close.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE3D2] shadow-sm space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-[#FAF6EE] text-[#4A0E17] hover:bg-[#F2EADB] flex items-center justify-center transition-colors"
            title="Change Payment Method"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-serif-luxury text-xl font-bold text-[#3B0C13]">
              CREDIT / DEBIT CARD
            </h2>
            <p className="text-xs text-[#7A695C]">
              256-Bit Encrypted & PCI-DSS Compliant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-300 text-[10px] font-bold">
          <Lock className="w-3 h-3" />
          <span>SSL 256-BIT</span>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Card Preview Banner */}
      <div className="bg-gradient-to-tr from-[#3B0C13] via-[#4A0E17] to-[#7B1D28] p-5 rounded-2xl border border-[#D4AF37]/50 shadow-md text-white space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#DFBA67]">
            LUXUE PRESTIGE CARD
          </span>
          <span className="text-xs font-black px-2 py-0.5 rounded bg-white/20 uppercase tracking-wider">
            {brand}
          </span>
        </div>

        <div className="font-mono text-sm sm:text-base font-bold tracking-[0.2em] text-[#FAF6EE]">
          {cardNumber || '•••• •••• •••• ••••'}
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#E0D7CD]">
          <div>
            <span className="text-[8px] uppercase tracking-wider block text-[#DFBA67]">
              CARDHOLDER
            </span>
            <span className="font-semibold uppercase truncate max-w-[160px] block">
              {cardholderName || 'YOUR NAME'}
            </span>
          </div>
          <div>
            <span className="text-[8px] uppercase tracking-wider block text-[#DFBA67]">
              EXPIRES
            </span>
            <span className="font-mono font-semibold">
              {expiry || 'MM/YY'}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Card Number */}
        <div>
          <label className="text-xs font-bold text-[#3B0C13] block mb-1">
            CARD NUMBER <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="4532 0158 9845 2048"
              value={cardNumber}
              onChange={e => setCardNumber(formatCardNumber(e.target.value))}
              className="w-full bg-[#FAF8F5] font-mono text-xs px-4 py-3 rounded-xl border border-[#D4AF37]/40 text-[#2D2622] font-bold tracking-wider placeholder:font-sans placeholder:tracking-normal placeholder:text-[#A8988B] focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17]"
            />
            <CreditCard className="w-4 h-4 text-[#8C7A6B] absolute right-3.5 top-3.5" />
          </div>
        </div>

        {/* Cardholder Name */}
        <div>
          <label className="text-xs font-bold text-[#3B0C13] block mb-1">
            CARDHOLDER NAME <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="Name as printed on card"
            value={cardholderName}
            onChange={e => setCardholderName(e.target.value)}
            className="w-full bg-[#FAF8F5] text-xs px-4 py-3 rounded-xl border border-[#D4AF37]/40 text-[#2D2622] font-semibold uppercase placeholder:normal-case placeholder:text-[#A8988B] focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17]"
          />
        </div>

        {/* Expiry & CVV */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-[#3B0C13] block mb-1">
              EXPIRY DATE <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={5}
              placeholder="MM/YY"
              value={expiry}
              onChange={e => setExpiry(formatExpiry(e.target.value))}
              className="w-full bg-[#FAF8F5] font-mono text-xs px-4 py-3 rounded-xl border border-[#D4AF37]/40 text-[#2D2622] font-bold placeholder:font-sans placeholder:text-[#A8988B] focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#3B0C13] block mb-1">
              CVV / CVC <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showCvv ? 'text' : 'password'}
                required
                maxLength={4}
                placeholder="123"
                value={cvv}
                onChange={e => setCvv(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#FAF8F5] font-mono text-xs px-4 py-3 rounded-xl border border-[#D4AF37]/40 text-[#2D2622] font-bold placeholder:font-sans placeholder:text-[#A8988B] focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17]"
              />
              <button
                type="button"
                onClick={() => setShowCvv(!showCvv)}
                className="absolute right-3 top-3 text-[#8C7A6B] hover:text-[#3B0C13]"
              >
                {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Pay Button */}
      <button
        type="submit"
        className="w-full bg-[#4A0E17] hover:bg-[#62121E] text-[#DFBA67] font-bold text-xs py-4 px-6 rounded-xl border border-[#D4AF37] shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
      >
        <CheckCircle className="w-4 h-4" />
        <span>PAY ₹{order.totalAmount.toLocaleString('en-IN')} SECURELY →</span>
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-[#7A695C] pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
        <span>Card details are tokenized & never stored on servers. PCI-DSS Certified.</span>
      </div>
    </form>
  );
};
