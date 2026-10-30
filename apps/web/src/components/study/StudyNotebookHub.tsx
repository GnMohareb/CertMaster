import React, { useState, useEffect, useRef } from 'react';
import { useCertMaster } from '../../context/CertMasterContext';
import { STUDY_GUIDES, AUDIO_BRIEFINGS } from '../../data/studyMaterials';
import { CISSP_DOMAINS } from '../../data/examBanks';
import {
  BookOpen,
  Headphones,
  Layers,
  Search,
  Play,
  Pause,
  RotateCw,
  Check,
  AlertCircle,
  HelpCircle,
  Volume2,
  VolumeX,
  FastForward,
  Sparkles,
} from 'lucide-react';

export const StudyNotebookHub: React.FC = () => {
  const { flashcards, updateFlashcardState, showToast } = useCertMaster();

  const [activeSection, setActiveSection] = useState<'guides' | 'audio' | 'flashcards'>('audio');
  const [guideSearch, setGuideSearch] = useState('');
  const [selectedGuideId, setSelectedGuideId] = useState<string>(STUDY_GUIDES[0].id);

  // Audio player state for Maya & Liam
  const [selectedAudioId, setSelectedAudioId] = useState<string>(AUDIO_BRIEFINGS[0].id);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgressSec, setAudioProgressSec] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeDialogueIndex, setActiveDialogueIndex] = useState(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cardDomainFilter, setCardDomainFilter] = useState('ALL');

  const activeAudio = AUDIO_BRIEFINGS.find((b) => b.id === selectedAudioId) || AUDIO_BRIEFINGS[0];
  const activeGuide = STUDY_GUIDES.find((g) => g.id === selectedGuideId) || STUDY_GUIDES[0];

  // Speech synthesis ref for real multi-speaker playback
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Filter flashcards
  const filteredCards = flashcards.filter((fc) => {
    if (cardDomainFilter === 'ALL') return true;
    return fc.domain === cardDomainFilter;
  });

  const currentCard = filteredCards[currentCardIndex] || filteredCards[0];

  // Audio Playback Engine (using Web Speech API with pitch modulation for Maya vs Liam)
  useEffect(() => {
    if (!isPlayingAudio) {
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
      // Pitch modulation: Maya (1.15 slightly higher feminine pitch), Liam (0.85 deeper masculine baritone)
      u.pitch = currentTurn.speaker === 'Maya' ? 1.15 : 0.85;

      u.onend = () => {
        if (activeDialogueIndex < activeAudio.dialogue.length - 1) {
          setActiveDialogueIndex((prev) => prev + 1);
          setAudioProgressSec(activeAudio.dialogue[activeDialogueIndex + 1]?.timestampSec || 0);
        } else {
          setIsPlayingAudio(false);
          setActiveDialogueIndex(0);
          setAudioProgressSec(0);
        }
      };

      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
    } else {
      // If muted, advance on timer
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
  }, [isPlayingAudio, activeDialogueIndex, selectedAudioId, playbackSpeed, isAudioMuted]);

  const toggleAudioPlay = () => {
    setIsPlayingAudio((prev) => !prev);
  };

  const jumpToAudioTurn = (idx: number) => {
    setActiveDialogueIndex(idx);
    setAudioProgressSec(activeAudio.dialogue[idx].timestampSec);
    setIsPlayingAudio(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Section Nav Tabs */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">
              <Sparkles className="h-4 w-4" />
              <span>NotebookLM Synthesis & Active Recall</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Authoritative Study Materials & Audio Overviews
            </h1>
          </div>

          {/* Section Switcher Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg dark:bg-slate-800">
            <button
              onClick={() => setActiveSection('audio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeSection === 'audio'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Headphones className="h-3.5 w-3.5 text-blue-500" />
              <span>Audio Overviews</span>
            </button>

            <button
              onClick={() => setActiveSection('guides')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeSection === 'guides'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-emerald-500" />
              <span>Study Guides</span>
            </button>

            <button
              onClick={() => setActiveSection('flashcards')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeSection === 'flashcards'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Layers className="h-3.5 w-3.5 text-amber-500" />
              <span>3D Recall Flashcards</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: AUDIO OVERVIEWS (Maya & Liam) */}
      {activeSection === 'audio' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Audio Playlist Selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
              Available Audio Briefings
            </h3>
            {AUDIO_BRIEFINGS.map((briefing) => (
              <button
                key={briefing.id}
                onClick={() => {
                  setSelectedAudioId(briefing.id);
                  setActiveDialogueIndex(0);
                  setIsPlayingAudio(false);
                }}
                className={`w-full rounded-xl border p-4 text-left transition-all ${
                  selectedAudioId === briefing.id
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

          {/* Active Audio Player & Synced Dialogue Transcript */}
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

                {/* Audio Controls */}
                <div className="flex items-center gap-2.5">
                  {/* Speed toggle */}
                  <button
                    onClick={() => setPlaybackSpeed((s) => (s === 1 ? 1.25 : s === 1.25 ? 1.5 : 1))}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-mono font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {playbackSpeed}x
                  </button>

                  {/* Mute toggle */}
                  <button
                    onClick={() => setIsAudioMuted((m) => !m)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {isAudioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>

                  {/* Play / Pause button */}
                  <button
                    onClick={toggleAudioPlay}
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

              {/* Animated Waveform Indicator */}
              <div className="my-4 flex items-center justify-center gap-1 h-8 px-4 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-100 dark:border-slate-800">
                {[...Array(24)].map((_, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-200 ${
                      isPlayingAudio
                        ? 'animate-pulse'
                        : 'opacity-40'
                    }`}
                    style={{
                      height: isPlayingAudio
                        ? `${Math.max(6, (Math.sin(i * 0.8 + activeDialogueIndex) + 1) * 14)}px`
                        : '6px',
                    }}
                  ></span>
                ))}
              </div>

              {/* Dialogue Transcript Stream */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {activeAudio.dialogue.map((turn, idx) => {
                  const isActive = idx === activeDialogueIndex;

                  return (
                    <div
                      key={idx}
                      onClick={() => jumpToAudioTurn(idx)}
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

      {/* SECTION 2: STUDY GUIDES & NOTES */}
      {activeSection === 'guides' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Guide Search & List */}
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={guideSearch}
                onChange={(e) => setGuideSearch(e.target.value)}
                placeholder="Search notes (e.g. Biba, Kerberos)..."
                className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>

            <div className="space-y-2">
              {STUDY_GUIDES.filter(
                (g) =>
                  !guideSearch.trim() ||
                  g.title.toLowerCase().includes(guideSearch.toLowerCase()) ||
                  g.domain.toLowerCase().includes(guideSearch.toLowerCase())
              ).map((guide) => (
                <button
                  key={guide.id}
                  onClick={() => setSelectedGuideId(guide.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    selectedGuideId === guide.id
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

          {/* Guide Content Reader */}
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

              {/* Markdown Content Blocks */}
              <div className="space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {activeGuide.content.map((block, i) => (
                  <div key={i} className="whitespace-pre-line">
                    {block}
                  </div>
                ))}
              </div>

              {/* Key Takeaways */}
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

      {/* SECTION 3: 3D FLASHCARD ACTIVE RECALL */}
      {activeSection === 'flashcards' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Domain Filter */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Card {currentCardIndex + 1} of {filteredCards.length}
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
                <option value="ALL">All Domains</option>
                {CISSP_DOMAINS.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3D Interactive Flippable Card */}
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
              <span>Status: <strong className="text-slate-700 dark:text-slate-300 capitalize">{currentCard.state}</strong></span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Tap to flip ↺</span>
            </div>
          </div>

          {/* Spaced-Repetition Feedback Buttons */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                updateFlashcardState(currentCard.id, 'needs_review');
                setIsCardFlipped(false);
                setCurrentCardIndex((idx) => (idx + 1) % filteredCards.length);
                showToast('Marked as: Needs Review (Prioritized for next round)');
              }}
              className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
            >
              <AlertCircle className="h-4 w-4" />
              <span>Needs Review</span>
            </button>

            <button
              onClick={() => {
                updateFlashcardState(currentCard.id, 'known');
                setIsCardFlipped(false);
                setCurrentCardIndex((idx) => (idx + 1) % filteredCards.length);
                showToast('Marked as: Known (Spaced interval increased)');
              }}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
            >
              <Check className="h-4 w-4" />
              <span>I Know This</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
