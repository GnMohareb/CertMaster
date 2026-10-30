import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { STUDY_SOURCE_DOCS, AUDIO_BRIEFINGS, FLASHCARD_DECK } from '../data/notebookData';
import { SourceDoc, AudioOverview, Flashcard } from '../types';
import {
  BookOpen,
  Headphones,
  CreditCard as CardIcon,
  Search,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles
} from 'lucide-react';

interface StudyMaterialsScreenProps {
  onNavigate?: (tab: string) => void;
}

export const StudyMaterialsScreen: React.FC<StudyMaterialsScreenProps> = ({ onNavigate }) => {
  const { activeExam } = useAuth();
  const [activeTab, setActiveTab] = useState<'GUIDES' | 'AUDIO' | 'FLASHCARDS'>('GUIDES');

  // Study Guides State
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>(STUDY_SOURCE_DOCS[0]?.id || '');

  // Audio Player State
  const [activeAudio, setActiveAudio] = useState<AudioOverview>(AUDIO_BRIEFINGS[0]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioPlaybackSeconds, setAudioPlaybackSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  // Flashcards State
  const [flashcards, setFlashcards] = useState<Flashcard[]>(FLASHCARD_DECK);
  const [currentFcIdx, setCurrentFcIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Audio Playback Timer Simulation & Web Speech Synthesis
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioPlaybackSeconds(prev => {
          if (prev >= activeAudio.durationSeconds) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingAudio, activeAudio]);

  const activeTurn = activeAudio.turns.slice().reverse().find(t => audioPlaybackSeconds >= t.timeSeconds) || activeAudio.turns[0];

  const handleToggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  const handleSeekAudio = (sec: number) => {
    setAudioPlaybackSeconds(sec);
  };

  const currentFlashcard = flashcards[currentFcIdx] || flashcards[0];

  const markFlashcard = (status: 'KNOWN' | 'NEEDS_REVIEW') => {
    setFlashcards(prev => {
      const copy = [...prev];
      copy[currentFcIdx] = {
        ...copy[currentFcIdx],
        status,
        boxLevel: status === 'KNOWN' ? Math.min(3, copy[currentFcIdx].boxLevel + 1) : 1
      };
      return copy;
    });
    setIsFlipped(false);
    if (currentFcIdx < flashcards.length - 1) {
      setCurrentFcIdx(currentFcIdx + 1);
    }
  };

  const knownCount = flashcards.filter(f => f.status === 'KNOWN').length;
  const reviewCount = flashcards.filter(f => f.status === 'NEEDS_REVIEW').length;
  const unreviewedCount = flashcards.length - knownCount - reviewCount;

  const filteredDocs = STUDY_SOURCE_DOCS.filter(d =>
    d.title.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
    d.domainName.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
    d.summary.toLowerCase().includes(searchDocQuery.toLowerCase())
  );

  const currentDoc = STUDY_SOURCE_DOCS.find(d => d.id === selectedDocId) || STUDY_SOURCE_DOCS[0];

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
          <span>Stage 2 of 5</span>
          <span>•</span>
          <span className="text-blue-400 font-bold">Authoritative Grounding & Active Recall</span>
        </div>
      </div>

      {/* NotebookLM Hub Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              NotebookLM Grounded Knowledge Hub
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Exam: {activeExam.shortCode}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">Study Guides, Audio Briefings & Active Recall</h1>
          <p className="text-xs text-slate-300">
            Source-grounded curriculum synthesized from authoritative NIST specifications, ISO standards, and official study guides.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab('GUIDES')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'GUIDES' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Study Guides</span>
          </button>
          <button
            onClick={() => setActiveTab('AUDIO')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'AUDIO' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Audio Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('FLASHCARDS')}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'FLASHCARDS' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3D Flashcards</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STUDY GUIDES & AUTHORITATIVE NOTES */}
      {activeTab === 'GUIDES' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Docs List */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search study guides & standards..."
                value={searchDocQuery}
                onChange={e => setSearchDocQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-2">
              {filteredDocs.map(doc => {
                const isSel = doc.id === currentDoc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                      isSel
                        ? 'border-blue-500 bg-blue-600/15 text-white'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-blue-400 uppercase">
                        {doc.domainName}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {doc.type}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-100 text-xs leading-snug line-clamp-2">
                      {doc.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{doc.summary}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Doc Reader & Key Takeaways */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-5">
            <div className="border-b border-slate-800 pb-4 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 text-xs font-bold">
                  {currentDoc.domainName}
                </span>
                <span className="text-xs text-slate-400">Standard: {currentDoc.authorOrStandard}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">{currentDoc.title}</h2>
              <p className="text-xs text-slate-300 italic">{currentDoc.summary}</p>
            </div>

            {/* Key Takeaways Box */}
            <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 text-xs space-y-2">
              <h4 className="font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5" /> High-Yield Exam Takeaways
              </h4>
              <ul className="space-y-1.5 text-slate-300 list-disc pl-4">
                {currentDoc.keyTakeaways.map((takeaway, i) => (
                  <li key={i} className="leading-relaxed">{takeaway}</li>
                ))}
              </ul>
            </div>

            {/* Markdown Content */}
            <div className="p-5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap">
              {currentDoc.fullContent}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MULTI-SPEAKER AUDIO OVERVIEWS (MAYA & LIAM) */}
      {activeTab === 'AUDIO' && (
        <div className="space-y-6">
          {/* Main Audio Player Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-indigo-400">
                    <Headphones className="w-7 h-7" />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    Deep Dive Podcast Series
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                    {activeAudio.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Co-hosted by {activeAudio.host1} & {activeAudio.host2}
                  </p>
                </div>
              </div>

              {/* Episode selector buttons */}
              <div className="flex items-center space-x-2">
                {AUDIO_BRIEFINGS.map(audio => (
                  <button
                    key={audio.id}
                    onClick={() => {
                      setActiveAudio(audio);
                      setAudioPlaybackSeconds(0);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      audio.id === activeAudio.id
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {audio.id === 'audio_deepdive_1' ? 'Models Briefing' : 'BIA Briefing'}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrub bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>
                  {Math.floor(audioPlaybackSeconds / 60)}:
                  {(audioPlaybackSeconds % 60).toString().padStart(2, '0')}
                </span>
                <span>
                  {Math.floor(activeAudio.durationSeconds / 60)}:
                  {(activeAudio.durationSeconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={activeAudio.durationSeconds}
                value={audioPlaybackSeconds}
                onChange={e => handleSeekAudio(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Playback Controls & Waveform Simulation */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleToggleAudio}
                  className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button
                  onClick={() => setAudioPlaybackSeconds(0)}
                  className="p-2.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Restart"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                  title="Toggle Mute"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Animated Equalizer Wave */}
              <div className="flex items-end space-x-1 h-8">
                {[12, 24, 18, 30, 16, 28, 20, 14, 26, 19].map((height, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-indigo-500 transition-all duration-200"
                    style={{
                      height: isPlayingAudio ? `${Math.min(32, height * (0.6 + Math.random() * 0.8))}px` : '4px',
                      opacity: isPlayingAudio ? 0.9 : 0.3
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Synchronized Transcript View */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Headphones className="w-4 h-4 text-indigo-400" />
              Live Interactive Audio Transcript ({activeAudio.turns.length} Dialogues)
            </h4>

            <div className="space-y-3">
              {activeAudio.turns.map((turn, idx) => {
                const isCurrentTurn = activeTurn.timeSeconds === turn.timeSeconds;
                const isHostMaya = turn.speaker.includes('Maya');

                return (
                  <div
                    key={idx}
                    onClick={() => handleSeekAudio(turn.timeSeconds)}
                    className={`p-4 rounded-xl border text-xs transition-all cursor-pointer ${
                      isCurrentTurn
                        ? 'border-indigo-500 bg-indigo-600/15 shadow-sm ring-1 ring-indigo-500/30'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`font-bold ${
                          isHostMaya ? 'text-cyan-400' : 'text-amber-400'
                        }`}
                      >
                        {turn.speaker}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {Math.floor(turn.timeSeconds / 60)}:
                        {(turn.timeSeconds % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <p className="leading-relaxed text-slate-200">{turn.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 3D FLASHCARDS ACTIVE RECALL */}
      {activeTab === 'FLASHCARDS' && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Deck Stats Bar */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-slate-200">
                Card {currentFcIdx + 1} of {flashcards.length}
              </span>
              <span className="text-slate-400 font-mono">
                Box Level {currentFlashcard.boxLevel}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> {knownCount} Known
              </span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> {reviewCount} Review
              </span>
            </div>
          </div>

          {/* 3D Flippable Card */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="perspective-1000 min-h-[320px] cursor-pointer select-none"
          >
            <div
              className={`relative w-full min-h-[320px] rounded-2xl transition-transform duration-500 transform-style-3d shadow-2xl ${
                isFlipped ? 'rotate-y-180' : ''
              }`}
            >
              {/* Front of Card */}
              <div className="absolute inset-0 backface-hidden p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border border-slate-700 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-blue-400 font-bold mb-4">
                    <span>{currentFlashcard.domainName}</span>
                    <span className="text-[10px] font-mono text-slate-400">TAP TO FLIP</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                    {currentFlashcard.frontPrompt}
                  </h3>
                </div>
                <div className="text-[11px] text-slate-400 font-mono pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span>Source: {currentFlashcard.sourceCitation}</span>
                  <span className="text-blue-400 font-bold">Question Side →</span>
                </div>
              </div>

              {/* Back of Card */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-indigo-500/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-indigo-400 font-bold mb-4">
                    <span>EXPLANATION & FORMULA</span>
                    <span className="text-[10px] font-mono text-emerald-400">RECALL ANSWER</span>
                  </div>
                  <p className="text-sm sm:text-base font-semibold text-slate-100 leading-relaxed whitespace-pre-line">
                    {currentFlashcard.backAnswer}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300">
                  Key Axiom: {currentFlashcard.keyFormulaOrRule}
                </div>
              </div>
            </div>
          </div>

          {/* Action rating buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => markFlashcard('NEEDS_REVIEW')}
              className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs border border-amber-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Needs Review (Reset to Box 1)</span>
            </button>
            <button
              onClick={() => markFlashcard('KNOWN')}
              className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mastered (Promote Box Level)</span>
            </button>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentFcIdx(Math.max(0, currentFcIdx - 1));
              }}
              disabled={currentFcIdx === 0}
              className="flex items-center space-x-1 disabled:opacity-40 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Card</span>
            </button>
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentFcIdx(Math.min(flashcards.length - 1, currentFcIdx + 1));
              }}
              disabled={currentFcIdx === flashcards.length - 1}
              className="flex items-center space-x-1 disabled:opacity-40 hover:text-white"
            >
              <span>Next Card</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
