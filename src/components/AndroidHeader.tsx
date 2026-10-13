import React, { useState } from 'react';
import {
  Download,
  MoreVertical,
  Search,
  Camera,
  Network,
  ShieldCheck,
  Code2,
  Terminal,
  Lock,
  Smartphone,
  Share2,
} from 'lucide-react';

interface AndroidHeaderProps {
  title: string;
  subtitle?: string;
  activeConnectionsCount: number;
  onOpenDiagnostics: () => void;
  onOpenMeshSimulator: () => void;
  onOpenTestRunner: () => void;
  onOpenSourceCode: () => void;
  onOpenInstallModal: () => void;
  onOpenWordPressModal?: () => void;
  onBack?: () => void;
  isChatScreen?: boolean;
  peerAvatar?: string;
  onCallPeer?: () => void;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  title,
  subtitle,
  activeConnectionsCount,
  onOpenDiagnostics,
  onOpenMeshSimulator,
  onOpenTestRunner,
  onOpenSourceCode,
  onOpenInstallModal,
  onOpenWordPressModal,
  onBack,
  isChatScreen,
  peerAvatar,
  onCallPeer,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-[#202c33] text-[#e9edef] border-b border-[#222e35] select-none shadow-md">
      {/* WhatsApp Main Top App Bar */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 gap-2">
        {/* Left: Back button or Logo */}
        <div className="flex items-center gap-2.5 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1 -ml-1 text-[#aebac1] hover:text-white rounded-full hover:bg-[#111b21]/60 transition-colors"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {isChatScreen && peerAvatar && (
            <div className="w-9 h-9 rounded-full bg-[#00a884]/20 border border-[#00a884]/40 flex items-center justify-center font-bold text-[#00a884] text-sm shrink-0">
              {peerAvatar}
            </div>
          )}

          <div className="min-w-0">
            <h1 className="text-base font-bold text-[#e9edef] leading-tight truncate flex items-center gap-1.5">
              <span>{title}</span>
              {!onBack && (
                <span className="text-[10px] px-1.5 py-0.2 bg-[#00a884]/20 text-[#00a884] font-mono rounded font-semibold">
                  Offline Mesh
                </span>
              )}
            </h1>
            <p className="text-[11px] text-[#8696a0] font-normal leading-tight truncate flex items-center gap-1">
              {isChatScreen ? (
                <>
                  <Lock className="w-2.5 h-2.5 text-[#00a884]" />
                  <span>{subtitle || 'End-to-end encrypted'}</span>
                </>
              ) : (
                <span>
                  {subtitle || `${activeConnectionsCount} peer link${activeConnectionsCount === 1 ? '' : 's'} connected`}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: WhatsApp-style action icons */}
        <div className="flex items-center gap-1 shrink-0 relative">
          {/* Prominent "Download .ZIPs" button */}
          {onOpenWordPressModal && (
            <button
              onClick={onOpenWordPressModal}
              className="px-2.5 py-1 bg-[#00a884]/20 hover:bg-[#00a884]/30 border border-[#00a884]/50 text-[#00a884] font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors shadow-sm active:scale-95"
              title="Download WordPress, Android, and Full Source .ZIP files"
            >
              <Download className="w-3.5 h-3.5 text-[#00a884]" />
              <span className="hidden sm:inline">Download .ZIP</span>
              <span className="sm:hidden">.ZIP</span>
            </button>
          )}

          {/* Prominent "Install on Phone" pill button */}
          <button
            onClick={onOpenInstallModal}
            className="px-2.5 py-1 bg-[#00a884] hover:bg-[#02906f] text-[#111b21] font-bold text-xs rounded-full flex items-center gap-1.5 transition-colors shadow-sm active:scale-95 mr-0.5"
            title="Install on Android phone / iPhone"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
            <span className="sm:hidden">Install</span>
          </button>

          {/* Mesh Simulator Shortcut */}
          <button
            onClick={onOpenMeshSimulator}
            className="p-2 text-[#aebac1] hover:text-[#00a884] hover:bg-[#111b21]/60 rounded-full transition-colors"
            title="Open Interactive 3-Device Mesh Simulator"
          >
            <Network className="w-4 h-4" />
          </button>

          {/* Unit Tests */}
          <button
            onClick={onOpenTestRunner}
            className="p-2 text-[#aebac1] hover:text-[#00a884] hover:bg-[#111b21]/60 rounded-full transition-colors"
            title="Run Protocol Unit Tests"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Three dots dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 text-[#aebac1] hover:text-white hover:bg-[#111b21]/60 rounded-full transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showDropdown && (
              <div
                className="absolute right-0 top-10 w-60 bg-[#233138] border border-[#222e35] rounded-xl shadow-2xl py-1.5 z-50 text-xs font-medium text-[#d1d7db] animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setShowDropdown(false)}
              >
                {onOpenWordPressModal && (
                  <button
                    onClick={onOpenWordPressModal}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#182229] flex items-center gap-2.5 text-[#00a884] font-semibold border-b border-[#222e35]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download .ZIP Packages</span>
                  </button>
                )}
                <button
                  onClick={onOpenInstallModal}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] flex items-center gap-2.5 text-sky-400 font-semibold"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Install on Phone Guide</span>
                </button>
                <button
                  onClick={onOpenSourceCode}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] flex items-center gap-2.5"
                >
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>Browse Android Source</span>
                </button>
                <button
                  onClick={onOpenMeshSimulator}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] flex items-center gap-2.5"
                >
                  <Network className="w-4 h-4 text-sky-400" />
                  <span>Multi-Hop Mesh Simulator</span>
                </button>
                <button
                  onClick={onOpenTestRunner}
                  className="w-full text-left px-4 py-2 hover:bg-[#182229] flex items-center gap-2.5"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Run Protocol Unit Tests</span>
                </button>
                <button
                  onClick={onOpenDiagnostics}
                  className="w-full text-left px-4 py-2.5 hover:bg-[#182229] flex items-center gap-2.5"
                >
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>Diagnostics & Logs</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
