import React, { useState, useEffect, useRef } from 'react';
import { useCertMaster } from '../../context/CertMasterContext';
import {
  getStudyGuidesForExamId,
  getAudioBriefingsForExamId,
} from '../../data/multiExamQuestions';
import { ALL_112_EXAM_BANKS } from '../../data/examBanks';
import {
  BookOpen,
  Headphones,
  Layers,
  Search,
  Play,
  Pause,
  Check,
  AlertCircle,
  Volume2,
  VolumeX,
  Sparkles,
  FileText,
  Plus,
  Bot,
  Send,
  Calendar,
  Target,
  CheckCircle2,
} from 'lucide-react';

type StudyTabType = 'guides' | 'audio' | 'flashcards' | 'notes' | 'plan' | 'ai-tutor';

export const StudyNotebookHub: React.FC = () => {
  const {
    flashcards,
    updateFlashcardState,
    customSources,
    addCustomSource,
    studyPlan,
    updateStudyPlan,
    selectedCertId,
    activeSubTab,
    navigateTo,
    aiTutorMessages,
    isTutorLoading,
    sendAITutorMessage,
    showToast,
  } = useCertMaster();

  const resolvedTab: StudyTabType = (
    ['guides', 'audio', 'flashcards', 'notes', 'plan', 'ai-tutor'].includes(activeSubTab)
      ? activeSubTab
      : 'guides'
  ) as StudyTabType;

  const activeBank =
    ALL_112_EXAM_BANKS.find((b) => b.id === selectedCertId) || ALL_112_EXAM_BANKS[0];

  const certGuides = getStudyGuidesForExamId(selectedCertId);
  const certAudio = getAudioBriefingsForExamId(selectedCertId);
  const certCards = flashcards.filter((fc) => (fc.examId || 'cissp') === selectedCertId);
  const certNotes = customSources.filter((s) => (s.examId || 'cissp') === selectedCertId);

  const [guideSearch, setGuideSearch] = useState('');
  const [selectedGuideId, setSelectedGuideId] = useState<string>(certGuides[0]?.id || '');

  // Audio player state for Maya & Liam
  const [selectedAudioId, setSelectedAudioId] = useState<string>(certAudio[0]?.id || '');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeDialogueIndex, setActiveDialogueIndex] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cardDomainFilter, setCardDomainFilter] = useState('ALL');

  // Personal Study Notes form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteDomain, setNoteDomain] = useState(certGuides[0]?.domain || 'Security & Risk Management');
  const [noteContent, setNoteContent] = useState('');

  // Study Plan form state
  const [planTargetDate, setPlanTargetDate] = useState(studyPlan.targetDate || '2026-12-15');
  const [planWeeklyHours, setPlanWeeklyHours] = useState(studyPlan.weeklyHours || 12);

  // AI Tutor input state
  const [tutorQuery, setTutorQuery] = useState('');

  // Sync selected guide/audio when certification changes
  useEffect(() => {
    setSelectedGuideId(certGuides[0]?.id || '');
    setSelectedAudioId(certAudio[0]?.id || '');
    setCurrentCardIndex(0);
    setIsCardFlipped(false);
    setCardDomainFilter('ALL');
    setIsPlayingAudio(false);
  }, [selectedCertId]);

  const activeAudio = certAudio.find((b) => b.id === selectedAudioId) || certAudio[0];
  const activeGuide = certGuides.find((g) => g.id === selectedGuideId) || certGuides[0];

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const availableDomains = Array.from(new Set(certCards.map((c) => c.domain)));

  const filteredCards = certCards.filter((fc) => {
    if (cardDomainFilter === 'ALL') return true;
    return fc.domain === cardDomainFilter;
  });

  const currentCard = filteredCards[currentCardIndex] || filteredCards[0];

  // Audio Playback Engine (Web Speech API)
  useEffect(() => {
    if (!isPlayingAudio || !activeAudio) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }

    if (!('speechSynthesis' in window)) {
      showToast('Speech synthesis not supported in this browser; running transcript visualizer');
      return;
    }

    const currentTurn = activeAudio.dialogue[activeDialogueIndex];
    if (!currentTurn) {
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    if (!isAudioMuted) {
      const u = new SpeechSynthesisUtterance(currentTurn.text);
      u.rate = playbackSpeed;
      u.pitch = currentTurn.speaker === 'Maya' ? 1.15 : 0.85;

      u.onend = () => {
        if (activeDialogueIndex < activeAudio.dialogue.length - 1) {
          setActiveDialogueIndex((prev) => prev + 1);
        } else {
          setIsPlayingAudio(false);
          setActiveDialogueIndex(0);
        }
      };

      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
    } else {
      const timer = setTimeout(() => {
        if (activeDialogueIndex < activeAudio.dialogue.length - 1) {
          setActiveDialogueIndex((prev) => prev + 1);
        } else {
          setIsPlayingAudio(false);
        }
      }, 5000 / playbackSpeed);
      return () => clearTimeout(timer);
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isPlayingAudio, activeDialogueIndex, selectedAudioId, playbackSpeed, isAudioMuted, activeAudio]);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;
    await addCustomSource({
      examId: selectedCertId,
      domainId: 'd1',
      domainName: noteDomain,
      authorOrStandard: 'Personal Learner Note',
      title: noteTitle.trim(),
      type: 'CHEAT_SHEET',
      keyTakeaways: [noteContent.trim().slice(0, 120)],
      fullContent: noteContent.trim(),
      summary: noteContent.trim().slice(0, 140),
    });
    setNoteTitle('');
    setNoteContent('');
  };

  return (
    <div className="space-y-6">
      {/* Top Section Nav Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Active Track: {activeBank.code} · Study & Active Recall Hub</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {activeBank.title} — Study Materials & AI Tutor
            </h1>
          </div>

          {/* 6 Learner-Centered Study Sub-Tabs */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg dark:bg-slate-800">
            {[
              { id: 'guides', label: 'Study Guides', icon: BookOpen, color: 'text-emerald-500' },
              { id: 'audio', label: 'Audio Lessons', icon: Headphones, color: 'text-blue-500' },
              { id: 'flashcards', label: 'Flashcards', icon: Layers, color: 'text-amber-500' },
              { id: 'notes', label: 'Personal Notes', icon: FileText, color: 'text-indigo-500' },
              { id: 'plan', label: '5-Stage Plan', icon: Target, color: 'text-rose-500' },
              { id: 'ai-tutor', label: 'AI Exam Tutor', icon: Bot, color: 'text-purple-500' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = resolvedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => navigateTo('study', tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* SECTION 1: STUDY GUIDES */}
      {resolvedTab === 'guides' && activeGuide && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={guideSearch}
                onChange={(e) => setGuideSearch(e.target.value)}
                placeholder={`Search ${activeBank.code} study guides...`}
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>

            <div className="space-y-2">
              {certGuides
                .filter(
                  (g) =>
                    !guideSearch.trim() ||
                    g.title.toLowerCase().includes(guideSearch.toLowerCase()) ||
                    g.domain.toLowerCase().includes(guideSearch.toLowerCase())
                )
                .map((guide) => (
                  <button
                    key={guide.id}
                    onClick={() => setSelectedGuideId(guide.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      activeGuide.id === guide.id
                        ? 'border-blue-600 bg-blue-50/60 dark:border-blue-500 dark:bg-blue-950/40 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span>{guide.domain}</span>
                      <span className="font-mono">{guide.readTimeMin}m read</span>
                    </div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                      {guide.title}
                    </div>
                  </button>
                ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                <span>{activeGuide.domain}</span>
                <span className="font-mono">Reference: {activeGuide.officialReference}</span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {activeGuide.title}
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                {activeGuide.summary}
              </p>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeGuide.content.map((block, i) => (
                  <div key={i} className="whitespace-pre-line">
                    {block}
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <div className="text-xs font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">
                  High-Yield Exam Takeaways
                </div>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {activeGuide.keyTakeaways.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-500 font-bold">·</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: AUDIO LESSONS (Maya & Liam) */}
      {resolvedTab === 'audio' && activeAudio && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              {activeBank.code} Audio Briefings ({certAudio.length})
            </h3>
            {certAudio.map((briefing) => (
              <button
                key={briefing.id}
                onClick={() => {
                  setSelectedAudioId(briefing.id);
                  setActiveDialogueIndex(0);
                  setIsPlayingAudio(false);
                }}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  activeAudio.id === briefing.id
                    ? 'border-blue-600 bg-blue-50/60 dark:border-blue-500 dark:bg-blue-950/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                  <span>{briefing.domain}</span>
                  <span className="font-mono">{briefing.durationFormatted}</span>
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2">
                  {briefing.title}
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                  <Headphones className="h-3 w-3" />
                  <span>Hosted by Maya & Liam</span>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    {activeAudio.domain}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeAudio.title}
                  </h2>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setPlaybackSpeed((s) => (s === 1 ? 1.25 : s === 1.25 ? 1.5 : 1))}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-mono font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {playbackSpeed}x
                  </button>

                  <button
                    onClick={() => setIsAudioMuted((m) => !m)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {isAudioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={() => setIsPlayingAudio((prev) => !prev)}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="h-4 w-4" />
                        <span>Pause Audio</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 fill-current" />
                        <span>Play Briefing</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-3 mt-4 max-h-96 overflow-y-auto pr-1">
                {activeAudio.dialogue.map((turn, idx) => {
                  const isActive = idx === activeDialogueIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveDialogueIndex(idx);
                        setIsPlayingAudio(true);
                      }}
                      className={`cursor-pointer rounded-lg p-3.5 transition-all border ${
                        isActive
                          ? 'border-blue-500 bg-blue-50/80 dark:border-blue-500 dark:bg-blue-950/40 shadow-sm'
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span
                          className={
                            turn.speaker === 'Maya'
                              ? 'text-purple-600 dark:text-purple-400'
                              : 'text-blue-600 dark:text-blue-400'
                          }
                        >
                          {turn.speaker} (
                          {turn.speaker === 'Maya' ? 'Chief Security Strategist' : 'Lead Systems Architect'}
                          )
                        </span>
                        <span className="font-mono text-[11px] text-slate-400">
                          {Math.floor(turn.timestampSec / 60)}:
                          {(turn.timestampSec % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <p
                        className={`text-xs sm:text-sm leading-relaxed ${
                          isActive
                            ? 'text-slate-900 font-medium dark:text-white'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {turn.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: 3D FLASHCARD ACTIVE RECALL (WITH LEITNER BOX 1-5) */}
      {resolvedTab === 'flashcards' && currentCard && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              {activeBank.code} Card {currentCardIndex + 1} of {filteredCards.length} · Leitner Box{' '}
              <strong className="text-blue-600 dark:text-blue-400">
                {currentCard.boxLevel || (currentCard.state === 'known' ? 4 : currentCard.state === 'needs_review' ? 2 : 1)} / 5
              </strong>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Filter Domain:</span>
              <select
                value={cardDomainFilter}
                onChange={(e) => {
                  setCardDomainFilter(e.target.value);
                  setCurrentCardIndex(0);
                  setIsCardFlipped(false);
                }}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Domains ({certCards.length})</option>
                {availableDomains.map((dom) => (
                  <option key={dom} value={dom}>
                    {dom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            onClick={() => setIsCardFlipped((f) => !f)}
            className="cursor-pointer min-h-[280px] rounded-xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 shadow-md transition-all flex flex-col justify-between hover:border-blue-500 select-none"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {currentCard.domain}
                </span>
                <span className="font-mono text-[11px]">
                  {isCardFlipped ? 'REVERSE (EXPLANATION)' : 'FRONT (QUESTION)'}
                </span>
              </div>

              {!isCardFlipped ? (
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
                    {currentCard.front}
                  </h3>
                  <div className="mt-8 text-xs text-slate-400 text-center">
                    Tap to reveal answer & citation
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                    {currentCard.back}
                  </div>
                  <div className="mt-6 text-[11px] text-slate-400 font-mono">
                    Official Reference: {currentCard.reference}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span>
                Status:{' '}
                <strong className="text-slate-700 dark:text-slate-300 capitalize">
                  {currentCard.state.replace('_', ' ')}
                </strong>
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Tap to flip ↺</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                updateFlashcardState(currentCard.id, 'needs_review');
                setIsCardFlipped(false);
                setCurrentCardIndex((idx) => (idx + 1) % filteredCards.length);
                showToast('Marked as: Needs Review (Leitner Box 2 · Synced to Android)');
              }}
              className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
            >
              <AlertCircle className="h-4 w-4" />
              <span>Needs Review (Box 2)</span>
            </button>

            <button
              onClick={() => {
                updateFlashcardState(currentCard.id, 'known');
                setIsCardFlipped(false);
                setCurrentCardIndex((idx) => (idx + 1) % filteredCards.length);
                showToast('Marked as: Known (Leitner Box 4 · Synced to Android)');
              }}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
            >
              <Check className="h-4 w-4" />
              <span>I Know This (Box 4)</span>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 4: PERSONAL STUDY NOTES (PARITY WITH ANDROID VAULT) */}
      {resolvedTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleCreateNote}
            className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
              <Plus className="h-4 w-4" />
              <span>Create Custom Study Note ({activeBank.code})</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Note Title
              </label>
              <input
                type="text"
                required
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g. Kerberos AS/TGS Ticket Exchange Flow"
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Domain / Topic
              </label>
              <input
                type="text"
                value={noteDomain}
                onChange={(e) => setNoteDomain(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Study Note Content
              </label>
              <textarea
                rows={5}
                required
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write key formulas, mnemonics, or exam trap notes here..."
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Save & Sync to Android Study Vault</span>
            </button>
          </form>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Saved Personal Study Notes for {activeBank.code} ({certNotes.length})
            </h3>
            {certNotes.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                <FileText className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No personal notes added for {activeBank.code} yet. Create a note on the left to sync across Web and Android.
                </p>
              </div>
            ) : (
              certNotes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {note.domainName}
                    </span>
                    <span className="font-mono">{note.type}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{note.title}</h4>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {note.fullContent}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 5: 5-STAGE STUDY PLAN EDITOR */}
      {resolvedTab === 'plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400">
              <Calendar className="h-4 w-4" />
              <span>Schedule & Weekly Commitment</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Exam Date
              </label>
              <input
                type="date"
                value={planTargetDate}
                onChange={(e) => setPlanTargetDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Weekly Study Hours ({planWeeklyHours} hrs/week)
              </label>
              <input
                type="range"
                min={2}
                max={40}
                value={planWeeklyHours}
                onChange={(e) => setPlanWeeklyHours(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={() =>
                updateStudyPlan({
                  targetDate: planTargetDate,
                  weeklyHours: planWeeklyHours,
                })
              }
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm"
            >
              Save & Sync Study Plan
            </button>
          </div>

          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              5-Stage Mastery Milestones ({activeBank.code})
            </h3>
            {(studyPlan.milestones || []).map((m) => {
              const isDone = m.status === 'COMPLETED';
              return (
                <div
                  key={m.stage}
                  className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-4 text-xs dark:border-slate-800"
                >
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 mt-0.5 ${
                        isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                      }`}
                    />
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{m.stageName}</div>
                      <div className="text-slate-500 dark:text-slate-400 mt-0.5">{m.description}</div>
                    </div>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {isDone ? 'COMPLETED' : 'ACTIVE'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 6: GROUNDED AI EXAM TUTOR */}
      {resolvedTab === 'ai-tutor' && (
        <div className="max-w-4xl mx-auto rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Grounded AI Exam Tutor ({activeBank.code})
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Answers grounded in your official study guides, question bank explanations, and NIST/ISO/AWS references.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {aiTutorMessages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'ml-auto max-w-xl bg-blue-600 text-white font-medium'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 dark:bg-slate-950/60 dark:border-slate-800 dark:text-slate-200'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {msg.citations.map((c, i) => (
                      <span
                        key={i}
                        className="rounded bg-white px-2 py-0.5 border border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                      >
                        Source: {c.title} ({c.authority})
                      </span>
                    ))}
                  </div>
                )}
                {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => sendAITutorMessage(q)}
                        className="rounded-lg border border-purple-300 bg-purple-50 px-2.5 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!tutorQuery.trim()) return;
              sendAITutorMessage(tutorQuery);
              setTutorQuery('');
            }}
            className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800"
          >
            <input
              type="text"
              value={tutorQuery}
              onChange={(e) => setTutorQuery(e.target.value)}
              placeholder={`Ask the ${activeBank.code} AI Tutor about any concept, formula, or exam scenario...`}
              className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <button
              type="submit"
              disabled={isTutorLoading}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{isTutorLoading ? 'Thinking...' : 'Ask Tutor'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
