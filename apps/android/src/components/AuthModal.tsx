import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  KeyRound,
  ShieldCheck,
  Building,
  Mail,
  Fingerprint,
  RefreshCw,
  LogOut,
  Smartphone,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isLoginModalOpen,
    closeLoginModal,
    isAuthenticated,
    ssoSession,
    userProfile,
    loginWithGoogle,
    loginWithEnterpriseSso,
    loginWithEmail,
    logout,
    refreshSsoToken,
    syncWithAndroid,
    isSyncing
  } = useAuth();

  const [authMethod, setAuthMethod] = useState<'GOOGLE' | 'ENTERPRISE' | 'EMAIL'>('GOOGLE');
  const [enterpriseDomain, setEnterpriseDomain] = useState('defense.gov');
  const [emailInput, setEmailInput] = useState('gnmohareb@gmail.com');

  if (!isLoginModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">CertMaster Single Sign-On (SSO)</h3>
              <p className="text-xs text-slate-400">Universal Authentication for Web & Android App</p>
            </div>
          </div>

          <button
            onClick={closeLoginModal}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Active Session Status */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isAuthenticated
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider">
                  {isAuthenticated ? 'Authenticated via Single Sign-On' : 'Guest / Sign-In Required'}
                </p>
                <p className="text-xs text-slate-300 font-mono">
                  {isAuthenticated ? `${ssoSession.displayName} (${ssoSession.email})` : 'Please sign in to sync with Android phone'}
                </p>
              </div>
            </div>

            {isAuthenticated && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                OIDC TOKEN ACTIVE
              </span>
            )}
          </div>

          {/* Provider Selection Tabs */}
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setAuthMethod('GOOGLE')}
              className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'GOOGLE'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google SSO</span>
            </button>

            <button
              onClick={() => setAuthMethod('ENTERPRISE')}
              className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'ENTERPRISE'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>SAML 2.0</span>
            </button>

            <button
              onClick={() => setAuthMethod('EMAIL')}
              className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMethod === 'EMAIL'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Magic Link</span>
            </button>
          </div>

          {/* TAB 1: GOOGLE SSO */}
          {authMethod === 'GOOGLE' && (
            <div className="space-y-4">
              <button
                onClick={() => loginWithGoogle('gnmohareb@gmail.com', 'GN Mohareb')}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-sm flex items-center justify-center gap-3 shadow-lg shadow-white/5 transition-all cursor-pointer group"
              >
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with gnmohareb@gmail.com</span>
                <ChevronRight className="w-4 h-4 ml-auto text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="other.google.account@gmail.com"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => loginWithGoogle(emailInput)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700"
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ENTERPRISE SAML */}
          {authMethod === 'ENTERPRISE' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Corporate SSO Domain
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={enterpriseDomain}
                  onChange={e => setEnterpriseDomain(e.target.value)}
                  placeholder="company.com"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => loginWithEnterpriseSso(enterpriseDomain, 'Okta SSO (SAML 2.0)')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Okta Login
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MAGIC LINK */}
          {authMethod === 'EMAIL' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-300">
                Work Email Address
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="student@enterprise.com"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => loginWithEmail(emailInput)}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                >
                  Send Link
                </button>
              </div>
            </div>
          )}

          {/* Technical Details Strip */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">OAuth Client ID:</span>
              <span className="font-mono text-[10px] text-slate-300">{ssoSession.clientId}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Scopes Granted:</span>
              <span className="font-mono text-[10px] text-cyan-300">openid, profile, email</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Android Companion:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" />
                Pixel 8 Pro Paired
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-800 bg-slate-900/50">
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/20 transition-colors"
            >
              Sign Out of SSO
            </button>
          ) : (
            <span className="text-xs text-slate-500">Sign in to sync entitlements</span>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={refreshSsoToken}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              Refresh Token
            </button>
            <button
              onClick={closeLoginModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
