import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Lock,
  Check,
  CheckCheck,
  Clock,
  AlertTriangle,
  Info,
  ShieldCheck,
  Trash2,
  ChevronDown,
  Paperclip,
  Smile,
  Mic,
  QrCode,
  Radio,
  FileText,
} from 'lucide-react';
import { PeerIdentity, MeshMessage, DeliveryState } from '../types/mesh';

interface ChatScreenProps {
  peer: PeerIdentity;
  messages: MeshMessage[];
  onSendMessage: (text: string) => Promise<void>;
  onClearConversation: () => void;
  onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  peer,
  messages,
  onSendMessage,
  onClearConversation,
  onBack,
}) => {
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [inspectMessage, setInspectMessage] = useState<MeshMessage | null>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isSending) return;
    const text = inputText;
    setInputText('');
    setIsSending(true);
    try {
      await onSendMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleMicClick = () => {
    setMicNotice('Voice messaging: Planned — local audio transport not yet supported on pure BLE.');
    setTimeout(() => setMicNotice(null), 3000);
  };

  // WhatsApp-style ticks
  const renderDeliveryTicks = (state: DeliveryState) => {
    switch (state) {
      case 'DELIVERED_TO_RECIPIENT':
        // Signature WhatsApp Double Blue Ticks
        return (
          <span title="Delivered: Recipient verified ACK received" className="flex items-center text-[#53bdeb]">
            <CheckCheck className="w-3.5 h-3.5" />
          </span>
        );
      case 'TRANSMITTED_TO_NEXT_HOP':
        // WhatsApp Double Grey Ticks
        return (
          <span title="Transmitted to next mesh hop" className="flex items-center text-[#8696a0]">
            <CheckCheck className="w-3.5 h-3.5" />
          </span>
        );
      case 'WAITING_FOR_CONNECTION':
      case 'SAVED_LOCALLY':
        // WhatsApp Single Grey Tick
        return (
          <span title="Sent: Waiting for peer route in local queue" className="flex items-center text-[#8696a0]">
            <Check className="w-3.5 h-3.5" />
          </span>
        );
      case 'EXPIRED':
      case 'FAILED':
        return (
          <span title="Message expired or undelivered" className="flex items-center text-rose-400">
            <AlertTriangle className="w-3 h-3" />
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7.5rem)] max-w-2xl mx-auto text-[#e9edef] relative bg-[#0b141a]">
      {/* WhatsApp Chat Wallpaper Texture Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `radial-gradient(#00a884 1px, transparent 1px), radial-gradient(#d1d7db 1px, #0b141a 1px)`,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px',
        }}
      />

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 z-10 font-sans">
        {/* End-to-End Encryption Banner */}
        <div className="mx-auto max-w-sm my-2 p-2 bg-[#182229]/90 border border-[#222e35] rounded-lg text-center shadow-sm">
          <div className="flex items-center justify-center gap-1.5 text-[#ffd279] text-[11px] font-medium leading-relaxed">
            <Lock className="w-3 h-3 shrink-0" />
            <span>Messages are end-to-end encrypted. No internet, cell towers, or cloud servers are involved.</span>
          </div>
        </div>

        {/* Date Divider */}
        <div className="flex justify-center my-2">
          <span className="px-3 py-1 bg-[#182229] border border-[#222e35] rounded-md text-[11px] font-semibold text-[#8696a0] uppercase tracking-wider shadow-sm">
            TODAY
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-10 text-[#8696a0] space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#1f2c34] flex items-center justify-center mx-auto text-[#00a884]">
              <Lock className="w-6 h-6" />
            </div>
            <p className="text-xs">No messages with {peer.displayName} yet.</p>
            <p className="text-[11px] text-[#8696a0]">
              Type a message below to send an encrypted offline packet.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.isOutgoing;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Chat Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3.5 py-2 text-[14px] shadow-md cursor-pointer transition-transform active:scale-[0.99] relative ${
                    isMe
                      ? 'bg-[#005c4b] text-[#e9edef] rounded-tr-xs'
                      : 'bg-[#202c33] text-[#e9edef] rounded-tl-xs border border-[#2a3942]/60'
                  }`}
                  onClick={() => setInspectMessage(msg)}
                  title="Click to view encrypted envelope inspection"
                >
                  {/* Message Text */}
                  <p className="leading-relaxed break-words whitespace-pre-wrap">{msg.plaintext}</p>

                  {/* Metadata Row: Timestamp & Status Ticks */}
                  <div className="flex items-center justify-end gap-1.5 mt-1 text-[11px] text-[#8696a0] font-mono select-none">
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isMe && renderDeliveryTicks(msg.deliveryState)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Mic Warning Toast */}
      {micNotice && (
        <div className="mx-4 mb-2 p-2.5 bg-[#202c33] border border-[#ffd279]/40 text-[#ffd279] text-xs rounded-xl shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-2 z-20">
          <Info className="w-4 h-4 shrink-0 text-[#ffd279]" />
          <span>{micNotice}</span>
        </div>
      )}

      {/* Envelope Inspection Drawer */}
      {inspectMessage && (
        <div className="p-3 bg-[#111b21] border-t border-[#222e35] text-xs font-mono space-y-1.5 z-20 animate-in slide-in-from-bottom-2 shadow-2xl">
          <div className="flex items-center justify-between text-[#8696a0]">
            <span className="font-bold text-[#00a884] flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>MeshEnvelope Inspector:</span>
            </span>
            <button
              onClick={() => setInspectMessage(null)}
              className="text-[#8696a0] hover:text-white p-1"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-[#d1d7db] bg-[#202c33]/70 p-2.5 rounded-lg border border-[#222e35]">
            <div>
              <span className="text-[#8696a0] block text-[10px]">Message ID:</span>
              <span className="text-white truncate block">{inspectMessage.id.slice(0, 16)}...</span>
            </div>
            <div>
              <span className="text-[#8696a0] block text-[10px]">Delivery State:</span>
              <span className="text-[#00a884] font-bold block">{inspectMessage.deliveryState}</span>
            </div>
            <div>
              <span className="text-[#8696a0] block text-[10px]">Traversed Hops:</span>
              <span className="text-white block">{inspectMessage.hopCount} / {inspectMessage.maxHops} max</span>
            </div>
            <div>
              <span className="text-[#8696a0] block text-[10px]">TTL Expiry:</span>
              <span className="text-white block">{new Date(inspectMessage.expiresAt).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Attachment Sheet Modal */}
      {showAttachmentMenu && (
        <div className="p-3 bg-[#1f2c34] border-t border-[#222e35] grid grid-cols-3 gap-3 z-20 animate-in slide-in-from-bottom-2">
          <button
            onClick={() => {
              setShowAttachmentMenu(false);
              alert(`Safety Number with ${peer.displayName}:\n\n${peer.safetyNumber}\n\nBoth devices compute identical numbers via NIST P-256.`);
            }}
            className="p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-xl flex flex-col items-center gap-1.5 text-xs text-[#d1d7db] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <span>Safety Number</span>
          </button>

          <button
            onClick={() => {
              setShowAttachmentMenu(false);
              setInputText('PING: Radio range beacon test');
            }}
            className="p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-xl flex flex-col items-center gap-1.5 text-xs text-[#d1d7db] transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Radio className="w-5 h-5" />
            </div>
            <span>Mesh Ping</span>
          </button>

          <button
            onClick={() => {
              setShowAttachmentMenu(false);
              onClearConversation();
            }}
            className="p-3 bg-[#202c33] hover:bg-[#2a3942] rounded-xl flex flex-col items-center gap-1.5 text-xs text-rose-400 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </div>
            <span>Clear Chat</span>
          </button>
        </div>
      )}

      {/* WhatsApp Input Bar */}
      <form onSubmit={handleSend} className="p-2 sm:p-2.5 bg-[#202c33] flex items-center gap-2 z-20">
        <div className="flex-1 flex items-center gap-2 bg-[#2a3942] rounded-full px-3.5 py-1.5 focus-within:ring-1 focus-within:ring-[#00a884]">
          <button
            type="button"
            className="text-[#8696a0] hover:text-[#d1d7db] transition-colors"
            title="Emoji"
            onClick={() => setInputText((prev) => prev + ' 🔐')}
          >
            <Smile className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Message"
            className="flex-1 bg-transparent text-[#e9edef] text-sm focus:outline-none placeholder:text-[#8696a0]"
          />

          <button
            type="button"
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            className="text-[#8696a0] hover:text-[#d1d7db] transition-colors"
            title="Attachments & Safety Number"
          >
            <Paperclip className="w-5 h-5 -rotate-45" />
          </button>
        </div>

        {/* WhatsApp Circular Green Send or Mic Button */}
        {inputText.trim() ? (
          <button
            type="submit"
            disabled={isSending}
            className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#02906f] text-[#111b21] flex items-center justify-center shrink-0 shadow-md transition-all active:scale-90"
            title="Send encrypted message"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleMicClick}
            className="w-10 h-10 rounded-full bg-[#00a884] hover:bg-[#02906f] text-[#111b21] flex items-center justify-center shrink-0 shadow-md transition-all active:scale-90"
            title="Voice message"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </form>
    </div>
  );
};
