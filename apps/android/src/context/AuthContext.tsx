import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserCentralProfile, ExamConfig, SsoSessionInfo } from '../types';
import { ApiSyncService, DEFAULT_USER_PROFILE, SyncLogEntry } from '../services/apiSyncService';
import { CATALOG_112_EXAMS, getExamById } from '../data/catalog112';

const DEFAULT_SSO_SESSION: SsoSessionInfo = {
  isAuthenticated: true,
  provider: 'Google Identity Services (OIDC)',
  issuer: 'https://accounts.google.com',
  clientId: 'certmaster-sso-production.apps.googleusercontent.com',
  ssoSubjectId: 'usr_gnmohareb_cissp_001',
  email: 'gnmohareb@gmail.com',
  displayName: 'GN Mohareb',
  emailVerified: true,
  grantedScopes: [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ],
  sessionStartedAt: Date.now() - 3600000 * 2, // 2 hours ago
  tokenExpiresAt: Date.now() + 3600000 * 22, // 22 hours remaining
  jwtTokenPreview: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjRiMWY5YSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiJ1c3JfZ25tb2hhcmViX2Npc3NwXzAwMSIsImVtYWlsIjoiZ25tb2hhcmViQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdWQiOiJjZXJ0bWFzdGVyLXNzby1wcm9kdWN0aW9uLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiaWF0IjoxNzM5MjA4MDAwLCJleHAiOjE3MzkyOTQ0MDB9.sso_sig_valid_cm',
  androidDeviceId: 'pixel8pro_android_gnm_77a9',
  syncStatus: 'SYNCHRONIZED'
};

const STORAGE_KEY_AUTH_STATUS = 'certmaster_sso_authenticated_status';
const STORAGE_KEY_SSO_SESSION = 'certmaster_sso_active_session';

