import React, { useState } from 'react';
import { Bluetooth, Radio, Smartphone, Wifi, Shield, RefreshCw, CheckCircle2, QrCode } from 'lucide-react';
import { PeerIdentity } from '../types/mesh';
import { WebBleManager } from '../bluetooth/webBluetooth';

interface DiscoveryScreenProps {
  discoveredPeers: PeerIdentity[];
  isScanning: boolean;
  isAdvertising: boolean;
  onToggleScan: () => void;
  onToggleAdvertise: () => void;
  onConnectPeer: (peer: PeerIdentity) => void;
  onOpenConnections: () => void;
}

export const DiscoveryScreen: React.FC<DiscoveryScreenProps> = ({
  discoveredPeers,
  isScanning,
  isAdvertising,
  onToggleScan,
  onToggleAdvertise,
  onConnectPeer,
  onOpenConnections,
}) => {
  const [webBleError, setWebBleError] = useState<string | null>(null);
  const [isPairingWebBle, setIsPairingWebBle] = useState(false);

  const handlePairPhysicalBle = async () => {
    setWebBleError(null);
    setIsPairingWebBle(true);
    try {
      const res = await WebBleManager.requestDevice();
      if (res) {
        alert(`Successfully linked physical BLE phone: ${res.name} (${res.id})`);
      }
    } catch (e: unknown) {
      setWebBleError((e as Error).message);
    } finally {
      setIsPairingWebBle(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] max-w-2xl mx-auto text-[#e9edef] bg-[#111b21] p-4 space-y-4 pb-24">
      {/* WhatsApp Section Header */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Bluetooth className="w-5 h-5 text-[#00a884]" />
          <span>Nearby Bluetooth Discovery</span>
        </h2>
        <p className="text-xs text-[#8696a0] mt-0.5">
          Find and connect directly with phones in Bluetooth Low Energy radio range.
        </p>
      </div>

      {/* BLE Radio Controls */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onToggleScan}
          className={`p-3.5 rounded-xl border text-left transition-colors flex flex-col justify-between ${
            isScanning
              ? 'bg-[#00a884]/15 border-[#00a884]/60 text-[#00a884]'
              : 'bg-[#202c33] border-[#222e35] text-[#8696a0] hover:bg-[#2a3942]'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <Radio className={`w-5 h-5 ${isScanning ? 'animate-pulse text-[#00a884]' : 'text-[#8696a0]'}`} />
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                isScanning ? 'bg-[#00a884] text-[#111b21]' : 'bg-[#111b21] text-[#8696a0]'
              }`}
            >
              {isScanning ? 'SCANNING' : 'IDLE'}
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-white block">BLE Scanner</span>
            <span className="text-[11px] text-[#8696a0]">
              {isScanning ? 'Listening for peers...' : 'Tap to scan'}
            </span>
          </div>
        </button>

        <button
          onClick={onToggleAdvertise}
          className={`p-3.5 rounded-xl border text-left transition-colors flex flex-col justify-between ${
            isAdvertising
              ? 'bg-[#00a884]/15 border-[#00a884]/60 text-[#00a884]'
              : 'bg-[#202c33] border-[#222e35] text-[#8696a0] hover:bg-[#2a3942]'
          }`}
        >
          <div className="flex items-center justify-between w-full mb-2">
            <Smartphone className={`w-5 h-5 ${isAdvertising ? 'text-[#00a884]' : 'text-[#8696a0]'}`} />
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                isAdvertising ? 'bg-[#00a884] text-[#111b21]' : 'bg-[#111b21] text-[#8696a0]'
              }`}
            >
              {isAdvertising ? 'BROADCASTING' : 'OFF'}
            </span>
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Beacon Broadcast</span>
            <span className="text-[11px] text-[#8696a0]">
              {isAdvertising ? 'Broadcasting Mesh UUID' : 'Tap to advertise'}
            </span>
          </div>
        </button>
      </div>

      {/* Web Bluetooth Hardware Pairing */}
      <div className="p-3.5 bg-[#202c33] border border-[#222e35] rounded-xl space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-[#00a884]" />
            <span className="text-xs font-bold text-white">Pair Physical Bluetooth Hardware</span>
          </div>
          <button
            onClick={handlePairPhysicalBle}
            disabled={isPairingWebBle}
            className="px-3 py-1 bg-[#00a884] hover:bg-[#02906f] disabled:bg-[#111b21] text-[#111b21] font-bold rounded-lg text-xs transition-colors"
          >
            {isPairingWebBle ? 'Opening BLE...' : 'Pair Phone'}
          </button>
        </div>
        <p className="text-[11px] text-[#8696a0]">
          Connect directly to another physical phone running the MeshLink GATT service via Chrome Web Bluetooth.
        </p>
        {webBleError && (
          <div className="text-[11px] text-rose-400 font-mono bg-rose-500/10 p-2 rounded border border-rose-500/30">
            {webBleError}
          </div>
        )}
      </div>

      {/* Discovered Peers List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8696a0]">
            Discovered Nearby Devices ({discoveredPeers.length})
          </span>
          <button onClick={onOpenConnections} className="text-xs text-[#00a884] hover:underline font-semibold">
            Active Links →
          </button>
        </div>

        {discoveredPeers.length === 0 ? (
          <div className="p-8 text-center bg-[#202c33] border border-[#222e35] rounded-xl space-y-2">
            <Radio className="w-6 h-6 mx-auto text-[#8696a0]" />
            <p className="text-xs text-[#8696a0]">No Bluetooth devices detected in range.</p>
            <p className="text-[11px] text-[#8696a0]">
              Ensure Bluetooth is enabled on both phones and beacon advertising is active.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {discoveredPeers.map((peer) => (
              <div
                key={peer.id}
                className="p-3 bg-[#202c33] border border-[#222e35] rounded-xl flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#111b21] border border-[#2a3942] flex items-center justify-center font-bold text-[#00a884]">
                    {peer.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold text-white block truncate">{peer.displayName}</span>
                    <span className="text-[11px] font-mono text-[#8696a0] block truncate">
                      RSSI: {peer.rssi || -68} dBm · {peer.deviceAddress || 'GATT Direct Link'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onConnectPeer(peer)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 ${
                    peer.isConnected
                      ? 'bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40'
                      : 'bg-[#00a884] hover:bg-[#02906f] text-[#111b21]'
                  }`}
                >
                  {peer.isConnected ? 'Connected' : 'Connect'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Permissions rationale */}
      <div className="p-3.5 bg-[#182229] border border-[#222e35] rounded-xl space-y-1 text-xs text-[#8696a0]">
        <div className="flex items-center gap-1.5 text-white font-semibold">
          <Shield className="w-4 h-4 text-[#00a884]" />
          <span>Android Permissions Compliance</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          MeshLink requests <code className="text-[#00a884]">BLUETOOTH_SCAN</code>, <code className="text-[#00a884]">BLUETOOTH_CONNECT</code>, and <code className="text-[#00a884]">BLUETOOTH_ADVERTISE</code> exclusively for peer communication. Internet and external location tracking are completely excluded.
        </p>
      </div>
    </div>
  );
};
