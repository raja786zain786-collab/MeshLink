import React, { useState, useEffect } from 'react';
import { X, Network, Send, Radio, Shield, CheckCircle, AlertTriangle, ArrowRight, Lock } from 'lucide-react';
import { meshSimulator, MeshEvent } from '../mesh/meshEngine';

interface LiveMeshVisualizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveMeshVisualizer: React.FC<LiveMeshVisualizerProps> = ({ isOpen, onClose }) => {
  const [, setTick] = useState(0);
  const [testMessage, setTestMessage] = useState('Secret emergency message over multi-hop mesh');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const unsub = meshSimulator.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const nodeA = meshSimulator.nodes.get('node_a');
  const nodeB = meshSimulator.nodes.get('node_b');
  const nodeC = meshSimulator.nodes.get('node_c');

  const isABConnected = meshSimulator.isConnected('node_a', 'node_b');
  const isBCConnected = meshSimulator.isConnected('node_b', 'node_c');
  const isACConnected = meshSimulator.isConnected('node_a', 'node_c');

  const handleSendMultiHop = async () => {
    if (!testMessage.trim() || isSending) return;
    setIsSending(true);
    try {
      await meshSimulator.sendMessage('node_a', 'node_c', testMessage);
    } finally {
      setTimeout(() => setIsSending(false), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Multi-Device Mesh Simulator</h2>
              <p className="text-xs text-slate-400">Physical Topology: Phone A → Phone B (Relay) → Phone C</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Topology Architecture Diagram */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Radio Adjacency Matrix & Distance
              </span>
              <span className="text-xs font-mono text-sky-400">
                Protocol: BLE 5.0 GATT · E2E AES-256-GCM
              </span>
            </div>

            {/* Nodes Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Node A */}
              <div className="bg-slate-900 border border-sky-500/40 rounded-xl p-4 flex flex-col items-center text-center relative shadow-lg shadow-sky-500/5">
                <div className="w-12 h-12 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold mb-2">
                  A
                </div>
                <h4 className="font-bold text-white text-sm">Phone A (Alice)</h4>
                <p className="text-[11px] text-sky-400 font-mono mt-0.5">Originating Sender</p>
                <div className="mt-3 text-xs text-slate-400 w-full space-y-1">
                  <div className="flex justify-between border-t border-slate-800 pt-1.5">
                    <span>Identity:</span>
                    <span className="font-mono text-slate-300">{nodeA?.identity.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Outbox:</span>
                    <span className="font-mono text-sky-300">{nodeA?.messages.length || 0} msgs</span>
                  </div>
                </div>
              </div>

              {/* Node B */}
              <div className="bg-slate-900 border border-indigo-500/40 rounded-xl p-4 flex flex-col items-center text-center relative shadow-lg shadow-indigo-500/5">
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-2">
                  B
                </div>
                <h4 className="font-bold text-white text-sm">Phone B (Relay)</h4>
                <p className="text-[11px] text-indigo-400 font-mono mt-0.5">Store & Forward Node</p>
                <div className="mt-3 text-xs text-slate-400 w-full space-y-1">
                  <div className="flex justify-between border-t border-slate-800 pt-1.5">
                    <span>Relay Opt-In:</span>
                    <span className="text-emerald-400 font-semibold">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Content Visibility:</span>
                    <span className="text-amber-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Blind (Encrypted)
                    </span>
                  </div>
                </div>
              </div>

              {/* Node C */}
              <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-4 flex flex-col items-center text-center relative shadow-lg shadow-emerald-500/5">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-2">
                  C
                </div>
                <h4 className="font-bold text-white text-sm">Phone C (Bob)</h4>
                <p className="text-[11px] text-emerald-400 font-mono mt-0.5">Target Recipient</p>
                <div className="mt-3 text-xs text-slate-400 w-full space-y-1">
                  <div className="flex justify-between border-t border-slate-800 pt-1.5">
                    <span>Direct Range:</span>
                    <span className="text-rose-400 font-semibold">{isACConnected ? 'In Direct Range' : 'Out of Direct Range'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inbox:</span>
                    <span className="font-mono text-emerald-300">{nodeC?.messages.length || 0} msgs</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Link Controls */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-400">Simulate Physical Radio Distance:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => meshSimulator.toggleConnection('node_a', 'node_b')}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    isABConnected
                      ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 line-through'
                  }`}
                >
                  Link A ↔ B: {isABConnected ? 'Connected (In Range)' : 'Severed'}
                </button>
                <button
                  onClick={() => meshSimulator.toggleConnection('node_b', 'node_c')}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    isBCConnected
                      ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 line-through'
                  }`}
                >
                  Link B ↔ C: {isBCConnected ? 'Connected (In Range)' : 'Severed'}
                </button>
                <button
                  onClick={() => meshSimulator.toggleConnection('node_a', 'node_c')}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    isACConnected
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}
                >
                  Link A ↔ C: {isACConnected ? 'Direct Range (B bypassed)' : 'Out of Direct Radio Range'}
                </button>
              </div>
            </div>
          </div>

          {/* Test Transmission Console */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400" />
              Dispatch Multi-Hop Encrypted Message from Phone A → Phone C
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Phone A encrypts with Phone C's NIST P-256 public key. Phone B receives and forwards the envelope blind without being able to decrypt it.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter encrypted mesh test message..."
                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-sky-500 font-mono"
              />
              <button
                onClick={handleSendMultiHop}
                disabled={isSending}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-slate-950 font-bold rounded-lg text-sm flex items-center gap-2 transition-colors shrink-0"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Routing Hops...' : 'Transmit Test'}</span>
              </button>
            </div>
          </div>

          {/* Live Packet Sniffer / Event Log */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                Live Mesh Packet Log ({meshSimulator.eventLog.length} events)
              </h3>
              <span className="text-xs text-slate-500 font-mono">Real-Time Routing Events</span>
            </div>

            {meshSimulator.eventLog.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                No packet events yet. Click "Transmit Test" above to send a multi-hop frame.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-xs pr-1">
                {meshSimulator.eventLog.slice(-8).reverse().map((ev, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-slate-900/90 border border-slate-800/80 rounded-lg flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ev.type === 'DELIVERED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : ev.type === 'ACK'
                            ? 'bg-indigo-500/20 text-indigo-400'
                            : ev.type === 'HOP'
                            ? 'bg-sky-500/20 text-sky-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {ev.type}
                      </span>
                      <span className="text-slate-300 truncate">{ev.details}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      Hop {ev.hopCount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Non-negotiable protocol rule: Delivered status requires verified recipient ACK.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