interface AuthContextType {
  isAuthenticated: boolean;
  ssoSession: SsoSessionInfo;
  userProfile: UserCentralProfile;
  activeExam: ExamConfig;
  activeExamId: string;
  setActiveExamId: (id: string) => void;
  isSyncing: boolean;
  syncWithAndroid: () => Promise<void>;
  subscribeToExam: (examId: string) => Promise<void>;
  purchaseAllAccess: () => Promise<void>;
  updateProfile: (profile: Partial<UserCentralProfile>) => void;
  loginWithGoogle: (email?: string, name?: string) => void;
  loginWithEnterpriseSso: (domain: string, providerName?: string) => void;
  loginWithEmail: (email: string) => void;
  logout: () => void;
  refreshSsoToken: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  themeMode: 'dark' | 'light';
  toggleTheme: () => void;
  showSyncModal: boolean;
  setShowSyncModal: (show: boolean) => void;
  showCertModal: boolean;
  setShowCertModal: (show: boolean) => void;
  openCertModal: () => void;
  closeCertModal: () => void;
  syncLogs: SyncLogEntry[];
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH_STATUS);
    return saved !== null ? saved === 'true' : true;
  });

  const [ssoSession, setSsoSession] = useState<SsoSessionInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SSO_SESSION);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return DEFAULT_SSO_SESSION;
  });

  const [userProfile, setUserProfile] = useState<UserCentralProfile>(() => ApiSyncService.getProfile());
  const [activeExamId, setActiveExamId] = useState<string>('cissp');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [showCertModal, setShowCertModal] = useState<boolean>(false);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>(() => ApiSyncService.getSyncLogs());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeExam = getExamById(activeExamId);

  useEffect(() => {
    ApiSyncService.initBroadcast();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(current => (current === msg ? null : current));
    }, 4500);
  };

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const openCertModal = () => setShowCertModal(true);
  const closeCertModal = () => setShowCertModal(false);

  const syncWithAndroid = async () => {
    setIsSyncing(true);
    try {
      const res = await ApiSyncService.syncWithAndroidApp(userProfile);
      setUserProfile(ApiSyncService.getProfile());
      setSyncLogs(ApiSyncService.getSyncLogs());
      setSsoSession(prev => ({
        ...prev,
        syncStatus: 'SYNCHRONIZED',
        tokenExpiresAt: Date.now() + 3600000 * 24
      }));
      showToast('☁️ SSO Session & Telemetry Synced with Android Client (Pixel 8 Pro)');
    } catch (e) {
      console.error(e);
      showToast('Sync error occurred. Please retry.');
    } finally {
      setIsSyncing(false);
    }
  };

  const subscribeToExam = async (examId: string) => {
    setIsSyncing(true);
    try {
      const updated = await ApiSyncService.verifyOrSubscribeExam(examId, false);
      setUserProfile({ ...updated });
      setSyncLogs(ApiSyncService.getSyncLogs());
      showToast(`🎉 Unlocked ${getExamById(examId).shortCode} on Web & Android via SSO Entitlements!`);
    } finally {
      setIsSyncing(false);
    }
  };

  const purchaseAllAccess = async () => {
    setIsSyncing(true);
    try {
      const updated = await ApiSyncService.verifyOrSubscribeExam('all', true);
      setUserProfile({ ...updated });
      setSyncLogs(ApiSyncService.getSyncLogs());
      showToast('🚀 Universal Multi-Pass Activated! All 120+ Exam Banks Unlocked.');
    } finally {
      setIsSyncing(false);
    }
  };

  const updateProfile = (changes: Partial<UserCentralProfile>) => {
    const updated = { ...userProfile, ...changes, lastSyncTimestampMillis: Date.now() };
    setUserProfile(updated);
    ApiSyncService.saveProfile(updated);
  };

  const loginWithGoogle = (customEmail?: string, customName?: string) => {
    const email = customEmail || 'gnmohareb@gmail.com';
    const name = customName || (email === 'gnmohareb@gmail.com' ? 'GN Mohareb' : email.split('@')[0]);

    const gProfile: UserCentralProfile = {
      ...DEFAULT_USER_PROFILE,
      displayName: name,
      email: email,
      avatarUrl: email === 'gnmohareb@gmail.com'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
      lastSyncTimestampMillis: Date.now()
    };

    const newSso: SsoSessionInfo = {
      isAuthenticated: true,
      provider: 'Google Identity Services (OIDC)',
      issuer: 'https://accounts.google.com',
      clientId: 'certmaster-sso-production.apps.googleusercontent.com',
      ssoSubjectId: email === 'gnmohareb@gmail.com' ? 'usr_gnmohareb_cissp_001' : `usr_${email.replace(/[@.]/g, '_')}`,
      email: email,
      displayName: name,
      emailVerified: true,
      grantedScopes: [
        'openid',
        'email',
        'profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ],
      sessionStartedAt: Date.now(),
      tokenExpiresAt: Date.now() + 3600000 * 24,
      jwtTokenPreview: `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiI${Math.random().toString(36).substring(2, 8)}...`,
      androidDeviceId: 'pixel8pro_android_gnm_77a9',
      syncStatus: 'SYNCHRONIZED'
    };

    setIsAuthenticated(true);
    setSsoSession(newSso);
    setUserProfile(gProfile);
    ApiSyncService.saveProfile(gProfile);

    localStorage.setItem(STORAGE_KEY_AUTH_STATUS, 'true');
    localStorage.setItem(STORAGE_KEY_SSO_SESSION, JSON.stringify(newSso));

    setIsLoginModalOpen(false);
    showToast(`✅ Successfully authenticated via Google SSO as ${email}`);
  };

  const loginWithEnterpriseSso = (domain: string, providerName: string = 'Enterprise SAML 2.0') => {
    const cleanDomain = domain.replace('@', '').toLowerCase();
    const demoEmail = `security.lead@${cleanDomain}`;
    const demoName = cleanDomain.split('.')[0].toUpperCase() + ' Security Lead';

    const enterpriseProfile: UserCentralProfile = {
      ...userProfile,
      displayName: demoName,
      email: demoEmail,
      subscriptionTier: 'Universal Multi-Pass',
      lastSyncTimestampMillis: Date.now()
    };

    const enterpriseSso: SsoSessionInfo = {
      isAuthenticated: true,
      provider: providerName as any,
      issuer: `https://sso.${cleanDomain}/saml/idp`,
      clientId: `urn:certmaster:sp:${cleanDomain}`,
      ssoSubjectId: `saml_${cleanDomain}_usr_009`,
      email: demoEmail,
      displayName: demoName,
      emailVerified: true,
      grantedScopes: ['saml:assertion', 'certmaster:universal_access', 'profile', 'email'],
      sessionStartedAt: Date.now(),
      tokenExpiresAt: Date.now() + 3600000 * 12,
      jwtTokenPreview: `eyJhbGciOiJSUzI1NiIsImlkcCI6IlNBTUxfMi4wIn0.eyJpc3MiOiJodHRwczovL3Nzby4ke2NsZWFuRG9tYWlufSIsImVtYWlsIjoiJHtkZW1vRW1haWx9In0...`,
      androidDeviceId: 'pixel8pro_android_gnm_77a9',
      syncStatus: 'SYNCHRONIZED'
    };

    setIsAuthenticated(true);
    setSsoSession(enterpriseSso);
    setUserProfile(enterpriseProfile);
    ApiSyncService.saveProfile(enterpriseProfile);

    localStorage.setItem(STORAGE_KEY_AUTH_STATUS, 'true');
    localStorage.setItem(STORAGE_KEY_SSO_SESSION, JSON.stringify(enterpriseSso));

    setIsLoginModalOpen(false);
    showToast(`🏢 Enterprise SSO Verified: Connected via ${providerName} (${cleanDomain})`);
  };

  const loginWithEmail = (email: string) => {
    const name = email.split('@')[0];
    const updated: UserCentralProfile = {
      ...userProfile,
      email: email,
      displayName: name,
      lastSyncTimestampMillis: Date.now()
    };

    const ssoState: SsoSessionInfo = {
      ...ssoSession,
      isAuthenticated: true,
      provider: 'Email Magic Link',
      email: email,
      displayName: name,
      ssoSubjectId: `usr_${email.replace(/[@.]/g, '_')}`
    };

    setIsAuthenticated(true);
    setSsoSession(ssoState);
    setUserProfile(updated);
    ApiSyncService.saveProfile(updated);

    localStorage.setItem(STORAGE_KEY_AUTH_STATUS, 'true');
    localStorage.setItem(STORAGE_KEY_SSO_SESSION, JSON.stringify(ssoState));

    setIsLoginModalOpen(false);
    showToast(`📧 Signed in with Magic Link SSO as ${email}`);
  };

  const refreshSsoToken = () => {
    setSsoSession(prev => ({
      ...prev,
      tokenExpiresAt: Date.now() + 3600000 * 24,
      syncStatus: 'SYNCHRONIZED'
    }));
    showToast('🔄 Google SSO Token & Cryptographic Handshake Refreshed');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setSsoSession(prev => ({
      ...prev,
      isAuthenticated: false,
      syncStatus: 'DISCONNECTED'
    }));
    localStorage.setItem(STORAGE_KEY_AUTH_STATUS, 'false');
    showToast('👋 Signed out of SSO Session. You can sign back in anytime.');
  };

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    if (typeof document !== 'undefined') {
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        ssoSession,
        userProfile,
        activeExam,
        activeExamId,
        setActiveExamId,
        isSyncing,
        syncWithAndroid,
        subscribeToExam,
        purchaseAllAccess,
        updateProfile,
        loginWithGoogle,
        loginWithEnterpriseSso,
        loginWithEmail,
        logout,
        refreshSsoToken,
        isLoginModalOpen,
        setIsLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        themeMode,
        toggleTheme,
        showSyncModal,
        setShowSyncModal,
        showCertModal,
        setShowCertModal,
        openCertModal,
        closeCertModal,
        syncLogs,
        toastMessage,
        showToast
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
