import React from 'react';
import { useShop } from '../context/ShopContext';

export const WhatsAppButton: React.FC = () => {
  const { settings } = useShop();

  // Clean phone number format from settings (no hardcoding)
  const rawPhone = settings?.whatsappNumber || '+919876543210';
  const cleanPhone = rawPhone.replace(/[^\d+]/g, '').replace(/^\+/, '');

  const defaultMsg = encodeURIComponent('Hello LUXUE FASHION ONLINE, I need help with my order.');
  const waUrl = `https://wa.me/${cleanPhone}?text=${defaultMsg}`;

  return (
    <aside aria-label="WhatsApp Support" className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2.5 group">
      {/* Label for Desktop / Tablet */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="hidden sm:inline-flex items-center gap-1.5 bg-[#5B0F15] text-[#D8B56F] text-xs font-bold px-3.5 py-2 rounded-full border border-[#D8B56F]/60 shadow-lg group-hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping" />
        <span>Chat with us</span>
      </a>

      {/* Recognized WhatsApp Circular Icon Button */}
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Official WhatsApp Support"
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-2xl border-2 border-white flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-[#25D366]/20"
      >
        {/* Official WhatsApp SVG Icon */}
        <svg
          viewBox="0 0 24 24"
          className="w-7 h-7 sm:w-8 sm:h-8 fill-current text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c0-5.445 4.43-9.874 9.877-9.874 2.634 0 5.108 1.027 6.969 2.889a9.813 9.813 0 012.88 6.97c-.001 5.45-4.431 9.878-9.877 9.878m0-18.156A11.66 11.66 0 003.791 7.08a11.66 11.66 0 00-1.78 6.222c0 2.062.536 4.077 1.554 5.845l-1.65 6.026 6.166-1.617c1.711.933 3.642 1.424 5.603 1.425h.005c6.436 0 11.674-5.238 11.677-11.676A11.6 11.6 0 0022.023 7.08 11.6 11.6 0 0013.73 3.629" />
        </svg>
      </a>
    </aside>
  );
};
