import React, { useState } from 'react';
import { X, ClipboardList, CheckCircle2, AlertTriangle, Smartphone, ArrowRight, Download } from 'lucide-react';

interface PhysicalTestPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhysicalTestPlanModal: React.FC<PhysicalTestPlanModalProps> = ({ isOpen, onClose }) => {
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const toggleCheck = (id: string) => {
    setCheckedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const steps = [
    {
      id: 'step_1',
      phase: 'Phase 1: Two-Device Direct Testing (Phone A ↔ Phone B)',
      title: 'Air-Gapped Bluetooth Pairing & Key Exchange',
      description: 'Turn off Wi-Fi and Cellular on both phones. Launch MeshLink. Verify both devices generate NIST P-256 identity keys. Scan and pair over BLE GATT.',
    },
    {
      id: 'step_2',
      phase: 'Phase 1: Two-Device Direct Testing (Phone A ↔ Phone B)',
      title: 'Direct Encrypted Messaging & Safety Number Verification',
      description: 'Compare 12-digit safety numbers on both screens. Send message from A to B. Verify state transitions from "Saved locally" -> "Waiting for connection" -> "Transmitted" -> "Delivered (verified ACK)".',
    },
    {
      id: 'step_3',
      phase: 'Phase 2: Three-Device Multi-Hop (Phone A → Phone B → Phone C)',
      title: 'Radio Distance Isolation Setup',
      description: 'Place Phone A in Room 1 and Phone C in Room 3 (out of BLE radio range of each other). Position Phone B in hallway between them (in range of both A and C). Verify Phone A cannot see Phone C directly in BLE scan.',
    },
    {
      id: 'step_4',
      phase: 'Phase 2: Three-Device Multi-Hop (Phone A → Phone B → Phone C)',
      title: 'Store-and-Forward Envelope Relay Execution',
      description: 'Send encrypted message from Phone A addressed to Phone C. Observe Phone B receives envelope (hop 1/5), logs show Blind Ciphertext (Phone B cannot decrypt). Phone B forwards to Phone C.',
    },
    {
      id: 'step_5',
      phase: 'Phase 2: Three-Device Multi-Hop (Phone A → Phone B → Phone C)',
      title: 'Authenticated Recipient ACK Back-Propagation',
      description: 'Phone C decrypts plaintext with its private key. Phone C automatically generates ACK envelope and transmits back to Phone B. Phone B forwards ACK to Phone A. Verify Phone A marks message as "Delivered to recipient (ACK verified)".',
    },
    {
      id: 'step_6',
      phase: 'Phase 3: Fault Injection & Edge Case Testing',
      title: 'Connection Severing & Reconnection Flush',
      description: 'Disable Bluetooth on Phone B. Send message from Phone A. Verify message remains queued in persistent outbox as "Waiting for connection". Re-enable Bluetooth on Phone B; verify automatic retry flushes outbox.',
    },
    {
      id: 'step_7',
      phase: 'Phase 3: Fault Injection & Edge Case Testing',
      title: 'Tamper Injection & Replay Defense',
      description: 'Test corrupt frame transmission and duplicate packet injection. Verify CRC32 frame drops and seen-filter suppression prevent replay or corruption.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Physical Device Test Protocol</h2>
              <p className="text-xs text-slate-400">Section 9 Physical Testing Standard (Phone A → Phone B → Phone C)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Prerequisites & Requirements
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              • Minimum 2 Android devices (Android 8.0+ / API 26+) with Bluetooth Low Energy hardware.<br />
              • Minimum 3 Android devices for multi-hop store-and-forward verification.<br />
              • Airplane Mode enabled on all devices with Bluetooth explicitly toggled ON.<br />
              • Zero internet connectivity throughout testing.
            </p>
          </div>

          {/* Checklist */}
          <div className="space-y-3">
            {steps.map((step) => {
              const checked = !!checkedSteps[step.id];
              return (
                <div
                  key={step.id}
                  onClick={() => toggleCheck(step.id)}
                  className={`p-4 rounded-xl border transition-colors cursor-pointer flex items-start gap-3.5 ${
                    checked
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 shrink-0 transition-colors ${
                      checked
                        ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                        : 'border-slate-700 bg-slate-900'
                    }`}
                  >
                    {checked && <CheckCircle2 className="w-3.5 h-3.5 font-bold" />}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400 font-semibold block">
                      {step.phase}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{step.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>{Object.values(checkedSteps).filter(Boolean).length} of {steps.length} protocol steps verified</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Close Protocol
          </button>
        </div>
      </div>
    </div>
  );
};
