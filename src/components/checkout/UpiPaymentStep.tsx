import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import {
  Copy,
  Check,
  Clock,
  ShieldCheck,
  Upload,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  Lock,
  Sparkles,
  Smartphone,
  QrCode,
  ExternalLink,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Order } from '../../types';
import { useShop } from '../../context/ShopContext';

interface UpiPaymentStepProps {
  order: Order;
  onBack: () => void;
  onSuccess: (order: Order) => void;
}

type UpiSubOption = 'app' | 'qr';
type VerificationState = 'idle' | 'app_launched' | 'verifying' | 'pending' | 'success' | 'failed';

interface UpiAppItem {
  id: string;
  name: string;
  shortName: string;
  colorBg: string;
  textColor: string;
  borderColor: string;
  badgeColor: string;
  tag: string;
  iconType: 'phonepe' | 'gpay' | 'paytm' | 'bhim' | 'other';
  intentPrefix?: string;
  packageScheme?: string;
}

const UPI_APPS: UpiAppItem[] = [
  {
    id: 'phonepe',
    name: 'PhonePe UPI',
    shortName: 'PhonePe',
    colorBg: 'bg-[#5f259f]',
    textColor: 'text-white',
    borderColor: 'border-[#5f259f]',
    badgeColor: 'bg-purple-900/40 text-purple-200',
    tag: '🟣 Popular & Fast',
    iconType: 'phonepe',
    intentPrefix: 'phonepe://pay',
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    shortName: 'Google Pay',
    colorBg: 'bg-[#1a73e8]',
    textColor: 'text-white',
    borderColor: 'border-[#1a73e8]',
    badgeColor: 'bg-blue-900/40 text-blue-200',
    tag: '🔵 Instant Bank Pay',
    iconType: 'gpay',
    intentPrefix: 'tez://upi/pay',
  },
  {
    id: 'paytm',
    name: 'Paytm UPI',
    shortName: 'Paytm',
    colorBg: 'bg-[#002e6e]',
    textColor: 'text-white',
    borderColor: 'border-[#00b9f5]',
    badgeColor: 'bg-cyan-900/40 text-cyan-200',
    tag: '🔵 Paytm Wallet & UPI',
    iconType: 'paytm',
    intentPrefix: 'paytmmp://pay',
  },
  {
    id: 'bhim',
    name: 'BHIM UPI',
    shortName: 'BHIM',
    colorBg: 'bg-[#00875a]',
    textColor: 'text-white',
    borderColor: 'border-[#00875a]',
    badgeColor: 'bg-emerald-900/40 text-emerald-200',
    tag: '🟢 Govt NPCI Official',
    iconType: 'bhim',
    intentPrefix: 'bhim://pay',
  },
  {
    id: 'other',
    name: 'Other UPI Apps',
    shortName: 'Any UPI App',
    colorBg: 'bg-[#3B0C13]',
    textColor: 'text-[#DFBA67]',
    borderColor: 'border-[#D4AF37]',
    badgeColor: 'bg-[#2B090E] text-[#DFBA67]',
    tag: '🟢 Cred, Amazon Pay, etc.',
    iconType: 'other',
    intentPrefix: 'upi://pay',
  },
];

