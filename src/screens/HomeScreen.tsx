import React from 'react';
import { Bluetooth, Radio, Share2, Shield, Phone, MessageSquare, Terminal, Zap, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import { MainTab } from '../components/AndroidBottomNav';

interface HomeScreenProps {
  onNavigateTab: (tab: MainTab) => void;
  onOpenScreen: (screenId: string) => void;
  activeConnectionsCount: number;
  relayActive: boolean;
  isScanning: boolean;
  queueSize: number;
  unreadCount: number;
  verifiedContactsCount: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateTab,
  onOpenScreen,
  activeConnectionsCount,
  relayActive,
  isScanning,
  queueSize,
  unreadCount,
  verifiedContactsCount,
}) => {
  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto text-slate-100 space-y-6 pb-20">
      {/* Mesh Radio Status Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-sky-400 font-bold block mb-1">
              Bluetooth Mesh State
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeConnectionsCount > 0 ? 'Connected to Peer Mesh' : 'Scanning for Radio Links'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {activeConnectionsCount > 0
                ? `${activeConnectionsCount} verified GATT physical link(s) established.`
                : 'Zero active links. Messages will queue in persistent local store.'}
            </p>
          </div>
          <div className="p-3 bg-sky-500/10 border border-sky-500/30 rounded-2xl text-sky-400">
            <Radio className={`w-6 h-6 ${activeConnectionsCount > 0 ? 'animate-pulse' : ''}`} />
          </div>
        </div>

        {/* Real Metrics Strip */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-800/80 text-center">
          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/50">
            <span className="text-[10px] uppercase text-slate-500 block font-semibold">Connections</span>
            <span className="text-base font-bold font-mono text-white tabular-nums">
              {activeConnectionsCount}
            </span>
          </div>
          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/50">
            <span className="text-[10px] uppercase text-slate-500 block font-semibold">Relay Queue</span>
            <span className="text-base font-bold font-mono text-sky-400 tabular-nums">
              {queueSize}
            </span>
          </div>
          <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800/50">
            <span className="text-[10px] uppercase text-slate-500 block font-semibold">Store & Fwd</span>
            <span className="text-base font-bold font-mono text-emerald-400">
              {relayActive ? 'Active' : 'Off'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="space-y-2.5">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Primary Mesh Controls
        </span>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigateTab('discovery')}
            className="p-3.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center gap-3 transition-colors text-left"
          >
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg shrink-0">
              <Bluetooth className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">Nearby Scan</span>
              <span className="text-[10px] text-slate-400 block truncate">
                {isScanning ? 'Scanner Active' : 'Start BLE Discovery'}
              </span>
            </div>
          </button>

          <button
            onClick={() => onOpenScreen('call')}
            className="p-3.5 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center gap-3 transition-colors text-left"
          >
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">Nearby Voice</span>
              <span className="text-[10px] text-indigo-300 block truncate">Audio Interface</span>
            </div>
          </button>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="space-y-2.5">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Architecture Modules
        </span>
        
        <button
          onClick={() => onNavigateTab('relay')}
          className="w-full p-4 bg-slate-900 hover:bg-slate-800/60 border border-slate-800 rounded-xl flex items-center justify-between transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl shrink-0">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Multi-Hop Store-and-Forward Engine</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Relay packets across devices outside direct radio range. Maximum 5 hops.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
        </button>

        <button
          onClick={() => onOpenScreen('contacts')}
          className="w-full p-4 bg-slate-900 hover:bg-slate-800/60 border border-slate-800 rounded-xl flex items-center justify-between transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Contacts & Identity Verification</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                12-digit cryptographic safety numbers and key-change tamper detection.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
        </button>

        <button
          onClick={() => onOpenScreen('profile')}
          className="w-full p-4 bg-slate-900 hover:bg-slate-800/60 border border-slate-800 rounded-xl flex items-center justify-between transition-colors text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Local Identity & Public Key</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your hardware-backed cryptographic identity without cloud dependencies.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
        </button>
      </div>
    </div>
  );
};
