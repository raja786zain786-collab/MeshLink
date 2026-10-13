import React from 'react';
import {
  MessageSquare,
  ShieldCheck,
  Check,
  CheckCheck,
  AlertTriangle,
  UserPlus,
  Lock,
  Search,
  Users,
  Smartphone,
  ChevronRight,
  Download,
} from 'lucide-react';
import { PeerIdentity, MeshMessage, DeliveryState } from '../types/mesh';

interface ConversationsScreenProps {
  contacts: PeerIdentity[];
  messages: MeshMessage[];
  onSelectPeer: (peer: PeerIdentity) => void;
  onOpenDiscovery: () => void;
  onOpenInstallModal: () => void;
  onOpenDownloadCenter?: () => void;
  activeConnectionsCount: number;
}

export const ConversationsScreen: React.FC<ConversationsScreenProps> = ({
  contacts,
  messages,
  onSelectPeer,
  onOpenDiscovery,
  onOpenInstallModal,
  onOpenDownloadCenter,
  activeConnectionsCount,
}) => {
  const renderDeliveryTick = (state: DeliveryState) => {
    switch (state) {
      case 'DELIVERED_TO_RECIPIENT':
        return <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb] shrink-0" />;
      case 'TRANSMITTED_TO_NEXT_HOP':
        return <CheckCheck className="w-3.5 h-3.5 text-[#8696a0] shrink-0" />;
      case 'WAITING_FOR_CONNECTION':
      case 'SAVED_LOCALLY':
        return <Check className="w-3.5 h-3.5 text-[#8696a0] shrink-0" />;
      case 'EXPIRED':
      case 'FAILED':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />;
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] max-w-2xl mx-auto text-[#e9edef] bg-[#111b21] pb-24 relative">
      {/* WhatsApp Search Bar */}
      <div className="px-3 sm:px-4 py-2 bg-[#111b21]">
        <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#202c33] rounded-lg text-xs text-[#8696a0] focus-within:ring-1 focus-within:ring-[#00a884]">
          <Search className="w-4 h-4 text-[#8696a0]" />
          <input
            type="text"
            placeholder="Search or start new offline chat"
            className="w-full bg-transparent text-[#e9edef] placeholder:text-[#8696a0] focus:outline-none"
          />
        </div>
      </div>

      {/* Download Center & Install App Recommendation Banner */}
      <div className="mx-3 sm:mx-4 my-1.5 p-3 bg-[#202c33] border border-[#00a884]/30 rounded-xl flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center shrink-0">
            <Download className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">Download .ZIP Archives & Install</h4>
            <p className="text-[11px] text-[#8696a0] truncate">WordPress Theme/Plugin, Android APK & PWA</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenDownloadCenter && (
            <button
              onClick={onOpenDownloadCenter}
              className="px-2.5 py-1.5 bg-[#111b21] hover:bg-[#2a3942] border border-[#222e35] text-[#00a884] font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
              title="Download WordPress and Android .zip files"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.ZIPs</span>
            </button>
          )}
          <button
            onClick={onOpenInstallModal}
            className="px-2.5 py-1.5 bg-[#00a884] hover:bg-[#02906f] text-[#111b21] font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
        </div>
      </div>

      {/* Mesh Radio Status Pill */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-[#8696a0] border-b border-[#222e35]">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#00a884] animate-pulse" />
          <span>BLE Radio: <strong>{activeConnectionsCount} link(s) active</strong></span>
        </span>
        <button
          onClick={onOpenDiscovery}
          className="text-[#00a884] hover:underline font-semibold"
        >
          Scan Nearby →
        </button>
      </div>

      {/* Conversations Feed */}
      <div className="divide-y divide-[#222e35]">
        {contacts.length === 0 ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#202c33] text-[#00a884] flex items-center justify-center mx-auto">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-white">No Conversations Yet</h3>
            <p className="text-xs text-[#8696a0] max-w-xs mx-auto">
              Scan for nearby phones over Bluetooth Low Energy to start chatting securely without internet.
            </p>
            <button
              onClick={onOpenDiscovery}
              className="px-4 py-2 bg-[#00a884] hover:bg-[#02906f] text-[#111b21] font-bold rounded-xl text-xs transition-colors"
            >
              Discover Nearby Devices
            </button>
          </div>
        ) : (
          contacts.map((contact) => {
            const peerMessages = messages.filter(
              (m) =>
                m.conversationPeerId === contact.id ||
                m.senderId === contact.id ||
                m.recipientId === contact.id
            );
            const lastMsg = peerMessages[peerMessages.length - 1];

            return (
              <div
                key={contact.id}
                onClick={() => onSelectPeer(contact)}
                className="flex items-center justify-between px-3 sm:px-4 py-3 hover:bg-[#202c33]/60 cursor-pointer transition-colors"
              >
                {/* Left: Avatar */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#202c33] border border-[#2a3942] flex items-center justify-center font-bold text-base text-[#00a884]">
                      {contact.displayName.charAt(0).toUpperCase()}
                    </div>
                    {contact.isConnected && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#111b21] rounded-full" />
                    )}
                  </div>

                  {/* Middle: Name & Last Message */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[15px] font-semibold text-[#e9edef] truncate">
                        {contact.displayName}
                      </span>
                      {contact.isVerified && (
                        <span title="Safety number verified">
                          <ShieldCheck className="w-4 h-4 text-[#00a884] shrink-0" />
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-[#8696a0] mt-0.5 truncate">
                      {lastMsg?.isOutgoing && renderDeliveryTick(lastMsg.deliveryState)}
                      <span className="truncate">
                        {lastMsg ? lastMsg.plaintext : 'Tap to start encrypted chat'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Time & Status */}
                <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                  <span className="text-[11px] text-[#8696a0] font-mono">
                    {lastMsg
                      ? new Date(lastMsg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'BLE'}
                  </span>
                  <span className="text-[10px] text-[#8696a0]">
                    {contact.isConnected ? 'Connected' : 'In Mesh'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* WhatsApp Floating Action Button (FAB) */}
      <button
        onClick={onOpenDiscovery}
        className="fixed bottom-20 right-4 sm:right-6 w-14 h-14 rounded-2xl bg-[#00a884] hover:bg-[#02906f] text-[#111b21] shadow-2xl flex items-center justify-center transition-transform active:scale-90 z-30"
        title="Start new chat / Discover peers"
      >
        <MessageSquare className="w-6 h-6 fill-current" />
      </button>
    </div>
  );
};
