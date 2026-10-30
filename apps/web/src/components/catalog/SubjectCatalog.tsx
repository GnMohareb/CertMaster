import React, { useState, useMemo } from 'react';
import { useCertMaster } from '../../context/CertMasterContext';
import { ALL_112_EXAM_BANKS, VENDORS } from '../../data/examBanks';
import { CISSP_EXAM_QUESTIONS } from '../../data/cisspQuestions';
import { VendorType, ExamBank } from '../../types/certmaster';
import { Search, Smartphone, Globe, Lock, Play, Sparkles, Shield, Check } from 'lucide-react';

export const SubjectCatalog: React.FC = () => {
  const { profile, setCheckoutExamId, startExamSession, setActiveTab } = useCertMaster();

  const [selectedVendor, setSelectedVendor] = useState<VendorType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'LOCKED'>('ALL');

  const filteredBanks = useMemo(() => {
    return ALL_112_EXAM_BANKS.filter((bank) => {
      // Vendor filter
      if (selectedVendor !== 'ALL' && bank.vendor !== selectedVendor) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCode = bank.code.toLowerCase().includes(query);
        const matchesTitle = bank.title.toLowerCase().includes(query);
        const matchesVendor = bank.vendor.toLowerCase().includes(query);
        if (!matchesCode && !matchesTitle && !matchesVendor) return false;
      }

      // Status filter
      const sub = profile.subscriptions[bank.id];
      const isActive = sub && sub.status === 'ACTIVE';

      if (statusFilter === 'ACTIVE' && !isActive) return false;
      if (statusFilter === 'LOCKED' && isActive) return false;

      return true;
    });
  }, [selectedVendor, searchQuery, statusFilter, profile.subscriptions]);

  const handleExamClick = (bank: ExamBank) => {
    const sub = profile.subscriptions[bank.id];
    const isUnlocked = sub && (sub.status === 'ACTIVE' || sub.status === 'TRIAL');

    if (isUnlocked) {
      // Launch simulator! If CISSP, load CISSP_EXAM_QUESTIONS
      if (bank.id === 'cissp') {
        startExamSession(bank.id, CISSP_EXAM_QUESTIONS, bank.durationMinutes);
      } else {
        // Load CISSP questions as mock bank for demonstration with custom titles
        const adaptedQuestions = CISSP_EXAM_QUESTIONS.map((q, idx) => ({
          ...q,
          id: `${bank.id}-q${idx + 1}`,
          examId: bank.id,
        }));
        startExamSession(bank.id, adaptedQuestions, bank.durationMinutes);
      }
      setActiveTab('simulator');
    } else {
      setCheckoutExamId(bank.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Catalog Header & Universal Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <span>Universal Exam Registry</span>
              <span>·</span>
              <span>112 Certified Banks</span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400">Cross-Platform Sync Guaranteed</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Enterprise Subject Banks & Certifications
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Every bank purchased or unlocked on the CertMaster Web Hub is instantly synchronized and available on the CertMaster Android companion app with complete state, score, and telemetry retention.
            </p>
          </div>

          {/* Quick Universal Pass CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCheckoutExamId('all-access')}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4" />
              <span>Get All-Access Pass ($99)</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 112 exams (e.g. CISSP, AWS, CISM, PMP)..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          {/* Segmented Status Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg dark:bg-slate-800/80 w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              All 112 Exams
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'ACTIVE'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Active Entitlements
            </button>
            <button
              onClick={() => setStatusFilter('LOCKED')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'LOCKED'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Locked Banks
            </button>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 sm:ml-auto font-mono">
            Showing {filteredBanks.length} of 112
          </div>
        </div>
      </div>

      {/* Vendor Filter Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          onClick={() => setSelectedVendor('ALL')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors border ${
            selectedVendor === 'ALL'
              ? 'border-blue-600 bg-blue-600 text-white font-semibold'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          All Vendors (112)
        </button>

        {VENDORS.map((v) => (
          <button
            key={v.id}
            onClick={() => setSelectedVendor(v.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors border ${
              selectedVendor === v.id
                ? 'border-blue-600 bg-blue-600 text-white font-semibold'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            {v.label} ({v.count})
          </button>
        ))}
      </div>

      {/* 112 Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBanks.map((bank) => {
          const sub = profile.subscriptions[bank.id];
          const isActive = sub && sub.status === 'ACTIVE';
          const isTrial = sub && sub.status === 'TRIAL';

          return (
            <div
              key={bank.id}
              className={`flex flex-col justify-between rounded-xl border p-5 transition-all ${
                isActive
                  ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-blue-500/50'
                  : 'border-slate-200 bg-slate-50/70 dark:border-slate-800/80 dark:bg-slate-950/60'
              }`}
            >
              <div>
                {/* Quiet Header Metadata (No Pills) */}
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{bank.vendor}</span>
                    <span>·</span>
                    <span>{bank.difficulty}</span>
                  </div>

                  {/* Entitlement Status Indicator */}
                  {isActive ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span>Web & Android Active</span>
                    </div>
                  ) : isTrial ? (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                      <span>Trial Active</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Lock className="h-3 w-3" />
                      <span>$29 or Pass</span>
                    </div>
                  )}
                </div>

                {/* Exam Title & Code */}
                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {bank.code}
                </h3>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
                  {bank.title}
                </div>

                {/* Description */}
                <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {bank.description}
                </p>

                {/* Metrics Line (Tabular figures, no pills) */}
                <div className="mt-4 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="tabular-nums font-semibold text-slate-900 dark:text-white">
                    {bank.questionsCount.toLocaleString()} Qs
                  </span>
                  <span>·</span>
                  <span className="tabular-nums">{bank.durationMinutes}m Timed</span>
                  <span>·</span>
                  <span className="tabular-nums">{bank.passRatePercent}% Pass</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-3">
                {isActive || isTrial ? (
                  <button
                    onClick={() => handleExamClick(bank)}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Launch Exam Simulator</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExamClick(bank)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Lock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Unlock Bank ($29)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredBanks.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Shield className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">No certification banks found</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search query or reset the vendor filter.
          </p>
          <button
            onClick={() => {
              setSelectedVendor('ALL');
              setSearchQuery('');
              setStatusFilter('ALL');
            }}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
