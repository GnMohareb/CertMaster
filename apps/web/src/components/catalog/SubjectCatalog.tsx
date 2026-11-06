import React, { useState, useMemo } from 'react';
import { useCertMaster } from '../../context/CertMasterContext';
import { ALL_112_EXAM_BANKS, VENDORS } from '../../data/examBanks';
import {
  getQuestionsForExamId,
  getStudyGuidesForExamId,
  getAudioBriefingsForExamId,
  FULL_PREP_EXAM_IDS,
} from '../../data/multiExamQuestions';
import { VendorType, ExamBank } from '../../types/certmaster';
import {
  Search,
  Lock,
  Play,
  Sparkles,
  Shield,
  BookOpen,
  Headphones,
  Layers,
  CheckCircle2,
  Eye,
  Award,
  ArrowRight,
  Smartphone,
  Download,
} from 'lucide-react';

export const SubjectCatalog: React.FC = () => {
  const {
    profile,
    flashcards,
    readinessMap,
    setCheckoutExamId,
    startExamSession,
    activeSection,
    selectedCertId,
    setSelectedCertId,
    navigateTo,
    showToast,
  } = useCertMaster();

  const [selectedVendor, setSelectedVendor] = useState<VendorType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FULL_PREP' | 'ACTIVE' | 'LOCKED'>('ALL');

  const isMyCertificationsSection = activeSection === 'my-certifications';

  const filteredBanks = useMemo(() => {
    return ALL_112_EXAM_BANKS.filter((bank) => {
      if (selectedVendor !== 'ALL' && bank.vendor !== selectedVendor) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCode = bank.code.toLowerCase().includes(query);
        const matchesTitle = bank.title.toLowerCase().includes(query);
        const matchesVendor = bank.vendor.toLowerCase().includes(query);
        if (!matchesCode && !matchesTitle && !matchesVendor) return false;
      }

      const sub = profile.subscriptions[bank.id];
      const isActive = sub && (sub.status === 'ACTIVE' || sub.status === 'TRIAL');
      const hasInteractiveContent =
        bank.contentStatus === 'SAMPLE_CONTENT_AVAILABLE' ||
        bank.contentStatus === 'LIMITED_PREPARATION' ||
        bank.contentStatus === 'FULL_PREPARATION_AVAILABLE' ||
        bank.contentStatus === 'FULL_PREP' ||
        FULL_PREP_EXAM_IDS.has(bank.id);

      if (statusFilter === 'FULL_PREP' && !hasInteractiveContent) return false;
      if (statusFilter === 'ACTIVE' && !isActive) return false;
      if (statusFilter === 'LOCKED' && isActive) return false;

      return true;
    });
  }, [selectedVendor, searchQuery, statusFilter, profile.subscriptions]);

  const handleExamClick = (bank: ExamBank) => {
    const sub = profile.subscriptions[bank.id];
    const isUnlocked = sub && (sub.status === 'ACTIVE' || sub.status === 'TRIAL');
    const hasInteractiveContent =
      bank.contentStatus === 'SAMPLE_CONTENT_AVAILABLE' ||
      bank.contentStatus === 'LIMITED_PREPARATION' ||
      bank.contentStatus === 'FULL_PREPARATION_AVAILABLE' ||
      bank.contentStatus === 'FULL_PREP' ||
      FULL_PREP_EXAM_IDS.has(bank.id);

    if (!hasInteractiveContent) {
      showToast(
        `${bank.code} (${bank.title}) is a Catalog Preview (0 Qs · Blueprint Only). Select one of the 6 Sample-Content Certifications to launch live study and practice.`
      );
      return;
    }

    if (isUnlocked) {
      const genuineQuestions = getQuestionsForExamId(bank.id);
      setSelectedCertId(bank.id);
      startExamSession(bank.id, genuineQuestions, bank.durationMinutes, 'MOCK');
    } else {
      setCheckoutExamId(bank.id);
    }
  };

  // =========================================================================
  // MY CERTIFICATIONS WORKSPACE VIEW (#/my-certifications)
  // =========================================================================
  if (isMyCertificationsSection) {
    const enrolledBanks = ALL_112_EXAM_BANKS.filter((b) => {
      const sub = profile.subscriptions[b.id];
      return (
        FULL_PREP_EXAM_IDS.has(b.id) ||
        (sub && (sub.status === 'ACTIVE' || sub.status === 'TRIAL'))
      );
    });
    const activeBank =
      ALL_112_EXAM_BANKS.find((b) => b.id === selectedCertId) || ALL_112_EXAM_BANKS[0];
    const certQuestions = getQuestionsForExamId(activeBank.id);
    const certGuides = getStudyGuidesForExamId(activeBank.id);
    const certAudio = getAudioBriefingsForExamId(activeBank.id);
    const certCards = flashcards.filter((f) => (f.examId || 'cissp') === activeBank.id);
    const certReadiness = readinessMap[activeBank.id] || {
      readinessScore: 76,
      passProbability: 82,
      simulationsCompleted: 2,
      weakestDomain: certQuestions[0]?.domain || 'Core Domain Architecture',
    };

    return (
      <div className="space-y-6">
        {/* Enrolled Certifications Switcher Strip */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
                <Award className="h-4 w-4" />
                <span>My Enrolled Certifications & Full-Prep Tracks</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                Select Your Active Certification Workspace
              </h1>
            </div>
            <button
              onClick={() => navigateTo('catalog', 'all')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 shrink-0"
            >
              <span>Explore All 112 Certifications</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {enrolledBanks.map((bank) => {
              const isSelected = bank.id === activeBank.id;
              const sub = profile.subscriptions[bank.id];
              const bQuestions = getQuestionsForExamId(bank.id);
              return (
                <button
                  key={bank.id}
                  onClick={() => {
                    setSelectedCertId(bank.id);
                    navigateTo('my-certifications', 'overview', bank.id);
                  }}
                  className={`flex flex-col justify-between rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/30 dark:border-blue-500 dark:bg-blue-950/40'
                      : 'border-slate-200 bg-slate-50/60 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">
                        {bank.vendor}
                      </span>
                      <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        {sub?.status === 'TRIAL' ? 'TRIAL · SAMPLE BANK' : 'SAMPLE CONTENT ACTIVE'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {bank.code}
                    </h3>
                    <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1">
                      {bank.title}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>{bQuestions.length} Sample Scenario Qs</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {isSelected ? '● Active Track' : 'Switch Track →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Certification Workspace Detail */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                {activeBank.vendor} · {activeBank.difficulty} · Sample Content Available ({certQuestions.length} Qs, {certGuides.length} Guides, {certCards.length} Cards)
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {activeBank.code} — {activeBank.title}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                {activeBank.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() =>
                  startExamSession(
                    activeBank.id,
                    certQuestions,
                    activeBank.durationMinutes,
                    'MOCK'
                  )
                }
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Launch {activeBank.code} Mock Exam</span>
              </button>
              <button
                onClick={() => navigateTo('study', 'guides')}
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
                <span>Open Study Hub</span>
              </button>
            </div>
          </div>

          {/* Certification Resource Modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigateTo('study', 'guides')}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-blue-500 dark:border-slate-800 dark:bg-slate-950/50 transition-all"
            >
              <BookOpen className="h-5 w-5 text-emerald-500 mb-2" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {certGuides.length} Study Guides
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Domain reference summaries & official citations
              </p>
            </button>

            <button
              onClick={() => navigateTo('study', 'audio')}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-blue-500 dark:border-slate-800 dark:bg-slate-950/50 transition-all"
            >
              <Headphones className="h-5 w-5 text-blue-500 mb-2" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {certAudio.length} Audio Briefings
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Maya & Liam multi-speaker domain deep dives
              </p>
            </button>

            <button
              onClick={() => navigateTo('study', 'flashcards')}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-blue-500 dark:border-slate-800 dark:bg-slate-950/50 transition-all"
            >
              <Layers className="h-5 w-5 text-amber-500 mb-2" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {certCards.length} Active Flashcards
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Leitner Box 1–5 spaced repetition deck
              </p>
            </button>

            <button
              onClick={() => navigateTo('progress', 'readiness')}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left hover:border-blue-500 dark:border-slate-800 dark:bg-slate-950/50 transition-all"
            >
              <CheckCircle2 className="h-5 w-5 text-purple-500 mb-2" />
              <div className="text-sm font-bold text-slate-900 dark:text-white">
                {certReadiness.readinessScore}% Readiness
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Pass Probability: {certReadiness.passProbability}%
              </p>
            </button>
          </div>

          {/* Dedicated Mobile Companion App Funnel */}
          <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-white p-5 dark:border-blue-900/50 dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0 shadow-sm">
                  <Smartphone className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                      Dedicated Mobile Companion App
                    </span>
                    <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      50 FREE ASSESSMENT QUESTIONS
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    CertMaster {activeBank.code} for Android
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                    Practice on your phone with the dedicated {activeBank.code} mobile app. Includes 50 free diagnostic assessment questions. Sign in with your registered account ({profile.email}) to sync test results, readiness scores, and study plans seamlessly between this Web Portal and your phone.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    showToast(`Starting download: CertMaster ${activeBank.code} Android App`);
                  }}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Get {activeBank.code} Mobile App</span>
                </button>
                <button
                  onClick={() => setCheckoutExamId(activeBank.id)}
                  className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <span>Upgrade to Complete Pass</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // EXPLORE CERTIFICATIONS CATALOG VIEW (#/catalog)
  // =========================================================================
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <span>Universal Certification Registry</span>
              <span>·</span>
              <span>6 Sample-Content Tracks (33 Qs) + 106 Blueprint Previews (0 Qs)</span>
              <span>·</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                Evidence-Based Content Classification
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Explore 112 Enterprise Certifications
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
              Certifications are classified objectively by actual bundled content: <strong>Sample Content Available</strong> (5–8 verified scenario questions, study guides, flashcards, and audio briefings) vs. <strong>Catalog Preview</strong> (domain blueprint only, 0 questions). No certification claims a full 100+ question bank until populated.
            </p>
          </div>

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
              placeholder="Search 112 exams (e.g. CISSP, AWS, Security+, PMP, CISM, CEH)..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg dark:bg-slate-800/80 w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              All Certifications ({ALL_112_EXAM_BANKS.length})
            </button>
            <button
              onClick={() => setStatusFilter('FULL_PREP')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'FULL_PREP'
                  ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Sample Content Ready (6)
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'ACTIVE'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              My Unlocked Tracks
            </button>
            <button
              onClick={() => setStatusFilter('LOCKED')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                statusFilter === 'LOCKED'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Catalog Previews (106)
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
          const hasInteractiveContent =
            bank.contentStatus === 'SAMPLE_CONTENT_AVAILABLE' ||
            bank.contentStatus === 'LIMITED_PREPARATION' ||
            bank.contentStatus === 'FULL_PREPARATION_AVAILABLE' ||
            bank.contentStatus === 'FULL_PREP' ||
            FULL_PREP_EXAM_IDS.has(bank.id);

          return (
            <div
              key={bank.id}
              className={`flex flex-col justify-between rounded-xl border p-5 transition-all ${
                hasInteractiveContent
                  ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-blue-500/60 shadow-sm'
                  : 'border-slate-200 bg-slate-50/70 dark:border-slate-800/80 dark:bg-slate-950/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {bank.vendor}
                    </span>
                    <span>·</span>
                    <span>{bank.difficulty}</span>
                  </div>

                  {/* Evidence-Based Content Status Badge */}
                  {hasInteractiveContent ? (
                    <span
                      title={`Status: ${bank.contentStatus} (${bank.questionsCount} questions, ${bank.studyGuidesCount || 0} guides, ${bank.flashcardsCount || 0} flashcards)`}
                      className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300"
                    >
                      Sample Content ({bank.questionsCount} Qs)
                    </span>
                  ) : (
                    <span
                      title="Status: CATALOG_PREVIEW (Domain blueprint only, 0 questions bundled)"
                      className="rounded-md bg-slate-200/80 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    >
                      Catalog Preview (0 Qs)
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {bank.code}
                </h3>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-1">
                  {bank.title}
                </div>

                <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {bank.description}
                </p>

                <div className="mt-4 flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono pt-3 border-t border-slate-200 dark:border-slate-800">
                  <span className="tabular-nums font-semibold text-slate-900 dark:text-white">
                    {hasInteractiveContent
                      ? `${bank.questionsCount} Qs · ${bank.studyGuidesCount || 0} Guides`
                      : `0 Qs · ${bank.domains.length} Domains`}
                  </span>
                  <span>·</span>
                  <span className="tabular-nums">{bank.durationMinutes}m Spec</span>
                  <span>·</span>
                  <span className="tabular-nums">{bank.passRatePercent}% Pass</span>
                </div>
              </div>

              <div className="mt-5 pt-3">
                {!hasInteractiveContent ? (
                  <button
                    onClick={() => handleExamClick(bank)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Blueprint Preview Only</span>
                  </button>
                ) : isActive || isTrial ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSelectedCertId(bank.id);
                        navigateTo('my-certifications', 'overview', bank.id);
                      }}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Study Hub</span>
                    </button>
                    <button
                      onClick={() => handleExamClick(bank)}
                      className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Start Exam</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleExamClick(bank)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                    <span>Unlock Full Prep ($29)</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBanks.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Shield className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
            No certification banks found
          </h3>
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
