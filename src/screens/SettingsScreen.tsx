import React from 'react';
import {
  Download,
  KeyRound,
  Shield,
  Battery,
  Database,
  Trash2,
  Terminal,
  HelpCircle,
  ChevronRight,
  Smartphone,
  Zap,
  Bell,
  Lock,
} from 'lucide-react';
import { DeviceSettings, PeerIdentity } from '../types/mesh';

interface SettingsScreenProps {
  localIdentity: PeerIdentity;
  settings: DeviceSettings;
  onUpdateSettings: (newSettings: Partial<DeviceSettings>) => void;
  onClearAllData: () => void;
  onShowPrivacy: () => void;
  onOpenProfile: () => void;
  onOpenInstallModal: () => void;
  onOpenWordPressModal?: () => void;
  onOpenDiagnostics: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  localIdentity,
  settings,
  onUpdateSettings,
  onClearAllData,
  onShowPrivacy,
  onOpenProfile,
  onOpenInstallModal,
  onOpenWordPressModal,
  onOpenDiagnostics,
}) => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] max-w-2xl mx-auto text-[#e9edef] bg-[#111b21] pb-24">
      {/* WhatsApp Profile Banner */}
      <div
        onClick={onOpenProfile}
        className="flex items-center gap-4 px-4 py-4 bg-[#111b21] hover:bg-[#202c33]/70 cursor-pointer border-b border-[#222e35] transition-colors"
      >
        <div className="w-14 h-14 rounded-full bg-[#202c33] border-2 border-[#00a884] flex items-center justify-center font-bold text-xl text-[#00a884] shrink-0">
          {localIdentity.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-white truncate">{localIdentity.displayName}</h3>
          <p className="text-xs text-[#8696a0] truncate mt-0.5">
            Hey there! I am using MeshLink offline Bluetooth.
          </p>
          <span className="text-[10px] font-mono text-[#00a884] block truncate mt-0.5">
            ID: {localIdentity.id.slice(0, 16)}...
          </span>
        </div>
        <ChevronRight className="w-5 h-5 text-[#8696a0] shrink-0" />
      </div>

      {/* Settings Action Items List */}
      <div className="divide-y divide-[#222e35]">
        {/* Highlighted Item: Install App on Phone */}
        <div
          onClick={onOpenInstallModal}
          className="flex items-center justify-between px-4 py-3.5 hover:bg-[#202c33]/70 cursor-pointer transition-colors bg-[#00a884]/5"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#00a884]">Install MeshLink on Your Phone</h4>
              <p className="text-xs text-[#8696a0] mt-0.5">
                Run as standalone native offline app on Android & iOS
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#00a884] bg-[#00a884]/20 px-2 py-0.5 rounded-full shrink-0">
            Install
          </span>
        </div>

        {/* Highlighted Item: WordPress Theme & Plugin .zip files */}
        {onOpenWordPressModal && (
          <div
            onClick={onOpenWordPressModal}
            className="flex items-center justify-between px-4 py-3.5 hover:bg-[#202c33]/70 cursor-pointer transition-colors bg-sky-500/5"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-sky-400">WordPress Theme & Plugin (.zip)</h4>
                <p className="text-xs text-[#8696a0] mt-0.5">
                  Download ready-to-upload Theme.zip & Plugin.zip
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-sky-400 bg-sky-500/20 px-2 py-0.5 rounded-full shrink-0">
              Downloads
            </span>
          </div>
        )}

        {/* Cryptographic Identity */}
        <div
          onClick={onOpenProfile}
          className="flex items-center justify-between px-4 py-3.5 hover:bg-[#202c33]/70 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#202c33] text-[#8696a0] flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Cryptographic Identity & Keys</h4>
              <p className="text-xs text-[#8696a0] mt-0.5">
                NIST P-256 ECDH keypair, safety numbers, recovery model
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8696a0] shrink-0" />
        </div>

        {/* Battery & Relay Saver Mode */}
        <div className="flex items-center justify-between px-4 py-3.5 hover:bg-[#202c33]/70 transition-colors">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#202c33] text-[#8696a0] flex items-center justify-center shrink-0">
              <Battery className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Adaptive Battery Saver</h4>
              <p className="text-xs text-[#8696a0] mt-0.5">
                Reduces BLE scan duty cycle to 20% to conserve battery
              </p>
            </div>
          </div>
          <button
            onClick={() => onUpdateSettings({ batterySaver: !settings.batterySaver })}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ${
              settings.batterySaver ? 'bg-[#00a884]' : 'bg-[#2a3942]'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                settings.batterySaver ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Storage Quotas & Data Wipe */}
        <div className="px-4 py-3.5 space-y-2">
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#202c33] text-[#8696a0] flex items-center justify-center shrink-0">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Storage and Local Data</h4>
              <p className="text-xs text-[#8696a0] mt-0.5">
                Queue limit: {settings.maxQueueSize} envelopes · TTL: {settings.ttlHours}h
              </p>
            </div>
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                if (confirm('Wipe all local chat messages, contacts, and relay queues?')) {
                  onClearAllData();
                }
              }}
              className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Local Storage</span>
            </button>
          </div>
        </div>

        {/* Diagnostics & Logs */}
        <div
          onClick={onOpenDiagnostics}
          className="flex items-center justify-between px-4 py-3.5 hover:bg-[#202c33]/70 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#202c33] text-[#8696a0] flex items-center justify-center shrink-0">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Diagnostics & Telemetry Logs</h4>
              <p className="text-xs text-[#8696a0] mt-0.5">
                Radio capabilities, packet frames, zero plaintext leaks
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8696a0] shrink-0" />
        </div>

        {/* Privacy Architecture */}
        <div
          onClick={onShowPrivacy}
          className="flex items-center justify-between px-4 py-3.5 hover:bg-[#202c33]/70 cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[#202c33] text-[#00a884] flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Privacy Architecture</h4>
              <p className="text-xs text-[#8696a0] mt-0.5">
                Zero internet permissions, zero cloud servers, pure peer-to-peer
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8696a0] shrink-0" />
        </div>
      </div>
    </div>
  );
};
