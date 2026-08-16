import React, { useState } from 'react';
import {
  CheckCircle2,
  Gift,
  Package,
  ArrowRight,
  FileText,
  Building2,
  Clock,
  ShieldCheck,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { InvoiceModal } from '../components/InvoiceModal';

export const OrderConfirmationPage: React.FC = () => {
  const { lastCreatedOrder, navigate, settings } = useShop();
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  if (!lastCreatedOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif-luxury text-xl font-bold text-[#3B0C13]">
          No Recent Order Found
        </h2>
        <p className="text-xs text-[#7A695C]">
          Browse our catalogue to order handcrafted designer ethnicwear.
        </p>
        <button
          onClick={() => navigate('home')}
          className="bg-[#4A0E17] text-[#DFBA67] font-bold text-xs px-6 py-3 rounded-xl border border-[#D4AF37] shadow-md"
        >
          RETURN TO HOMEPAGE
        </button>
      </div>
    );
  }

  const isPaid = lastCreatedOrder.paymentStatus === 'Paid';
  const isProcessing =
    lastCreatedOrder.paymentStatus === 'Payment Processing' ||
    lastCreatedOrder.paymentStatus === 'Pending Payment' ||
    lastCreatedOrder.paymentStatus === 'Pending';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 pb-28">
      {showInvoiceModal && (
        <InvoiceModal order={lastCreatedOrder} onClose={() => setShowInvoiceModal(false)} />
      )}

      <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-[#D4AF37] shadow-2xl text-center space-y-6">
        {/* Animated Icon */}
        <div
          className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto shadow-md ${
            isPaid
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
              : 'bg-amber-50 border-amber-400 text-amber-800'
          }`}
        >
          {isPaid ? (
            <CheckCircle2 className="w-12 h-12 text-emerald-700 animate-bounce" />
          ) : (
            <Clock className="w-12 h-12 text-amber-700 animate-pulse" />
          )}
        </div>

        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#801723]">
            {isPaid ? 'PAYMENT VERIFIED & CONFIRMED' : 'ORDER PLACED & VERIFICATION IN PROGRESS'}
          </span>
          <h1 className="font-serif-luxury text-2xl sm:text-4xl font-bold text-[#3B0C13] mt-1">
            {isPaid ? 'ORDER CONFIRMED ✓' : 'PAYMENT PROCESSING'}
          </h1>
          <p className="text-xs text-[#7A695C] mt-2">
            Your order <strong>#{lastCreatedOrder.id}</strong> has been registered.
            {isProcessing &&
              ' We are verifying your UPI transaction reference and will dispatch your package shortly.'}
          </p>
        </div>

        {/* Verification Status Banner if UPI verification pending */}
        {lastCreatedOrder.paymentVerification?.utrNumber && (
          <div className="bg-amber-50/90 p-4 rounded-2xl border border-amber-300 text-left space-y-1.5 text-xs text-amber-950">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-[#801723] uppercase text-[10px] tracking-wider">
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                UPI PAYMENT VERIFICATION
              </span>
              <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                Status: Pending Admin Review
              </span>
            </div>
            <p className="font-mono text-xs font-bold text-[#3B0C13]">
              Recorded UTR / Transaction ID: {lastCreatedOrder.paymentVerification.utrNumber}
            </p>
            <p className="text-[11px] text-amber-900 leading-snug">
              Our accounts team confirms bank credits directly with ICICI Bank. Once approved, you will receive an SMS and your tracking timeline will move to Confirmed.
            </p>
          </div>
        )}

        {/* Card info banner if paid via card */}
        {lastCreatedOrder.cardInfo && (
          <div className="bg-emerald-50/90 p-4 rounded-2xl border border-emerald-300 text-left space-y-1 text-xs text-emerald-950">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-emerald-900 uppercase text-[10px] tracking-wider">
                <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                CARD TRANSACTION AUTHORIZED
              </span>
              <span className="bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                Auth: {lastCreatedOrder.cardInfo.authCode || 'APPROVED'}
              </span>
            </div>
            <p className="font-mono text-xs font-semibold text-emerald-900">
              Paid via {lastCreatedOrder.cardInfo.brand} ({lastCreatedOrder.cardInfo.maskedNumber})
            </p>
          </div>
        )}

        {/* Business Info Section in Order Confirmation */}
        <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#D4AF37]/50 text-left space-y-1.5 text-xs text-[#5A4D41]">
          <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-1.5">
            <span className="font-bold text-[#801723] uppercase text-[10px] tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              OFFICIAL BUSINESS DETAILS
            </span>
            <span className="font-mono text-[11px] font-bold text-[#3B0C13]">
              GSTIN: {settings.gstin || '09AAMFE0502D1ZX'}
            </span>
          </div>
          <p className="font-extrabold text-[#3B0C13]">{settings.storeName || 'LUXUE FASHION ONLINE'}</p>
          <p className="text-[11px] text-[#7A695C] leading-snug">
            {settings.officeAddress || 'Ground Floor, SD-46, Sector 45'}, {settings.city || 'Noida'}, {settings.state || 'Uttar Pradesh'}, {settings.pinCode || '201303'}, {settings.country || 'India'}
          </p>
        </div>

        {/* Order Details Summary Box */}
        <div className="bg-[#FAF6EE] p-5 rounded-2xl border border-[#EAE3D2] text-left space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-3 text-xs font-bold text-[#3B0C13]">
            <span>ORDER ID: {lastCreatedOrder.id}</span>
            <div className="flex items-center gap-2">
              <span className="text-[#801723]">Method: {lastCreatedOrder.paymentMethod}</span>
              <span className="text-[#7A695C]">|</span>
              <span className="text-[#4A0E17]">Status: {lastCreatedOrder.orderStatus}</span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-3">
            {lastCreatedOrder.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-14 object-cover rounded-lg border border-[#D4AF37]"
                  />
                  <div>
                    <p className="font-bold text-[#2D2622]">{item.product.name}</p>
                    <p className="text-[#7A695C] text-[11px]">
                      Size: {item.selectedSize} | Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-[#4A0E17]">
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </span>
              </div>
            ))}

            {/* Free Rakhi Gift Item */}
            {lastCreatedOrder.freeGiftItem && (
              <div className="bg-emerald-100/80 p-3 rounded-xl border border-emerald-400 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-emerald-800" />
                  <div>
                    <span className="text-[9px] font-extrabold bg-emerald-800 text-white px-1.5 py-0.5 rounded">
                      FREE RAKHI GIFT
                    </span>
                    <p className="font-bold text-emerald-950">
                      {lastCreatedOrder.freeGiftItem.product.name}
                    </p>
                  </div>
                </div>
                <span className="font-extrabold text-emerald-900">₹0 FREE</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#EAE3D2] flex justify-between text-xs font-black text-[#4A0E17]">
            <span>TOTAL PAYABLE AMOUNT</span>
            <span className="text-base">₹{lastCreatedOrder.totalAmount.toLocaleString('en-IN')}</span>
          </div>

          <div className="text-xs text-[#5A4D41] pt-2 border-t border-[#EAE3D2]">
            <p className="font-bold text-[#3B0C13]">SHIPPING TO:</p>
            <p className="font-medium text-[#2D2622]">{lastCreatedOrder.shippingAddress.fullName} ({lastCreatedOrder.shippingAddress.mobile})</p>
            <p>{lastCreatedOrder.shippingAddress.house}, {lastCreatedOrder.shippingAddress.street}</p>
            <p>{lastCreatedOrder.shippingAddress.city}, {lastCreatedOrder.shippingAddress.state} - {lastCreatedOrder.shippingAddress.pin}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="w-full bg-[#DFBA67] hover:bg-[#EAD087] text-[#3B0C13] font-bold text-xs py-3.5 px-6 rounded-xl border border-[#D4AF37] shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
          >
            <FileText className="w-4 h-4 text-[#3B0C13]" />
            <span>VIEW / DOWNLOAD TAX INVOICE</span>
          </button>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('orders')}
              className="flex-1 bg-[#4A0E17] hover:bg-[#62121E] text-[#DFBA67] font-bold text-xs py-3.5 px-6 rounded-xl border border-[#D4AF37] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4 text-[#DFBA67]" />
              <span>TRACK MY ORDER</span>
            </button>

            <button
              onClick={() => navigate('shop')}
              className="flex-1 bg-[#FAF6EE] hover:bg-[#FAF0DC] text-[#4A0E17] font-bold text-xs py-3.5 px-6 rounded-xl border border-[#4A0E17] flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CONTINUE SHOPPING</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-[10px] text-[#8C7A6B]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
          <span>Need help with your order? WhatsApp Support at {settings.whatsappNumber || '+91 98765 43210'}</span>
        </div>
      </div>
    </div>
  );
};
