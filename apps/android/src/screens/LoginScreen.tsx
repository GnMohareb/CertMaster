import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Server,
  RefreshCw,
  LogOut,
  Building,
  Mail,
  Fingerprint,
  ExternalLink,
  Code2,
  Lock,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Globe,
  Radio
} from 'lucide-react';

interface LoginScreenProps {
  onNavigate?: (tab: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const {
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
  const [enterpriseProvider, setEnterpriseProvider] = useState('Okta SSO (SAML 2.0)');
  const [emailInput, setEmailInput] = useState('gnmohareb@gmail.com');
  const [showRawClaims, setShowRawClaims] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  const handleCopyToken = () => {
    navigator.clipboard?.writeText(ssoSession.jwtTokenPreview);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const calculateRemainingHours = () => {
    const diffMs = ssoSession.tokenExpiresAt - Date.now();
    if (diffMs <= 0) return 'Expired';
    return `${Math.round(diffMs / 3600000)} hours remaining`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-12">
      {/* 1. HERO SSO IDENTITY BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/80 border border-slate-800 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-400">
              <KeyRound className="w-3.5 h-3.5" />
              <span>CENTRAL SINGLE SIGN-ON (SSO) GATEWAY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              CertMaster Identity & SSO Hub
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Connect your verified Google Workspace or Enterprise SAML SSO credentials. A single login synchronizes your exam banks, simulation telemetry, and active subscriptions seamlessly between this Web Portal and the Android App.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5">
            <div className={`p-4 rounded-2xl border text-xs flex items-center gap-3 ${
              isAuthenticated
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                isAuthenticated ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`} />
              <div>
                <p className="font-extrabold uppercase tracking-wider text-[11px]">
                  {isAuthenticated ? 'SSO Session Active' : 'Unauthenticated / Guest'}
                </p>
                <p className="text-[11px] text-slate-300 font-mono">
                  {isAuthenticated ? ssoSession.email : 'No active SSO session'}
                </p>
              </div>
            </div>

            {isAuthenticated && onNavigate && (
              <button
                onClick={() => onNavigate('user-area')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <span>Go to Student Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. AUTHENTICATION BOX & SSO PROVIDER SELECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Sign-In Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div>
              <h2 className="text-lg font-extrabold text-white">Choose SSO Login Method</h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your identity provider to authenticate and federate cross-device privileges.
              </p>
            </div>

            {/* Provider Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setAuthMethod('GOOGLE')}
                className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
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
                className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  authMethod === 'ENTERPRISE'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Building className="w-3.5 h-3.5" />
                <span>Enterprise SAML</span>
              </button>

              <button
                onClick={() => setAuthMethod('EMAIL')}
                className={`py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  authMethod === 'EMAIL'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Magic Link</span>
              </button>
            </div>

            {/* TAB CONTENT 1: GOOGLE SSO */}
            {authMethod === 'GOOGLE' && (
              <div className="space-y-4 pt-1">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Google Identity Services (OIDC)</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      OIDC Compliant
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Fastest login path. Links directly with the Google Sign-In Credential Manager installed on the CertMaster Android app.
                  </p>

                  {/* Primary Google Login Button */}
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
                    <span>Sign in with Google (gnmohareb@gmail.com)</span>
                    <ChevronRight className="w-4 h-4 ml-auto text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                {/* Switch / Custom Google account input */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs space-y-2.5">
                  <span className="font-bold text-slate-400 uppercase text-[11px]">
                    Or Sign In with Another Google Account
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      placeholder="your.google.account@gmail.com"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => loginWithGoogle(emailInput)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
                    >
                      Authenticate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: ENTERPRISE SAML 2.0 */}
            {authMethod === 'ENTERPRISE' && (
              <div className="space-y-4 pt-1">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Enterprise Single Sign-On</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      SAML 2.0 & OIDC
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Log in with your corporate identity provider (Okta, Microsoft Entra ID / Azure AD, PingFederate).
                  </p>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Corporate Identity Provider
                      </label>
                      <select
                        value={enterpriseProvider}
                        onChange={e => setEnterpriseProvider(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="Okta SSO (SAML 2.0)">Okta Single Sign-On (SAML 2.0)</option>
                        <option value="Microsoft Entra ID (Azure AD)">Microsoft Entra ID (Azure AD SSO)</option>
                        <option value="PingIdentity OIDC">PingIdentity Universal Directory</option>
                        <option value="CyberArk Identity">CyberArk Secure Identity Gateway</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                        Organization Domain
                      </label>
                      <div className="flex rounded-xl bg-slate-900 border border-slate-700 overflow-hidden">
                        <span className="px-3 py-2 text-xs text-slate-500 font-mono bg-slate-950/80 border-r border-slate-800">
                          https://
                        </span>
                        <input
                          type="text"
                          value={enterpriseDomain}
                          onChange={e => setEnterpriseDomain(e.target.value)}
                          placeholder="company.com"
                          className="flex-1 px-3 py-2 text-white text-xs bg-transparent focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => loginWithEnterpriseSso(enterpriseDomain, enterpriseProvider)}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    >
                      <Building className="w-4 h-4" />
                      <span>Federate with {enterpriseProvider.split(' ')[0]} ({enterpriseDomain})</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: MAGIC LINK */}
            {authMethod === 'EMAIL' && (
              <div className="space-y-4 pt-1">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Passwordless Magic Link</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Zero-Password Security
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    We will dispatch a cryptographic one-time SSO session token to your inbox.
                  </p>

                  <div className="flex gap-2 pt-1">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={e => setEmailInput(e.target.value)}
                      placeholder="student@certmaster.io"
                      className="flex-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={() => loginWithEmail(emailInput)}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
                    >
                      Send Magic Link
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Session Management Action Buttons (Logout & Refresh) */}
            {isAuthenticated && (
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={refreshSsoToken}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                    <span>Renew SSO Token</span>
                  </button>
                  <button
                    onClick={() => syncWithAndroid()}
                    disabled={isSyncing}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-semibold flex items-center gap-1.5 border border-emerald-500/30 transition-colors cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{isSyncing ? 'Syncing...' : 'Sync with Android Phone'}</span>
                  </button>
                </div>

                <button
                  onClick={logout}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold flex items-center gap-1.5 border border-rose-500/30 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of SSO</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live SSO Claims & Technical Proof (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-white">SSO Architecture & Claims</h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ACTIVE FEDERATION
              </span>
            </div>

            <p className="text-xs text-slate-400">
              CertMaster operates on OpenID Connect (OIDC) identity federation. Here are the active cryptographic claims granted to this session:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">Identity Provider:</span>
                <span className="font-bold text-white text-right">{ssoSession.provider}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">SSO Subject (sub):</span>
                <span className="font-mono text-cyan-300 text-[11px]">{ssoSession.ssoSubjectId}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">Audience (Client ID):</span>
                <span className="font-mono text-slate-300 text-[10px] truncate max-w-[170px]" title={ssoSession.clientId}>
                  {ssoSession.clientId}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">Issuer (iss):</span>
                <span className="font-mono text-slate-300 text-[11px]">{ssoSession.issuer}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">Token Expiry:</span>
                <span className="font-bold text-amber-400">{calculateRemainingHours()}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">Android Companion Link:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  Pixel 8 Pro Synced
                </span>
              </div>
            </div>

            {/* OIDC Scopes Strip */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Authorized OAuth 2.0 Scopes
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ssoSession.grantedScopes.map(scope => (
                  <span
                    key={scope}
                    className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono"
                  >
                    {scope.replace('https://www.googleapis.com/auth/', '')}
                  </span>
                ))}
              </div>
            </div>

            {/* Decoded JWT Inspector Toggle */}
            <div>
              <button
                onClick={() => setShowRawClaims(!showRawClaims)}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold flex items-center justify-between border border-slate-700 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-blue-400" />
                  {showRawClaims ? 'Hide Cryptographic JWT Payload' : 'Inspect Decoded JWT Token & Claims'}
                </span>
                <ChevronRight className={`w-3.5 h-3.5 transition-transform ${showRawClaims ? 'rotate-90' : ''}`} />
              </button>

              {showRawClaims && (
                <div className="mt-2 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-2 text-slate-300 overflow-x-auto">
                  <div className="flex justify-between items-center pb-1 border-b border-slate-800">
                    <span className="text-slate-500 text-[10px]">DECODED CLAIMS PAYLOAD</span>
                    <button
                      onClick={handleCopyToken}
                      className="text-[10px] text-blue-400 hover:text-blue-300 font-sans"
                    >
                      {copiedToken ? 'Copied!' : 'Copy Token'}
                    </button>
                  </div>
                  <pre className="text-emerald-400 text-[10px] leading-tight">
{JSON.stringify({
  iss: ssoSession.issuer,
  sub: ssoSession.ssoSubjectId,
  aud: ssoSession.clientId,
  email: ssoSession.email,
  email_verified: ssoSession.emailVerified,
  name: ssoSession.displayName,
  entitlements: userProfile.subscriptionTier,
  active_exams: Object.keys(userProfile.subscriptions),
  mobile_paired_device: ssoSession.androidDeviceId,
  exp: Math.floor(ssoSession.tokenExpiresAt / 1000)
}, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* 3. Cross-Platform Unified Experience Notice */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/20 text-xs space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Universal Access Guarantee</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              Because your login is authenticated via Google SSO, any subscription purchased on Web ($29 or $99 Multi-Pass) instantly unlocks all simulation features in your Android app without re-entering payment info.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
