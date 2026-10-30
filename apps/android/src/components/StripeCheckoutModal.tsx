import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getExamById } from '../data/catalog112';
import {
  X,
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  Globe,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedExamId?: string;
  isAllAccess?: boolean;
}

export const StripeCheckoutModal: React.FC<StripeCheckoutModalProps> = ({
  isOpen,
  onClose,
  selectedExamId,
  isAllAccess = false
}) => {
  const { subscribeToExam, purchaseAllAccess } = useAuth();

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [cardHolder, setCardHolder] = useState('GN Mohareb');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const targetExam = selectedExamId ? getExamById(selectedExamId) : null;
  const isMulti = isAllAccess || !targetExam;
  const price = isMulti ? '$99.00' : '$29.00';
  const title = isMulti
    ? 'Universal All-Access Multi-Pass'
    : `${targetExam?.shortCode} Exam Bank Access`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      if (isMulti) {
        await purchaseAllAccess();
      } else if (selectedExamId) {
        await subscribeToExam(selectedExamId);
      }
      setIsSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        setIsSuccess(false);
        setIsProcessing(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Stripe Secure Checkout</h3>
              <p className="text-[11px] text-slate-400">256-bit TLS Encrypted Transaction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-white">Subscription Active!</h3>
            <p className="text-xs text-slate-300 max-w-xs mx-auto">
              Your entitlement has been authorized. Instant cross-platform access has been pushed to both Web and your CertMaster Android app.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            {/* Plan Summary Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  Selected Entitlement
                </span>
                <h4 className="text-sm font-bold text-white">{title}</h4>
                <p className="text-[11px] text-slate-400">
                  {isMulti
                    ? 'Unlocks all 112 Certification Banks permanently'
                    : `Full question banks, simulations, and audio briefings for ${targetExam?.shortCode}`}
                </p>
              </div>
              <div className="text-right">
                <span className="text-lg font-extrabold text-white">{price}</span>
                <span className="text-[10px] text-slate-400 block">one-time pass</span>
              </div>
            </div>

            {/* Universal Guarantee Callout */}
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div className="text-[11px] text-emerald-300">
                <span className="font-bold">Cross-Platform Sync Guarantee:</span> Once purchased here on Web, access immediately syncs with your CertMaster Android client.
              </div>
            </div>

            {/* Card Form */}
            <div className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Cardholder Name</label>
                <input
                  type="text"
                  value={cardHolder}
                  onChange={e => setCardHolder(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-medium focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Expiration</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={e => setExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CVC</label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={e => setCvc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
            >
              {isProcessing ? (
                <span>Processing Payment...</span>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Authorize & Unlock for {price}</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
