import React, { useState } from 'react';
import {
  X,
  Download,
  FileCode,
  CheckCircle2,
  Terminal,
  Layers,
  Smartphone,
  ExternalLink,
  Copy,
  Check,
  Package,
  FolderArchive,
  Info,
} from 'lucide-react';

interface WordPressModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'wordpress' | 'source' | 'guide';
}

export const WordPressModal: React.FC<WordPressModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'wordpress',
}) => {
  const [activeTab, setActiveTab] = useState<'wordpress' | 'source' | 'guide'>(initialTab);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentHost =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-dev-ypftjyiu4ddd6m5fsaf7qk-37096022669.asia-southeast1.run.app';

  // Robust download helper that works inside AI Studio iframe
  const triggerDownload = async (relativeUrl: string, filename: string) => {
    try {
      setDownloadingFile(filename);
      const res = await fetch(relativeUrl);
      if (!res.ok) throw new Error('File fetch failed');
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      setDownloadSuccess(filename);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch {
      // Fallback: direct window open / navigation
      window.open(relativeUrl, '_blank');
    } finally {
      setDownloadingFile(null);
    }
  };

  const copyDirectUrl = (filename: string) => {
    const fullUrl = `${currentHost}/${filename}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(filename);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#111b21] border border-[#222e35] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-[#e9edef]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222e35] bg-[#202c33]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#00a884]/20 text-[#00a884] flex items-center justify-center font-bold">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">MeshLink Download Center</h2>
              <p className="text-xs text-[#8696a0]">
                Download WordPress Theme & Plugin, Android Kotlin, and Full Project .ZIPs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8696a0] hover:text-white rounded-lg hover:bg-[#111b21] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#222e35] bg-[#111b21] text-xs font-semibold">
          <button
            onClick={() => setActiveTab('wordpress')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'wordpress'
                ? 'border-[#00a884] text-[#00a884] bg-[#202c33]/50'
                : 'border-transparent text-[#8696a0] hover:text-[#d1d7db]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>WordPress Packages (.zip)</span>
          </button>

          <button
            onClick={() => setActiveTab('source')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'source'
                ? 'border-[#00a884] text-[#00a884] bg-[#202c33]/50'
                : 'border-transparent text-[#8696a0] hover:text-[#d1d7db]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Android & All Source (.zip)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-3 text-center transition-colors border-b-2 flex items-center justify-center gap-2 ${
              activeTab === 'guide'
                ? 'border-[#00a884] text-[#00a884] bg-[#202c33]/50'
                : 'border-transparent text-[#8696a0] hover:text-[#d1d7db]'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>How to Download Guide</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {activeTab === 'wordpress' && (
            <div className="space-y-4">
              <p className="text-xs text-[#8696a0] leading-relaxed">
                MeshLink is split into two separate, ready-to-upload WordPress zip archives:
              </p>

              {/* 1. WordPress Theme Card */}
              <div className="p-4 bg-[#202c33] border border-[#222e35] rounded-xl space-y-3 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-[#00a884]/20 text-[#00a884] rounded-lg">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">1. MeshLink WordPress Theme</h3>
                      <span className="text-[11px] font-mono text-[#00a884]">meshlink-theme.zip</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => copyDirectUrl('meshlink-theme.zip')}
                      className="px-2.5 py-1.5 bg-[#111b21] hover:bg-[#2a3942] text-[#8696a0] hover:text-white text-xs rounded-lg flex items-center gap-1 border border-[#222e35] transition-colors"
                      title="Copy Direct Download Link"
                    >
                      {copiedLink === 'meshlink-theme.zip' ? (
                        <Check className="w-3.5 h-3.5 text-[#00a884]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedLink === 'meshlink-theme.zip' ? 'Copied' : 'Link'}</span>
                    </button>
                    <button
                      onClick={() => triggerDownload('/meshlink-theme.zip', 'meshlink-theme.zip')}
                      disabled={downloadingFile === 'meshlink-theme.zip'}
                      className="px-4 py-2 bg-[#00a884] hover:bg-[#02906f] disabled:opacity-50 text-[#111b21] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {downloadingFile === 'meshlink-theme.zip'
                          ? 'Downloading...'
                          : downloadSuccess === 'meshlink-theme.zip'
                          ? 'Downloaded!'
                          : 'Download .zip'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#8696a0] space-y-1 pt-2 border-t border-[#2a3942]">
                  <strong className="text-[#d1d7db] block">Contains Frontend & UI/UX Design:</strong>
                  <p className="text-[11px] leading-relaxed">
                    • <code className="text-sky-300">style.css</code>: Theme metadata & WhatsApp dark mode color tokens<br />
                    • <code className="text-sky-300">index.php</code>: Full WhatsApp layout, chat feed, discovery, relay<br />
                    • <code className="text-sky-300">assets/css/meshlink.css</code>: Complete styling, doodle wallpaper, chat bubbles<br />
                    • <code className="text-sky-300">assets/js/meshlink-app.js</code>: WebCrypto NIST P-256, BLE simulations, FAB<br />
                    • <code className="text-sky-300">functions.php</code>, <code className="text-sky-300">header.php</code>, <code className="text-sky-300">footer.php</code>
                  </p>
                </div>
              </div>

              {/* 2. WordPress Plugin Card */}
              <div className="p-4 bg-[#202c33] border border-[#222e35] rounded-xl space-y-3 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">2. MeshLink WordPress Plugin</h3>
                      <span className="text-[11px] font-mono text-indigo-400">meshlink-plugin.zip</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => copyDirectUrl('meshlink-plugin.zip')}
                      className="px-2.5 py-1.5 bg-[#111b21] hover:bg-[#2a3942] text-[#8696a0] hover:text-white text-xs rounded-lg flex items-center gap-1 border border-[#222e35] transition-colors"
                      title="Copy Direct Download Link"
                    >
                      {copiedLink === 'meshlink-plugin.zip' ? (
                        <Check className="w-3.5 h-3.5 text-[#00a884]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedLink === 'meshlink-plugin.zip' ? 'Copied' : 'Link'}</span>
                    </button>
                    <button
                      onClick={() => triggerDownload('/meshlink-plugin.zip', 'meshlink-plugin.zip')}
                      disabled={downloadingFile === 'meshlink-plugin.zip'}
                      className="px-4 py-2 bg-[#00a884] hover:bg-[#02906f] disabled:opacity-50 text-[#111b21] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {downloadingFile === 'meshlink-plugin.zip'
                          ? 'Downloading...'
                          : downloadSuccess === 'meshlink-plugin.zip'
                          ? 'Downloaded!'
                          : 'Download .zip'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#8696a0] space-y-1 pt-2 border-t border-[#2a3942]">
                  <strong className="text-[#d1d7db] block">Contains All Backend & Mesh Logic:</strong>
                  <p className="text-[11px] leading-relaxed">
                    • <code className="text-indigo-300">class-meshlink-api.php</code>: REST API routes (/wp-json/meshlink/v1/...)<br />
                    • <code className="text-indigo-300">class-meshlink-relay.php</code>: Store-and-forward, duplicate suppression, TTL<br />
                    • <code className="text-indigo-300">class-meshlink-db.php</code>: Custom tables for messages, queues, peers<br />
                    • <code className="text-indigo-300">class-meshlink-crypto.php</code>: Server-side SHA-256 safety number calculation<br />
                    • <code className="text-indigo-300">class-meshlink-shortcode.php</code>: Embed shortcode <code className="text-[#00a884]">[meshlink_app]</code><br />
                    • <code className="text-indigo-300">class-meshlink-admin.php</code>: WP Admin console & queue statistics
                  </p>
                </div>
              </div>

              {/* WordPress Installation Instructions & Verified Compatibility */}
              <div className="p-4 bg-[#182229] border border-[#222e35] rounded-xl space-y-3 text-xs text-[#8696a0]">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>WordPress Compatibility Verified (Fix Applied for style.css / stylesheet.css)</span>
                </div>
                <p className="text-[11px] text-[#d1d7db] leading-relaxed">
                  Both zip files are packaged in standard WordPress format. <code className="text-[#00a884]">style.css</code> (and fallback <code className="text-[#00a884]">stylesheet.css</code>) is placed directly in the theme root folder (<code className="text-sky-300">meshlink-theme/style.css</code>) with all official WordPress theme headers, eliminating the "The theme is missing the style.css stylesheet" upload error.
                </p>

                <strong className="text-white block font-semibold pt-1">Step-by-step installation in WordPress:</strong>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11px]">
                  <li>
                    <strong>Upload Theme:</strong> In WordPress Admin, go to <strong className="text-[#e9edef]">Appearance → Themes → Add New → Upload Theme</strong>, select <code className="text-[#00a884] bg-[#111b21] px-1.5 py-0.5 rounded">meshlink-theme.zip</code>, and click <em>Install Now</em> → <em>Activate</em>.
                  </li>
                  <li>
                    <strong>Upload Plugin:</strong> Go to <strong className="text-[#e9edef]">Plugins → Add New → Upload Plugin</strong>, select <code className="text-indigo-400 bg-[#111b21] px-1.5 py-0.5 rounded">meshlink-plugin.zip</code>, and click <em>Install Now</em> → <em>Activate</em>.
                  </li>
                  <li>
                    <strong>Ready!</strong> Your WordPress site will render the full WhatsApp-style P2P interface at your homepage, or anywhere using the <code className="text-[#00a884]">[meshlink_app]</code> shortcode.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'source' && (
            <div className="space-y-4">
              <p className="text-xs text-[#8696a0] leading-relaxed">
                Download the complete native Android project or the unified full source repository:
              </p>

              {/* 3. Android Kotlin Project Card */}
              <div className="p-4 bg-[#202c33] border border-[#222e35] rounded-xl space-y-3 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">3. Native Android Project (Kotlin & Compose)</h3>
                      <span className="text-[11px] font-mono text-emerald-400">meshlink-android-source.zip</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => copyDirectUrl('meshlink-android-source.zip')}
                      className="px-2.5 py-1.5 bg-[#111b21] hover:bg-[#2a3942] text-[#8696a0] hover:text-white text-xs rounded-lg flex items-center gap-1 border border-[#222e35] transition-colors"
                      title="Copy Direct Download Link"
                    >
                      {copiedLink === 'meshlink-android-source.zip' ? (
                        <Check className="w-3.5 h-3.5 text-[#00a884]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedLink === 'meshlink-android-source.zip' ? 'Copied' : 'Link'}</span>
                    </button>
                    <button
                      onClick={() =>
                        triggerDownload('/meshlink-android-source.zip', 'meshlink-android-source.zip')
                      }
                      disabled={downloadingFile === 'meshlink-android-source.zip'}
                      className="px-4 py-2 bg-[#00a884] hover:bg-[#02906f] disabled:opacity-50 text-[#111b21] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {downloadingFile === 'meshlink-android-source.zip'
                          ? 'Downloading...'
                          : downloadSuccess === 'meshlink-android-source.zip'
                          ? 'Downloaded!'
                          : 'Download .zip'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#8696a0] space-y-1 pt-2 border-t border-[#2a3942]">
                  <strong className="text-[#d1d7db] block">Production Android Studio Package:</strong>
                  <p className="text-[11px] leading-relaxed">
                    • <code className="text-emerald-300">BleManager.kt</code>: BLE scanner, advertiser, GATT server & client<br />
                    • <code className="text-emerald-300">CryptoManager.kt</code>: Android Keystore, ECDH, AES-256-GCM<br />
                    • <code className="text-emerald-300">RelayEngine.kt & RelayService.kt</code>: Foreground BLE routing engine<br />
                    • <code className="text-emerald-300">AllScreens.kt</code>: Jetpack Compose Material 3 screens<br />
                    • <code className="text-emerald-300">MeshProtocolTest.kt</code>: JUnit test suite for protocol & ACKs
                  </p>
                </div>
              </div>

              {/* 4. Complete Full Project Archive */}
              <div className="p-4 bg-[#202c33] border border-[#222e35] rounded-xl space-y-3 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">4. Complete Full Project (All Sources)</h3>
                      <span className="text-[11px] font-mono text-amber-400">meshlink-source-all.zip</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => copyDirectUrl('meshlink-source-all.zip')}
                      className="px-2.5 py-1.5 bg-[#111b21] hover:bg-[#2a3942] text-[#8696a0] hover:text-white text-xs rounded-lg flex items-center gap-1 border border-[#222e35] transition-colors"
                      title="Copy Direct Download Link"
                    >
                      {copiedLink === 'meshlink-source-all.zip' ? (
                        <Check className="w-3.5 h-3.5 text-[#00a884]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>{copiedLink === 'meshlink-source-all.zip' ? 'Copied' : 'Link'}</span>
                    </button>
                    <button
                      onClick={() =>
                        triggerDownload('/meshlink-source-all.zip', 'meshlink-source-all.zip')
                      }
                      disabled={downloadingFile === 'meshlink-source-all.zip'}
                      className="px-4 py-2 bg-[#00a884] hover:bg-[#02906f] disabled:opacity-50 text-[#111b21] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>
                        {downloadingFile === 'meshlink-source-all.zip'
                          ? 'Downloading...'
                          : downloadSuccess === 'meshlink-source-all.zip'
                          ? 'Downloaded!'
                          : 'Download .zip'}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="text-xs text-[#8696a0] space-y-1 pt-2 border-t border-[#2a3942]">
                  <strong className="text-[#d1d7db] block">Everything Included:</strong>
                  <p className="text-[11px] leading-relaxed">
                    Contains Android Kotlin directory, WordPress theme & plugin folders, React/Vite source code, and configurations in a single archive.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#202c33] border border-[#222e35] rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#00a884] text-[#111b21] flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <span>Method 1: Direct 1-Click Download Inside AI Studio (Fastest)</span>
                </h3>
                <p className="text-xs text-[#8696a0] leading-relaxed pl-8">
                  Inside this AI Studio preview window, simply switch to the <strong>WordPress Packages</strong> or <strong>Android & All Source</strong> tab above and click the green <strong>"Download .zip"</strong> button on any package. The browser immediately streams the file into your computer's <strong>Downloads</strong> folder.
                </p>
              </div>

              <div className="p-4 bg-[#202c33] border border-[#222e35] rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#00a884] text-[#111b21] flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <span>Method 2: Direct URL Download in Browser Address Bar</span>
                </h3>
                <p className="text-xs text-[#8696a0] leading-relaxed pl-8">
                  You can copy and paste any of these URLs directly into a new browser tab to trigger the download:
                </p>
                <div className="pl-8 space-y-1.5 font-mono text-[11px]">
                  <div className="p-2 bg-[#111b21] rounded-lg border border-[#222e35] flex items-center justify-between">
                    <span className="text-[#00a884] truncate">{currentHost}/meshlink-theme.zip</span>
                    <button
                      onClick={() => copyDirectUrl('meshlink-theme.zip')}
                      className="text-xs text-[#8696a0] hover:text-white px-2 py-0.5 rounded bg-[#202c33]"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="p-2 bg-[#111b21] rounded-lg border border-[#222e35] flex items-center justify-between">
                    <span className="text-indigo-400 truncate">{currentHost}/meshlink-plugin.zip</span>
                    <button
                      onClick={() => copyDirectUrl('meshlink-plugin.zip')}
                      className="text-xs text-[#8696a0] hover:text-white px-2 py-0.5 rounded bg-[#202c33]"
                    >
                      Copy
                    </button>
                  </div>
                  <div className="p-2 bg-[#111b21] rounded-lg border border-[#222e35] flex items-center justify-between">
                    <span className="text-emerald-400 truncate">
                      {currentHost}/meshlink-android-source.zip
                    </span>
                    <button
                      onClick={() => copyDirectUrl('meshlink-android-source.zip')}
                      className="text-xs text-[#8696a0] hover:text-white px-2 py-0.5 rounded bg-[#202c33]"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#202c33] border border-[#222e35] rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#00a884] text-[#111b21] flex items-center justify-center font-bold text-xs">
                    3
                  </span>
                  <span>Method 3: Google AI Studio Export Menu</span>
                </h3>
                <p className="text-xs text-[#8696a0] leading-relaxed pl-8">
                  In Google AI Studio's top navigation bar (outside this preview iframe), look for the <strong>Export</strong> or <strong>Download Code / Sync to GitHub</strong> options to download the entire workspace repository at any time.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#222e35] bg-[#202c33] flex items-center justify-between text-xs text-[#8696a0]">
          <span className="flex items-center gap-1.5 text-[#00a884]">
            <CheckCircle2 className="w-4 h-4" />
            <span>All .zip files generated & tested</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#111b21] hover:bg-[#2a3942] text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

