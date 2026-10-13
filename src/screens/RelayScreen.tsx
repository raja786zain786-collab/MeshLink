import React from 'react';
import { Share2, Lock, Trash2, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { RelayQueueItem } from '../types/mesh';

interface RelayScreenProps {
  relayOptIn: boolean;
  onToggleRelayOptIn: () => void;
  maxHops: number;
  relayQueue: RelayQueueItem[];
  forwardedCount: number;
  duplicatesSuppressedCount: number;
  onClearQueue: () => void;
  onPurgeExpired: () => void;
}

export const RelayScreen: React.FC<RelayScreenProps> = ({
  relayOptIn,
  onToggleRelayOptIn,
  maxHops,
  relayQueue,
  forwardedCount,
  duplicatesSuppressedCount,
  onClearQueue,
  onPurgeExpired,
}) => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] max-w-2xl mx-auto text-[#e9edef] bg-[#111b21] p-4 space-y-4 pb-24">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-[#00a884]" />
          <span>Multi-Hop Relay Engine</span>
        </h2>
        <p className="text-xs text-[#8696a0] mt-0.5">
          Forward encrypted packets across participating phones out of direct radio range.
        </p>
      </div>

      {/* Relay Switch */}
      <div className="p-4 bg-[#202c33] border border-[#222e35] rounded-xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold text-white block">Participate in Mesh Relaying</span>
            <span className="text-xs text-[#8696a0] block mt-0.5">
              Allow this phone to relay encrypted packets for nearby peers
            </span>
          </div>
          <button
            onClick={onToggleRelayOptIn}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
              relayOptIn ? 'bg-[#00a884]' : 'bg-[#2a3942]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                relayOptIn ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="p-2.5 bg-[#111b21] rounded-lg border border-[#222e35] text-[11px] text-[#8696a0] flex items-start gap-2">
          <Lock className="w-4 h-4 text-[#00a884] shrink-0 mt-0.5" />
          <span>
            <strong>Zero-Knowledge Relaying:</strong> Packets are encrypted with the recipient's public key. Relay phones forward packets blind and cannot decrypt message contents.
          </span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 bg-[#202c33] border border-[#222e35] rounded-xl">
          <span className="text-[10px] uppercase font-semibold text-[#8696a0] block">
            Forwarded Envelopes
          </span>
          <span className="text-xl font-bold font-mono text-white tabular-nums">
            {forwardedCount}
          </span>
          <p className="text-[10px] text-[#8696a0] mt-0.5">Transmitted to next hop</p>
        </div>

        <div className="p-3.5 bg-[#202c33] border border-[#222e35] rounded-xl">
          <span className="text-[10px] uppercase font-semibold text-[#8696a0] block">
            Duplicates Blocked
          </span>
          <span className="text-xl font-bold font-mono text-[#00a884] tabular-nums">
            {duplicatesSuppressedCount}
          </span>
          <p className="text-[10px] text-[#8696a0] mt-0.5">Loop & flood prevention</p>
        </div>
      </div>

      {/* Protocol Boundaries */}
      <div className="p-3.5 bg-[#202c33] border border-[#222e35] rounded-xl space-y-2 text-xs">
        <span className="font-bold text-white uppercase tracking-wider text-[10px] block">
          Network Protocol Limits
        </span>
        <div className="flex justify-between py-1 border-b border-[#222e35]">
          <span className="text-[#8696a0]">Maximum Hop Limit:</span>
          <span className="font-mono font-bold text-[#00a884]">{maxHops} hops</span>
        </div>
        <div className="flex justify-between py-1 border-b border-[#222e35]">
          <span className="text-[#8696a0]">Default Envelope TTL:</span>
          <span className="font-mono text-white">24 hours</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-[#8696a0]">Storage Queue Cap:</span>
          <span className="font-mono text-white">500 envelopes</span>
        </div>
      </div>

      {/* Queue Items */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8696a0]">
            Transit Outbox ({relayQueue.length})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onPurgeExpired}
              className="text-[11px] text-[#8696a0] hover:text-white font-medium"
            >
              Purge Expired
            </button>
            <span className="text-[#8696a0]">·</span>
            <button
              onClick={onClearQueue}
              className="text-[11px] text-rose-400 hover:text-rose-300 font-medium"
            >
              Clear Queue
            </button>
          </div>
        </div>

        {relayQueue.length === 0 ? (
          <div className="p-6 text-center bg-[#202c33] border border-[#222e35] rounded-xl space-y-1">
            <Clock className="w-5 h-5 mx-auto text-[#8696a0]" />
            <p className="text-xs text-[#8696a0]">Relay queue is empty.</p>
            <p className="text-[11px] text-[#8696a0]">
              Packets for unreachable peers will queue here and auto-flush upon radio contact.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {relayQueue.map((item) => (
              <div
                key={item.messageId}
                className="p-3 bg-[#111b21] border border-[#222e35] rounded-xl flex items-center justify-between gap-3 text-xs font-mono"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">ID: {item.messageId.slice(0, 8)}...</span>
                    <span className="px-1.5 py-0.5 bg-[#202c33] text-[10px] rounded text-[#8696a0]">
                      Hop {item.hopCount}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8696a0] block mt-0.5">
                    Target: {item.recipientId.slice(0, 10)}... · Exp: {new Date(item.expiresAt).toLocaleTimeString()}
                  </span>
                </div>
                <span className="text-[10px] text-[#00a884] font-bold shrink-0">Blind Ciphertext</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
