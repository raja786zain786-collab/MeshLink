import React from 'react';
import { Shield, Lock, Radio, Database, ArrowRight, CheckCircle2 } from 'lucide-react';

interface WelcomeScreenProps {
  onProceed: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onProceed }) => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] p-4 sm:p-6 justify-between max-w-xl mx-auto text-slate-100">
      <div className="space-y-6">
        <div>
          <span className="text-xs uppercase font-mono tracking-wider text-sky-400 font-bold block mb-1">
            MeshLink Architectural Standard
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Internet-Free Mesh Messenger
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Nearby smartphones communicate directly over Bluetooth Low Energy and relay encrypted messages through participating phones.
          </p>
        </div>

        {/* Core Principles */}
        <div className="space-y-3">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
              <Lock className="w-4 h-4" />
              <span>1. Zero Internet & Zero Cloud</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-6">
              No server-side database, no remote authentication, no telemetry, and no internet permission. The application functions completely offline after installation.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Radio className="w-4 h-4" />
              <span>2. Multi-Hop Store-and-Forward</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-6">
              Messages can travel beyond your direct radio range. Relays store and forward encrypted envelopes blind—they cannot read your message text or tamper with payloads.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Shield className="w-4 h-4" />
              <span>3. Hardware-Backed Encryption</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-6">
              NIST P-256 ECDH key agreement and AES-256-GCM authenticated encryption. Delivery status is only marked "Delivered" when an authentic recipient ACK is received.
            </p>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Database className="w-4 h-4" />
              <span>4. Local Storage & Privacy Hygiene</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pl-6">
              All contacts, messages, and cryptographic keys remain stored exclusively on your device. You can purge all local data anytime.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          onClick={onProceed}
          className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-sky-500/10 transition-all active:scale-[0.99]"
        >
          <span>Accept Architecture & Enter MeshLink</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-[11px] text-slate-500 text-center mt-2.5">
          By proceeding, you configure your local identity keypair.
        </p>
      </div>
    </div>
  );
};
