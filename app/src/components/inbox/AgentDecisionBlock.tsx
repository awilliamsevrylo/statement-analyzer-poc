'use client';

import { cls, I } from '@/components/UI';
import type { AgentDecision, AgentDecisionOption } from '@/data/inbox';

interface AgentDecisionBlockProps {
  decision: AgentDecision;
  loanNumber: string;
  onResolve?: (id: AgentDecisionOption['id']) => void;
}

const TONE_STYLES: Record<AgentDecisionOption['tone'], { row: string; badge: string; sub: string }> = {
  success: {
    row:   'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900',
    badge: 'bg-emerald-600 text-white',
    sub:   'text-emerald-700',
  },
  critical: {
    row:   'border-rose-200 bg-rose-50/40 hover:bg-rose-50 text-rose-900',
    badge: 'bg-rose-600 text-white',
    sub:   'text-rose-700',
  },
  neutral: {
    row:   'border-slate-200 bg-white hover:bg-slate-50 text-slate-800',
    badge: 'bg-slate-700 text-white',
    sub:   'text-slate-500',
  },
};

const TONE_GLYPH: Record<AgentDecisionOption['tone'], string> = {
  success:  '✓',
  critical: '✕',
  neutral:  '⌕',
};

function expiresLabel(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'expired';
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  return `expires in ${days} day${days === 1 ? '' : 's'}`;
}

export default function AgentDecisionBlock({ decision, loanNumber, onResolve }: AgentDecisionBlockProps) {
  const resolved = !!decision.resolvedWith;

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-md bg-[#eb7230] text-white">
          {I.sparkle}
        </div>
        <div className="text-[12px] text-slate-500">Processed in 14 seconds · 1 question for you</div>
      </div>

      <p className="mb-3 text-[14px] text-slate-800">
        Hey Steph — pulled <span className="font-semibold">Wells Fargo ****7842 · April</span> from your forward. One thing needs your call:
      </p>

      <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/60 p-3.5">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700">Needs decision</div>
        <div className="text-[14px] font-semibold text-slate-900">{decision.question}</div>
        <div className="mt-1 text-[12px] text-slate-700">{decision.context}</div>
      </div>

      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Reply with one tap</div>
      <div className="space-y-1.5">
        {decision.options.map((opt) => {
          const styles = TONE_STYLES[opt.tone];
          const isResolved = decision.resolvedWith === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={resolved}
              onClick={() => onResolve?.(opt.id)}
              className={cls(
                'flex w-full items-center gap-3 rounded-lg border px-4 py-2.5 text-left transition-colors',
                styles.row,
                resolved && !isResolved && 'opacity-40',
                resolved && 'cursor-not-allowed',
              )}
            >
              <span className={cls('flex size-7 items-center justify-center rounded-md text-[13px] font-bold', styles.badge)}>
                {TONE_GLYPH[opt.tone]}
              </span>
              <div className="flex-1">
                <div className="text-[13px] font-semibold">{opt.label}</div>
                <div className={cls('text-[11px]', styles.sub)}>{opt.sublabel}</div>
              </div>
              {isResolved && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-[10px] text-slate-400">
        Replies are tracked to {loanNumber} · {resolved ? 'resolved' : expiresLabel(decision.expiresAt)}
      </div>
    </>
  );
}
