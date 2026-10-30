import React, { useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  X,
  Download,
  Share2,
  Printer,
  Sparkles,
  ExternalLink,
  Smartphone
} from 'lucide-react';

interface ReadinessCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadinessCertificateModal: React.FC<ReadinessCertificateModalProps> = ({
  isOpen,
  onClose
}) => {
  const { userProfile, activeExam, showToast } = useAuth();
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const issueDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const certNumber = `CM-VERIFIED-${userProfile.userId.toUpperCase().slice(-8)}-${activeExam.shortCode.replace(/[^a-zA-Z0-9]/g, '')}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `I am verified exam-ready for ${activeExam.title} on CertMaster with an ${userProfile.assessmentScorePercent}% benchmark score! Verification ID: ${certNumber}`
      );
      showToast('📋 Certificate verification link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">CertMaster Readiness Verification</h3>
              <p className="text-[11px] text-slate-400">First-Time Pass Guarantee Entitlement</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Share verification credential"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas / Render Body */}
        <div className="p-6 sm:p-8 bg-slate-950" ref={certRef}>
          <div className="relative border-4 border-double border-amber-500/40 rounded-2xl p-6 sm:p-10 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/70 text-center space-y-6 shadow-inner overflow-hidden">
            {/* Watermark Crest */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <ShieldCheck className="w-96 h-96 text-white" />
            </div>

            {/* Corner Decorative Elements */}
            <div className="absolute top-2 left-2 text-amber-500/30 text-xs font-serif">✦</div>
            <div className="absolute top-2 right-2 text-amber-500/30 text-xs font-serif">✦</div>
            <div className="absolute bottom-2 left-2 text-amber-500/30 text-xs font-serif">✦</div>
            <div className="absolute bottom-2 right-2 text-amber-500/30 text-xs font-serif">✦</div>

            {/* Top Brand & Badge */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[11px] font-bold text-amber-400 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pass Guarantee Verification</span>
              </div>
              <h2 className="text-xs uppercase tracking-widest text-slate-400 font-mono mt-2">
                CertMaster Cloud Learning Platform
              </h2>
            </div>

            {/* Main Certificate Title */}
            <div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-wide">
                Certificate of Exam Readiness
              </h1>
              <p className="text-xs text-slate-400 italic mt-1 font-serif">
                This credential officially verifies that the candidate has mastered core domains and behavioral stress calibration
              </p>
            </div>

            {/* Student Name */}
            <div className="py-2 border-y border-slate-800/80 max-w-md mx-auto">
              <p className="text-xs uppercase text-slate-400 tracking-wider">Awarded To</p>
              <h3 className="text-xl sm:text-2xl font-bold text-amber-300 tracking-tight mt-0.5">
                {userProfile.displayName}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">{userProfile.email}</p>
            </div>

            {/* Certification Details */}
            <div className="space-y-2">
              <p className="text-xs text-slate-300">
                Having successfully completed all 5 stages of the mastery roadmap for:
              </p>
              <div className="inline-block px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30">
                <span className="text-base sm:text-lg font-extrabold text-blue-300">
                  {activeExam.title} ({activeExam.shortCode})
                </span>
                <p className="text-[11px] text-slate-400">Vendor: {activeExam.vendor}</p>
              </div>
            </div>

            {/* Performance Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-left">
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Overall Readiness</span>
                <strong className="text-sm font-bold text-emerald-400">
                  {userProfile.assessmentScorePercent}%
                </strong>
                <span className="text-[9px] text-slate-500 block">Benchmark: 70%</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Cognitive Stress</span>
                <strong className="text-sm font-bold text-amber-400">
                  {userProfile.cognitiveStressBaseline}/100
                </strong>
                <span className="text-[9px] text-slate-500 block">Low Oscillation</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Behavior Archetype</span>
                <strong className="text-xs font-bold text-blue-300 truncate block">
                  {userProfile.behavioralArchetype}
                </strong>
                <span className="text-[9px] text-slate-500 block">Telemetry Calibrated</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Android Synced</span>
                <strong className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5" />
                  Offline Ready
                </strong>
                <span className="text-[9px] text-slate-500 block">Pixel 8 Pro</span>
              </div>
            </div>

            {/* Signatures & Seal */}
            <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="text-left space-y-0.5">
                <p className="font-bold text-slate-300">Dr. Elena Rostova, CISSP, CISM</p>
                <p className="text-[10px] text-slate-500">Chief Behavioral Learning Architect</p>
              </div>

              {/* Gold Seal Graphic */}
              <div className="w-16 h-16 rounded-full border-2 border-amber-400/80 bg-gradient-to-tr from-amber-500/20 to-yellow-300/30 flex flex-col items-center justify-center text-amber-300 shadow-lg shadow-amber-500/10">
                <Award className="w-6 h-6" />
                <span className="text-[8px] font-black uppercase tracking-wider">VERIFIED</span>
              </div>

              <div className="text-right space-y-0.5">
                <p className="font-mono text-slate-400 text-[11px]">{issueDate}</p>
                <p className="font-mono text-[9px] text-slate-500 truncate max-w-[180px]">{certNumber}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-slate-900 border-t border-slate-800 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Guaranteed Pass: Eligible for 100% exam fee reimbursement if unpassed.</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors cursor-pointer"
            >
              Return to Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
