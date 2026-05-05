// src/components/UI.tsx
// Reusable UI primitives used across the Evrylo app.

import type { ReactNode } from 'react';

// ── class utility ─────────────────────────────────────────────────────────────
export function cls(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(' ');
}

// ── formatters ──────────────────────────────────────────────────────────────
export function fmtUSD(n: number, opts?: { sign?: boolean; decimals?: number }) {
  const s = opts?.sign && n > 0 ? '+' : '';
  return s + '$' + Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: opts?.decimals ?? 2,
    maximumFractionDigits: opts?.decimals ?? 2,
  });
}

export function fmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}`;
}

export function fmtLongDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export type BadgeTone = 'neutral' | 'primary' | 'critical' | 'warning' | 'info' | 'success' | 'rent';

const BADGE_TONES: Record<BadgeTone, string> = {
  neutral:  'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  primary:  'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  critical: 'bg-rose-50 text-rose-700 ring-1 ring-rose-200',
  warning:  'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
  info:     'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  success:  'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  rent:     'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
};

export function Badge({ tone, children, className }: { tone: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={cls('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', BADGE_TONES[tone], className)}>
      {children}
    </span>
  );
}

// ── SeverityBadge ─────────────────────────────────────────────────────────────
export type Severity = 'critical' | 'warning' | 'info' | 'pass';

const SEVERITY_CONFIG: Record<Severity, { label: string; tone: BadgeTone }> = {
  critical: { label: 'Critical', tone: 'critical' },
  warning:  { label: 'Warning', tone: 'warning' },
  info:     { label: 'Info', tone: 'info' },
  pass:     { label: 'Pass', tone: 'success' },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const c = SEVERITY_CONFIG[severity];
  return (
    <Badge tone={c.tone}>
      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'currentColor' }} />
      {c.label}
    </Badge>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div className={cls('rounded-xl border border-slate-200 bg-white shadow-sm', className)} onClick={onClick}>
      {children}
    </div>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';

const BTN_VARIANTS: Record<BtnVariant, string> = {
  primary:  'bg-[#eb7230] text-white hover:bg-[#d96526] shadow-sm',
  secondary: 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50',
  ghost:    'text-slate-600 hover:bg-slate-100',
  danger:   'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50',
  success:  'bg-emerald-600 text-white hover:bg-emerald-700',
};

export function Btn({
  variant = 'primary',
  children,
  className,
  onClick,
  href,
  disabled,
}: {
  variant?: BtnVariant;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}) {
  const classes = cls(
    'inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    BTN_VARIANTS[variant],
    disabled && 'cursor-not-allowed opacity-50 pointer-events-none',
    className,
  );
  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// ── ConfidenceBar ────────────────────────────────────────────────────────────
export function ConfidenceBar({ value }: { value: number }) {
  const color = value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-slate-300';
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100">
      <div className={cls('h-1.5 rounded-full transition-all', color)} style={{ width: `${value}%` }} />
    </div>
  );
}

// ── Inline SVG Icons (lucide-style, 16px, strokeWidth=2) ─────────────────────
function Icon({
  children,
  size = 16,
  className,
}: {
  children: ReactNode;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

export const I = {
  search: (
    <Icon>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </Icon>
  ),
  plus: (
    <Icon>
      <path d="M5 12h14" /><path d="M12 5v14" />
    </Icon>
  ),
  chevronDown: (
    <Icon>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  ),
  chevronRight: (
    <Icon>
      <path d="m9 18 6-6-6-6" />
    </Icon>
  ),
  chevronLeft: (
    <Icon>
      <path d="m15 18-6-6 6-6" />
    </Icon>
  ),
  alert: (
    <Icon>
      <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
    </Icon>
  ),
  check: (
    <Icon>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  ),
  mail: (
    <Icon>
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </Icon>
  ),
  flag: (
    <Icon>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" />
    </Icon>
  ),
  x: (
    <Icon>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </Icon>
  ),
  download: (
    <Icon>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
    </Icon>
  ),
  filter: (
    <Icon>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </Icon>
  ),
  link: (
    <Icon>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Icon>
  ),
  bank: (
    <Icon>
      <path d="M3 21h18" /><path d="M3 10h18" /><path d="M5 6l7-3 7 3" /><path d="M4 10v11" /><path d="M20 10v11" /><path d="M8 14v3" /><path d="M12 14v3" /><path d="M16 14v3" />
    </Icon>
  ),
  user: (
    <Icon>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </Icon>
  ),
  file: (
    <Icon>
      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" /><path d="M14 2v6h6" />
    </Icon>
  ),
  arrowRight: (
    <Icon>
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </Icon>
  ),
  arrowDown: (
    <Icon>
      <path d="M12 5v14" /><path d="m19 12-7 7-7-7" />
    </Icon>
  ),
  branch: (
    <Icon>
      <line x1="6" x2="6" y1="3" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" />
    </Icon>
  ),
  shield: (
    <Icon>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Icon>
  ),
  dollar: (
    <Icon>
      <line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </Icon>
  ),
  sparkle: (
    <Icon>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z" />
    </Icon>
  ),
  send: (
    <Icon>
      <path d="m22 2-7 20-4-9-9-4 20-7z" /><path d="M22 2 11 13" />
    </Icon>
  ),
  list: (
    <Icon>
      <line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" />
    </Icon>
  ),
  home: (
    <Icon>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </Icon>
  ),
};
