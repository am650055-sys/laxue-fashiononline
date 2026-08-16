import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Package,
  Heart,
  MapPin,
  LogOut,
  Crown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Edit3,
  Check,
  RefreshCw,
  Plus,
  X,
  Home,
  Building,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ShippingAddress } from '../types';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi NCR',
];

export const ProfilePage: React.FC = () => {
  const { userProfile, savedAddress, saveAddressForFuture, signUp, logOut, navigate } = useShop();

  // Sign-Up Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
  });

  const [errors, setErrors] = useState<{
    name?: string;
    mobile?: string;
    email?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  // Address Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState<ShippingAddress>({
    fullName: '',
    mobile: '',
    house: '',
    street: '',
    area: '',
    landmark: '',
    city: '',
    state: '',
    pin: '',
    country: 'India',
    saveForFuture: true,
  });

  const [addressErrors, setAddressErrors] = useState<{
    fullName?: string;
    mobile?: string;
    house?: string;
    street?: string;
    city?: string;
    state?: string;
    pin?: string;
  }>({});

  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Helper to extract initials from Name
  const getInitials = (name: string): string => {
    if (!name || !name.trim()) return 'LU';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Sign-up Form Validation
  const validateSignUpForm = (): boolean => {
    const newErrors: { name?: string; mobile?: string; email?: string } = {};

    // 1. Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your full name or username';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // 2. Mobile validation (10 digits)
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (!cleanMobile) {
      newErrors.mobile = 'Please enter your 10-digit mobile number';
    } else if (cleanMobile.length !== 10) {
      newErrors.mobile = 'Mobile number must be exactly 10 digits';
    } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      newErrors.mobile = 'Please enter a valid Indian mobile number (starts with 6, 7, 8, 9)';
    }

    // 3. Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your Gmail / Email ID';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g. name@gmail.com)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Mobile Input (Numbers only, max 10)
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData(prev => ({ ...prev, mobile: rawVal }));
    if (errors.mobile) {
      setErrors(prev => ({ ...prev, mobile: undefined }));
    }
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUpForm()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      signUp({
        name: formData.name.trim(),
        mobile: formData.mobile.trim(),
        email: formData.email.trim().toLowerCase(),
      });
      setIsSubmitting(false);
      setShowSuccessToast({
        show: true,
        message: `Account created successfully! Welcome to LUXUE VIP Club, ${formData.name.trim()}.`,
      });
      setTimeout(() => setShowSuccessToast({ show: false, message: '' }), 3500);
    }, 400);
  };

  // Demo prefill helper for quick testing
  const handleFillDemo = () => {
    setFormData({
      name: 'Priya Verma',
      mobile: '9876543210',
      email: 'priya.verma@gmail.com',
    });
    setErrors({});
  };

  // Open Address Modal with existing data or defaults
  const handleOpenAddressModal = () => {
    const current = savedAddress || userProfile?.addressDetails;
    if (current) {
      setAddressForm({
        fullName: current.fullName || userProfile?.name || '',
        mobile: current.mobile || userProfile?.mobile || '',
        house: current.house || '',
        street: current.street || '',
        area: current.area || '',
        landmark: current.landmark || '',
        city: current.city || '',
        state: current.state || '',
        pin: current.pin || '',
        country: 'India',
        saveForFuture: true,
      });
    } else {
      setAddressForm({
        fullName: userProfile?.name || '',
        mobile: userProfile?.mobile || '',
        house: '',
        street: '',
        area: '',
        landmark: '',
        city: '',
        state: '',
        pin: '',
        country: 'India',
        saveForFuture: true,
      });
    }
    setAddressErrors({});
    setIsAddressModalOpen(true);
  };

  // Validate Address Form
  const validateAddressForm = (): boolean => {
    const errs: {
      fullName?: string;
      mobile?: string;
      house?: string;
      street?: string;
      city?: string;
      state?: string;
      pin?: string;
    } = {};

    if (!addressForm.fullName.trim()) {
      errs.fullName = 'Full Name / Receiver Name is required';
    }

    const cleanMob = addressForm.mobile.replace(/\D/g, '');
    if (!cleanMob || cleanMob.length !== 10) {
      errs.mobile = 'Enter a valid 10-digit mobile number';
    }

    if (!addressForm.house.trim()) {
      errs.house = 'Flat / House No. / Building Name is required';
    }

    if (!addressForm.street.trim()) {
      errs.street = 'Street / Area / Locality is required';
    }

    if (!addressForm.city.trim()) {
      errs.city = 'City is required';
    }

    if (!addressForm.state.trim()) {
      errs.state = 'Please select or enter State';
    }

    const cleanPin = addressForm.pin.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      errs.pin = 'Pincode must be 6 digits';
    }

    setAddressErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Save Address Handler
  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAddressForm()) return;

    setIsSavingAddress(true);
    setTimeout(() => {
      const formattedAddress: ShippingAddress = {
        fullName: addressForm.fullName.trim(),
        mobile: addressForm.mobile.trim(),
        house: addressForm.house.trim(),
        street: addressForm.street.trim(),
        area: addressForm.area?.trim() || '',
        landmark: addressForm.landmark?.trim() || '',
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        pin: addressForm.pin.trim(),
        country: 'India',
        saveForFuture: true,
      };

      saveAddressForFuture(formattedAddress);
      setIsSavingAddress(false);
      setIsAddressModalOpen(false);
      setShowSuccessToast({
        show: true,
        message: 'Primary shipping address updated successfully!',
      });
      setTimeout(() => setShowSuccessToast({ show: false, message: '' }), 3500);
    }, 350);
  };

  // Active address determination
  const activeAddress = savedAddress || userProfile?.addressDetails;

  // ----------------------------------------------------
  // VIEW 1: SIGN-UP FORM (When NOT logged in)
  // ----------------------------------------------------
  if (!userProfile) {
    return (
      <div className="min-h-[80vh] bg-[#FCF9F2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="w-full max-w-lg">
          {/* Card Container */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EAE3D2] shadow-xl relative overflow-hidden">
            {/* Top Decorative Banner */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#5C0F1B] via-[#DFBA67] to-[#5C0F1B]" />

            {/* Header / Brand Icon */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#5C0F1B] text-[#DFBA67] border-2 border-[#D4AF37] shadow-md mb-4">
                <Crown className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 bg-[#FAF3E0] text-[#801723] text-[11px] font-extrabold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-[#D4AF37]/40 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>JOIN LUXUE PRIVILEGE CLUB</span>
              </div>

              <h1 className="font-serif-luxury text-2xl sm:text-3xl font-bold text-[#3B0C13]">
                Create Your Account
              </h1>
              <p className="text-xs sm:text-sm text-[#7A695C] mt-1 max-w-sm mx-auto">
                Sign up to unlock VIP Kurti discounts, 1-click express checkout & real-time order tracking.
              </p>
            </div>

            {/* Sign-Up Form */}
            <form onSubmit={handleSignUpSubmit} className="space-y-5">
              {/* STEP 1: Full Name */}
              <div>
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#3B0C13] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#5C0F1B] text-[#DFBA67] text-[10px] font-black flex items-center justify-center">
                      1
                    </span>
                    <span>Full Name / Username</span>
                  </span>
                  <span className="text-[10px] text-rose-700 font-bold">* Required</span>
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7A6B]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Priya Verma"
                    value={formData.name}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-[#FCF9F2] text-sm text-[#2D2622] font-medium rounded-2xl border transition-all focus:outline-none focus:ring-2 ${
                      errors.name
                        ? 'border-red-400 focus:ring-red-400 bg-red-50/40'
                        : 'border-[#EAE3D2] focus:border-[#5C0F1B] focus:ring-[#5C0F1B]/20'
                    }`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* STEP 2: Mobile Number */}
              <div>
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#3B0C13] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#5C0F1B] text-[#DFBA67] text-[10px] font-black flex items-center justify-center">
                      2
                    </span>
                    <span>Mobile Number</span>
                  </span>
                  <span className="text-[10px] text-[#7A695C] font-semibold">
                    {formData.mobile.length}/10 digits
                  </span>
                </label>

                <div className="relative flex rounded-2xl overflow-hidden border border-[#EAE3D2] focus-within:border-[#5C0F1B] focus-within:ring-2 focus-within:ring-[#5C0F1B]/20 transition-all bg-[#FCF9F2]">
                  {/* +91 Country Code Badge */}
                  <div className="flex items-center gap-1 px-3.5 bg-[#F2EAE0] border-r border-[#EAE3D2] text-xs font-bold text-[#4A0E17] select-none">
                    <Phone className="w-3.5 h-3.5 text-[#801723]" />
                    <span>+91</span>
                  </div>

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={formData.mobile}
                    onChange={handleMobileChange}
                    className="w-full px-3.5 py-3 text-sm text-[#2D2622] font-medium bg-transparent focus:outline-none"
                  />
                </div>
                {errors.mobile && (
                  <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.mobile}</span>
                  </p>
                )}
              </div>

              {/* STEP 3: Gmail / Email ID */}
              <div>
                <label className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#3B0C13] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-[#5C0F1B] text-[#DFBA67] text-[10px] font-black flex items-center justify-center">
                      3
                    </span>
                    <span>Gmail / Email ID</span>
                  </span>
                  <span className="text-[10px] text-rose-700 font-bold">* Required</span>
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7A6B]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="e.g. priya.verma@gmail.com"
                    value={formData.email}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, email: e.target.value }));
                      if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                    }}
                    className={`w-full pl-10 pr-4 py-3 bg-[#FCF9F2] text-sm text-[#2D2622] font-medium rounded-2xl border transition-all focus:outline-none focus:ring-2 ${
                      errors.email
                        ? 'border-red-400 focus:ring-red-400 bg-red-50/40'
                        : 'border-[#EAE3D2] focus:border-[#5C0F1B] focus:ring-[#5C0F1B]/20'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Trust Badge */}
              <div className="p-3 bg-[#FAF6EE] rounded-xl border border-[#EAE3D2] flex items-center gap-2 text-[11px] text-[#5A4D41]">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Your information is encrypted & 100% securely protected.</span>
              </div>

              {/* ACTION: Sign Up Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-2xl bg-[#5C0F1B] hover:bg-[#4A0E17] text-[#DFBA67] font-bold text-sm sm:text-base tracking-wider uppercase border-2 border-[#D4AF37] shadow-xl hover:shadow-2xl transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>CREATING ACCOUNT...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#DFBA67] group-hover:rotate-12 transition-transform" />
                    <span>SIGN UP</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Quick Demo Fill Helper */}
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="text-[11px] font-bold text-[#801723] hover:text-[#5C0F1B] underline underline-offset-4 cursor-pointer"
                >
                  ⚡ Auto-Fill Sample Details (Priya Verma)
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // VIEW 2: DYNAMIC LOGGED-IN PROFILE CARD
  // ----------------------------------------------------
  const initials = getInitials(userProfile.name);

  return (
    <div className="min-h-[75vh] bg-[#FCF9F2] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Success Toast Notification */}
        {showSuccessToast.show && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 shadow-sm animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs sm:text-sm font-bold">
              {showSuccessToast.message}
            </div>
          </div>
        )}

        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#EAE3D2] shadow-xl space-y-6 relative overflow-hidden">
          {/* Top Decorative Border */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#5C0F1B] via-[#DFBA67] to-[#5C0F1B]" />

          {/* User Card Header with Avatar Initials & Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EAE3D2] pb-6">
            <div className="flex items-center gap-4">
              {/* Dynamic Avatar with Generated Initials */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#5C0F1B] text-[#DFBA67] border-2 border-[#D4AF37] flex items-center justify-center font-bold text-xl sm:text-2xl shadow-md tracking-wider shrink-0 ring-4 ring-[#FAF3E0]">
                {initials}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#3B0C13]">
                    {userProfile.name}
                  </h2>
                  <Crown className="w-4 h-4 text-[#D4AF37]" />
                </div>

                {/* Subtext: Email ID & Mobile Number */}
                <p className="text-xs sm:text-sm text-[#7A695C] mt-0.5 font-medium">
                  {userProfile.email} | +91 {userProfile.mobile}
                </p>

                {/* VIP Badge */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 bg-[#FAF3E0] text-[#801723] border border-[#D4AF37]/50 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xs tracking-wider">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    LUXUE VIP MEMBER
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Switch / Sign Out Button on Header */}
            <button
              type="button"
              onClick={logOut}
              className="self-start sm:self-center text-xs font-bold text-rose-700 hover:text-rose-900 py-1.5 px-3 rounded-xl border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer flex items-center gap-1.5"
              title="Sign in with a different account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Account</span>
            </button>
          </div>

          {/* Profile Quick Links & Actions */}
          <div className="space-y-3.5">
            {/* 1. MY ORDERS */}
            <button
              type="button"
              onClick={() => navigate('orders')}
              className="w-full bg-[#FAF6EE] hover:bg-[#F2EAE0] p-4 sm:p-5 rounded-2xl border border-[#EAE3D2] flex items-center justify-between transition-all duration-200 cursor-pointer group shadow-xs hover:shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE3D2] flex items-center justify-center text-[#801723] group-hover:bg-[#5C0F1B] group-hover:text-[#DFBA67] transition-colors">
                  <Package className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-xs sm:text-sm font-bold text-[#3B0C13] block uppercase tracking-wider">
                    MY ORDERS
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#7A695C]">
                    View real-time delivery status & order invoices
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#801723] group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>

            {/* 2. MY WISHLIST */}
            <button
              type="button"
              onClick={() => navigate('wishlist')}
              className="w-full bg-[#FAF6EE] hover:bg-[#F2EAE0] p-4 sm:p-5 rounded-2xl border border-[#EAE3D2] flex items-center justify-between transition-all duration-200 cursor-pointer group shadow-xs hover:shadow-md"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE3D2] flex items-center justify-center text-[#801723] group-hover:bg-[#5C0F1B] group-hover:text-[#DFBA67] transition-colors">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-xs sm:text-sm font-bold text-[#3B0C13] block uppercase tracking-wider">
                    MY WISHLIST
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#7A695C]">
                    Saved ethnic Kurtis & festive outfits
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-[#801723] group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>

            {/* 3. PRIMARY SHIPPING ADDRESS (Dynamic with Empty State & Edit Modal) */}
            <div className="bg-[#FAF6EE] p-4 sm:p-5 rounded-2xl border border-[#EAE3D2] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#EAE3D2] flex items-center justify-center text-[#801723]">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-[#3B0C13] uppercase tracking-wider block">
                      PRIMARY SHIPPING ADDRESS
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-[#7A695C]">
                      Default delivery location for your orders
                    </span>
                  </div>
                </div>

                {activeAddress && (
                  <button
                    type="button"
                    onClick={handleOpenAddressModal}
                    className="text-xs font-bold text-[#801723] hover:text-[#5C0F1B] bg-white hover:bg-[#FAF3E0] py-1.5 px-3 rounded-xl border border-[#EAE3D2] hover:border-[#D4AF37] flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Change Address</span>
                  </button>
                )}
              </div>

              {/* Address Content: Either Empty State or Saved Address Card */}
              {activeAddress ? (
                <div className="pt-2 pl-0 sm:pl-13">
                  <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#EAE3D2] space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-[#3B0C13]">
                        {activeAddress.fullName || userProfile.name}
                      </span>
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">
                        <Check className="w-3 h-3" />
                        Default Address
                      </span>
                    </div>

                    <p className="text-xs text-[#5A4D41] leading-relaxed">
                      {activeAddress.house}, {activeAddress.street}
                      {activeAddress.area ? `, ${activeAddress.area}` : ''}
                      {activeAddress.landmark ? ` (Landmark: ${activeAddress.landmark})` : ''}
                    </p>

                    <p className="text-xs font-semibold text-[#3B0C13]">
                      {activeAddress.city}, {activeAddress.state} - <span className="font-bold text-[#801723]">{activeAddress.pin}</span>
                    </p>

                    <p className="text-[11px] text-[#7A695C] pt-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#801723]" />
                      <span>Contact: +91 {activeAddress.mobile || userProfile.mobile}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="pt-2 pl-0 sm:pl-13">
                  <div className="bg-white/80 p-4 sm:p-5 rounded-xl border border-dashed border-[#D4AF37]/60 text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-[#FAF3E0] border border-[#D4AF37]/40 flex items-center justify-center mx-auto text-[#801723]">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#3B0C13]">
                        No shipping address added yet
                      </h4>
                      <p className="text-[11px] text-[#7A695C] mt-0.5 max-w-sm mx-auto">
                        Add your primary delivery address for 1-click express checkout and fast door delivery.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenAddressModal}
                      className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-[#5C0F1B] hover:bg-[#4A0E17] text-[#DFBA67] text-xs font-bold uppercase tracking-wider border border-[#D4AF37] shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Add New Address</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 4. LOG OUT BUTTON */}
            <button
              type="button"
              onClick={logOut}
              className="w-full bg-[#FAF6EE] hover:bg-rose-50 p-4 sm:p-5 rounded-2xl border border-[#EAE3D2] hover:border-rose-300 flex items-center justify-between transition-colors text-rose-800 cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white border border-rose-200 flex items-center justify-center text-rose-700">
                  <LogOut className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-xs sm:text-sm font-bold text-rose-900 block uppercase tracking-wider">
                    LOG OUT OF ACCOUNT
                  </span>
                  <span className="text-[11px] sm:text-xs text-rose-700/80">
                    End your current session safely
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-800">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADD / EDIT ADDRESS MODAL */}
      {/* ========================================================= */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div
            className="bg-white rounded-3xl w-full max-w-lg border-2 border-[#EAE3D2] shadow-2xl overflow-hidden my-8 relative flex flex-col max-h-[90vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#5C0F1B] text-[#DFBA67] px-6 py-4 flex items-center justify-between border-b border-[#D4AF37]/30 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-[#4A0E17] border border-[#D4AF37]/50 text-[#DFBA67]">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif-luxury text-lg font-bold text-white">
                    {activeAddress ? 'Edit Shipping Address' : 'Add Shipping Address'}
                  </h3>
                  <p className="text-[10px] text-[#DFBA67]/90 font-medium">
                    Provide accurate location details for smooth delivery
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-[#DFBA67] transition-colors cursor-pointer"
                aria-label="Close address form"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveAddress} className="p-6 overflow-y-auto space-y-4">
              {/* Receiver Full Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B0C13] mb-1">
                  Full Name / Receiver Name <span className="text-rose-700">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7A6B]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Priya Verma"
                    value={addressForm.fullName}
                    onChange={e => {
                      setAddressForm(prev => ({ ...prev, fullName: e.target.value }));
                      if (addressErrors.fullName) {
                        setAddressErrors(prev => ({ ...prev, fullName: undefined }));
                      }
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 bg-[#FCF9F2] text-xs sm:text-sm text-[#2D2622] rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                      addressErrors.fullName
                        ? 'border-red-400 focus:ring-red-400 bg-red-50/40'
                        : 'border-[#EAE3D2] focus:border-[#5C0F1B] focus:ring-[#5C0F1B]/20'
                    }`}
                  />
                </div>
                {addressErrors.fullName && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">
                    {addressErrors.fullName}
                  </p>
                )}
              </div>

              {/* Mobile Number (10 digits) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B0C13] mb-1">
                  Mobile Number <span className="text-rose-700">*</span>
                </label>
                <div className="relative flex rounded-xl overflow-hidden border border-[#EAE3D2] focus-within:border-[#5C0F1B] focus-within:ring-2 focus-within:ring-[#5C0F1B]/20 transition-all bg-[#FCF9F2]">
                  <div className="flex items-center gap-1 px-3 bg-[#F2EAE0] border-r border-[#EAE3D2] text-xs font-bold text-[#4A0E17] select-none">
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={addressForm.mobile}
                    onChange={e => {
                      const num = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setAddressForm(prev => ({ ...prev, mobile: num }));
                      if (addressErrors.mobile) {
                        setAddressErrors(prev => ({ ...prev, mobile: undefined }));
                      }
                    }}
                    className="w-full px-3 py-2.5 text-xs sm:text-sm text-[#2D2622] font-medium bg-transparent focus:outline-none"
                  />
                </div>
                {addressErrors.mobile && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">
                    {addressErrors.mobile}
                  </p>
                )}
              </div>

              {/* Flat / House No. / Building Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B0C13] mb-1">
                  Flat / House No. / Building Name <span className="text-rose-700">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7A6B]">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Flat 302, Royal Residency"
                    value={addressForm.house}
                    onChange={e => {
                      setAddressForm(prev => ({ ...prev, house: e.target.value }));
                      if (addressErrors.house) {
                        setAddressErrors(prev => ({ ...prev, house: undefined }));
                      }
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 bg-[#FCF9F2] text-xs sm:text-sm text-[#2D2622] rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                      addressErrors.house
                        ? 'border-red-400 focus:ring-red-400 bg-red-50/40'
                        : 'border-[#EAE3D2] focus:border-[#5C0F1B] focus:ring-[#5C0F1B]/20'
                    }`}
                  />
                </div>
                {addressErrors.house && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">
                    {addressErrors.house}
                  </p>
                )}
              </div>

              {/* Street / Area / Locality */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B0C13] mb-1">
                  Street / Area / Locality <span className="text-rose-700">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8C7A6B]">
                    <Home className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 1st Cross, Indiranagar Stage 2"
                    value={addressForm.street}
                    onChange={e => {
                      setAddressForm(prev => ({ ...prev, street: e.target.value }));
                      if (addressErrors.street) {
                        setAddressErrors(prev => ({ ...prev, street: undefined }));
                      }
                    }}
                    className={`w-full pl-9 pr-3 py-2.5 bg-[#FCF9F2] text-xs sm:text-sm text-[#2D2622] rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                      addressErrors.street
                        ? 'border-red-400 focus:ring-red-400 bg-red-50/40'
                        : 'border-[#EAE3D2] focus:border-[#5C0F1B] focus:ring-[#5C0F1B]/20'
                    }`}
                  />
                </div>
                {addressErrors.street && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">
                    {addressErrors.street}
                  </p>
                )}
              </div>

              {/* Two Column Row: City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* City */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3B0C13] mb-1">
                    City <span className="text-rose-700">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru"
                    value={addressForm.city}
                    onChange={e => {
                      setAddressForm(prev => ({ ...prev, city: e.target.value }));
                      if (addressErrors.city) {
                        setAddressErrors(prev => ({ ...prev, city: undefined }));
                      }
                    }}
                    className={`w-full px-3 py-2.5 bg-[#FCF9F2] text-xs sm:text-sm text-[#2D2622] rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                      addressErrors.city
                        ? 'border-red-400 focus:ring-red-400 bg-red-50/40'
                        : 'border-[#EAE3D2] focus:border-[#5C0F1B] focus:ring-[#5C0F1B]/20'
                    }`}
                  />
                  {addressErrors.city && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1">
                      {addressErrors.city}
                    </p>
                  )}
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3B0C13] mb-1">
                    State <span className="text-rose-700">*</span>
                  </label>
                  <select
                    value={addressForm.state}
                    onChange={e => {
                      setAddressForm(prev => ({ ...prev, state: e.target.value }));
                      if (addressErrors.state) {
                        setAddressErrors(prev => ({ ...prev, state: undefined }));
                      }
                    }}
                    className={`w-full px-3 py-2.5 bg-[#FCF9F2] text-xs sm:text-sm text-[#2D2622] rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                      addressErrors.state
                        ? 'border-red-400 focus:ring-red-400 bg-red-50/40'
                        : 'border-[#EAE3D2] focus:border-[#5C0F1B] focus:ring-[#5C0F1B]/20'
                    }`}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map(st => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  {addressErrors.state && (
                    <p className="text-[11px] text-red-600 font-semibold mt-1">
                      {addressErrors.state}
                    </p>
                  )}
                </div>
              </div>

              {/* Pincode (6 digits) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#3B0C13] mb-1">
                  Pincode (6 Digits) <span className="text-rose-700">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="e.g. 560038"
                  value={addressForm.pin}
                  onChange={e => {
                    const pin = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setAddressForm(prev => ({ ...prev, pin }));
                    if (addressErrors.pin) {
                      setAddressErrors(prev => ({ ...prev, pin: undefined }));
                    }
                  }}
                  className={`w-full px-3 py-2.5 bg-[#FCF9F2] text-xs sm:text-sm text-[#2D2622] font-medium rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                    addressErrors.pin
                      ? 'border-red-400 focus:ring-red-400 bg-red-50/40'
                      : 'border-[#EAE3D2] focus:border-[#5C0F1B] focus:ring-[#5C0F1B]/20'
                  }`}
                />
                {addressErrors.pin && (
                  <p className="text-[11px] text-red-600 font-semibold mt-1">
                    {addressErrors.pin}
                  </p>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="pt-3 border-t border-[#EAE3D2] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-[#EAE3D2] text-[#7A695C] hover:text-[#3B0C13] hover:bg-[#FAF6EE] text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="py-2.5 px-6 rounded-xl bg-[#5C0F1B] hover:bg-[#4A0E17] text-[#DFBA67] text-xs sm:text-sm font-bold uppercase tracking-wider border border-[#D4AF37] shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-75"
                >
                  {isSavingAddress ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>SAVING...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>SAVE ADDRESS</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
