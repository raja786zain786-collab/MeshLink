import React, { useState } from 'react';
import {
  X,
  Download,
  Smartphone,
  Check,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Terminal,
  AlertTriangle,
  HelpCircle,
  Laptop,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isIframe, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'pwa' | 'apk'>('pwa');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [installStatusMsg, setInstallStatusMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://meshlink.app';

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleOpenDirect = () => {
    window.open(currentUrl, '_blank');
  };

  const handleOneTapInstall = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        onClose();
        return;
      }
    } else {
      // Fallback if beforeinstallprompt is not currently queued
      if (isIframe) {
        setInstallStatusMsg(
          'Please click "Open in Full Window" below! Chrome prevents PWA installation from inside preview iframes.'
        );
      } else {
        setInstallStatusMsg(
          'Look for the Install icon (💻/📱 with down arrow) on the right side of Chrome\'s address bar, or open Chrome Menu (⋮) → "Install MeshLink".'
        );
      }
      setTimeout(() => setInstallStatusMsg(null), 8000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#111b21] border border-[#222e35] rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#e9edef]">
        {/* WhatsApp-style Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222e35] bg-[#202c33]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Install MeshLink on Your Phone or PC</h2>
              <p className="text-xs text-[#8696a0]">Full-screen native offline WhatsApp-style experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8696a0] hover:text-white rounded-lg hover:bg-[#111b21] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-[#222e35] bg-[#111b21] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pwa')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'pwa'
                ? 'border-[#00a884] text-[#00a884] bg-[#202c33]/50'
                : 'border-transparent text-[#8696a0] hover:text-[#d1d7db]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Instant Install (Chrome & Mobile)</span>
          </button>
          <button
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'apk'
                ? 'border-[#00a884] text-[#00a884] bg-[#202c33]/50'
                : 'border-transparent text-[#8696a0] hover:text-[#d1d7db]'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Native Android APK (Gradle)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {activeTab === 'pwa' ? (
            <div className="space-y-4">
              {/* Iframe Detection Alert & Fix Button */}
              {isIframe && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-300">
                        Fix for Chrome: "This App cannot be installed"
                      </h4>
                      <p className="text-xs text-[#8696a0] mt-0.5 leading-relaxed">
                        Google Chrome strictly blocks app installations from inside embedded preview windows (iframes). To install MeshLink on your phone or desktop, open the app directly in a full browser tab!
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenDirect}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors shadow-md"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in Full Browser Tab (Enables Chrome Install)</span>
                  </button>
                </div>
              )}

              {/* One Tap Install Button */}
              <div className="p-4 bg-[#202c33] border border-[#00a884]/40 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#00a884] font-bold text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isInstallable
                        ? 'Ready for 1-Click Installation!'
                        : 'Instant Installation (PWA)'}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#00a884]/20 text-[#00a884]">
                    PWA Ready
                  </span>
                </div>
                <p className="text-xs text-[#8696a0] leading-relaxed">
                  Install MeshLink directly to your Android, iPhone, Windows, or Mac home screen as a standalone offline application without browser bars.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={handleOneTapInstall}
                    className="flex-1 py-3 bg-[#00a884] hover:bg-[#02906f] text-[#111b21] font-bold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-[#00a884]/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isInstallable ? 'Install MeshLink Now' : 'Launch Install Prompt'}</span>
                  </button>

                  <button
                    onClick={handleOpenDirect}
                    className="px-4 py-3 bg-[#111b21] hover:bg-[#2a3942] border border-[#222e35] text-[#d1d7db] font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                    title="Open app in a new top-level browser tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Open in Tab</span>
                  </button>
                </div>

                {installStatusMsg && (
                  <div className="p-2.5 bg-[#182229] border border-[#00a884]/30 rounded-lg text-xs text-[#00a884] animate-fade-in flex items-start gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{installStatusMsg}</span>
                  </div>
                )}
              </div>

              {/* Already installed banner */}
              {isInstalled && (
                <div className="p-3 bg-[#00a884]/15 border border-[#00a884]/30 rounded-xl flex items-center gap-2.5 text-xs text-[#00a884]">
                  <Check className="w-4 h-4 shrink-0 font-bold" />
                  <span>MeshLink is already installed and running in Standalone App Mode!</span>
                </div>
              )}

              {/* Scan with phone QR Code */}
              <div className="p-4 bg-[#202c33] border border-[#222e35] rounded-xl flex flex-col sm:flex-row items-center gap-4">
                {/* SVG QR Code */}
                <div className="p-3 bg-white rounded-xl shrink-0 shadow-md">
                  <svg className="w-28 h-28" viewBox="0 0 100 100" fill="none">
                    <rect width="100" height="100" fill="white" />
                    <rect x="8" y="8" width="26" height="26" fill="#111b21" />
                    <rect x="12" y="12" width="18" height="18" fill="white" />
                    <rect x="16" y="16" width="10" height="10" fill="#00a884" />

                    <rect x="66" y="8" width="26" height="26" fill="#111b21" />
                    <rect x="70" y="12" width="18" height="18" fill="white" />
                    <rect x="74" y="16" width="10" height="10" fill="#00a884" />

                    <rect x="8" y="66" width="26" height="26" fill="#111b21" />
                    <rect x="12" y="70" width="18" height="18" fill="white" />
                    <rect x="16" y="74" width="10" height="10" fill="#00a884" />

                    <rect x="42" y="12" width="6" height="6" fill="#111b21" />
                    <rect x="52" y="18" width="8" height="6" fill="#111b21" />
                    <rect x="42" y="30" width="16" height="6" fill="#111b21" />
                    <rect x="20" y="46" width="8" height="8" fill="#111b21" />
                    <rect x="36" y="44" width="10" height="10" fill="#111b21" />
                    <rect x="54" y="46" width="8" height="8" fill="#111b21" />
                    <rect x="72" y="44" width="10" height="10" fill="#111b21" />
                    <rect x="44" y="64" width="12" height="8" fill="#111b21" />
                    <rect x="66" y="72" width="8" height="8" fill="#111b21" />
                    <rect x="80" y="76" width="10" height="10" fill="#111b21" />
                  </svg>
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
                  <span className="text-xs uppercase font-mono font-bold text-[#00a884] block">
                    Scan With Phone Camera
                  </span>
                  <p className="text-xs text-[#8696a0]">
                    Point your smartphone camera at this QR code to open MeshLink directly on mobile Chrome or Safari.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      onClick={handleCopyUrl}
                      className="px-3 py-1.5 bg-[#111b21] hover:bg-[#2a3942] border border-[#222e35] rounded-lg text-xs font-mono text-[#d1d7db] flex items-center gap-1.5 transition-colors"
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5 text-[#00a884]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedUrl ? 'Copied URL!' : 'Copy Direct Link'}</span>
                    </button>
                    <button
                      onClick={handleOpenDirect}
                      className="px-3 py-1.5 bg-[#111b21] hover:bg-[#2a3942] border border-[#222e35] rounded-lg text-xs font-mono text-[#d1d7db] flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                      <span>Open Link</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Troubleshooting Card for "This App cannot be install" */}
              <div className="border border-[#222e35] rounded-xl overflow-hidden bg-[#182229]">
                <button
                  onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                  className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-[#8696a0] hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Why did Chrome show "This App cannot be install"?</span>
                  </span>
                  <span className="text-[11px] text-[#8696a0]">{showTroubleshooting ? '▲ Hide' : '▼ View Fix'}</span>
                </button>

                {showTroubleshooting && (
                  <div className="p-4 pt-1 border-t border-[#222e35] text-xs text-[#8696a0] space-y-2">
                    <p>
                      In Google Chrome, the error <span className="text-white font-mono">"This App cannot be install"</span> occurs for two reasons:
                    </p>
                    <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[#d1d7db]">
                      <li>
                        <strong>Embedded iFrame constraint:</strong> Chrome’s security policy forbids PWA installation inside an iframe (like the AI Studio web preview). <strong className="text-[#00a884]">Fix:</strong> Click <em>"Open in Full Browser Tab"</em> above so Chrome runs it top-level.
                      </li>
                      <li>
                        <strong>Missing PWA Service Worker & PNG Icons:</strong> Chrome requires standard 192x192 & 512x512 PNG icons and an active service worker. <strong className="text-[#00a884]">Fix:</strong> These have now been fully generated and registered (<code className="text-emerald-400">pwa-192x192.png</code>, <code className="text-emerald-400">pwa-512x512.png</code>, and service worker cache).
                      </li>
                    </ol>
                  </div>
                )}
              </div>

              {/* Step by step for Desktop, Android & iOS */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#d1d7db]">
                  Standard Browser Install Guides
                </h4>

                {/* Chrome Desktop Steps */}
                <div className="p-3.5 bg-[#202c33]/70 border border-[#222e35] rounded-xl space-y-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                    <span>On Google Chrome (Desktop / PC / Mac)</span>
                  </span>
                  <ol className="text-xs text-[#8696a0] space-y-1.5 list-decimal list-inside pl-1">
                    <li>Open MeshLink in a direct browser tab (outside iframe).</li>
                    <li>
                      Look at the far right of Chrome's address bar for the <strong>Install icon</strong> (a computer monitor with down arrow ⬇️).
                    </li>
                    <li>
                      Or click Chrome's top-right menu <strong>(⋮) → "Install MeshLink..."</strong> or <strong>"Save and share" → "Install page as app"</strong>.
                    </li>
                    <li>
                      Click <strong>Install</strong>. MeshLink will launch immediately in a dedicated standalone app window!
                    </li>
                  </ol>
                </div>

                {/* Android Steps */}
                <div className="p-3.5 bg-[#202c33]/70 border border-[#222e35] rounded-xl space-y-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-[#00a884]" />
                    <span>On Android (Google Chrome / Edge / Samsung)</span>
                  </span>
                  <ol className="text-xs text-[#8696a0] space-y-1.5 list-decimal list-inside pl-1">
                    <li>Open this link in <strong>Chrome</strong> on your Android phone.</li>
                    <li>
                      Tap the <strong>three dots menu (⋮)</strong> in the top right corner.
                    </li>
                    <li>
                      Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
                    </li>
                    <li>
                      Tap <strong>Install</strong>. MeshLink will appear with its app icon on your home screen and open without any browser URL bars!
                    </li>
                  </ol>
                </div>

                {/* iPhone Steps */}
                <div className="p-3.5 bg-[#202c33]/70 border border-[#222e35] rounded-xl space-y-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-sky-400" />
                    <span>On iPhone / iPad (Safari)</span>
                  </span>
                  <ol className="text-xs text-[#8696a0] space-y-1.5 list-decimal list-inside pl-1">
                    <li>Open this link in <strong>Safari</strong> on your iPhone.</li>
                    <li>
                      Tap the <strong>Share</strong> button (square icon with an arrow pointing up at the bottom).
                    </li>
                    <li>
                      Scroll down and tap <strong>"Add to Home Screen"</strong>.
                    </li>
                    <li>
                      Tap <strong>"Add"</strong> in the top right. MeshLink is now installed on your iOS home screen!
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          ) : (
            /* Native Android APK Tab */
            <div className="space-y-3">
              <div className="p-4 bg-[#202c33] border border-[#222e35] rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Download Full Android Studio Source Project
                    </span>
                    <p className="text-xs text-[#8696a0] leading-relaxed">
                      Complete Kotlin, Jetpack Compose, Room, Keystore, and BLE code in a single zip.
                    </p>
                  </div>
                  <a
                    href="/meshlink-android-source.zip"
                    download="meshlink-android-source.zip"
                    className="px-3.5 py-2 bg-[#00a884] hover:bg-[#02906f] text-[#111b21] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-md shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Project .ZIP</span>
                  </a>
                </div>
              </div>

              <div className="p-4 bg-[#111b21] border border-[#222e35] rounded-xl space-y-2 text-xs font-mono text-[#d1d7db]">
                <span className="text-[#8696a0] block text-[11px] font-sans font-semibold">
                  1. Open the project in Android Studio or Terminal:
                </span>
                <div className="bg-[#202c33] p-2.5 rounded-lg select-all">
                  cd android && ./gradlew assembleDebug
                </div>

                <span className="text-[#8696a0] block text-[11px] font-sans font-semibold pt-1">
                  2. Install directly onto your connected Android phone via ADB:
                </span>
                <div className="bg-[#202c33] p-2.5 rounded-lg select-all">
                  adb install app/build/outputs/apk/debug/app-debug.apk
                </div>

                <span className="text-[#8696a0] block text-[11px] font-sans font-semibold pt-1">
                  3. Run unit tests on Android SDK:
                </span>
                <div className="bg-[#202c33] p-2.5 rounded-lg select-all">
                  ./gradlew testDebugUnitTest
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#222e35] bg-[#202c33] flex items-center justify-between text-xs text-[#8696a0]">
          <span className="flex items-center gap-1.5 text-[#00a884]">
            <ShieldCheck className="w-4 h-4" />
            <span>Zero cloud · 100% Offline peer-to-peer</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#111b21] hover:bg-[#2a3942] text-white rounded-lg transition-colors font-medium"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
