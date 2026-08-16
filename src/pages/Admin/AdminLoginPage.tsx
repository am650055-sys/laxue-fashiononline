import React, { useState } from 'react';
import { Crown, Lock, User, ShieldCheck, AlertCircle, KeyRound, Info, CheckCircle2, Sparkles } from 'lucide-react';

interface AdminLoginPageProps {
  onLoginSuccess: (token: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@luxue.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    // 1. Input Sanitization
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Invalid email or password');
      setIsLoading(false);
      return;
    }

    const defaultAdminToken = 'luxue-admin-jwt-token-2026';

    // 2. Direct Static / Client-Side Credentials Check
    if ((cleanEmail === 'admin@luxue.com' || cleanEmail === 'admin') && cleanPassword === 'admin123') {
      // 3. Success Action: Store authentication state in localStorage and sessionStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('luxue_admin_token', defaultAdminToken);
      sessionStorage.setItem(
        'luxue_admin_session',
        JSON.stringify({
          email: cleanEmail,
          role: 'admin',
          authenticated: true,
          loginTime: new Date().toISOString(),
        })
      );

      setSuccessMessage('Authentication successful! Loading Admin Dashboard...');
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(defaultAdminToken);
      }, 300);
    } else {
      // 4. Error Handling: Clean client-side message
      setIsLoading(false);
      setError('Invalid email or password');
    }
  };

  const handleApplyDefaultCredentials = () => {
    setEmail('admin@luxue.com');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#1F060A] bg-radial from-[#3B0C13] via-[#1F060A] to-[#0D0204] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#2B090E] border-2 border-[#D4AF37]/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Top Gold Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D4AF37] via-[#DFBA67] to-[#D4AF37]" />

        {/* Header Branding */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 rounded-full bg-[#3B0C13] border-2 border-[#D4AF37] text-[#DFBA67] flex items-center justify-center mx-auto shadow-lg">
            <Crown className="w-8 h-8 text-[#DFBA67]" />
          </div>
          
          <div>
            <h1 className="font-serif-luxury text-3xl font-black text-white tracking-[0.2em] uppercase">
              LUXUE
            </h1>
            <p className="text-xs font-bold text-[#DFBA67] uppercase tracking-[0.3em] pt-0.5">
              ADMINISTRATION
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[#3B0C13]/80 text-[#C2B2A3] text-[11px] font-semibold px-3 py-1 rounded-full border border-[#D4AF37]/30 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#DFBA67]" />
            <span>Secure Admin Login</span>
          </div>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs p-3.5 rounded-xl flex items-center gap-2.5 shadow-md animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 text-xs p-3.5 rounded-xl flex items-center gap-2.5 shadow-md animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="leading-relaxed font-semibold">{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email / Username */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-[#DFBA67] uppercase tracking-wider block">
              EMAIL / USERNAME
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#DFBA67] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@luxue.com"
                className="w-full bg-[#1F060A] text-white text-xs pl-10 pr-3 py-3.5 rounded-xl border border-[#D4AF37]/40 focus:border-[#DFBA67] focus:outline-none placeholder:text-[#A39283]/50 transition-colors font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-extrabold text-[#DFBA67] uppercase tracking-wider block">
                PASSWORD
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-[11px] font-bold text-[#C2B2A3] hover:text-[#DFBA67] transition-colors cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#DFBA67] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1F060A] text-white text-xs pl-10 pr-3 py-3.5 rounded-xl border border-[#D4AF37]/40 focus:border-[#DFBA67] focus:outline-none placeholder:text-[#A39283]/50 transition-colors font-medium"
              />
            </div>
          </div>

          {/* Preset Demo Credentials Box */}
          <div className="bg-[#1F060A]/90 p-3.5 rounded-xl border border-[#D4AF37]/30 text-[11px] text-[#C2B2A3] space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="font-bold text-[#DFBA67] flex items-center gap-1">
                <Info className="w-3.5 h-3.5" />
                <span>Default Authorized Admin Credentials:</span>
              </p>
              <button
                type="button"
                onClick={handleApplyDefaultCredentials}
                className="text-[10px] text-[#DFBA67] hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" /> Auto-fill
              </button>
            </div>
            <p className="text-xs">
              Email: <span className="font-mono text-white font-bold bg-[#2B090E] px-1.5 py-0.5 rounded border border-[#D4AF37]/20">admin@luxue.com</span>
            </p>
            <p className="text-xs">
              Password: <span className="font-mono text-white font-bold bg-[#2B090E] px-1.5 py-0.5 rounded border border-[#D4AF37]/20">admin123</span>
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#801723] via-[#4A0E17] to-[#801723] hover:from-[#921A28] hover:to-[#921A28] text-[#DFBA67] font-extrabold text-xs py-4 rounded-xl border border-[#D4AF37] shadow-xl flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest transition-all disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isLoading ? 'VERIFYING CREDENTIALS...' : 'LOGIN TO ADMIN PANEL'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#D4AF37]/20 text-[10px] text-[#A39283]">
          <p>© {new Date().getFullYear()} LUXUE FASHION ONLINE • RESTRICTED SYSTEM</p>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#2B090E] border-2 border-[#D4AF37] text-white max-w-sm w-full p-6 rounded-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-[#3B0C13] border border-[#D4AF37] text-[#DFBA67] flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="font-serif-luxury text-lg font-bold text-white uppercase tracking-wider">
              ADMIN CREDENTIAL RECOVERY
            </h3>
            <p className="text-xs text-[#C2B2A3] leading-relaxed">
              To reset your administrative security password or request master key access, please contact the System Security Administrator directly at:
            </p>
            <div className="bg-[#1F060A] p-3 rounded-xl border border-[#D4AF37]/40 text-xs font-mono text-[#DFBA67]">
              security@luxue.com
            </div>
            <button
              onClick={() => setShowForgotModal(false)}
              className="w-full bg-[#3B0C13] hover:bg-[#4A0E17] text-[#DFBA67] font-bold text-xs py-2.5 rounded-xl border border-[#D4AF37] transition-all cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
