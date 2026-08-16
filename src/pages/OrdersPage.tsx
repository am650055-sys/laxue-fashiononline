import React, { useState, useEffect } from 'react';
import { Truck, Check, Clock, ChevronRight, FileText, QrCode, ShieldCheck, AlertCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Order } from '../types';
import { EmptyState } from '../components/EmptyState';
import { InvoiceModal } from '../components/InvoiceModal';

export const OrdersPage: React.FC = () => {
  const { navigate, submitPaymentProof } = useShop();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  
  // UTR submission modal for existing orders
  const [utrModalOrder, setUtrModalOrder] = useState<Order | null>(null);
  const [manualUtr, setManualUtr] = useState('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [utrMessage, setUtrMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const url = searchPhone ? `/api/orders?phone=${searchPhone}` : '/api/orders';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleManualUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrModalOrder) return;
    if (!manualUtr || manualUtr.trim().length < 6) {
      setUtrMessage({ type: 'error', text: 'Please enter a valid 12-digit UPI UTR number' });
      return;
    }

    setIsSubmittingUtr(true);
    const res = await submitPaymentProof(utrModalOrder.id, manualUtr.trim());
    setIsSubmittingUtr(false);

    if (res.success) {
      setUtrMessage({ type: 'success', text: 'UTR submitted successfully for admin verification!' });
      setTimeout(() => {
        setUtrModalOrder(null);
        setUtrMessage(null);
        setManualUtr('');
        fetchOrders();
      }, 1500);
    } else {
      setUtrMessage({ type: 'error', text: res.message || 'Failed to submit UTR' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-28">
      {selectedInvoiceOrder && (
        <InvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}

      {/* Manual UTR Submission Modal */}
      {utrModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border-2 border-[#D4AF37] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#EAE3D2] pb-3">
              <h3 className="font-serif-luxury text-lg font-bold text-[#3B0C13]">
                SUBMIT UPI UTR / REF ID
              </h3>
              <button
                onClick={() => {
                  setUtrModalOrder(null);
                  setUtrMessage(null);
                }}
                className="text-[#7A695C] hover:text-[#3B0C13] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#7A695C]">
              Order #{utrModalOrder.id} • Payable Amount: ₹{utrModalOrder.totalAmount.toLocaleString('en-IN')}
            </p>

            {utrMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  utrMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border border-rose-300'
                }`}
              >
                {utrMessage.text}
              </div>
            )}

            <form onSubmit={handleManualUtrSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#3B0C13] block mb-1">
                  12-DIGIT UPI UTR NUMBER *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 423589102456"
                  value={manualUtr}
                  onChange={e => setManualUtr(e.target.value.toUpperCase())}
                  className="w-full bg-[#FAF8F5] font-mono text-xs px-3.5 py-3 rounded-xl border border-[#D4AF37]/50 text-[#2D2622] font-bold tracking-wider focus:outline-none focus:border-[#4A0E17]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingUtr}
                className="w-full bg-[#4A0E17] text-[#DFBA67] font-bold text-xs py-3 rounded-xl border border-[#D4AF37] shadow-md uppercase tracking-wider"
              >
                {isSubmittingUtr ? 'SUBMITTING...' : 'VERIFY & CONFIRM PAYMENT'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#EAE3D2] pb-4 mb-6 gap-3">
        <div>
          <h1 className="font-serif-luxury text-2xl font-bold text-[#3B0C13]">
            MY ORDERS & TRACKING
          </h1>
          <p className="text-xs text-[#7A695C]">
            Live order timeline, bank verification status, and tax invoices.
          </p>
        </div>

        {/* Search by Mobile */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search by Mobile No."
            value={searchPhone}
            onChange={e => setSearchPhone(e.target.value)}
            className="bg-[#FAF6EE] text-xs px-3.5 py-2.5 rounded-xl border border-[#D4AF37]/40 focus:outline-none focus:border-[#4A0E17]"
          />
          <button
            onClick={fetchOrders}
            className="bg-[#4A0E17] text-[#DFBA67] text-xs font-bold px-4 py-2.5 rounded-xl border border-[#D4AF37] cursor-pointer"
          >
            SEARCH
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-xs font-bold text-[#7A695C] animate-pulse">
          Loading your order history...
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map(order => {
            const isPaid = order.paymentStatus === 'Paid';
            const isProcessing =
              order.paymentStatus === 'Payment Processing' ||
              order.paymentStatus === 'Pending Payment' ||
              order.paymentStatus === 'Pending';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border-2 border-[#EAE3D2] shadow-sm overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="bg-[#FAF6EE] p-4 sm:p-5 border-b border-[#EAE3D2] flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                  <div>
                    <span className="text-[#3B0C13] font-mono text-sm">ORDER #{order.id}</span>
                    <span className="text-[#7A695C] font-normal ml-3 text-[11px]">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {order.paymentStatus} ({order.paymentMethod})
                    </span>
                    <span className="bg-[#4A0E17] text-[#DFBA67] px-3 py-1 rounded-full text-[10px] font-bold border border-[#D4AF37]/50">
                      {order.orderStatus}
                    </span>
                  </div>
                </div>

                {/* UTR Verification Notice banner if submitted */}
                {order.paymentVerification?.utrNumber && (
                  <div className="bg-amber-50/80 px-4 py-2.5 border-b border-amber-200 flex items-center justify-between text-[11px] text-amber-950">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-700" />
                      <span>
                        UTR Recorded: <strong className="font-mono">{order.paymentVerification.utrNumber}</strong>
                        {order.paymentVerification.status === 'approved' && ' • Verified & Confirmed ✓'}
                        {order.paymentVerification.status === 'pending' && ' • Under Bank Credit Verification'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Items */}
                <div className="p-4 sm:p-5 space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3.5">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-14 object-cover rounded-xl border border-[#D4AF37]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#2D2622] truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[11px] text-[#7A695C]">
                          Size: {item.selectedSize} | Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#4A0E17]">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}

                  {order.freeGiftItem && (
                    <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-300 flex items-center justify-between text-xs">
                      <span className="font-bold text-emerald-900">
                        🎁 Free Rakhi Gift: {order.freeGiftItem.product.name}
                      </span>
                      <span className="font-extrabold text-emerald-800">FREE</span>
                    </div>
                  )}
                </div>

                {/* Tracking Stepper */}
                <div className="p-4 sm:p-5 bg-[#FAF8F5] border-t border-[#EAE3D2]">
                  <p className="text-xs font-bold text-[#3B0C13] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#801723]" />
                    <span>DELIVERY TRACKING TIMELINE</span>
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-[10px] font-semibold">
                    {order.trackingHistory.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className={`p-2.5 rounded-xl border ${
                          step.completed
                            ? 'bg-[#4A0E17] text-[#DFBA67] border-[#D4AF37]'
                            : 'bg-white text-[#8C7A6B] border-[#EAE3D2]'
                        }`}
                      >
                        <div className="flex justify-center mb-1">
                          {step.completed ? (
                            <Check className="w-3.5 h-3.5 text-[#DFBA67]" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-[#8C7A6B]" />
                          )}
                        </div>
                        <p className="truncate font-bold">{step.status}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer bar */}
                <div className="p-4 bg-white border-t border-[#EAE3D2] flex flex-wrap justify-between items-center gap-3 text-xs font-bold text-[#3B0C13]">
                  <span>Total Amount Paid: ₹{order.totalAmount.toLocaleString('en-IN')}</span>

                  <div className="flex items-center gap-3">
                    {isProcessing && !order.paymentVerification?.utrNumber && order.paymentMethod === 'UPI' && (
                      <button
                        onClick={() => setUtrModalOrder(order)}
                        className="bg-[#4A0E17] text-[#DFBA67] px-3 py-1.5 rounded-lg border border-[#D4AF37] flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>SUBMIT UTR</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedInvoiceOrder(order)}
                      className="bg-[#DFBA67] hover:bg-[#EAD087] text-[#3B0C13] px-3.5 py-1.5 rounded-lg border border-[#D4AF37] flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#3B0C13]" />
                      <span>TAX INVOICE</span>
                    </button>

                    <button
                      onClick={() => navigate('shop')}
                      className="text-[#801723] hover:underline flex items-center gap-1 text-xs"
                    >
                      <span>Shop More</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState type="no-orders" />
      )}
    </div>
  );
};
