import React, { useState } from 'react';
import { useCertMaster } from '../../context/CertMasterContext';
import { ALL_112_EXAM_BANKS } from '../../data/examBanks';
import { X, Lock, CheckCircle, CreditCard, Shield, Smartphone, Globe } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const {
    checkoutExamId,
    setCheckoutExamId,
    purchaseExam,
    startExamSession,
    profile,
  } = useCertMaster();

  const [checkoutTier, setCheckoutTier] = useState<'single' | 'universal'>('single');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('888');
  const [zip, setZip] = useState('94103');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!checkoutExamId) return null;

  const targetBank = ALL_112_EXAM_BANKS.find((b) => b.id === checkoutExamId);
  const isSingle = checkoutTier === 'single';
  const price = isSingle ? (targetBank?.price || 29) : 99;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    purchaseExam(checkoutExamId, checkoutTier);
    setIsProcessing(false);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setCheckoutExamId(null);
  };

  const handleLaunchNow = () => {
    handleClose();
    if (targetBank) {
      startExamSession(targetBank.id, undefined, targetBank.durationMinutes);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-colors my-8">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        {!isSuccess ? (
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Universal Entitlement Checkout
                  </h3>
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    TEST / SANDBOX GATE
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Instant Omnichannel Cross-Platform Unlock: Web Portal + Dedicated Android App
                </div>
              </div>
            </div>

            {/* Plan Tier Selection */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setCheckoutTier('single')}
                className={`rounded-lg border p-3 text-left transition-colors ${
                  isSingle
                    ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/40'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Single Exam Pass
                </div>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white tabular-nums">
                  ${targetBank?.price || 29}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {targetBank?.code || 'Single Bank'} Full Bank
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCheckoutTier('universal')}
                className={`rounded-lg border p-3 text-left transition-colors relative ${
                  !isSingle
                    ? 'border-blue-600 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/40'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                }`}
              >
                <span className="absolute -top-2 right-2 rounded bg-amber-500 px-1.5 py-0.2 text-[9px] font-bold text-slate-950 uppercase">
                  Best Value
                </span>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  All-Access Pass
                </div>
                <div className="text-lg font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
                  $99
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  All 112 Subject Banks
                </div>
              </button>
            </div>

            {/* Target Exam Summary */}
            <div className="mb-5 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-950/50">
              <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white mb-1">
                <span>{isSingle ? `${targetBank?.code} (${targetBank?.title})` : 'Universal Multi-Pass (112 Certification Banks)'}</span>
                <span className="font-mono">${price}.00</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="h-3 w-3" />
                  Cross-Platform Sync Guaranteed
                </span>
                <span>·</span>
                <span>Linked to {profile.email}</span>
              </div>
            </div>

            {/* Sandbox Payment Form */}
            <form onSubmit={handlePay} className="space-y-3.5">
              <div className="rounded-lg bg-amber-500/10 p-3 text-[11px] text-amber-800 dark:text-amber-200 border border-amber-500/20">
                <strong>Sandbox Test Checkout:</strong> No real card will be charged. This triggers the server-verified entitlement gate to provision your pass across both this Web Portal and your Android companion app.
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Card Details (Sandbox Mode)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expiration
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CVC / Postal
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value)}
                      placeholder="CVC"
                      className="w-1/2 rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                    <input
                      type="text"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      placeholder="ZIP"
                      className="w-1/2 rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
                <Lock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span>256-bit TLS encrypted transaction with instantaneous Android push notification</span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full rounded-lg bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Authorizing Stripe Payment...</span>
                    </>
                  ) : (
                    <span>Complete Payment (${price}.00) & Unlock Now</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Payment Success State */
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <CheckCircle className="h-8 w-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Entitlement Provisioned!
              </h3>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                {isSingle
                  ? `${targetBank?.code} has been unlocked for your central account.`
                  : 'Universal Multi-Pass activated across all 112 Certification Banks.'}
              </p>
            </div>

            {/* Cross-Platform Verification Pill */}
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
              <div className="flex items-center justify-center gap-3 font-semibold">
                <span className="flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-blue-500" />
                  Web Platform Active
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
                  Android App Synced
                </span>
              </div>
              <div className="mt-1 text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                Token ID: tk_{Date.now().toString(36)} · Synced to {profile.androidDeviceId || 'Android Companion'}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Back to Catalog
              </button>
              <button
                type="button"
                onClick={handleLaunchNow}
                className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-sm"
              >
                Launch Exam Simulator Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
