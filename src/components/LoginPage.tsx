import React, { useState } from 'react';
import {
  Sparkles,
  Lock,
  Mail,
  Store,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Bot,
  AlertCircle
} from 'lucide-react';
import { STORE_INFO } from '../data/mockData';
import { extractUserProfileFromEmail } from '../utils/userUtils';

interface LoginPageProps {
  onLogin: (email?: string, storeLocation?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeBranch, setStoreBranch] = useState('BR-042 (Indiranagar Central)');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }
    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(email.trim(), storeBranch.trim());
    }, 400);
  };

  const handleQuickDemoLogin = () => {
    const demoEmail = 'vikram.sharma@retailiq.internal';
    const demoPass = 'storepass2026';
    const demoBranch = 'BR-042 (Indiranagar Central)';
    setEmail(demoEmail);
    setPassword(demoPass);
    setStoreBranch(demoBranch);
    setErrorMessage(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(demoEmail, demoBranch);
    }, 300);
  };

  const previewProfile = email.trim() ? extractUserProfileFromEmail(email.trim()) : null;

  return (
    <div className="min-h-screen w-full bg-[#070b14] bg-gradient-to-br from-[#070b14] via-[#091024] to-[#0a142e] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Background ambient electric blue & cyan gradient glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Header matching Main Dashboard Header */}
      <header className="p-5 sm:px-10 lg:px-12 flex items-center justify-between relative z-10 border-b border-slate-800/60 bg-slate-950/40 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-white">
                Retail<span className="text-cyan-400">IQ</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 tracking-wider">
                AI COPILOT
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Sales & Inventory Intelligence</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 bg-slate-900/90 border border-slate-800/90 px-3.5 py-1.5 rounded-xl shadow-inner backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50"></span>
          <span className="font-semibold text-slate-200">Indiranagar Central</span>
          <span className="text-slate-500 font-mono text-[11px]">POS Active</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 relative z-10 my-4">
        <div className="w-full max-w-md bg-slate-950/85 backdrop-blur-2xl border border-slate-800/90 hover:border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative overflow-hidden transition-all duration-300">
          {/* Subtle cyan top border highlight */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent"></div>

          {/* Card Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[11px] font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Manager Portal Login</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Sign in to manage stock levels, track sales velocity, and dispatch automated restock POs.
            </p>
          </div>

          {/* Strong Gradient 1-Click Demo CTA Box */}
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/50 via-slate-900/80 to-blue-950/50 border border-cyan-500/40 shadow-lg shadow-cyan-950/30 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                <Bot className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Hackathon Fast Access</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                Pre-configured Store Manager shift
              </p>
            </div>
            <button
              type="button"
              id="btn-quick-demo-login"
              onClick={handleQuickDemoLogin}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 border border-cyan-400/40 shrink-0 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-200" />
              <span>1-Click Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Login Form with More Spacing and Glowing Rounded Input Boxes */}
          <form noValidate onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Simple message asking to fill in both fields when either field is empty */}
            {errorMessage && (
              <div
                id="login-error-message"
                className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/60 text-rose-200 text-xs flex items-center gap-2.5 shadow-lg shadow-rose-950/40"
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-semibold">{errorMessage}</span>
              </div>
            )}

            {/* Store Branch Selection */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                Store Location / Branch ID
              </label>
              <div className="relative group">
                <Store className="w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="input-login-branch"
                  value={storeBranch}
                  onChange={(e) => setStoreBranch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/90 border border-slate-800/90 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:shadow-[0_0_18px_rgba(6,182,212,0.22)] transition-all text-xs font-medium"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                Manager Work Email
              </label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  id="input-login-email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-950/90 border ${
                    errorMessage && !email.trim()
                      ? 'border-rose-500/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-800/90 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:shadow-[0_0_18px_rgba(6,182,212,0.22)]'
                  } rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all text-xs font-medium`}
                  placeholder="manager@retailiq.internal"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer font-medium">
                  Forgot key?
                </span>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-cyan-400 transition-colors absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  id="input-login-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-950/90 border ${
                    errorMessage && !password.trim()
                      ? 'border-rose-500/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                      : 'border-slate-800/90 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 focus:shadow-[0_0_18px_rgba(6,182,212,0.22)]'
                  } rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none transition-all text-xs font-medium font-mono`}
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-slate-400 text-xs font-medium">Keep shift session active</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                v2.4-Demo
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="btn-login-submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-extrabold tracking-wide uppercase bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 mt-3 border border-cyan-400/30 hover:scale-[1.01] active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Authenticating Store Node...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Store Manager</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Profile Preview Box */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-slate-400 text-[11px]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-cyan-400 flex items-center justify-center font-extrabold text-xs border border-cyan-500/30 shadow-inner">
                {previewProfile ? previewProfile.initials : STORE_INFO.manager.avatar}
              </div>
              <div>
                <strong className="text-white block leading-tight">
                  {previewProfile ? previewProfile.name : STORE_INFO.manager.name}
                </strong>
                <span className="text-[10px] text-slate-400">
                  {previewProfile ? previewProfile.role : STORE_INFO.manager.role}
                </span>
              </div>
            </div>
            <span className="text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-800/40 text-[10px]">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified Shift</span>
            </span>
          </div>
        </div>
      </main>

      {/* Bottom Footer Info */}
      <footer className="p-5 text-center text-xs text-slate-500 relative z-10 border-t border-slate-800/40 bg-slate-950/20">
        <p>© 2026 RetailIQ AI Systems • Intelligent Sales & Inventory Copilot for Retail Managers</p>
      </footer>
    </div>
  );
};
