import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Smartphone,
  Globe,
  RefreshCw,
  CheckCircle2,
  ArrowRightLeft,
  Server,
  KeyRound,
  ShieldAlert,
  Send
} from 'lucide-react';

export const CrossPlatformSyncModal: React.FC = () => {
  const {
    showSyncModal,
    setShowSyncModal,
    userProfile,
    isSyncing,
    syncWithAndroid,
    syncLogs
  } = useAuth();

  if (!showSyncModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Cross-Platform Cloud Sync Bridge
              </h3>
              <p className="text-xs text-slate-400">
                Bidirectional synchronization between Web Hub & CertMaster Android client
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowSyncModal(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Active Device Pair Graphic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 relative">
              <div className="flex items-center space-x-2.5 mb-2">
                <Globe className="w-5 h-5 text-blue-400" />
                <span className="font-bold text-slate-200">Central Web Platform</span>
              </div>
              <p className="text-slate-400 text-[11px] mb-2 font-mono">
                Origin: https://certmaster.cloud/hub
              </p>
              <div className="flex items-center space-x-2 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-emerald-400 font-semibold">Active Session (Current Tab)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 relative">
              <div className="flex items-center space-x-2.5 mb-2">
                <Smartphone className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-slate-200">Android Companion</span>
              </div>
              <p className="text-slate-400 text-[11px] mb-2 font-mono">
                Device: Google Pixel 8 Pro (API 34)
              </p>
              <div className="flex items-center space-x-2 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-300">Room SQLite DB Synchronized</span>
              </div>
            </div>
          </div>

          {/* Cloud REST Endpoints Verification */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              REST & Telemetry Endpoints Status
            </h4>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-blue-300">POST /api/profile/sync</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">200 OK • Live</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-blue-300">POST /api/subscriptions/verify</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">200 OK • Verified</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                <span className="text-blue-300">POST /api/scores/telemetry</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">200 OK • Streaming</span>
              </div>
            </div>
          </div>

          {/* Sync Activity Feed */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-300 text-xs uppercase tracking-wider">
                Sync Event Stream ({syncLogs.length})
              </h4>
              <span className="text-[11px] text-slate-400">
                User: <span className="font-mono text-blue-400">{userProfile.email}</span>
              </span>
            </div>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {syncLogs.map(log => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex items-start justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                          log.source === 'ANDROID'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {log.source}
                      </span>
                      <span className="font-semibold text-slate-200">{log.message}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 pl-1">{log.payloadSummary}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 pl-2">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Last Synced: <span className="text-slate-200 font-medium">{new Date(userProfile.lastSyncTimestampMillis).toLocaleTimeString()}</span>
          </div>
          <button
            onClick={() => syncWithAndroid()}
            disabled={isSyncing}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Force Cloud Sync Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
