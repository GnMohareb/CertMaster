import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Smartphone,
  CheckCircle2,
  Lock,
  Play,
  RotateCcw,
  Headphones,
  Layers,
  LayoutDashboard,
  ShieldCheck,
  User,
  Zap,
  RefreshCw,
  Award,
  BookOpen,
  Wifi,
  ChevronRight,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';

interface LiveMobileAppDeviceProps {
  onSyncTriggered?: (direction: 'PHONE_TO_WEB' | 'WEB_TO_PHONE') => void;
  className?: string;
}

export const LiveMobileAppDevice: React.FC<LiveMobileAppDeviceProps> = ({
  onSyncTriggered,
  className = ''
}) => {
  const {
    userProfile,
    activeExam,
    activeExamId,
    setActiveExamId,
    updateProfile,
    subscribeToExam,
    syncWithAndroid,
    isSyncing,
    showToast
  } = useAuth();

  const [mobileScreen, setMobileScreen] = useState<'DASHBOARD' | 'SIM' | 'AUDIO' | 'FLASHCARDS' | 'PROFILE'>('DASHBOARD');
  const [selectedMobileOpt, setSelectedMobileOpt] = useState<number | null>(null);
  const [mobileSimScore, setMobileSimScore] = useState<number | null>(null);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [mobileAudioPlaying, setMobileAudioPlaying] = useState(false);
  const [isReceivingWebSync, setIsReceivingWebSync] = useState(false);
  const [lastSyncFromWebTime, setLastSyncFromWebTime] = useState<string>('Just now');

  // Trigger brief visual animation on phone when web profile updates
  useEffect(() => {
    setIsReceivingWebSync(true);
    setLastSyncFromWebTime(new Date().toLocaleTimeString());
    const t = setTimeout(() => setIsReceivingWebSync(false), 1200);
    return () => clearTimeout(t);
  }, [userProfile.lastSyncTimestampMillis, userProfile.assessmentScorePercent, userProfile.subscriptions]);

  const handleMobileOptionSelect = (optIdx: number) => {
    setSelectedMobileOpt(optIdx);
    // Instant sync to web
    if (onSyncTriggered) onSyncTriggered('PHONE_TO_WEB');
  };

  const handleMobileSimSubmit = () => {
    const isCorrect = selectedMobileOpt === 1; // Option B (Bell-LaPadula) is correct
    const newScore = isCorrect ? 82 : 68;
    setMobileSimScore(newScore);

    // Push new score from phone to central web cloud
    updateProfile({
      assessmentScorePercent: newScore,
      hesitationNotes: 'Mobile drill session completed on Pixel 8 Pro. Answer validated against NIST standards.'
    });

    showToast(`📱 Mobile App submitted drill: ${newScore}% Readiness synced to Web!`);
    if (onSyncTriggered) onSyncTriggered('PHONE_TO_WEB');
  };

  const handleMobileUnlockExam = async (examId: string) => {
    await subscribeToExam(examId);
    showToast(`📱 Mobile In-App Purchase: ${examId.toUpperCase()} unlocked universally!`);
    if (onSyncTriggered) onSyncTriggered('PHONE_TO_WEB');
  };

  const isExamSubscribed = userProfile.subscriptions[activeExamId]?.status === 'ACTIVE';

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Outer Phone Hardware Chasis (Google Pixel 8 Pro Aesthetic) */}
      <div className="relative w-[340px] h-[690px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-800 flex flex-col justify-between overflow-hidden">
        {/* Subtle Screen Glare Overlay */}
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Sync Incoming Pulse Highlight */}
        {isReceivingWebSync && (
          <div className="absolute inset-0 bg-blue-500/15 border-2 border-cyan-400 rounded-[40px] z-50 pointer-events-none animate-pulse flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-full bg-slate-900/90 text-cyan-300 font-bold text-[11px] border border-cyan-400 shadow-xl flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Sync Packet Received From Web!
            </span>
          </div>
        )}

        {/* Top Status Bar & Camera Hole-Punch */}
        <div className="relative z-20 flex items-center justify-between px-4 pt-1 text-[11px] font-mono text-slate-300">
          <span>09:42</span>
          {/* Front Camera Cutout */}
          <div className="w-4 h-4 bg-black rounded-full border border-slate-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-blue-900/60 rounded-full" />
          </div>
          <div className="flex items-center space-x-1">
            <Wifi className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-bold text-emerald-400">5G</span>
            <span className="text-[10px]">100%</span>
          </div>
        </div>

        {/* Native Android Header (CertTopAppBar) */}
        <div className="relative z-10 px-3 py-2 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between mt-1 rounded-t-xl">
          <div className="flex items-center space-x-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: activeExam.primaryColorHex }}
            />
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-xs text-white leading-none">
                  {activeExam.shortCode}
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 rounded">
                  ONLINE
                </span>
              </div>
              <p className="text-[9px] text-slate-400">CertMaster Android v2.4</p>
            </div>
          </div>

          <button
            onClick={() => syncWithAndroid()}
            disabled={isSyncing}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
            title="Trigger Mobile Cloud Sync"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Dynamic Mobile App Body */}
        <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-3 text-xs bg-slate-950 font-sans">
          {/* SCREEN 1: MOBILE DASHBOARD */}
          {mobileScreen === 'DASHBOARD' && (
            <div className="space-y-3 animate-in fade-in">
              {/* Readiness Hero Card */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-slate-800 text-center space-y-2 relative overflow-hidden shadow-md">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-slate-300">Readiness Baseline</span>
                  <span className="text-emerald-400 font-mono">Room SQLite Cached</span>
                </div>

                <div className="flex items-center justify-center my-1">
                  <div className="w-18 h-18 rounded-full border-4 border-emerald-500/80 bg-slate-950 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-xl font-extrabold text-white">
                      {userProfile.assessmentScorePercent}%
                    </span>
                    <span className="text-[8px] text-emerald-400 font-bold uppercase">Ready</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-300">
                  Target: 70% • Archetype: <strong className="text-amber-300">{userProfile.behavioralArchetype}</strong>
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>Stress: {userProfile.cognitiveStressBaseline}/100</span>
                  <span>Synced: {lastSyncFromWebTime}</span>
                </div>
              </div>

              {/* Active Exam Status Pill */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-400 block">Selected Subject Bank</span>
                  <strong className="text-white text-xs">{activeExam.title}</strong>
                </div>
                {isExamSubscribed ? (
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    UNLOCKED
                  </span>
                ) : (
                  <button
                    onClick={() => handleMobileUnlockExam(activeExam.id)}
                    className="px-2 py-1 rounded text-[9px] font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                  >
                    Unlock ($29)
                  </button>
                )}
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <button
                  onClick={() => setMobileScreen('SIM')}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left space-y-1 transition-colors"
                >
                  <Play className="w-4 h-4 text-blue-400" />
                  <strong className="block text-white">Start Practice</strong>
                  <span className="text-[9px] text-slate-400">Mobile drill</span>
                </button>

                <button
                  onClick={() => setMobileScreen('AUDIO')}
                  className="p-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-left space-y-1 transition-colors"
                >
                  <Headphones className="w-4 h-4 text-indigo-400" />
                  <strong className="block text-white">Audio Briefing</strong>
                  <span className="text-[9px] text-slate-400">Maya & Liam</span>
                </button>
              </div>

              <button
                onClick={() => setMobileScreen('FLASHCARDS')}
                className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <div className="text-left">
                    <strong className="block text-white text-[11px]">3D Flashcard Recall</strong>
                    <span className="text-[9px] text-slate-400">7 active cards in deck</span>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          )}

          {/* SCREEN 2: MOBILE EXAM SIMULATION */}
          {mobileScreen === 'SIM' && (
            <div className="space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-bold text-blue-400">Question #3 of 50</span>
                <span className="font-mono text-amber-400">28:14 Left</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <p className="font-semibold text-white text-[11px] leading-snug">
                  Which mathematical model enforces no read-up (Simple Security) and no write-down (*-property)?
                </p>

                <div className="space-y-1.5 pt-1">
                  {[
                    'A. Biba Integrity Model',
                    'B. Bell-LaPadula Confidentiality',
                    'C. Clark-Wilson Commercial Model',
                    'D. Brewer-Nash Chinese Wall'
                  ].map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleMobileOptionSelect(i)}
                      className={`w-full text-left p-2 rounded-lg border text-[10px] transition-all ${
                        selectedMobileOpt === i
                          ? 'bg-blue-600/25 border-blue-500 text-white font-bold ring-1 ring-blue-400'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {mobileSimScore !== null && (
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center text-[10px] text-emerald-300">
                  ✓ Validated: Score updated to {mobileSimScore}% and committed to central cloud!
                </div>
              )}

              <button
                onClick={handleMobileSimSubmit}
                disabled={selectedMobileOpt === null}
                className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs disabled:opacity-40 shadow-md transition-colors"
              >
                Submit Answer & Sync
              </button>
            </div>
          )}

          {/* SCREEN 3: MOBILE AUDIO OVERVIEW */}
          {mobileScreen === 'AUDIO' && (
            <div className="space-y-3 animate-in fade-in text-center">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/30 space-y-2">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 mx-auto flex items-center justify-center text-white shadow-lg">
                  <Headphones className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-white text-xs">Security Models Deep Dive</h4>
                <p className="text-[10px] text-slate-300">Dr. Maya & Liam (CISSP CBK)</p>

                {/* Animated Audio bars */}
                <div className="flex items-end justify-center space-x-1 h-6 pt-1">
                  {[8, 16, 12, 22, 14, 18, 10, 15].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full bg-cyan-400 transition-all duration-150"
                      style={{
                        height: mobileAudioPlaying ? `${Math.max(4, h * (0.5 + Math.random()))}px` : '4px',
                        opacity: mobileAudioPlaying ? 1 : 0.4
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setMobileAudioPlaying(!mobileAudioPlaying)}
                  className="px-4 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold shadow-md transition-colors"
                >
                  {mobileAudioPlaying ? 'Pause Audio' : 'Play Podcast Stream'}
                </button>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                "Simple security = No read up. *-Property = No write down."
              </p>
            </div>
          )}

          {/* SCREEN 4: MOBILE FLASHCARDS */}
          {mobileScreen === 'FLASHCARDS' && (
            <div className="space-y-3 animate-in fade-in">
              <div
                onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 border border-slate-700 min-h-[140px] flex flex-col justify-between cursor-pointer text-center"
              >
                <span className="text-[9px] font-mono text-cyan-400 block">
                  {flashcardFlipped ? 'ANSWER (RECALL)' : 'QUESTION (TAP TO FLIP)'}
                </span>

                <p className="text-white font-bold text-xs">
                  {flashcardFlipped
                    ? 'MTD = RTO + WRT (Recovery Time Objective + Work Recovery Time)'
                    : 'What is the formula for Maximum Tolerable Downtime (MTD)?'}
                </p>

                <span className="text-[8px] text-slate-400 font-mono">
                  {flashcardFlipped ? 'Formula Verified' : 'Tap to Reveal'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <button
                  onClick={() => {
                    setFlashcardFlipped(false);
                    showToast('📱 Flashcard marked: Needs Review');
                  }}
                  className="py-1.5 rounded-lg bg-slate-800 text-amber-400 font-bold border border-slate-700"
                >
                  Review Again
                </button>
                <button
                  onClick={() => {
                    setFlashcardFlipped(false);
                    showToast('📱 Flashcard marked: Mastered (Box 3)');
                  }}
                  className="py-1.5 rounded-lg bg-emerald-600 text-white font-bold shadow-sm"
                >
                  Mastered
                </button>
              </div>
            </div>
          )}

          {/* SCREEN 5: MOBILE CENTRAL PROFILE */}
          {mobileScreen === 'PROFILE' && (
            <div className="space-y-2.5 animate-in fade-in">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-1">
                <img
                  src={userProfile.avatarUrl}
                  alt="Avatar"
                  className="w-12 h-12 rounded-full mx-auto border-2 border-blue-500 object-cover"
                />
                <strong className="block text-white text-xs">{userProfile.displayName}</strong>
                <span className="text-[10px] text-slate-400 font-mono block">{userProfile.email}</span>
                <span className="inline-block px-1.5 py-0.2 bg-emerald-500/15 text-emerald-400 text-[8px] font-bold rounded">
                  SSO LINKED
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 font-mono text-[9px]">
                <div className="flex justify-between text-slate-300">
                  <span>User ID:</span>
                  <span className="text-slate-400">{userProfile.userId}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Cloud Tier:</span>
                  <span className="text-blue-400 font-bold">{userProfile.subscriptionTier}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Active Banks:</span>
                  <span className="text-emerald-400 font-bold">
                    {Object.values(userProfile.subscriptions).filter(s => s.status === 'ACTIVE').length} of 112
                  </span>
                </div>
              </div>

              <button
                onClick={() => syncWithAndroid()}
                disabled={isSyncing}
                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Synchronize With Web Platform</span>
              </button>
            </div>
          )}
        </div>

        {/* Native Android M3 Bottom Navigation Bar */}
        <div className="relative z-10 px-2 py-1.5 bg-slate-900 border-t border-slate-800 rounded-b-xl flex justify-around text-center">
          <button
            onClick={() => setMobileScreen('DASHBOARD')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              mobileScreen === 'DASHBOARD' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="text-[8px] mt-0.5">Home</span>
          </button>

          <button
            onClick={() => setMobileScreen('SIM')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              mobileScreen === 'SIM' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span className="text-[8px] mt-0.5">Simulate</span>
          </button>

          <button
            onClick={() => setMobileScreen('FLASHCARDS')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              mobileScreen === 'FLASHCARDS' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[8px] mt-0.5">Cards</span>
          </button>

          <button
            onClick={() => setMobileScreen('PROFILE')}
            className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors ${
              mobileScreen === 'PROFILE' ? 'text-blue-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span className="text-[8px] mt-0.5">Profile</span>
          </button>
        </div>

        {/* Android Home Navigation Pill Indicator */}
        <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto my-1" />
      </div>

      {/* Device Badge Subtitle */}
      <div className="mt-2 text-center text-xs text-slate-400 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Pixel 8 Pro Client (Android 14) • Live Sync Active</span>
      </div>
    </div>
  );
};
