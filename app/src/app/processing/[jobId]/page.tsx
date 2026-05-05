'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { cls, Btn } from '@/components/UI';
import { dashboardFiles, PROCESSING_STEPS } from '@/data/dashboard';

type ProcessStatus = 'running' | 'done' | 'failed';

interface StepState {
  id: string;
  label: string;
  state: 'done' | 'running' | 'error' | 'pending';
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export default function ProcessingPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params?.jobId;
  const router = useRouter();

  const file = useMemo(() => dashboardFiles.find((f) => f.id === jobId), [jobId]);

  const status: ProcessStatus = useMemo(() => {
    if (!file) return 'running';
    if (file.status === 'failed') return 'failed';
    if (file.status === 'completed') return 'done';
    return 'running';
  }, [file]);

  const progressPct = file?.progress_pct ?? (status === 'done' ? 100 : status === 'failed' ? 35 : 62);
  const currentStepIndex = Math.max(0, Math.min(8, Math.floor((progressPct / 100) * 9)));

  const steps: StepState[] = useMemo(() => {
    return PROCESSING_STEPS.map((s, i) => {
      if (status === 'done') return { id: s.id, label: s.label, state: 'done' };
      if (status === 'failed') {
        if (i < currentStepIndex) return { id: s.id, label: s.label, state: 'done' };
        if (i === currentStepIndex) return { id: s.id, label: s.label, state: 'error' };
        return { id: s.id, label: s.label, state: 'pending' };
      }
      if (i < currentStepIndex) return { id: s.id, label: s.label, state: 'done' };
      if (i === currentStepIndex) return { id: s.id, label: s.label, state: 'running' };
      return { id: s.id, label: s.label, state: 'pending' };
    });
  }, [status, currentStepIndex]);

  const headline = status === 'failed' ? 'Analysis failed' : status === 'done' ? 'Analysis complete' : 'Analyzing statements…';

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-50 p-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div
            className={cls(
              'flex h-10 w-10 items-center justify-center rounded-xl',
              status === 'failed' && 'bg-rose-50 text-rose-600',
              status === 'done' && 'bg-emerald-50 text-emerald-600',
              status === 'running' && 'bg-orange-50 text-orange-600',
            )}
          >
            {status === 'failed' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            )}
            {status === 'done' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            )}
            {status === 'running' && <Spinner />}
          </div>

          <div className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Job {jobId ?? '—'}
          </div>
          <h1 className="mt-1 text-lg font-semibold text-slate-900">{headline}</h1>
          {file?.fail_reason && (
            <p className="mt-1 text-sm text-rose-600">{file.fail_reason}</p>
          )}
          {file?.fail_detail && (
            <p className="mt-1 text-xs text-slate-500">{file.fail_detail}</p>
          )}
        </div>

        <div className="mt-6 space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-3">
              <div className="flex w-5 items-center justify-center">
                {step.state === 'done' && (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </div>
                )}
                {step.state === 'running' && (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
                    </span>
                  </div>
                )}
                {step.state === 'error' && (
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                  </div>
                )}
                {step.state === 'pending' && (
                  <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                )}
              </div>
              <span
                className={cls(
                  'text-sm',
                  step.state === 'done' && 'text-slate-700',
                  step.state === 'running' && 'font-medium text-slate-900',
                  step.state === 'error' && 'font-medium text-rose-700',
                  step.state === 'pending' && 'text-slate-400',
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center">
          {status === 'failed' && (
            <Btn variant="primary" onClick={() => router.push(`/processing/${jobId}`)}>
              Retry analysis
            </Btn>
          )}
          {status === 'done' && (
            <Btn variant="primary" onClick={() => router.push(`/report/${jobId}`)}>
              Open report
            </Btn>
          )}
          {status === 'running' && (
            <p className="text-xs text-slate-500">This usually takes 30–60 seconds</p>
          )}
        </div>
      </div>
    </div>
  );
}
