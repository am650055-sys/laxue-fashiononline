import React, { useState } from 'react';
import { Crown, Mail, ArrowRight, Instagram, Facebook, Youtube, Check, MapPin, Building2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Footer: React.FC = () => {
  const { navigate, setActiveCategoryFilter, settings } = useShop();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-[#2B090E] text-[#E5DACE] pt-12 pb-24 md:pb-12 border-t-2 border-[#D4AF37]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Newsletter Section */}
        <div className="bg-gradient-to-r from-[#4A0E17] via-[#5B121E] to-[#4A0E17] rounded-2xl p-6 sm:p-10 mb-12 border border-[#D4AF37]/40 shadow-xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md">
            <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white tracking-wider uppercase mb-1">
              JOIN THE LUXUE CIRCLE
            </h3>
            <p className="text-xs sm:text-sm text-amber-100">
              Subscribe to receive exclusive access to private sales, new festive edits, and secret Rakhi gift offers.
            </p>
          </div>

          <div className="w-full md:w-auto">
            {subscribed ? (
              <div className="bg-[#6A1623] text-[#DFBA67] font-bold text-sm px-6 py-3 rounded-xl border border-[#D4AF37] flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-emerald-400" />
                <span>WELCOME TO THE LUXUE CIRCLE!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-[#B8860B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#3B0C13] text-white text-xs sm:text-sm pl-10 pr-4 py-3 rounded-xl border border-[#D4AF37]/40 focus:outline-none focus:border-[#DFBA67] placeholder:text-[#A8988B]"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#DFBA67] hover:bg-[#EAD087] text-[#3B0C13] font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>SUBSCRIBE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-[#DFBA67]" />
              <span className="font-serif-luxury text-2xl font-bold tracking-[0.2em] text-white uppercase">
                LUXUE
              </span>
            </div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-bold mb-4">
              FASHION ONLINE
            </p>
            <p className="text-xs text-[#B8A89A] max-w-sm leading-relaxed italic mb-6">
              “Elegance Woven Into Every Style.”
              <br />
              Crafting modern silhouettes and timeless Indian ethnic heritage for the sophisticated woman.
            </p>
            <div className="flex items-center space-x-3">
              <a href="#instagram" className="w-9 h-9 rounded-full bg-[#3B0C13] border border-[#D4AF37]/40 flex items-center justify-center text-[#DFBA67] hover:bg-[#DFBA67] hover:text-[#3B0C13] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#facebook" className="w-9 h-9 rounded-full bg-[#3B0C13] border border-[#D4AF37]/40 flex items-center justify-center text-[#DFBA67] hover:bg-[#DFBA67] hover:text-[#3B0C13] transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#youtube" className="w-9 h-9 rounded-full bg-[#3B0C13] border border-[#D4AF37]/40 flex items-center justify-center text-[#DFBA67] hover:bg-[#DFBA67] hover:text-[#3B0C13] transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 1: Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#DFBA67] mb-4">
              SHOP
            </h4>
            <ul className="space-y-2.5 text-xs text-[#C2B2A3]">
              <li>
                <button
                  onClick={() => {
                    setActiveCategoryFilter('All');
                    navigate('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  All Kurtis
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveCategoryFilter('New Arrivals');
                    navigate('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  New Arrivals
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveCategoryFilter('Best Sellers');
                    navigate('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Best Sellers
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveCategoryFilter('Festive Kurtis');
                    navigate('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Festive Collection
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setActiveCategoryFilter('Anarkali Kurtis');
                    navigate('shop');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Anarkali Sets
                </button>
              </li>
            </ul>
          </div>

          {/* Col 2: Help */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#DFBA67] mb-4">
              HELP
            </h4>
            <ul className="space-y-2.5 text-xs text-[#C2B2A3]">
              <li>
                <button onClick={() => navigate('contact')} className="hover:text-white transition-colors">
                  Contact Customer Support
                </button>
              </li>
              <li>
                <button onClick={() => navigate('about')} className="hover:text-white transition-colors">
                  Shipping Information
                </button>
              </li>
              <li>
                <button onClick={() => navigate('about')} className="hover:text-white transition-colors">
                  Easy 15-Day Returns
                </button>
              </li>
              <li>
                <button onClick={() => navigate('about')} className="hover:text-white transition-colors">
                  Kurti Size Guide
                </button>
              </li>
              <li>
                <button onClick={() => navigate('about')} className="hover:text-white transition-colors">
                  FAQs
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#DFBA67] mb-4">
              LEGAL & POLICIES
            </h4>
            <ul className="space-y-2.5 text-xs text-[#C2B2A3]">
              <li>
                <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#terms" className="hover:text-white transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#refund" className="hover:text-white transition-colors">Refund & Cancellation</a>
              </li>
              <li>
                <a href="#shipping" className="hover:text-white transition-colors">Shipping Policy</a>
              </li>
            </ul>
          </div>

        </div>

        {/* Office & Business Details Section */}
        <div className="bg-[#1F060A] rounded-2xl p-6 mb-10 border border-[#D4AF37]/30 text-xs text-[#C2B2A3]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#DFBA67]" />
                <h4 className="font-serif-luxury text-sm font-bold text-white tracking-wider uppercase">
                  OFFICE & BUSINESS DETAILS
                </h4>
              </div>
              <p className="font-bold text-[#DFBA67]">{settings.storeName || 'LUXUE FASHION ONLINE'}</p>
              <p className="text-[#A39283] leading-relaxed">
                <span className="font-semibold text-amber-100">Office Address:</span> {settings.officeAddress || 'Ground Floor, SD-46, Opposite Prateek Stylome Gate No.3, Sector 45'}, {settings.city || 'Noida'}, {settings.state || 'Uttar Pradesh'}, {settings.pinCode || '201303'}, {settings.country || 'India'}
              </p>
            </div>

            <div className="bg-[#2B090E] px-4 py-3 rounded-xl border border-[#D4AF37]/40 shrink-0">
              <span className="text-[10px] uppercase font-bold text-[#D4AF37] block">REGISTERED GSTIN</span>
              <span className="font-mono text-sm font-bold text-white tracking-widest">{settings.gstin || '09AAMFE0502D1ZX'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-[#3D141C] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#A39283] gap-4">
          <p>© {new Date().getFullYear()} LUXUE FASHION ONLINE. All Rights Reserved.</p>
          <div className="flex items-center space-x-4">
            <span>Secure 256-bit Encrypted Checkout</span>
            <span>•</span>
            <span>Crafted in India 🇮🇳</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
