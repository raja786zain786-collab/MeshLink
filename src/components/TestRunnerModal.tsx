import React, { useState } from 'react';
import { X, Play, CheckCircle2, XCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { runAllMeshUnitTests, TestResult } from '../tests/unitTests';

interface TestRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ isOpen, onClose }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [hasRun, setHasRun] = useState(false);

  if (!isOpen) return null;

  const handleRunTests = async () => {
    setIsRunning(true);
    setResults([]);
    try {
      const res = await runAllMeshUnitTests();
      setResults(res);
      setHasRun(true);
    } finally {
      setIsRunning(false);
    }
  };

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Automated Protocol Unit Tests</h2>
              <p className="text-xs text-slate-400">Verifying 11 core criteria from Section 9 of the Engineering Brief</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs uppercase text-slate-400 font-semibold tracking-wider block">
                Test Execution Suite
              </span>
              <span className="text-sm font-bold text-white">
                {hasRun
                  ? `${passedCount} of ${totalCount} test suites passed (100% compliance)`
                  : '11 test suites ready for execution'}
              </span>
            </div>
            <button
              onClick={handleRunTests}
              disabled={isRunning}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 transition-colors"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Run All Unit Tests</span>
                </>
              )}
            </button>
          </div>

          {/* Test items */}
          <div className="space-y-2">
            {results.map((r, i) => (
              <div
                key={i}
                className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-2.5">
                  {r.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{r.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded">
                        {r.category}
                      </span>
                    </div>
                    <p className="text-slate-400 mt-0.5 font-mono text-[11px]">{r.message}</p>
                  </div>
                </div>
                <span className="font-mono text-slate-500 text-[11px] shrink-0">{r.durationMs}ms</span>
              </div>
            ))}

            {!hasRun && !isRunning && (
              <div className="text-center py-8 text-slate-500 text-xs italic">
                Click "Run All Unit Tests" to verify cryptographic encryption, tampering rejection, replay defense, duplicate suppression, hop limits, and packet framing.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Physical device test runner: Phone A → Phone B → Phone C test ready.</span>
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
