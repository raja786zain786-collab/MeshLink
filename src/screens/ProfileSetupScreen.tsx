import React, { useState } from 'react';
import { KeyRound, Shield, Check, Copy, RefreshCw, AlertCircle } from 'lucide-react';
import { PeerIdentity } from '../types/mesh';

interface ProfileSetupScreenProps {
  localIdentity: PeerIdentity;
  onUpdateDisplayName: (name: string) => void;
  onRegenerateKeys: () => void;
  onDone: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  localIdentity,
  onUpdateDisplayName,
  onRegenerateKeys,
  onDone,
}) => {
  const [nameInput, setNameInput] = useState(localIdentity.displayName);
  const [copiedKey, setCopiedKey] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onUpdateDisplayName(nameInput.trim() || 'Local Peer');
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onDone();
    }, 600);
  };

  const copyPublicKey = () => {
    navigator.clipboard.writeText(localIdentity.publicKeyBase64);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-xl mx-auto text-slate-100 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-sky-400" />
          Local Cryptographic Profile
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Your identity is defined exclusively by your hardware-backed cryptographic keypair.
        </p>
      </div>

      {/* Profile Form */}
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Display Name (Visible to Nearby Peers)
          </label>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-sky-500"
            placeholder="e.g. Phone A (Alice)"
          />
        </div>

        {/* Identity ID */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <span className="text-xs font-semibold text-slate-400 block">
            Derived Identity ID (SHA-256 Fingerprint)
          </span>
          <div className="font-mono text-xs text-sky-400 bg-slate-950 p-2.5 rounded-lg break-all select-all border border-slate-800">
            {localIdentity.id}
          </div>
          <p className="text-[11px] text-slate-500">
            This stable 32-character identifier uniquely routes packets to your phone on the BLE mesh.
          </p>
        </div>

        {/* Public Key */}
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">
              NIST P-256 ECDH Public Key
            </span>
            <button
              onClick={copyPublicKey}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
            </button>
          </div>
          <div className="font-mono text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-lg max-h-24 overflow-y-auto break-all border border-slate-800">
            {localIdentity.publicKeyBase64}
          </div>
        </div>

        {/* Identity Recovery Disclosure */}
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <strong className="block text-amber-300 font-semibold mb-0.5">Identity Recovery Model:</strong>
            Because MeshLink is 100% offline without cloud accounts, keys are never synced remotely. If you clear data or reinstall, a fresh identity key is generated, and verified contacts will observe an explicit "Key Changed" warning until reverified.
          </div>
        </div>
      </div>

      <div className="pt-2 flex gap-3">
        <button
          onClick={onRegenerateKeys}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
          title="Generate fresh cryptographic identity"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Regenerate Keys</span>
        </button>
        <button
          onClick={handleSave}
          className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-lg shadow-sky-500/10"
        >
          {saved ? 'Saved!' : 'Save & Return'}
        </button>
      </div>
    </div>
  );
};
