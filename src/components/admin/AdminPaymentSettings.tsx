import React, { useState, useEffect } from 'react';
import {
  QrCode,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Lock,
  Smartphone,
  Info,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useShop } from '../../context/ShopContext';
import { PaymentGatewaySettings } from '../../types';

export const AdminPaymentSettings: React.FC = () => {
  const { settings, updatePaymentSettings } = useShop();

  // Local active state synced with server
  const [activeUpiId, setActiveUpiId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('admin_upi_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.merchantUpiId || parsed.upiId) return parsed.merchantUpiId || parsed.upiId;
      }
    } catch {}
    return settings.merchantUpiId || settings.paymentSettings?.merchantUpiId || '';
  });

  const [activeMerchantName, setActiveMerchantName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('admin_upi_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.merchantName) return parsed.merchantName;
      }
    } catch {}
    return settings.merchantName || settings.paymentSettings?.merchantName || settings.storeName || 'LUXUE FASHION ONLINE';
  });

  const [activeUpiEnabled, setActiveUpiEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('admin_upi_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.upiEnabled === 'boolean') return parsed.upiEnabled;
      }
    } catch {}
    return settings.paymentSettings?.upiEnabled ?? true;
  });

  const [activeCardEnabled, setActiveCardEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('admin_upi_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.cardEnabled === 'boolean') return parsed.cardEnabled;
      }
    } catch {}
    return settings.paymentSettings?.cardEnabled ?? true;
  });

  const [lastUpdatedIso, setLastUpdatedIso] = useState<string>(() => {
    return settings.paymentSettings?.lastUpdated || new Date().toISOString();
  });

  const lastUpdatedBy =
    settings.paymentSettings?.lastUpdatedBy || 'LUXUE Superadmin';

  // Form Edit State
  const [upiIdInput, setUpiIdInput] = useState(activeUpiId);
  const [merchantNameInput, setMerchantNameInput] = useState(activeMerchantName);
  const [isUpiEnabled, setIsUpiEnabled] = useState(activeUpiEnabled);
  const [isCardEnabled, setIsCardEnabled] = useState(activeCardEnabled);

  // Fetch directly from server database on mount
  useEffect(() => {
    const fetchLatestServerSettings = async () => {
      try {
        const res = await fetch(`/api/payment-config?t=${Date.now()}`, {
          headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' },
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.merchantUpiId !== undefined) {
            const upi = data.merchantUpiId || data.upiId || '';
            const name = data.merchantName || data.businessName || 'LUXUE FASHION ONLINE';
            setActiveUpiId(upi);
            setUpiIdInput(upi);
            setActiveMerchantName(name);
            setMerchantNameInput(name);
            if (typeof data.upiEnabled === 'boolean') {
              setActiveUpiEnabled(data.upiEnabled);
              setIsUpiEnabled(data.upiEnabled);
            }
            if (typeof data.cardEnabled === 'boolean') {
              setActiveCardEnabled(data.cardEnabled);
              setIsCardEnabled(data.cardEnabled);
            }
            if (data.lastUpdated) {
              setLastUpdatedIso(data.lastUpdated);
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load server payment settings:', err);
      }
    };

    fetchLatestServerSettings();
  }, []);

  // Sync when settings prop changes
  useEffect(() => {
    const currentUpi = settings.merchantUpiId || settings.paymentSettings?.merchantUpiId;
    if (currentUpi) {
      setActiveUpiId(currentUpi);
      setUpiIdInput(currentUpi);
    }
    const currentName = settings.merchantName || settings.paymentSettings?.merchantName;
    if (currentName) {
      setActiveMerchantName(currentName);
      setMerchantNameInput(currentName);
    }
    if (settings.paymentSettings?.upiEnabled !== undefined) {
      setActiveUpiEnabled(settings.paymentSettings.upiEnabled);
      setIsUpiEnabled(settings.paymentSettings.upiEnabled);
    }
    if (settings.paymentSettings?.cardEnabled !== undefined) {
      setActiveCardEnabled(settings.paymentSettings.cardEnabled);
      setIsCardEnabled(settings.paymentSettings.cardEnabled);
    }
    if (settings.paymentSettings?.lastUpdated) {
      setLastUpdatedIso(settings.paymentSettings.lastUpdated);
    }
  }, [settings]);

  // Validation State
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}$/;
  const isUpiValid = upiRegex.test(upiIdInput.trim());

  // Action State
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Test Tool State
  const [testAmount, setTestAmount] = useState('10');
  const [testQrDataUrl, setTestQrDataUrl] = useState<string | null>(null);
  const [copiedTestUpi, setCopiedTestUpi] = useState(false);
  const [copiedActiveUpi, setCopiedActiveUpi] = useState(false);

  // Format date in IST
  const formattedLastUpdated = (() => {
    try {
      return new Date(lastUpdatedIso).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return 'Recently';
    }
  })();

  // Generate Test QR
  useEffect(() => {
    const targetUpi = isUpiValid ? upiIdInput.trim() : activeUpiId;
    const targetName = merchantNameInput.trim() || activeMerchantName;
    const numAmount = parseFloat(testAmount) || 10;

    if (!targetUpi) {
      setTestQrDataUrl(null);
      return;
    }

    const params = new URLSearchParams({
      pa: targetUpi,
      pn: targetName,
      am: numAmount.toFixed(2),
      cu: 'INR',
      tn: 'Admin Test Payment LUXUE',
    });
    const payload = `upi://pay?${params.toString()}`;

    QRCode.toDataURL(payload, {
      width: 260,
      margin: 1.5,
      color: {
        dark: '#3B0C13',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then(url => setTestQrDataUrl(url))
      .catch(err => console.error('Test QR Generation error:', err));
  }, [upiIdInput, merchantNameInput, testAmount, isUpiValid, activeUpiId, activeMerchantName]);

  const handleCopyTestUpi = () => {
    const targetUpi = upiIdInput.trim() || activeUpiId;
    if (!targetUpi) return;
    navigator.clipboard?.writeText(targetUpi);
    setCopiedTestUpi(true);
    setTimeout(() => setCopiedTestUpi(false), 2000);
  };

  const handleCopyActiveUpi = () => {
    if (!activeUpiId) return;
    navigator.clipboard?.writeText(activeUpiId);
    setCopiedActiveUpi(true);
    setTimeout(() => setCopiedActiveUpi(false), 2000);
  };

  // Common UPI handle suggestions
  const upiSuggestions = [
    'testone@upi',
    'testtwo@upi',
    'store@icici',
    'merchant@okhdfcbank',
    'business@paytm',
  ];

  // Submit Handler
  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    // 1. Prevent default form submission and browser reloads
    e.preventDefault();
    setFeedbackMessage(null);

    const cleanUpi = upiIdInput.trim().toLowerCase();
    const cleanMerchant = merchantNameInput.trim() || 'LUXUE FASHION ONLINE';

    if (!cleanUpi) {
      setFeedbackMessage({ type: 'error', text: 'UPI ID cannot be empty.' });
      return;
    }

    // 2. VPA Format Validation
    if (!upiRegex.test(cleanUpi)) {
      setFeedbackMessage({
        type: 'error',
        text: 'Invalid UPI ID format. Please use a valid VPA handle (e.g., testone@upi, store@icici, mobile@paytm).',
      });
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('luxue_admin_token') || 'luxue-admin-jwt-token-2026';
      const result = await updatePaymentSettings({
        upiId: cleanUpi,
        merchantUpiId: cleanUpi,
        businessName: cleanMerchant,
        merchantName: cleanMerchant,
        upiEnabled: isUpiEnabled,
        cardEnabled: isCardEnabled,
      });

      if (!result.success) {
        setFeedbackMessage({
          type: 'error',
          text: result.message || 'Failed to save UPI settings. Please try again.',
        });
        return;
      }

      // 3. Database Read-Back Verification to ensure state is confirmed on server
      const verifyRes = await fetch(`/api/admin/payment-settings?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });

      if (!verifyRes.ok) {
        throw new Error('Could not verify database state.');
      }

      const verifyData = await verifyRes.json();
      const confirmedUpi = verifyData.paymentSettings?.upiId || verifyData.upiId || verifyData.merchantUpiId;

      if (confirmedUpi !== cleanUpi) {
        throw new Error(`Database verification mismatch. Server returned: ${confirmedUpi}`);
      }

      // Update active local state only after DB confirmation
      setActiveUpiId(cleanUpi);
      setUpiIdInput(cleanUpi);
      setActiveMerchantName(cleanMerchant);
      setMerchantNameInput(cleanMerchant);
      setActiveUpiEnabled(isUpiEnabled);
      setActiveCardEnabled(isCardEnabled);
      setLastUpdatedIso(new Date().toISOString());

      setFeedbackMessage({
        type: 'success',
        text: 'UPI Settings Saved Successfully',
      });
    } catch (err: any) {
      console.error('Save verification error:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Failed to save UPI settings. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Banner / Breadcrumb Header */}
      <div className="bg-[#2B090E] p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D4AF37]/20 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#3B0C13] border border-[#D4AF37] text-[#DFBA67] flex items-center justify-center shadow-md">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[#DFBA67] tracking-widest">
                  ADMIN CONSOLE → PAYMENT SETTINGS
                </span>
                <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                  REAL-TIME SYNC
                </span>
              </div>
              <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-white">
                UPI PAYMENT & GATEWAY MANAGEMENT
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="bg-[#1F060A] px-3 py-1.5 rounded-xl border border-[#D4AF37]/30 text-[#C2B2A3] flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#DFBA67]" />
              <span>
                Last Updated: <strong className="text-white">{formattedLastUpdated}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Informational Guidance */}
        <p className="text-xs text-[#C2B2A3] leading-relaxed">
          Configure the active merchant UPI ID, business receiver name, and gateway availability switches.
          Any changes saved here will <strong className="text-white">instantly propagate to customer checkout</strong> without requiring code modifications or server restarts.
        </p>

        {/* Live Active Configuration Badge Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-[#1F060A] p-3.5 rounded-xl border border-[#D4AF37]/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#A39283] uppercase font-bold block">
                ACTIVE UPI ID (CUSTOMER FACING)
              </span>
              <span className="font-mono text-sm font-bold text-[#DFBA67]">
                {activeUpiId}
              </span>
            </div>
            <button
              onClick={handleCopyActiveUpi}
              className="p-1.5 bg-[#2B090E] hover:bg-[#3B0C13] text-[#DFBA67] rounded-lg border border-[#D4AF37]/40 text-xs font-bold transition-all cursor-pointer"
              title="Copy active UPI ID"
            >
              {copiedActiveUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="bg-[#1F060A] p-3.5 rounded-xl border border-[#D4AF37]/30">
            <span className="text-[10px] text-[#A39283] uppercase font-bold block">
              UPI GATEWAY STATUS
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  activeUpiEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span
                className={`text-xs font-bold ${
                  activeUpiEnabled ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {activeUpiEnabled ? 'ONLINE & ACCEPTING PAYMENTS' : 'OFFLINE (DISABLED)'}
              </span>
            </div>
          </div>

          <div className="bg-[#1F060A] p-3.5 rounded-xl border border-[#D4AF37]/30">
            <span className="text-[10px] text-[#A39283] uppercase font-bold block">
              SECURITY & ACCESS
            </span>
            <span className="text-xs font-bold text-white flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#DFBA67]" />
              <span>Admin Protected • {lastUpdatedBy}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Settings Form (Left) & Test Payment Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSavePaymentSettings} className="bg-[#2B090E] p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-xl space-y-6">
            <div className="border-b border-[#D4AF37]/20 pb-3 flex items-center justify-between">
              <h3 className="font-serif-luxury text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#DFBA67]" />
                <span>UPI SETTINGS CONFIGURATION</span>
              </h3>
              <span className="text-[10px] text-[#A39283] font-mono">ENCRYPTED STORAGE</span>
            </div>

            {feedbackMessage && (
              <div
                className={`p-4 rounded-2xl border text-xs font-semibold flex items-start gap-2.5 ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500/50'
                    : 'bg-rose-950/80 text-rose-200 border-rose-500/50'
                }`}
              >
                {feedbackMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span className="leading-relaxed">{feedbackMessage.text}</span>
              </div>
            )}

            {/* Field 1: UPI ID */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#DFBA67] uppercase tracking-wider block">
                  MERCHANT UPI ID (VPA) <span className="text-rose-400">*</span>
                </label>
                {upiIdInput && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                      isUpiValid
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {isUpiValid ? (
                      <>
                        <Check className="w-3 h-3" /> Valid VPA Format
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" /> Invalid Format (needs @handle)
                      </>
                    )}
                  </span>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g. yourname@upi or store@icici"
                  value={upiIdInput}
                  onChange={e => setUpiIdInput(e.target.value.toLowerCase().trim())}
                  className="w-full bg-[#1F060A] text-white font-mono text-sm px-4 py-3.5 rounded-xl border border-[#D4AF37]/50 focus:outline-none focus:border-[#DFBA67] focus:ring-1 focus:ring-[#DFBA67] tracking-wider"
                />
              </div>

              <p className="text-[11px] text-[#C2B2A3]">
                Enter any valid Indian UPI ID / VPA. Example formats: <code className="text-[#DFBA67]">testone@upi</code>, <code className="text-[#DFBA67]">store@icici</code>, <code className="text-[#DFBA67]">merchant@paytm</code>.
              </p>

              {/* Suggestions Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-[#A39283] font-bold">Quick Handles:</span>
                {upiSuggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setUpiIdInput(sug)}
                    className="bg-[#1F060A] hover:bg-[#3B0C13] text-[#C2B2A3] hover:text-[#DFBA67] text-[10px] font-mono px-2 py-0.5 rounded border border-[#D4AF37]/20 transition-colors cursor-pointer"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 2: Business / Merchant Display Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#DFBA67] uppercase tracking-wider block">
                BUSINESS / BENEFICIARY NAME <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. LUXUE FASHION ONLINE"
                value={merchantNameInput}
                onChange={e => setMerchantNameInput(e.target.value)}
                className="w-full bg-[#1F060A] text-white text-sm px-4 py-3.5 rounded-xl border border-[#D4AF37]/50 focus:outline-none focus:border-[#DFBA67]"
              />
              <p className="text-[11px] text-[#C2B2A3]">
                This registered business name appears to customers in Google Pay, PhonePe, and Paytm transaction intent popups.
              </p>
            </div>

            {/* Switches: Payment Status & Card Support */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-[#DFBA67] uppercase tracking-wider block">
                GATEWAY AVAILABILITY CONTROLS
              </span>

              {/* UPI ON/OFF Switch */}
              <div className="bg-[#1F060A] p-4 rounded-2xl border border-[#D4AF37]/40 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      UPI Payment Gateway (QR & App Intent)
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        isUpiEnabled
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {isUpiEnabled ? 'STATUS: ON' : 'STATUS: OFF'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A39283] mt-0.5">
                    When enabled, customers can scan dynamic QR codes or tap to launch UPI apps directly.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isUpiEnabled}
                    onChange={e => setIsUpiEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 border border-neutral-700" />
                </label>
              </div>

              {/* Card ON/OFF Switch */}
              <div className="bg-[#1F060A] p-4 rounded-2xl border border-[#D4AF37]/40 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      Credit / Debit Card Checkout Gateway
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        isCardEnabled
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {isCardEnabled ? 'STATUS: ON' : 'STATUS: OFF'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A39283] mt-0.5">
                    Visa, MasterCard, RuPay card payments with secure 3D verification.
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isCardEnabled}
                    onChange={e => setIsCardEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 border border-neutral-700" />
                </label>
              </div>

              {/* Permanent COD Lock Notice */}
              <div className="bg-[#1F060A] p-4 rounded-2xl border border-rose-500/30 flex items-start gap-3">
                <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-rose-300">
                      Cash on Delivery (COD): PERMANENTLY LOCKED
                    </span>
                    <span className="bg-rose-950 text-rose-300 text-[9px] font-bold px-2 py-0.2 rounded border border-rose-500/40">
                      PREPAID ONLY
                    </span>
                  </div>
                  <p className="text-[10px] text-[#C2B2A3] mt-0.5">
                    COD is locked across all storefront orders to ensure 100% verified genuine prepaid shipments for luxury handcrafted kurtis.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#D4AF37]/20">
              <button
                type="submit"
                disabled={isSaving || !isUpiValid}
                className="bg-gradient-to-r from-[#DFBA67] to-[#C89D35] hover:from-[#E8C776] hover:to-[#D4AF37] text-[#1F060A] font-extrabold text-xs px-6 py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>SAVING SETTINGS...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>SAVE PAYMENT CHANGES</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setUpiIdInput(activeUpiId);
                  setMerchantNameInput(activeMerchantName);
                  setIsUpiEnabled(activeUpiEnabled);
                  setIsCardEnabled(activeCardEnabled);
                  setFeedbackMessage(null);
                }}
                className="bg-[#1F060A] hover:bg-[#3B0C13] text-[#C2B2A3] hover:text-white text-xs font-bold px-4 py-3.5 rounded-xl border border-[#D4AF37]/30 transition-colors cursor-pointer"
              >
                Reset to Current
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Live Interactive Test Payment Preview (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#2B090E] p-6 rounded-3xl border-2 border-[#D4AF37]/50 shadow-2xl space-y-5">
            <div className="border-b border-[#D4AF37]/20 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#DFBA67]" />
                <h3 className="font-serif-luxury text-base font-bold text-white">
                  LIVE PAYMENT SIMULATOR
                </h3>
              </div>
              <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                LIVE PREVIEW
              </span>
            </div>

            <p className="text-xs text-[#C2B2A3]">
              Verify how your configured UPI ID and QR code render on customer mobile screens in real time.
            </p>

            {/* Test Amount Input */}
            <div className="bg-[#1F060A] p-3.5 rounded-xl border border-[#D4AF37]/30 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-[#DFBA67] uppercase font-bold block">
                  TEST TRANSACTION AMOUNT (₹)
                </span>
                <span className="text-[11px] text-[#A39283]">
                  Simulate QR with custom amount
                </span>
              </div>
              <div className="flex items-center gap-1 bg-[#2B090E] px-3 py-1.5 rounded-lg border border-[#D4AF37]/40">
                <span className="text-xs font-bold text-[#DFBA67]">₹</span>
                <input
                  type="number"
                  min="1"
                  max="50000"
                  value={testAmount}
                  onChange={e => setTestAmount(e.target.value)}
                  className="w-20 bg-transparent text-white font-bold text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Live QR Display Box */}
            <div className="bg-[#1F060A] p-5 rounded-2xl border border-[#D4AF37]/40 text-center space-y-3">
              <div className="p-3 bg-white rounded-2xl border border-[#EAE3D2] inline-block shadow-lg">
                {testQrDataUrl ? (
                  <img
                    src={testQrDataUrl}
                    alt="Test UPI QR Code"
                    className="w-44 h-44 mx-auto object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">
                    Generating test QR...
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] text-[#A39283] uppercase font-bold block">
                  SIMULATED PAYABLE TOTAL
                </span>
                <span className="font-serif-luxury text-xl font-black text-[#DFBA67]">
                  ₹{parseFloat(testAmount || '10').toLocaleString('en-IN')}
                </span>
              </div>

              {/* Simulated Customer UPI ID Copy Strip */}
              <div className="bg-[#2B090E] p-2.5 rounded-xl border border-[#D4AF37]/30 flex items-center justify-between text-left">
                <div className="truncate mr-2">
                  <span className="text-[9px] text-[#A39283] uppercase font-bold block">
                    DESTINATION UPI ID
                  </span>
                  <span className="font-mono text-xs font-bold text-white truncate block">
                    {upiIdInput.trim() || activeUpiId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyTestUpi}
                  className="bg-[#1F060A] hover:bg-[#3B0C13] text-[#DFBA67] px-2.5 py-1 rounded-lg border border-[#D4AF37]/30 text-[10px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  {copiedTestUpi ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Test Deep Link Launcher */}
              <a
                href={`upi://pay?pa=${encodeURIComponent(upiIdInput.trim() || activeUpiId)}&pn=${encodeURIComponent(merchantNameInput.trim() || activeMerchantName)}&am=${(parseFloat(testAmount) || 10).toFixed(2)}&cu=INR&tn=AdminTestPayment`}
                className="w-full bg-[#3B0C13] hover:bg-[#4A0E17] text-[#DFBA67] font-bold text-xs py-2.5 px-3 rounded-xl border border-[#D4AF37]/40 flex items-center justify-center gap-1.5 transition-colors block"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>TEST OPEN IN INSTALLED UPI APP</span>
              </a>
            </div>

            {/* Safety & Verification Workflow Protocol */}
            <div className="bg-[#1F060A] p-4 rounded-xl border border-[#D4AF37]/30 space-y-2 text-[11px] text-[#C2B2A3]">
              <div className="flex items-center gap-1.5 font-bold text-[#DFBA67]">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Bank Reconciliation Protocol:</span>
              </div>
              <p>
                1. Customers submit their 12-digit UTR/Reference ID upon completing app payment or QR scan.
              </p>
              <p>
                2. Submissions enter <strong className="text-amber-300">Payment Verification Pending</strong> state.
              </p>
              <p>
                3. Admin verifies credit in merchant bank statement & clicks <strong className="text-emerald-300">Approve</strong> inside Admin Orders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
