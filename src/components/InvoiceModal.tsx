import React from 'react';
import { X, Printer, Crown, FileText, CheckCircle2, Building2 } from 'lucide-react';
import { Order } from '../types';
import { useShop } from '../context/ShopContext';

interface InvoiceModalProps {
  order: Order;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const { settings } = useShop();

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  // Tax calculation (5% GST included in fashion items)
  const gstRate = 0.05;
  const taxableValue = Math.round(order.totalAmount / (1 + gstRate));
  const totalGstAmount = order.totalAmount - taxableValue;
  const cgstAmount = (totalGstAmount / 2).toFixed(2);
  const sgstAmount = (totalGstAmount / 2).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:block">
      <div className="bg-white w-full max-w-3xl rounded-3xl border-2 border-[#D4AF37] shadow-2xl overflow-hidden print:border-none print:shadow-none print:rounded-none my-8">
        
        {/* Modal Top Action Bar (Hidden when printing) */}
        <div className="bg-[#3B0C13] text-[#DFBA67] px-6 py-4 flex items-center justify-between border-b border-[#D4AF37]/40 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#DFBA67]" />
            <span className="font-serif-luxury font-bold text-sm tracking-wider uppercase">
              OFFICIAL TAX INVOICE • #{order.id}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-[#DFBA67] hover:bg-[#EAD087] text-[#3B0C13] font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT INVOICE</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-amber-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* INVOICE CONTENT AREA */}
        <div className="p-6 sm:p-10 space-y-8 bg-white text-[#2D2622]">
          