export const UpiPaymentStep: React.FC<UpiPaymentStepProps> = ({ order, onBack, onSuccess }) => {
  const { settings, submitPaymentProof } = useShop();

  // Active sub-option: 'app' (PAY WITH UPI APP) or 'qr' (SCAN QR CODE)
  const [activeSubOption, setActiveSubOption] = useState<UpiSubOption>('app');

  // 5-second preparation loader for QR Code
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [hasLoadedQRInitially, setHasLoadedQRInitially] = useState(false);

  // QR Code canvas / data URL
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // 10-minute timer tied to session creation timestamp (persists across page refresh)
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(() => {
    try {
      const stored = sessionStorage.getItem(`luxue_timer_${order.id}`);
      if (stored) {
        const expiresAt = parseInt(stored, 10);
        const diff = Math.floor((expiresAt - Date.now()) / 1000);
        return diff > 0 ? diff : 0;
      }
    } catch {
      // Fallback
    }
    const expires = Date.now() + 10 * 60 * 1000;
    try {
      sessionStorage.setItem(`luxue_timer_${order.id}`, expires.toString());
    } catch {
      // Ignore
    }
    return 600; // 10 minutes (09:59)
  });

  const [copiedUpi, setCopiedUpi] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [screenshotName, setScreenshotName] = useState('');
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [proofError, setProofError] = useState<string | null>(null);

  // App Payment States
  const [selectedApp, setSelectedApp] = useState<UpiAppItem | null>(null);
  const [appUnavailableError, setAppUnavailableError] = useState<string | null>(null);
  const [verificationState, setVerificationState] = useState<VerificationState>('idle');
  const [verificationMessage, setVerificationMessage] = useState<string>('');
  const [isPollingStatus, setIsPollingStatus] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const merchantUpiId = settings.merchantUpiId || settings.paymentSettings?.merchantUpiId || 'luxuefashion@icici';
  const merchantName = settings.merchantName || settings.paymentSettings?.merchantName || 'LUXUE FASHION ONLINE';
  const exactAmount = order.totalAmount;
  const paymentReference = `LUX_${order.id}`;

  // Format Timer as MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Build standard UPI intent payload URL
  const buildUpiPayload = useCallback(
    (customPrefix?: string) => {
      const prefix = customPrefix || 'upi://pay';
      const params = new URLSearchParams({
        pa: merchantUpiId,
        pn: merchantName,
        am: exactAmount.toFixed(2),
        cu: 'INR',
        tr: order.id,
        tn: `Order ${order.id} LUXUE Fashion`,
      });
      return `${prefix}?${params.toString()}`;
    },
    [merchantUpiId, merchantName, exactAmount, order.id]
  );

  // Generate QR Code data URL dynamically
  useEffect(() => {
    const payload = buildUpiPayload('upi://pay');
    QRCode.toDataURL(payload, {
      width: 320,
      margin: 1.5,
      color: {
        dark: '#3B0C13',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('QR Generation error:', err));
  }, [buildUpiPayload]);

  // Handle switching to QR Code tab with 5-second premium loader
  const handleSelectQrOption = () => {
    setActiveSubOption('qr');
    setAppUnavailableError(null);

    if (!hasLoadedQRInitially) {
      setIsGeneratingQR(true);
      setGenerationProgress(0);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 2;
        setGenerationProgress(Math.min(100, progress));
        if (progress >= 100) {
          clearInterval(interval);
          setIsGeneratingQR(false);
          setHasLoadedQRInitially(true);
        }
      }, 100); // 50 steps * 100ms = 5000ms (5.0s)
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeftSeconds]);

  // Check Backend Payment Status Helper
  const checkBackendPaymentStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${order.id}`);
      if (res.ok) {
        const latestOrder: Order = await res.json();
        if (latestOrder.paymentStatus === 'Paid') {
          setVerificationState('success');
          setVerificationMessage('✓ PAYMENT SUCCESSFUL');
          setTimeout(() => {
            onSuccess(latestOrder);
          }, 1200);
          return true;
        } else if (latestOrder.paymentStatus === 'Payment Failed') {
          setVerificationState('failed');
          setVerificationMessage('Payment failed. Please try again.');
          return false;
        } else if (
          latestOrder.paymentStatus === 'Payment Processing' ||
          latestOrder.paymentVerification?.status === 'pending'
        ) {
          setVerificationState('pending');
          setVerificationMessage('Payment verification pending');
        }
      }
    } catch (err) {
      console.error('Status check error:', err);
    }
    return false;
  }, [order.id, onSuccess]);

  // Poll backend verification after app launch
  const triggerPaymentVerificationFlow = useCallback(async () => {
    setVerificationState('verifying');
    setVerificationMessage('Verifying your payment with bank gateway...');
    setIsPollingStatus(true);

    // Initial check
    const isPaid = await checkBackendPaymentStatus();
    if (isPaid) {
      setIsPollingStatus(false);
      return;
    }

    // Poll 3 times at 3-second intervals
    let attempts = 0;
    const maxAttempts = 3;

    const pollInterval = setInterval(async () => {
      attempts += 1;
      const verified = await checkBackendPaymentStatus();
      if (verified || attempts >= maxAttempts) {
        clearInterval(pollInterval);
        setIsPollingStatus(false);
        if (!verified) {
          setVerificationState('pending');
          setVerificationMessage(
            'Payment verification pending — please confirm your 12-digit UPI UTR below if payment was completed in your app.'
          );
        }
      }
    }, 3000);
  }, [checkBackendPaymentStatus]);

  // Launch UPI App via Deep-Link
  const handleLaunchUpiApp = (app: UpiAppItem) => {
    setSelectedApp(app);
    setAppUnavailableError(null);
    setProofError(null);

    // Check if session is expired
    if (timeLeftSeconds <= 0) {
      setProofError('Payment session has expired. Please generate a new session.');
      return;
    }

    const specificUri = buildUpiPayload(app.intentPrefix);
    const genericUpiUri = buildUpiPayload('upi://pay');

    const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (!isMobileDevice) {
      // On desktop, deep links may not be handled by OS
      setAppUnavailableError(
        `${app.name} is designed for mobile devices. You can scan the QR code below on your phone or use another UPI method.`
      );
      setVerificationState('idle');
      return;
    }

    // On mobile, attempt deep link
    setVerificationState('app_launched');
    setVerificationMessage(`Opening ${app.name}... Please complete payment of ₹${exactAmount.toLocaleString('en-IN')}.`);

    let didSwitchAway = false;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        didSwitchAway = true;
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Attempt primary app deep-link
    window.location.href = specificUri;

    // Timeout check: if after 2.2 seconds the user hasn't left the page, the app might not be installed
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (!didSwitchAway && document.visibilityState === 'visible') {
        // Fallback attempt with generic upi:// uri
        if (app.id !== 'other') {
          window.location.href = genericUpiUri;
        }

        setTimeout(() => {
          if (!didSwitchAway && document.visibilityState === 'visible') {
            setAppUnavailableError(
              `App not available on this device: ${app.name} could not be opened automatically.`
            );
            setVerificationState('idle');
          }
        }, 1200);
      }
    }, 2200);
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(merchantUpiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleGenerateNewQR = () => {
    const newExpires = Date.now() + 10 * 60 * 1000;
    sessionStorage.setItem(`luxue_timer_${order.id}`, newExpires.toString());
    setTimeLeftSeconds(600);
    setHasLoadedQRInitially(false);
    handleSelectQrOption();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProofError('Image size exceeds 5MB limit');
      return;
    }

    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onload = async event => {
      const base64 = event.target?.result as string;
      setScreenshotUrl(base64);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, fileName: file.name }),
        });
        if (res.ok) {
          const data = await res.json();
          setScreenshotUrl(data.url);
        }
      } catch (err) {
        console.error('Screenshot upload error:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit UTR Proof
  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    setProofError(null);

    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setProofError('Please enter a valid 12-digit UPI UTR or Transaction Reference ID');
      return;
    }

    setIsSubmittingProof(true);
    const result = await submitPaymentProof(order.id, cleanUtr, screenshotUrl);
    setIsSubmittingProof(false);

    if (result.success && result.order) {
      setVerificationState('pending');
      onSuccess(result.order);
    } else {
      setProofError(result.message || 'Payment verification failed to submit');
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE3D2] shadow-sm space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#EAE3D2] pb-4 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-[#FAF6EE] text-[#4A0E17] hover:bg-[#F2EADB] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Change Payment Method"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#3B0C13]">
              UPI INSTANT CHECKOUT
            </h2>
            <p className="text-xs text-[#7A695C]">
              Order #{order.id} • Verified Merchant Payment
            </p>
          </div>
        </div>

        {/* 10-Min Live Countdown Timer */}
        <div
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-mono font-bold shrink-0 ${
            timeLeftSeconds > 120
              ? 'bg-[#FAF6EE] text-[#4A0E17] border-[#D4AF37]/50'
              : 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{formatTimer(timeLeftSeconds)}</span>
        </div>
      </div>

      {/* Amount Callout Strip */}
      <div className="bg-[#FAF6EE] p-4 rounded-2xl border border-[#D4AF37]/40 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#801723] block">
            VERIFIED ORDER TOTAL
          </span>
          <span className="font-serif-luxury text-2xl font-black text-[#4A0E17]">
            ₹{exactAmount.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[#7A695C] uppercase font-bold block">
            MERCHANT VPA
          </span>
          <span className="font-mono text-xs font-bold text-[#3B0C13]">
            {merchantUpiId}
          </span>
        </div>
      </div>

      {/* Two-Option Tabs: A) PAY WITH UPI APP vs B) SCAN QR CODE */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#FAF8F5] rounded-2xl border border-[#EAE3D2]">
        <button
          type="button"
          onClick={() => {
            setActiveSubOption('app');
            setAppUnavailableError(null);
          }}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubOption === 'app'
              ? 'bg-[#4A0E17] text-[#DFBA67] border border-[#D4AF37] shadow-md'
              : 'bg-transparent text-[#5A4D41] hover:bg-white/60'
          }`}
        >
          <Smartphone className="w-4 h-4 shrink-0" />
          <span className="truncate">A) PAY WITH UPI APP</span>
        </button>

        <button
          type="button"
          onClick={handleSelectQrOption}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubOption === 'qr'
              ? 'bg-[#4A0E17] text-[#DFBA67] border border-[#D4AF37] shadow-md'
              : 'bg-transparent text-[#5A4D41] hover:bg-white/60'
          }`}
        >
          <QrCode className="w-4 h-4 shrink-0" />
          <span className="truncate">B) SCAN QR CODE</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* OPTION A: PAY WITH UPI APP */}
      {/* ========================================================================= */}
      {activeSubOption === 'app' && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif-luxury text-base font-bold text-[#3B0C13] flex items-center gap-2">
              <span>Select Your Installed UPI App</span>
            </h3>
            <p className="text-xs text-[#7A695C]">
              Tap any app button below to launch dynamic checkout for exactly ₹{exactAmount.toLocaleString('en-IN')}.
            </p>
          </div>

          {/* App Unavailable Warning Banner */}
          {appUnavailableError && (
            <div className="p-4 bg-amber-50/90 border-2 border-amber-300 rounded-2xl space-y-3">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-amber-950">App not available on this device</h4>
                  <p className="text-xs text-amber-800 mt-0.5">{appUnavailableError}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setAppUnavailableError(null);
                    setSelectedApp(null);
                  }}
                  className="bg-[#3B0C13] text-[#DFBA67] font-bold text-xs px-3.5 py-2 rounded-xl border border-[#D4AF37] cursor-pointer hover:bg-[#4A0E17] transition-all"
                >
                  Choose another UPI app
                </button>
                <button
                  type="button"
                  onClick={handleSelectQrOption}
                  className="bg-white text-[#3B0C13] font-bold text-xs px-3.5 py-2 rounded-xl border border-amber-400 cursor-pointer hover:bg-amber-100 transition-all flex items-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan QR Code instead</span>
                </button>
              </div>
            </div>
          )}

          {/* UPI App Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {UPI_APPS.map(app => (
              <button
                key={app.id}
                type="button"
                onClick={() => handleLaunchUpiApp(app)}
                className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer relative overflow-hidden group hover:scale-[1.01] shadow-xs ${
                  selectedApp?.id === app.id
                    ? 'border-[#4A0E17] bg-[#FAF6EE] ring-2 ring-[#4A0E17]/20'
                    : 'border-[#EAE3D2] bg-white hover:border-[#D4AF37]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* App Icon Representation */}
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-xs font-bold text-sm shrink-0 ${app.colorBg} ${app.textColor}`}
                    >
                      {app.iconType === 'phonepe' && <span>Pe</span>}
                      {app.iconType === 'gpay' && <span>G</span>}
                      {app.iconType === 'paytm' && <span>Pay</span>}
                      {app.iconType === 'bhim' && <span>BHIM</span>}
                      {app.iconType === 'other' && <Smartphone className="w-5 h-5 text-[#DFBA67]" />}
                    </div>

                    <div>
                      <span className="font-serif-luxury font-bold text-sm text-[#3B0C13] block">
                        {app.name}
                      </span>
                      <span className="text-[11px] text-[#7A695C]">{app.tag}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-[#801723] group-hover:translate-x-1 transition-transform">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#EAE3D2]/70 flex items-center justify-between text-[11px]">
                  <span className="text-[#8C7A6B]">Payable Amount:</span>
                  <span className="font-bold text-[#4A0E17]">₹{exactAmount.toLocaleString('en-IN')}</span>
                </div>
              </button>
            ))}
          </div>

          {/* App Launched / Verification In Progress Card */}
          {verificationState === 'app_launched' && (
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border-2 border-[#D4AF37]/50 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-[#FAF6EE] border-2 border-[#D4AF37] flex items-center justify-center mx-auto text-[#4A0E17]">
                <Smartphone className="w-6 h-6 text-[#801723] animate-bounce" />
              </div>

              <div>
                <h4 className="font-serif-luxury text-base font-bold text-[#3B0C13]">
                  {verificationMessage}
                </h4>
                <p className="text-xs text-[#7A695C] mt-1 max-w-md mx-auto">
                  Once you approve the payment in your UPI app, click below to verify your order confirmation.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={triggerPaymentVerificationFlow}
                  className="bg-[#4A0E17] hover:bg-[#62121E] text-[#DFBA67] font-bold text-xs px-6 py-3.5 rounded-xl border border-[#D4AF37] shadow-md flex items-center gap-2 cursor-pointer transition-all uppercase tracking-wider"
                >
                  <Check className="w-4 h-4" />
                  <span>I HAVE COMPLETED PAYMENT IN APP</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setVerificationState('idle');
                    setSelectedApp(null);
                  }}
                  className="bg-white text-[#5A4D41] hover:bg-[#FAF6EE] text-xs font-semibold px-4 py-3 rounded-xl border border-[#EAE3D2] transition-colors cursor-pointer"
                >
                  Change App
                </button>
              </div>
            </div>
          )}

          {/* Verification Status Banner */}
          {verificationState === 'verifying' && (
            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-300 text-center space-y-3">
              <Loader2 className="w-7 h-7 text-amber-700 animate-spin mx-auto" />
              <div>
                <h4 className="font-bold text-sm text-amber-950">Verifying your payment...</h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Confirming transaction status with the payment gateway. Please do not close this window.
                </p>
              </div>
            </div>
          )}

          {verificationState === 'success' && (
            <div className="bg-emerald-50 p-5 rounded-2xl border-2 border-emerald-400 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="font-serif-luxury text-lg font-bold text-emerald-950">✓ PAYMENT SUCCESSFUL</h4>
              <p className="text-xs text-emerald-800">Your order is confirmed and transitioning to the success page...</p>
            </div>
          )}

          {verificationState === 'failed' && (
            <div className="bg-rose-50 p-5 rounded-2xl border border-rose-300 text-center space-y-3">
              <XCircle className="w-7 h-7 text-rose-600 mx-auto" />
              <div>
                <h4 className="font-bold text-sm text-rose-950">Payment failed. Please try again.</h4>
                <p className="text-xs text-rose-800 mt-0.5">The transaction could not be completed in your app.</p>
              </div>
              <button
                type="button"
                onClick={() => setVerificationState('idle')}
                className="bg-[#4A0E17] text-[#DFBA67] font-bold text-xs px-5 py-2.5 rounded-xl border border-[#D4AF37] cursor-pointer"
              >
                TRY AGAIN
              </button>
            </div>
          )}

          {/* UTR Fallback Submission for Direct App Payment */}
          <div className="bg-[#FFFDF9] p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/40 space-y-4">
            <div className="border-b border-[#EAE3D2] pb-2">
              <span className="text-[10px] uppercase font-bold text-[#801723] tracking-wider block">
                MANUAL RECONCILIATION
              </span>
              <h4 className="font-serif-luxury text-sm font-bold text-[#3B0C13]">
                Already Paid via UPI App? Enter 12-Digit Reference
              </h4>
              <p className="text-[11px] text-[#7A695C]">
                If your app does not redirect automatically, enter the 12-digit UTR from your receipt.
              </p>
            </div>

            <form onSubmit={handleSubmitProof} className="space-y-3">
              {proofError && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{proofError}</span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-[#3B0C13] block mb-1">
                  12-DIGIT UPI UTR / TRANSACTION ID <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={24}
                  placeholder="e.g. 423589102456"
                  value={utrNumber}
                  onChange={e => setUtrNumber(e.target.value.toUpperCase())}
                  className="w-full bg-white font-mono text-xs px-4 py-3 rounded-xl border border-[#D4AF37]/60 text-[#2D2622] font-bold tracking-wider placeholder:font-sans placeholder:tracking-normal placeholder:text-[#A8988B] focus:outline-none focus:border-[#4A0E17]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingProof}
                className="w-full bg-[#4A0E17] hover:bg-[#62121E] text-[#DFBA67] font-bold text-xs py-3 px-4 rounded-xl border border-[#D4AF37] shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider disabled:opacity-75"
              >
                {isSubmittingProof ? (
                  <span>VERIFYING WITH BACKEND GATEWAY...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>CONFIRM PAYMENT WITH UTR →</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OPTION B: SCAN QR CODE */}
      {/* ========================================================================= */}
      {activeSubOption === 'qr' && (
        <div className="space-y-6">
          {/* 5-second Luxury Loading State */}
          {isGeneratingQR ? (
            <div className="bg-[#FAF8F5] p-8 sm:p-12 rounded-3xl border border-[#D4AF37]/40 text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#FAF6EE] border-2 border-[#D4AF37] flex items-center justify-center mx-auto text-[#4A0E17] animate-pulse shadow-md">
                <Sparkles className="w-8 h-8 text-[#DFBA67] animate-spin" />
              </div>

              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#801723]">
                  LUXURY ENCRYPTED GATEWAY
                </span>
                <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold text-[#3B0C13] mt-1">
                  Preparing secure payment...
                </h3>
                <p className="text-xs text-[#7A695C] mt-2 max-w-sm mx-auto">
                  Generating your payment QR...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="max-w-xs mx-auto space-y-2">
                <div className="h-2.5 w-full bg-white rounded-full overflow-hidden border border-[#EAE3D2]">
                  <div
                    className="h-full bg-gradient-to-r from-[#801723] via-[#4A0E17] to-[#DFBA67] transition-all duration-100 ease-out"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
                <p className="text-[10px] font-bold text-[#8C7A6B]">
                  Configuring dynamic QR with exact order total... {generationProgress}%
                </p>
              </div>
            </div>
          ) : timeLeftSeconds === 0 ? (
            /* Expired Session State */
            <div className="p-8 text-center bg-rose-50/70 rounded-2xl border-2 border-rose-300 space-y-4">
              <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-rose-950">
                  Payment session expired
                </h3>
                <p className="text-xs text-rose-700 mt-1 max-w-md mx-auto">
                  For security and real-time reconciliation, this dynamic QR code session has expired.
                </p>
              </div>
              <button
                onClick={handleGenerateNewQR}
                className="bg-[#4A0E17] text-[#DFBA67] font-bold text-xs px-6 py-3.5 rounded-xl border border-[#D4AF37] shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer hover:bg-[#62121E] transition-all uppercase tracking-wider"
              >
                <RefreshCw className="w-4 h-4" />
                <span>GENERATE NEW QR</span>
              </button>
            </div>
          ) : (
            /* Active Dynamic QR State */
            <div className="space-y-6">
              {/* QR Code Container */}
              <div className="bg-[#FAF8F5] p-6 rounded-2xl border-2 border-[#D4AF37]/50 text-center space-y-4 max-w-sm mx-auto shadow-inner">
                <div className="flex items-center justify-between px-2 text-[10px] font-extrabold uppercase tracking-wider text-[#801723]">
                  <span>OFFICIAL MERCHANT QR</span>
                  <span className="flex items-center gap-1 text-emerald-800 font-bold">
                    <Lock className="w-3 h-3" /> 256-BIT SECURE
                  </span>
                </div>

                {/* QR Image Box */}
                <div className="p-3.5 bg-white rounded-2xl border border-[#EAE3D2] shadow-md inline-block">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="UPI Dynamic Payment QR Code"
                      className="w-48 h-48 sm:w-56 sm:h-56 mx-auto object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 sm:w-56 sm:h-56 bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">
                      Generating QR...
                    </div>
                  )}
                </div>

                {/* Amount Callout */}
                <div className="bg-white py-2.5 px-4 rounded-xl border border-[#D4AF37]/60 shadow-xs">
                  <span className="text-[10px] text-[#7A695C] uppercase font-bold block">
                    PAY EXACTLY
                  </span>
                  <span className="font-serif-luxury text-2xl font-black text-[#4A0E17]">
                    ₹{exactAmount.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Merchant UPI ID Box with Tap to Copy */}
                <div className="bg-white p-3 rounded-xl border border-[#EAE3D2] flex items-center justify-between text-left">
                  <div>
                    <span className="text-[9px] font-bold text-[#8C7A6B] uppercase block">
                      MERCHANT UPI ID
                    </span>
                    <span className="font-mono text-xs font-bold text-[#3B0C13]">
                      UPI ID: {merchantUpiId}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="bg-[#FAF6EE] hover:bg-[#F2EADB] text-[#4A0E17] px-3 py-1.5 rounded-lg border border-[#D4AF37]/40 flex items-center gap-1 text-[11px] font-bold transition-all cursor-pointer"
                    title="Tap to copy UPI ID"
                  >
                    {copiedUpi ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-700" />
                        <span className="text-emerald-800">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-[#4A0E17]" />
                        <span>Tap to copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Supported Apps List */}
                <p className="text-[10px] text-[#8C7A6B] font-medium">
                  Scan with PhonePe • Google Pay • Paytm • BHIM • Cred • Any App
                </p>
              </div>

              {/* Verification & UTR Submission Box */}
              <form
                onSubmit={handleSubmitProof}
                className="bg-[#FFFDF9] p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/50 shadow-xs space-y-4"
              >
                <div className="border-b border-[#EAE3D2] pb-2">
                  <h3 className="font-serif-luxury text-base font-bold text-[#3B0C13]">
                    HAVE YOU SCANNED & COMPLETED THE PAYMENT?
                  </h3>
                  <p className="text-xs text-[#7A695C]">
                    Enter your 12-digit UPI UTR / Transaction Reference ID below for instant validation.
                  </p>
                </div>

                {proofError && (
                  <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{proofError}</span>
                  </div>
                )}

                {/* UTR Input */}
                <div>
                  <label className="text-xs font-bold text-[#3B0C13] block mb-1">
                    UPI UTR / TRANSACTION ID <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={24}
                    placeholder="e.g. 423589102456"
                    value={utrNumber}
                    onChange={e => setUtrNumber(e.target.value.toUpperCase())}
                    className="w-full bg-white font-mono text-xs px-4 py-3 rounded-xl border border-[#D4AF37]/60 text-[#2D2622] font-bold tracking-wider placeholder:font-sans placeholder:tracking-normal placeholder:text-[#A8988B] focus:outline-none focus:border-[#4A0E17] focus:ring-1 focus:ring-[#4A0E17]"
                  />
                  <p className="text-[10px] text-[#8C7A6B] mt-1">
                    Find this 12-digit number in your Google Pay, PhonePe, or Paytm receipt.
                  </p>
                </div>

                {/* Screenshot Upload (Optional) */}
                <div>
                  <label className="text-xs font-bold text-[#3B0C13] block mb-1">
                    PAYMENT SCREENSHOT <span className="text-[#8C7A6B] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 bg-white rounded-xl border border-dashed border-[#C4B4A5] hover:border-[#4A0E17] flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 text-xs text-[#5A4D41]">
                      <Upload className="w-4 h-4 text-[#801723]" />
                      <span className="truncate max-w-[220px]">
                        {screenshotName || 'Click to upload payment screenshot'}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#801723] uppercase bg-[#FAF6EE] px-2 py-1 rounded">
                      Browse
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmittingProof}
                  className="w-full bg-[#4A0E17] hover:bg-[#62121E] text-[#DFBA67] font-bold text-xs py-4 px-6 rounded-xl border border-[#D4AF37] shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider disabled:opacity-75"
                >
                  {isSubmittingProof ? (
                    <span>SUBMITTING FOR VERIFICATION...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>SUBMIT PAYMENT DETAILS →</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#7A695C]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Payments are strictly verified by LUXUE official accounts before dispatch.</span>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
