import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LiveMobileAppDevice } from '../components/LiveMobileAppDevice';
import { PerformanceLineChart } from '../components/PerformanceLineChart';
import { HISTORICAL_SIMULATION_SESSIONS } from '../data/historicalScores';
import {
  Smartphone,
  Globe,
  ArrowRightLeft,
  Zap,
  CheckCircle2,
  Server,
  RefreshCw,
  Activity,
  ShieldCheck,
  Send,
  Radio,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';

interface SyncPacket {
  id: string;
  time: string;
  direction: 'WEB_TO_PHONE' | 'PHONE_TO_WEB';
  channel: 'ROOM_SQLITE' | 'REST_TELEMETRY' | 'ENTITLEMENT_BUS';
  action: string;
  payload: string;
  latencyMs: number;
}

export const DualDeviceScreen: React.FC = () => {
  const {
    userProfile,
    activeExam,
    subscribeToExam,
    purchaseAllAccess,
    updateProfile,
    syncWithAndroid,
    isSyncing,
    showToast
  } = useAuth();

  const [packets, setPackets] = useState<SyncPacket[]>([
    {
      id: 'pkt_01',
      time: '09:42:15',
      direction: 'WEB_TO_PHONE',
      channel: 'ENTITLEMENT_BUS',
      action: 'Universal Entitlement Push',
      payload: 'CISSP, AWS-SAA, Sec+ ACTIVE on Web (Stripe)',
      latencyMs: 14
    },
    {
      id: 'pkt_02',
      time: '09:42:20',
      direction: 'PHONE_TO_WEB',
      channel: 'ROOM_SQLITE',
      action: 'Room Database Baseline Commit',
      payload: 'Assessment Score: 74%, Archetype: Analytical Hesitator',
      latencyMs: 11
    },
    {
      id: 'pkt_03',
      time: '09:42:35',
      direction: 'PHONE_TO_WEB',
      channel: 'REST_TELEMETRY',
      action: 'Biometric Latency Telemetry',
      payload: 'Cognitive Stress: 68/100, Dwell Time: 54s/q',
      latencyMs: 18
    }
  ]);

  const addPacket = (direction: 'WEB_TO_PHONE' | 'PHONE_TO_WEB', action: string, payload: string) => {
    const newPkt: SyncPacket = {
      id: 'pkt_' + Math.random().toString(36).substring(2, 8),
      time: new Date().toLocaleTimeString(),
      direction,
      channel: direction === 'WEB_TO_PHONE' ? 'ENTITLEMENT_BUS' : 'ROOM_SQLITE',
      action,
      payload,
      latencyMs: Math.floor(8 + Math.random() * 15)
    };
    setPackets(prev => [newPkt, ...prev.slice(0, 15)]);
  };

  const handleSimulateWebAction = async (actionType: 'SCORE' | 'BUY_EXAM' | 'BUY_ALL' | 'STRESS') => {
    if (actionType === 'SCORE') {
      const nextScore = Math.min(95, userProfile.assessmentScorePercent + 4);
      updateProfile({ assessmentScorePercent: nextScore });
      addPacket('WEB_TO_PHONE', 'Score Telemetry Broadcast', `Readiness updated to ${nextScore}%`);
      showToast(`⚡ Web Platform pushed new ${nextScore}% score to phone!`);
    } else if (actionType === 'BUY_EXAM') {
      await subscribeToExam('cism');
      addPacket('WEB_TO_PHONE', 'Entitlement Authorized', 'CISM unlocked via Stripe -> Pushed to Android');
      showToast('⚡ CISM unlocked on Web! Instant access granted to phone.');
    } else if (actionType === 'BUY_ALL') {
      await purchaseAllAccess();
      addPacket('WEB_TO_PHONE', 'Universal Pass Broadcast', 'All 112 Exam Banks unlocked across Web & Android');
      showToast('🚀 Universal All-Access Pass Active! Synced to phone.');
    } else if (actionType === 'STRESS') {
      const newStress = Math.max(30, userProfile.cognitiveStressBaseline - 8);
      updateProfile({ cognitiveStressBaseline: newStress });
      addPacket('WEB_TO_PHONE', 'Stress Metric Calibrated', `Cognitive Stress reduced to ${newStress}/100`);
      showToast(`⚡ Cognitive Stress calibrated to ${newStress}/100 and mirrored to phone.`);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Dual Screen Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Connected Studio Active
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Account: <strong className="text-white">{userProfile.email}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Live Dual-Device Connection Studio
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Witness the <strong>Central Web Platform</strong> and the <strong>Android Mobile App</strong> communicating in real time over the cloud synchronization bus.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => syncWithAndroid()}
            disabled={isSyncing}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Trigger Cloud Sync'}</span>
          </button>
        </div>
      </div>

      {/* Main Dual-Device Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Central Web Platform View (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900 border border-blue-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Central Web Platform Command</h3>
                  <p className="text-[11px] text-slate-400">
                    Host: <span className="text-blue-400 font-mono">certmaster.cloud</span>
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                DESKTOP CLIENT
              </span>
            </div>

            {/* Live Synchronized Stats Ribbon */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Baseline Readiness</span>
                <strong className="text-lg font-black text-emerald-400">
                  {userProfile.assessmentScorePercent}%
                </strong>
                <span className="text-[9px] text-slate-500 block">Mirrored to Phone</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Cognitive Stress</span>
                <strong className="text-lg font-black text-amber-400">
                  {userProfile.cognitiveStressBaseline}/100
                </strong>
                <span className="text-[9px] text-slate-500 block">Dwell Telemetry</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Unlocked Banks</span>
                <strong className="text-lg font-black text-blue-400">
                  {Object.values(userProfile.subscriptions).filter(s => s.status === 'ACTIVE').length} / 112
                </strong>
                <span className="text-[9px] text-slate-500 block">Universal Access</span>
              </div>
            </div>

            {/* Interactive "Cause & Effect" Action Bar */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Trigger Actions On Web & Watch Mobile Screen React:
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleSimulateWebAction('SCORE')}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-white font-semibold border border-slate-700 text-left transition-colors cursor-pointer"
                >
                  <strong className="block text-emerald-400 text-[11px]">+4% Readiness Drill</strong>
                  <span className="text-[10px] text-slate-400">Pushes score to phone</span>
                </button>

                <button
                  onClick={() => handleSimulateWebAction('BUY_EXAM')}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-white font-semibold border border-slate-700 text-left transition-colors cursor-pointer"
                >
                  <strong className="block text-blue-400 text-[11px]">Unlock CISM ($29)</strong>
                  <span className="text-[10px] text-slate-400">Instantly unlocks on phone</span>
                </button>

                <button
                  onClick={() => handleSimulateWebAction('BUY_ALL')}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-white font-semibold border border-slate-700 text-left transition-colors cursor-pointer"
                >
                  <strong className="block text-cyan-400 text-[11px]">Universal 112 Pass ($99)</strong>
                  <span className="text-[10px] text-slate-400">Unlocks all banks on phone</span>
                </button>

                <button
                  onClick={() => handleSimulateWebAction('STRESS')}
                  className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-white font-semibold border border-slate-700 text-left transition-colors cursor-pointer"
                >
                  <strong className="block text-amber-400 text-[11px]">Recalibrate Stress</strong>
                  <span className="text-[10px] text-slate-400">Lowers cognitive index</span>
                </button>
              </div>
            </div>

            {/* Embedded Bézier Curve Telemetry */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Live Bézier Score Trajectory</span>
                <span className="text-emerald-400 font-mono text-[10px]">Cloud Synced</span>
              </div>
              <PerformanceLineChart sessions={HISTORICAL_SIMULATION_SESSIONS} />
            </div>
          </div>

          {/* Real-Time Packet Inspector Feed */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                Live Cloud Bus Packet Stream ({packets.length} packets logged)
              </h3>
              <span className="text-[10px] font-mono text-slate-400">
                Protocols: WebSocket • BroadcastChannel • SSE
              </span>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs font-mono">
              {packets.map(pkt => (
                <div
                  key={pkt.id}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center space-x-2 truncate">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        pkt.direction === 'WEB_TO_PHONE'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {pkt.direction === 'WEB_TO_PHONE' ? 'WEB → PHONE' : 'PHONE → WEB'}
                    </span>
                    <span className="text-slate-200 font-bold truncate">{pkt.action}</span>
                    <span className="text-slate-400 text-[10px] hidden sm:inline truncate">
                      ({pkt.payload})
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0 text-[10px] text-slate-500">
                    <span className="text-emerald-400 font-bold">{pkt.latencyMs}ms</span>
                    <span>{pkt.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Mobile App (Pixel 8 Pro) (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="mb-3 text-center space-y-1">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Smartphone className="w-4 h-4" />
              <span>Interactive Phone Screen</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-400">
              Tap buttons on the phone to test two-way synchronization to the web platform!
            </p>
          </div>

          <LiveMobileAppDevice
            onSyncTriggered={dir => {
              addPacket(dir, 'Mobile App Touch Interaction', 'Action on Pixel 8 Pro synced to Central Web Platform');
            }}
          />
        </div>
      </div>
    </div>
  );
};
