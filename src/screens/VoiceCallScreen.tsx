import React, { useState } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, ShieldAlert, AlertTriangle, ArrowLeft } from 'lucide-react';

interface VoiceCallScreenProps {
  onBack: () => void;
  peerName?: string;
}

export const VoiceCallScreen: React.FC<VoiceCallScreenProps> = ({ onBack, peerName = 'Nearby Peer' }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  return (
    <div className="flex flex-col min-h-[calc(100vh-7.5rem)] max-w-2xl mx-auto text-[#e9edef] justify-between p-4 sm:p-6 bg-[#0b141a] pb-24">
      {/* WhatsApp Call Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1 -ml-1 text-[#8696a0] hover:text-white rounded-full hover:bg-[#202c33] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base font-bold text-white">Direct Peer Voice</h2>
          <p className="text-xs text-[#8696a0]">Internet-free local audio channel</p>
        </div>
      </div>

      {/* Main Avatar & Calling Info */}
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-[#202c33] border-2 border-[#00a884]/40 flex items-center justify-center text-[#00a884] shadow-2xl shadow-[#00a884]/10">
            <Phone className="w-12 h-12" />
          </div>
          <span className="absolute bottom-1 right-1 px-2.5 py-0.5 bg-[#111b21] border border-[#222e35] text-[10px] font-mono text-[#8696a0] rounded-full">
            Standby
          </span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-white">{peerName}</h3>
          <p className="text-xs text-[#8696a0] mt-0.5 font-mono">Direct Bluetooth Low Energy Link</p>
        </div>

        {/* WhatsApp Call Technical Disclosure Notice */}
        <div className="max-w-md p-4 bg-[#202c33] border border-[#ffd279]/30 rounded-2xl text-left space-y-2 text-xs">
          <div className="flex items-center gap-2 text-[#ffd279] font-bold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Planned — local audio transport not yet supported</span>
          </div>
          <p className="text-[#d1d7db] leading-relaxed text-[11px]">
            <strong>Engineering Feasibility Analysis:</strong> BLE GATT maximum throughput is limited to ~4–8 KB/s with variable latency (30ms–150ms). Real-time full-duplex voice telephony (Opus / AMR-WB) requires continuous &gt;16 kbps throughput with &lt;80ms jitter. Pure BLE GATT cannot reliably sustain bidirectional phone calls without Wi-Fi Direct or Bluetooth Classic HFP audio sinks.
          </p>
          <p className="text-[#8696a0] leading-relaxed text-[11px]">
            To preserve protocol truthfulness: MeshLink does not fake active audio or secretly use cloud WebRTC. Calling remains honestly disabled until viable direct hardware audio transport is established.
          </p>
        </div>
      </div>

      {/* WhatsApp Call Actions Strip */}
      <div className="space-y-4 pb-2">
        <div className="flex justify-center gap-6">
          <button
            onClick={() => setIsMuted(!isMuted)}
            disabled
            className="w-12 h-12 rounded-full bg-[#202c33] text-[#8696a0] flex items-center justify-center cursor-not-allowed border border-[#222e35]"
            title="Mute microphone (Disabled)"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsSpeaker(!isSpeaker)}
            disabled
            className="w-12 h-12 rounded-full bg-[#202c33] text-[#8696a0] flex items-center justify-center cursor-not-allowed border border-[#222e35]"
            title="Speakerphone (Disabled)"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-3">
          <button
            disabled
            className="flex-1 py-3.5 bg-[#202c33] text-[#8696a0] font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed border border-[#222e35]"
          >
            <Phone className="w-4 h-4" />
            <span>Start Voice Call (Transport Unavailable)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
