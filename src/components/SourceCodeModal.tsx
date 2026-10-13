import React, { useState } from 'react';
import { X, Code2, Copy, Check, FileCode, Download } from 'lucide-react';
import { ANDROID_SOURCE_CATALOG } from '../androidSources/sourceCatalog';

interface SourceCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourceCodeModal: React.FC<SourceCodeModalProps> = ({ isOpen, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentFile = ANDROID_SOURCE_CATALOG[selectedIndex];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Android Kotlin & Jetpack Compose Source Code</h2>
              <p className="text-xs text-slate-400">Complete, production-grade Android Studio project files</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/meshlink-android-source.zip"
              download="meshlink-android-source.zip"
              className="px-3 py-1.5 bg-[#00a884] hover:bg-[#02906f] text-[#111b21] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download Android .ZIP</span>
              <span className="sm:hidden">.ZIP</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Layout: Sidebar + Code Editor */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* File Selector Sidebar */}
          <div className="w-full md:w-72 border-r border-slate-800 bg-slate-950/60 p-3 overflow-y-auto space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 py-1 block">
              Project Files
            </span>
            {ANDROID_SOURCE_CATALOG.map((f, i) => (
              <button
                key={i}
                onClick={() => setSelectedIndex(i)}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono flex items-center gap-2 transition-colors ${
                  selectedIndex === i
                    ? 'bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <FileCode className="w-4 h-4 shrink-0 text-slate-500" />
                <span className="truncate">{f.title}</span>
              </button>
            ))}
          </div>

          {/* Main Code View */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* File info bar */}
            <div className="px-5 py-3 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
              <div>
                <span className="text-xs font-mono font-bold text-white">{currentFile.path}</span>
                <p className="text-[11px] text-slate-400 mt-0.5">{currentFile.description}</p>
              </div>
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1.5 transition-colors font-medium shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body */}
            <div className="flex-1 p-5 overflow-auto font-mono text-xs text-slate-300 bg-slate-950/90 leading-relaxed selection:bg-indigo-500/30">
              <pre className="whitespace-pre">{currentFile.code}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>All files written directly to <code className="text-slate-200">/android</code> directory in repository root.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
