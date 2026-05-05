'use client';

// src/components/modals/NewAnalysisModal.tsx
// New analysis modal with workflow selector and upload progress.

import { useState, useCallback } from 'react';
import { cls, Btn, I } from '@/components/UI';

type WorkflowType = 'bsl' | 'general';

interface NewAnalysisModalProps {
  onClose: () => void;
}

const PROCESSING_STEPS = [
  { label: 'OCR', detail: 'Extracting text from PDFs' },
  { label: 'Classify', detail: 'Categorizing deposits & debits' },
  { label: 'Trigger-match', detail: 'Detecting undisclosed debts' },
  { label: 'Trace transfers', detail: 'Linking source-of-funds chains' },
];

export default function NewAnalysisModal({ onClose }: NewAnalysisModalProps) {
  const [workflow, setWorkflow] = useState<WorkflowType>('general');
  const [borrowerName, setBorrowerName] = useState('');
  const [files, setFiles] = useState<string[]>([]);
  const [step, setStep] = useState<'config' | 'uploading' | 'done'>('config');
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState(0);

  function addDemoFile() {
    setFiles(['Wells_Fargo_7842_Statements.pdf', 'Chase_3921_Statements.pdf']);
  }

  function runAnalysis() {
    if (!borrowerName.trim() || files.length === 0) return;
    setStep('uploading');
    setProgress(0);
    setCompletedSteps(0);

    let p = 0;
    const interval = setInterval(() => {
      p += 4;
      setProgress(p);
      setCompletedSteps(Math.floor((p / 100) * PROCESSING_STEPS.length));
      if (p >= 100) {
        clearInterval(interval);
        setStep('done');
      }
    }, 120);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).map((f) => f.name);
    setFiles((prev) => [...prev, ...dropped]);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm">
      <div className="flex w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="text-sm font-semibold text-slate-900">New analysis</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            {I.x}
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {step === 'config' && (
            <div className="space-y-5">
              {/* Workflow selector */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Workflow
                </label>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWorkflow('bsl')}
                    className={cls(
                      'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors',
                      workflow === 'bsl'
                        ? 'border-[#eb7230] bg-orange-50 ring-1 ring-orange-200'
                        : 'border-slate-200 hover:border-slate-300',
                    )}
                  >
                    <div className={cls(
                      'flex h-9 w-9 items-center justify-center rounded-lg',
                      workflow === 'bsl' ? 'bg-[#eb7230] text-white' : 'bg-slate-100 text-slate-600',
                    )}>
                      {I.shield}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Bank Statement Loan</div>
                      <div className="mt-0.5 text-xs text-slate-500">12 months · Self-employed / 1099</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWorkflow('general')}
                    className={cls(
                      'flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-colors',
                      workflow === 'general'
                        ? 'border-[#eb7230] bg-orange-50 ring-1 ring-orange-200'
                        : 'border-slate-200 hover:border-slate-300',
                    )}
                  >
                    <div className={cls(
                      'flex h-9 w-9 items-center justify-center rounded-lg',
                      workflow === 'general' ? 'bg-[#eb7230] text-white' : 'bg-slate-100 text-slate-600',
                    )}>
                      {I.dollar}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">General audit</div>
                      <div className="mt-0.5 text-xs text-slate-500">2 months · W-2 / Conventional / FHA</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Borrower name */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Borrower name
                </label>
                <input
                  type="text"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  placeholder="e.g. Marcus Chen"
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
                />
              </div>

              {/* File drop zone */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Bank statements
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  className="mt-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-6 py-8 text-center transition-colors hover:border-slate-400"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    {I.file}
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-900">
                    Drop PDF bank statements here
                  </p>
                  <p className="mt-1 text-xs text-slate-500">or</p>
                  <button
                    type="button"
                    className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Browse files
                  </button>
                  <button
                    type="button"
                    onClick={addDemoFile}
                    className="mt-2 ml-2 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#eb7230] hover:bg-orange-50"
                  >
                    Use demo file
                  </button>
                </div>
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="space-y-1.5">
                  {files.map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                    >
                      {I.file}
                      <span className="text-xs text-slate-700">{f}</span>
                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((x) => x !== f))}
                        className="ml-auto rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                      >
                        {I.x}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'uploading' && (
            <div className="space-y-5 py-2">
              <div>
                <div className="flex items-center justify-between text-sm font-medium text-slate-900">
                  <span>Uploading & analyzing…</span>
                  <span>{progress}%</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#eb7230] transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {PROCESSING_STEPS.map((s, i) => {
                  const done = i < completedSteps;
                  const current = i === completedSteps && progress < 100;
                  return (
                    <div
                      key={s.label}
                      className={cls(
                        'flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
                        done
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : current
                          ? 'border-orange-200 bg-orange-50/40'
                          : 'border-slate-200 bg-white',
                      )}
                    >
                      <div
                        className={cls(
                          'flex h-6 w-6 items-center justify-center rounded-full',
                          done
                            ? 'bg-emerald-500 text-white'
                            : current
                            ? 'bg-[#eb7230] text-white'
                            : 'bg-slate-100 text-slate-400',
                        )}
                      >
                        {done ? I.check : <span className="text-xs font-medium">{i + 1}</span>}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{s.label}</div>
                        <div className="text-xs text-slate-500">{s.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'done' && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                {I.check}
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">Analysis complete</h3>
              <p className="mt-1 text-sm text-slate-500">
                Your file is ready for review. 7 action items were detected.
              </p>
              <Btn className="mt-5" onClick={onClose}>
                Open workbench
              </Btn>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'config' && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
            <Btn variant="ghost" onClick={onClose}>
              Cancel
            </Btn>
            <Btn
              onClick={runAnalysis}
              disabled={!borrowerName.trim() || files.length === 0}
            >
              Run analysis
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}