import React, { useState } from 'react';
import { MapPin, CheckSquare, Square, ArrowRight, ShieldCheck } from 'lucide-react';
import { ShippingAddress } from '../../types';

interface AddressStepProps {
  initialAddress: ShippingAddress;
  onContinue: (address: ShippingAddress) => void;
}

export const AddressStep: React.FC<AddressStepProps> = ({ initialAddress, onContinue }) => {
  const [address, setAddress] = useState<ShippingAddress>(initialAddress);
  const [saveForFuture, setSaveForFuture] = useState<boolean>(initialAddress.saveForFuture ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!address.fullName || address.fullName.trim().length < 2) {
      errs.fullName = 'Please enter your full name';
    }

    const cleanMobile = (address.mobile || '').replace(/\D/g, '');
    if (!cleanMobile || cleanMobile.length < 10) {
      errs.mobile = 'Please enter a valid 10-digit mobile number';
    }

    if (!address.house || address.house.trim().length < 2) {
      errs.house = 'House / Flat / Building is required';
    }

    if (!address.street || address.street.trim().length < 3) {
      errs.street = 'Street / Area is required';
    }

    if (!address.city || address.city.trim().length < 2) {
      errs.city = 'City is required';
    }

    if (!address.state || address.state.trim().length < 2) {
      errs.state = 'State is required';
    }

    const cleanPin = (address.pin || '').replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      errs.pin = 'Enter a valid 6-digit PIN code';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onContinue({
        ...address,
        saveForFuture,
      });
    }
  };

  const handleChange = (field: keyof ShippingAddress, val: string) => {
    setAddress(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE3D2] shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4A0E17] text-[#DFBA67] flex items-center justify-center font-bold text-sm">
            1
          </div>
          <div>
            <h2 className="font-serif-luxury text-xl font-bold text-[#3B0C13]">
              DELIVERY ADDRESS
            </h2>
            <p className="text-xs text-[#7A695C]">
              Where should we deliver your luxury parcel?
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold text-[#801723] uppercase tracking-wider bg-[#FAF6EE] px-3 py-1 rounded-full border border-[#D4AF37]/30">
          STEP 1 OF 2
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="text-xs font-bold text-[#3B0C13] block mb-1.5">
            FULL NAME <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Priya Sharma"
            value={address.fullName}
            onChange={e => handleChange('fullName', e.target.value)}
            className={`w-full bg-[#FAF8F5] text-xs px-4 py-3 rounded-xl border ${
              errors.fullName ? 'border-rose-500 bg-rose-50/40' : 'border-[#D4AF37]/40'
            } text-[#2D2622] font-medium placeholder:text-[#A8988B] focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17]`}
          />
          {errors.fullName && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.fullName}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="text-xs font-bold text-[#3B0C13] block mb-1.5">
            MOBILE NUMBER <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-xs font-bold text-[#801723]">+91</span>
            <input
              type="tel"
              maxLength={10}
              placeholder="9876543210"
              value={address.mobile}
              onChange={e => handleChange('mobile', e.target.value.replace(/\D/g, ''))}
              className={`w-full bg-[#FAF8F5] text-xs pl-12 pr-4 py-3 rounded-xl border ${
                errors.mobile ? 'border-rose-500 bg-rose-50/40' : 'border-[#D4AF37]/40'
              } text-[#2D2622] font-medium placeholder:text-[#A8988B] focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17]`}
            />
          </div>
          {errors.mobile && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.mobile}</p>
          )}
        </div>

        {/* House / Flat / Building */}
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-[#3B0C13] block mb-1.5">
            HOUSE / FLAT / BUILDING <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            placeholder="Flat No. / House No. / Villa / Building Name"
            value={address.house}
            onChange={e => handleChange('house', e.target.value)}
            className={`w-full bg-[#FAF8F5] text-xs px-4 py-3 rounded-xl border ${
              errors.house ? 'border-rose-500 bg-rose-50/40' : 'border-[#D4AF37]/40'
            } text-[#2D2622] font-medium placeholder:text-[#A8988B] focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17]`}
          />
          {errors.house && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.house}</p>
          )}
        </div>

        {/* Street / Area */}
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-[#3B0C13] block mb-1.5">
            STREET / AREA / ROAD <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            placeholder="Street Name, Area, Sector, Colony"
            value={address.street}
            onChange={e => handleChange('street', e.target.value)}
            className={`w-full bg-[#FAF8F5] text-xs px-4 py-3 rounded-xl border ${
              errors.street ? 'border-rose-500 bg-rose-50/40' : 'border-[#D4AF37]/40'
            } text-[#2D2622] font-medium placeholder:text-[#A8988B] focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17]`}
          />
          {errors.street && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.street}</p>
          )}
        </div>

        {/* Landmark */}
        <div>
          <label className="text-xs font-bold text-[#3B0C13] block mb-1.5">
            LANDMARK <span className="text-[#8C7A6B] font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            placeholder="Near Metro, Opposite Park, etc."
            value={address.landmark || ''}
            onChange={e => handleChange('landmark', e.target.value)}
            className="w-full bg-[#FAF8F5] text-xs px-4 py-3 rounded-xl border border-[#D4AF37]/40 text-[#2D2622] font-medium placeholder:text-[#A8988B] focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17]"
          />
        </div>

        {/* PIN Code */}
        <div>
          <label className="text-xs font-bold text-[#3B0C13] block mb-1.5">
            PIN CODE <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            maxLength={6}
            placeholder="6-Digit Postal PIN"
            value={address.pin}
            onChange={e => handleChange('pin', e.target.value.replace(/\D/g, ''))}
            className={`w-full bg-[#FAF8F5] text-xs px-4 py-3 rounded-xl border ${
              errors.pin ? 'border-rose-500 bg-rose-50/40' : 'border-[#D4AF37]/40'
            } text-[#2D2622] font-medium placeholder:text-[#A8988B] focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17]`}
          />
          {errors.pin && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.pin}</p>
          )}
        </div>

        {/* City */}
        <div>
          <label className="text-xs font-bold text-[#3B0C13] block mb-1.5">
            CITY <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Noida / New Delhi / Bengaluru"
            value={address.city}
            onChange={e => handleChange('city', e.target.value)}
            className={`w-full bg-[#FAF8F5] text-xs px-4 py-3 rounded-xl border ${
              errors.city ? 'border-rose-500 bg-rose-50/40' : 'border-[#D4AF37]/40'
            } text-[#2D2622] font-medium placeholder:text-[#A8988B] focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17]`}
          />
          {errors.city && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.city}</p>
          )}
        </div>

        {/* State */}
        <div>
          <label className="text-xs font-bold text-[#3B0C13] block mb-1.5">
            STATE <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Uttar Pradesh / Delhi / Maharashtra"
            value={address.state}
            onChange={e => handleChange('state', e.target.value)}
            className={`w-full bg-[#FAF8F5] text-xs px-4 py-3 rounded-xl border ${
              errors.state ? 'border-rose-500 bg-rose-50/40' : 'border-[#D4AF37]/40'
            } text-[#2D2622] font-medium placeholder:text-[#A8988B] focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17]`}
          />
          {errors.state && (
            <p className="text-[11px] text-rose-600 font-semibold mt-1">{errors.state}</p>
          )}
        </div>
      </div>

      {/* Save Address Checkbox */}
      <div
        onClick={() => setSaveForFuture(!saveForFuture)}
        className="flex items-center gap-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#EAE3D2] cursor-pointer select-none hover:bg-[#FAF6EE] transition-colors"
      >
        {saveForFuture ? (
          <CheckSquare className="w-5 h-5 text-[#4A0E17]" />
        ) : (
          <Square className="w-5 h-5 text-[#A8988B]" />
        )}
        <span className="text-xs font-bold text-[#3B0C13]">
          Save this address for future orders
        </span>
      </div>

      {/* Button */}
      <button
        type="submit"
        className="w-full bg-[#4A0E17] hover:bg-[#62121E] text-[#DFBA67] font-bold text-xs py-4 px-6 rounded-xl border border-[#D4AF37] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
      >
        <span>CONTINUE TO PAYMENT</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-[#7A695C] pt-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
        <span>End-to-End SSL 256-Bit Encrypted & Privacy Protected</span>
      </div>
    </form>
  );
};
