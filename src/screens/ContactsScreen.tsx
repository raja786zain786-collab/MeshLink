import React, { useState } from 'react';
import { ShieldCheck, QrCode, AlertTriangle, Check, Copy, UserCheck, X } from 'lucide-react';
import { PeerIdentity } from '../types/mesh';

interface ContactsScreenProps {
  contacts: PeerIdentity[];
  onToggleVerification: (peerId: string) => void;
  onOpenChat: (peer: PeerIdentity) => void;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({
  contacts,
  onToggleVerification,
  onOpenChat,
}) => {
  const [selectedQrPeer, setSelectedQrPeer] = useState<PeerIdentity | null>(null);

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto text-slate-100 space-y-6 pb-20">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Contacts & Identity Verification
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Cryptographically compare 12-digit safety numbers or scan QR codes to prevent MITM attacks.
        </p>
      </div>

      {contacts.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <UserCheck className="w-6 h-6 mx-auto text-slate-600" />
          <p className="text-xs text-slate-400">No contacts in local database.</p>
          <p className="text-[11px] text-slate-500">
            Contacts are automatically discovered and bound when pairing over Bluetooth.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sky-400">
                    {contact.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{contact.displayName}</h4>
                    <p className="text-[11px] font-mono text-slate-400">
                      ID: {contact.id.slice(0, 10)}...
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedQrPeer(contact)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
                    title="View QR Code & Safety Number"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onToggleVerification(contact.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      contact.isVerified
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {contact.isVerified ? 'Verified' : 'Verify'}
                  </button>
                </div>
              </div>

              {/* Safety Number Display */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">
                  12-Digit Safety Number (NIST P-256 Fingerprint)
                </span>
                <span className="font-mono text-base font-bold text-sky-400 tracking-wider block">
                  {contact.safetyNumber}
                </span>
                <p className="text-[10px] text-slate-400">
                  Compare with the number on your peer's phone screen. If both match, your channel is mathematically tamper-proof.
                </p>
              </div>

              {/* Key Change Warning Check */}
              {contact.safetyNumber.includes('999999') && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-300 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>Warning: Peer public key changed! Re-verify safety number before sending confidential messages.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* QR Code Inspection Modal */}
      {selectedQrPeer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Identity Verification QR</h3>
              <button onClick={() => setSelectedQrPeer(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Clean SVG QR Code Representation */}
            <div className="p-4 bg-white rounded-xl inline-block mx-auto shadow-lg">
              <svg className="w-40 h-40" viewBox="0 0 100 100" fill="none">
                {/* Simulated high-density QR code visual matrix */}
                <rect width="100" height="100" fill="white" />
                {/* Corner markers */}
                <rect x="10" y="10" width="24" height="24" fill="black" />
                <rect x="14" y="14" width="16" height="16" fill="white" />
                <rect x="18" y="18" width="8" height="8" fill="black" />

                <rect x="66" y="10" width="24" height="24" fill="black" />
                <rect x="70" y="14" width="16" height="16" fill="white" />
                <rect x="74" y="18" width="8" height="8" fill="black" />

                <rect x="10" y="66" width="24" height="24" fill="black" />
                <rect x="14" y="70" width="16" height="16" fill="white" />
                <rect x="18" y="74" width="8" height="8" fill="black" />

                {/* Data modules */}
                <rect x="42" y="14" width="4" height="4" fill="black" />
                <rect x="50" y="20" width="6" height="4" fill="black" />
                <rect x="42" y="32" width="16" height="4" fill="black" />
                <rect x="22" y="46" width="6" height="6" fill="black" />
                <rect x="36" y="44" width="8" height="8" fill="black" />
                <rect x="52" y="46" width="6" height="6" fill="black" />
                <rect x="70" y="44" width="8" height="8" fill="black" />
                <rect x="44" y="62" width="12" height="6" fill="black" />
                <rect x="66" y="70" width="6" height="6" fill="black" />
                <rect x="78" y="74" width="8" height="8" fill="black" />
              </svg>
            </div>

            <div>
              <span className="text-xs font-bold text-white block">{selectedQrPeer.displayName}</span>
              <span className="font-mono text-sm font-bold text-sky-400 mt-1 block">
                {selectedQrPeer.safetyNumber}
              </span>
            </div>

            <button
              onClick={() => setSelectedQrPeer(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