          {/* Header: Company Details & Invoice Badge */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-[#EAE3D2] pb-6 gap-6">
            
            {/* Business Logo & Address */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-[#801723]" />
                <h1 className="font-serif-luxury text-2xl font-black text-[#3B0C13] tracking-widest uppercase">
                  {settings.storeName || 'LUXUE FASHION ONLINE'}
                </h1>
              </div>
              <p className="text-[10px] uppercase font-bold text-[#801723] tracking-[0.2em]">
                PREMIUM ETHNIC & FESTIVE WEAR
              </p>
              
              <div className="text-xs text-[#5A4D41] space-y-0.5 pt-1">
                <p className="font-bold text-[#3B0C13]">REGISTERED OFFICE ADDRESS:</p>
                <p>{settings.officeAddress || 'Ground Floor, SD-46, Opposite Prateek Stylome Gate No.3, Sector 45'}</p>
                <p>
                  {settings.city || 'Noida'}, {settings.state || 'Uttar Pradesh'} - {settings.pinCode || '201303'}, {settings.country || 'India'}
                </p>
                <p className="font-bold text-[#801723] pt-0.5">
                  GSTIN: <span className="font-mono text-[#3B0C13]">{settings.gstin || '09AAMFE0502D1ZX'}</span>
                </p>
                <p>Support: {settings.supportPhone} | Email: {settings.supportEmail}</p>
              </div>
            </div>

            {/* Tax Invoice Right Header Box */}
            <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#D4AF37]/50 text-right space-y-1 min-w-[220px]">
              <span className="inline-block bg-[#4A0E17] text-[#DFBA67] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border border-[#D4AF37]">
                ORIGINAL TAX INVOICE
              </span>
              <p className="text-xs font-bold text-[#3B0C13] pt-2">INVOICE NO: <span className="font-mono text-[#801723]">INV-{order.id}</span></p>
              <p className="text-xs text-[#5A4D41]">ORDER ID: <span className="font-bold text-[#3B0C13]">{order.id}</span></p>
              <p className="text-xs text-[#5A4D41]">INVOICE DATE: <span className="font-bold">{formattedDate}</span></p>
              <p className="text-xs text-[#5A4D41]">PAYMENT STATUS: <span className="font-bold text-emerald-800 uppercase">{order.paymentStatus} ({order.paymentMethod})</span></p>
            </div>

          </div>

          {/* Billed To vs Sold By Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-[#FAF6EE] p-5 rounded-2xl border border-[#EAE3D2] text-xs">
            
            {/* Customer Shipping Address */}
            <div className="space-y-1 border-b sm:border-b-0 sm:border-r border-[#EAE3D2] pb-4 sm:pb-0 sm:pr-4">
              <p className="font-bold uppercase tracking-wider text-[#801723] text-[11px] border-b border-[#EAE3D2] pb-1 mb-2">
                BILLED & SHIPPED TO:
              </p>
              <p className="font-extrabold text-[#3B0C13] text-sm">{order.customerName}</p>
              <p>{order.shippingAddress.house}, {order.shippingAddress.street}</p>
              {order.shippingAddress.area && <p>{order.shippingAddress.area}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pin}</p>
              <p>{order.shippingAddress.country}</p>
              <p className="pt-1 text-[#5A4D41]">
                <span className="font-bold">Phone:</span> {order.phone} | <span className="font-bold">Email:</span> {order.email}
              </p>
            </div>

            {/* Seller Info */}
            <div className="space-y-1">
              <p className="font-bold uppercase tracking-wider text-[#801723] text-[11px] border-b border-[#EAE3D2] pb-1 mb-2 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>SOLD BY:</span>
              </p>
              <p className="font-extrabold text-[#3B0C13] text-sm">{settings.storeName || 'LUXUE FASHION ONLINE'}</p>
              <p>{settings.officeAddress || 'Ground Floor, SD-46, Opposite Prateek Stylome Gate No.3, Sector 45'}</p>
              <p>{settings.city || 'Noida'}, {settings.state || 'Uttar Pradesh'} - {settings.pinCode || '201303'}, {settings.country || 'India'}</p>
              <p className="font-bold text-[#801723] pt-1">GSTIN: {settings.gstin || '09AAMFE0502D1ZX'}</p>
              <p className="text-[10px] text-gray-500">Place of Supply: {order.shippingAddress.state || 'Uttar Pradesh'} (State Code: 09)</p>
            </div>

          </div>

          {/* Product Items Table */}
          <div className="border border-[#EAE3D2] rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#4A0E17] text-[#DFBA67] uppercase text-[10px] font-bold tracking-wider">
                  <th className="p-3 pl-4">#</th>
                  <th className="p-3">ITEM DESCRIPTION & VARIANT</th>
                  <th className="p-3 text-center">QTY</th>
                  <th className="p-3 text-right">UNIT PRICE</th>
                  <th className="p-3 pr-4 text-right">TOTAL AMOUNT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D2]">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF6EE]/50">
                    <td className="p-3 pl-4 font-mono font-bold text-gray-500">{idx + 1}</td>
                    <td className="p-3">
                      <p className="font-bold text-[#3B0C13]">{item.product.name}</p>
                      <p className="text-[11px] text-[#7A695C]">
                        SKU: {item.product.sku} | Size: <span className="font-bold text-[#3B0C13]">{item.selectedSize}</span> | Color: {item.selectedColor}
                      </p>
                    </td>
                    <td className="p-3 text-center font-bold">{item.quantity}</td>
                    <td className="p-3 text-right">₹{item.product.price.toLocaleString('en-IN')}</td>
                    <td className="p-3 pr-4 text-right font-bold text-[#4A0E17]">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}

                {/* Free Gift Row if applicable */}
                {order.freeGiftItem && (
                  <tr className="bg-emerald-50/70">
                    <td className="p-3 pl-4 font-mono font-bold text-emerald-800">🎁</td>
                    <td className="p-3">
                      <span className="text-[9px] font-extrabold bg-emerald-800 text-white px-1.5 py-0.5 rounded mr-2 uppercase">
                        RAKHI FESTIVE GIFT
                      </span>
                      <span className="font-bold text-emerald-950">{order.freeGiftItem.product.name}</span>
                      <p className="text-[11px] text-emerald-800">
                        Size: {order.freeGiftItem.selectedSize} | Color: {order.freeGiftItem.selectedColor}
                      </p>
                    </td>
                    <td className="p-3 text-center font-bold text-emerald-900">1</td>
                    <td className="p-3 text-right text-emerald-900">₹0</td>
                    <td className="p-3 pr-4 text-right font-bold text-emerald-900">FREE</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals & GST Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            
            {/* Tax Summary Info */}
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#EAE3D2] space-y-2 text-[11px] text-[#5A4D41]">
              <p className="font-bold text-[#3B0C13] uppercase border-b border-[#EAE3D2] pb-1">
                GST BREAKDOWN (INCLUDED IN TOTAL)
              </p>
              <div className="flex justify-between">
                <span>Taxable Value (Excl. Tax):</span>
                <span className="font-mono">₹{taxableValue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>CGST (2.5%):</span>
                <span className="font-mono">₹{cgstAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST (2.5%):</span>
                <span className="font-mono">₹{sgstAmount}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-[#EAE3D2] pt-1 text-[#801723]">
                <span>Total Tax Included (GST 5%):</span>
                <span className="font-mono">₹{totalGstAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Financial Totals */}
            <div className="space-y-2 text-xs font-medium text-[#5A4D41] bg-[#FAF6EE] p-4 rounded-2xl border border-[#EAE3D2]">
              <div className="flex justify-between">
                <span>Subtotal (Items):</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Promo / Coupon Discount:</span>
                  <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Express Shipping Fee:</span>
                <span>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#4A0E17] pt-3 border-t-2 border-[#3B0C13]">
                <span>GRAND TOTAL:</span>
                <span className="text-base font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>

          {/* Footer Declaration & Signatory */}
          <div className="pt-6 border-t border-[#EAE3D2] flex flex-col sm:flex-row justify-between items-end text-[10px] text-[#7A695C] gap-4">
            <div className="space-y-1">
              <p className="font-bold text-[#3B0C13] uppercase">DECLARATION & TERMS:</p>
              <p>• This is a computer generated tax invoice and requires no physical signature.</p>
              <p>• Goods once sold are eligible for 15 days easy replacement as per store policy.</p>
              <p>• Subject to Noida, Uttar Pradesh Jurisdiction.</p>
            </div>

            <div className="text-right border-t border-[#EAE3D2] sm:border-none pt-2 sm:pt-0">
              <p className="font-serif-luxury text-sm font-bold text-[#3B0C13]">{settings.storeName || 'LUXUE FASHION ONLINE'}</p>
              <p className="italic text-[#801723] pt-4 font-bold">Authorized Signatory</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
