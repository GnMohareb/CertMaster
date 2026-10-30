import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { CATALOG_112_EXAMS, VENDORS, CATEGORIES } from '../data/catalog112';
import {
  Search,
  Filter,
  CheckCircle2,
  Lock,
  Smartphone,
  CreditCard,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  ExternalLink,
  Zap
} from 'lucide-react';

interface CatalogScreenProps {
  onOpenCheckout: (examId?: string, isAllAccess?: boolean) => void;
  onLaunchExam: (examId: string) => void;
  onNavigate?: (tab: string) => void;
}

export const CatalogScreen: React.FC<CatalogScreenProps> = ({ onOpenCheckout, onLaunchExam, onNavigate }) => {
  const { userProfile, activeExamId, setActiveExamId, showToast } = useAuth();

  const [selectedVendor, setSelectedVendor] = useState<string>('All Vendors');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Domains');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNLOCKED' | 'POPULAR'>('ALL');

  const filteredExams = useMemo(() => {
    return CATALOG_112_EXAMS.filter(exam => {
      const matchesVendor =
        selectedVendor === 'All Vendors' || exam.vendor.toLowerCase().includes(selectedVendor.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All Domains' || exam.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.shortCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exam.vendor.toLowerCase().includes(searchQuery.toLowerCase());

      const isUnlocked = userProfile.subscriptions[exam.id]?.status === 'ACTIVE';

      if (filterMode === 'UNLOCKED' && !isUnlocked) return false;
      if (filterMode === 'POPULAR' && !exam.isPopular) return false;

      return matchesVendor && matchesCategory && matchesSearch;
    });
  }, [selectedVendor, selectedCategory, searchQuery, filterMode, userProfile.subscriptions]);

  const activeSubscriptionCount = Object.values(userProfile.subscriptions).filter(
    s => s.status === 'ACTIVE'
  ).length;

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Return to Journey */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        {onNavigate && (
          <button
            onClick={() => onNavigate('user-area')}
            className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors cursor-pointer group"
          >
            <span className="text-blue-400 font-bold group-hover:-translate-x-0.5 transition-transform">←</span>
            <span className="font-semibold">Back to Learning Journey</span>
          </button>
        )}
        <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
          <span>Live Ingestion Pipeline</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">{activeSubscriptionCount} Entitlements Active</span>
        </div>
      </div>

      {/* Universal Paywall Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                120+ Course Banks • Updated Hourly
              </span>
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" />
                Cross-Platform Access Guarantee
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dynamic Subject Catalog & Universal Entitlements
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Our curriculum pipeline continually ingests new certification blueprints, scenario banks, and regulatory updates hourly. Unlocking an exam grants instant synchronized access across both the Web Platform and the CertMaster Android app.
            </p>
          </div>

          {/* Universal Multi-Pass Promo Box */}
          <div className="p-4 rounded-xl bg-slate-900/90 border border-blue-500/40 shadow-lg text-xs space-y-2.5 shrink-0 max-w-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Best Value Multi-Pass
              </span>
              <span className="text-lg font-black text-white">$99</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Unlock all 120+ courses permanently across Web & Android, including all new modules ingested hourly.
            </p>
            <button
              onClick={() => onOpenCheckout(undefined, true)}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Get Universal Multi-Pass ($99)</span>
            </button>
          </div>
        </div>

        {/* Entitlement Summary Bar */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Your Active Entitlements:{' '}
              <strong className="text-white font-bold">Universal Multi-Pass Active (All Courses Unlocked)</strong>
            </span>
          </div>
          <div className="text-slate-400 text-[11px] font-mono">
            Single-Subject Pass: $29.00 / exam • Instant Cloud Ingestion
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by certification name, short code (e.g. CISSP, SAA-C03, PMP), or vendor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex items-center space-x-1.5 w-full md:w-auto shrink-0">
            {(['ALL', 'UNLOCKED', 'POPULAR'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                  filterMode === mode
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                {mode === 'ALL' ? 'All 112 Banks' : mode === 'UNLOCKED' ? 'My Active' : 'Popular'}
              </button>
            ))}
          </div>
        </div>

        {/* Vendor & Category Filter Ribbons */}
        <div className="flex flex-col gap-2 pt-1 border-t border-slate-800/80 text-xs">
          {/* Vendors */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] text-slate-400 font-bold shrink-0 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Vendor:
            </span>
            {VENDORS.map(v => (
              <button
                key={v}
                onClick={() => setSelectedVendor(v)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  selectedVendor === v
                    ? 'bg-slate-700 text-white border border-slate-600'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {v}
              </button>
            ))}
          </div>

          {/* Domain Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-[11px] text-slate-400 font-bold shrink-0 mr-1">Category:</span>
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === c
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Certification Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExams.map(exam => {
          const sub = userProfile.subscriptions[exam.id];
          const isUnlocked = sub?.status === 'ACTIVE';
          const isCurrentActive = exam.id === activeExamId;

          return (
            <div
              key={exam.id}
              className={`p-5 rounded-2xl bg-slate-900 border transition-all flex flex-col justify-between ${
                isCurrentActive
                  ? 'border-blue-500 shadow-md shadow-blue-500/10'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header row with vendor & status badge */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {exam.vendor}
                  </span>
                  {isUnlocked ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      UNLOCKED (WEB & ANDROID)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      $29.00 PASS
                    </span>
                  )}
                </div>

                {/* Exam Title & Short Code */}
                <div className="flex items-center space-x-2.5 mb-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: exam.primaryColorHex }}
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">
                      {exam.shortCode}
                    </h3>
                    <p className="text-xs text-slate-300 font-medium">{exam.title}</p>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  {exam.description}
                </p>

                {/* Exam Specs Pill Grid */}
                <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[10px] font-mono text-slate-300 mb-3 text-center">
                  <div>
                    <span className="text-slate-500 block">Bank Size</span>
                    <strong className="text-white">{exam.totalBankQuestions} Qs</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Time</span>
                    <strong className="text-white">{exam.durationMinutes}m</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Passing</span>
                    <strong className="text-emerald-400">{exam.passingScorePercent}%</strong>
                  </div>
                </div>

                {/* Domain topic chips */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {exam.domains.slice(0, 3).map((d, i) => (
                    <span
                      key={d.id || i}
                      className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-medium truncate max-w-[150px]"
                    >
                      {d.name}
                    </span>
                  ))}
                  {exam.domains.length > 3 && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400">
                      +{exam.domains.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                {isUnlocked ? (
                  <>
                    <button
                      onClick={() => {
                        setActiveExamId(exam.id);
                        onLaunchExam(exam.id);
                      }}
                      className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Launch Prep</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    {isCurrentActive ? (
                      <span className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        Active Target
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveExamId(exam.id);
                          showToast(`🎯 Set ${exam.shortCode} as your active Learning Journey target!`);
                          if (onNavigate) onNavigate('user-area');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold border border-slate-700 transition-colors cursor-pointer"
                        title="Set as My Primary Learning Journey"
                      >
                        Set Target
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onOpenCheckout(exam.id, false)}
                      className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Unlock Pass ($29)</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveExamId(exam.id);
                        onLaunchExam(exam.id);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition-colors"
                      title="Preview exam engine"
                    >
                      Preview
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
