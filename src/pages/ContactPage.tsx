import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare, Check, Navigation, Building2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ContactPage: React.FC = () => {
  const { settings } = useShop();
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const fullAddress = `${settings.officeAddress || 'Ground Floor, SD-46, Opposite Prateek Stylome Gate No.3, Sector 45'}, ${settings.city || 'Noida'}, ${settings.state || 'Uttar Pradesh'}, ${settings.pinCode || '201303'}, ${settings.country || 'India'}`;
  
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${settings.storeName || 'LUXUE FASHION ONLINE'}, ${fullAddress}`)}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 pb-28 space-y-10">
      
      <div className="text-center max-w-xl mx-auto">
        <h1 className="font-serif-luxury text-3xl font-bold text-[#3B0C13]">
          CONTACT CUSTOMER SUPPORT
        </h1>
        <p className="text-xs text-[#7A695C] mt-2">
          Have questions regarding size guidance, Rakhi offers, or order delivery? We are here to help!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 bg-white p-6 sm:p-10 rounded-3xl border border-[#EAE3D2] shadow-sm">
        
        {/* Contact Form (md:col-span-7) */}
        <div className="md:col-span-7 space-y-4">
          <h2 className="font-serif-luxury text-xl font-bold text-[#3B0C13]">
            SEND US A MESSAGE
          </h2>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-300 p-6 rounded-2xl text-center space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-emerald-900">
                MESSAGE SENT SUCCESSFULLY!
              </h3>
              <p className="text-xs text-emerald-800">
                Our customer concierge team will respond within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#5A4D41] block mb-1">NAME *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-[#FAF6EE] text-xs px-3 py-2.5 rounded-xl border border-[#D4AF37]/40 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#5A4D41] block mb-1">EMAIL *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-[#FAF6EE] text-xs px-3 py-2.5 rounded-xl border border-[#D4AF37]/40 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#5A4D41] block mb-1">PHONE</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="w-full bg-[#FAF6EE] text-xs px-3 py-2.5 rounded-xl border border-[#D4AF37]/40 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#5A4D41] block mb-1">MESSAGE *</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-[#FAF6EE] text-xs p-3 rounded-xl border border-[#D4AF37]/40 focus:outline-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#4A0E17] hover:bg-[#62121E] text-[#DFBA67] font-bold text-xs py-3.5 rounded-xl border border-[#D4AF37] flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-[#DFBA67]" />
                <span>SUBMIT MESSAGE</span>
              </button>
            </form>
          )}
        </div>

        {/* Contact Info (md:col-span-5) */}
        <div className="md:col-span-5 bg-[#FAF6EE] p-6 rounded-2xl border border-[#EAE3D2] space-y-6">
          
          <div>
            <h3 className="font-serif-luxury text-lg font-bold text-[#3B0C13] border-b border-[#EAE3D2] pb-2">
              DIRECT CONTACT
            </h3>

            <div className="space-y-4 text-xs text-[#5A4D41] mt-4">
              <div className="flex items-start gap-3">
                <MessageSquare className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#3B0C13] block">WhatsApp Support</span>
                  <p>{settings.whatsappNumber || '+91 98765 43210'} (Mon - Sat, 10 AM - 7 PM IST)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#801723] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#3B0C13] block">Customer Support Helpline</span>
                  <p>{settings.supportPhone || '+91 98765 43210'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#801723] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#3B0C13] block">Email Assistance</span>
                  <p>{settings.supportEmail || 'support@luxue.com'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* VISIT OUR OFFICE SECTION */}
          <div className="pt-4 border-t-2 border-[#EAE3D2] space-y-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#801723]" />
              <h3 className="font-serif-luxury text-base font-bold text-[#3B0C13]">
                VISIT OUR OFFICE
              </h3>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#D4AF37]/40 space-y-2 text-xs text-[#5A4D41]">
              <p className="font-extrabold text-[#3B0C13] uppercase tracking-wider text-xs">
                {settings.storeName || 'LUXUE FASHION ONLINE'}
              </p>
              
              <div className="space-y-0.5">
                <p>{settings.officeAddress || 'Ground Floor, SD-46, Opposite Prateek Stylome Gate No.3, Sector 45'}</p>
                <p>{settings.city || 'Noida'}, {settings.state || 'Uttar Pradesh'},</p>
                <p>{settings.pinCode || '201303'}, {settings.country || 'India'}</p>
              </div>

              <div className="pt-2 border-t border-[#EAE3D2]">
                <p className="font-bold text-[#801723]">
                  GSTIN: <span className="font-mono text-[#3B0C13] font-extrabold">{settings.gstin || '09AAMFE0502D1ZX'}</span>
                </p>
              </div>

              <a
                href={mapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 w-full bg-[#4A0E17] hover:bg-[#62121E] text-[#DFBA67] font-bold text-xs py-2.5 px-4 rounded-xl border border-[#D4AF37] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm text-center block"
              >
                <Navigation className="w-4 h-4 text-[#DFBA67]" />
                <span>GET DIRECTIONS</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
