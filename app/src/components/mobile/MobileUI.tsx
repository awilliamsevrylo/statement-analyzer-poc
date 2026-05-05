// src/components/mobile/MobileUI.tsx
// Mobile UI primitives — small-screen variants with CSS variable theming.

import type { ReactNode } from 'react';

// ── class utility ─────────────────────────────────────────────────────────────
export function mcls(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(' ');
}

// ── formatters ──────────────────────────────────────────────────────────────
export function mFmtUSD(n: number, opts?: { sign?: boolean; decimals?: number }) {
  const s = opts?.sign && n > 0 ? '+' : '';
  return (
    s +
    '$' +
    Math.abs(n).toLocaleString('en-US', {
      minimumFractionDigits: opts?.decimals ?? 0,
      maximumFractionDigits: opts?.decimals ?? 0,
    })
  );
}

export function mFmtDate(iso: string) {
  const d = new Date(iso + 'T00:00:00');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}`;
}

// ── tone helpers ──────────────────────────────────────────────────────────────
export type MTone = 'neutral' | 'primary' | 'critical' | 'warning' | 'info' | 'success' | 'rent';

export function toneClasses(tone: MTone) {
  const map: Record<MTone, { bg: string; text: string; border: string; ring: string }> = {
    neutral:  { bg: 'bg-[#f1f5f9]', text: 'text-[#475569]', border: 'border-[#e2e8f0]', ring: 'ring-[#e2e8f0]' },
    primary:  { bg: 'bg-[#fff7ed]', text: 'text-[#c2410c]', border: 'border-[#fed7aa]', ring: 'ring-[#fed7aa]' },
    critical: { bg: 'bg-[#fff1f2]', text: 'text-[#be123c]', border: 'border-[#fecdd3]', ring: 'ring-[#fecdd3]' },
    warning:  { bg: 'bg-[#fffbeb]', text: 'text-[#92400e]', border: 'border-[#fde68a]', ring: 'ring-[#fde68a]' },
    info:     { bg: 'bg-[#f0f9ff]', text: 'text-[#075985]', border: 'border-[#bae6fd]', ring: 'ring-[#bae6fd]' },
    success:  { bg: 'bg-[#f0fdf4]', text: 'text-[#15803d]', border: 'border-[#bbf7d0]', ring: 'ring-[#bbf7d0]' },
    rent:     { bg: 'bg-[#eff6ff]', text: 'text-[#1d4ed8]', border: 'border-[#bfdbfe]', ring: 'ring-[#bfdbfe]' },
  };
  return map[tone];
}

export function toneDot(tone: MTone) {
  const map: Record<MTone, string> = {
    neutral:  'bg-[#94a3b8]',
    primary:  'bg-[#eb7230]',
    critical: 'bg-[#e11d48]',
    warning:  'bg-[#f59e0b]',
    info:     'bg-[#0284c7]',
    success:  'bg-[#059669]',
    rent:     'bg-[#3b82f6]',
  };
  return map[tone];
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function MIcon({ children, size = 20, className }: { children: ReactNode; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      {children}
    </svg>
  );
}

export const MI = {
  home: (
    <MIcon>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </MIcon>
  ),
  homeFilled: (
    <MIcon>
      <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" /><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10H3z" />
    </MIcon>
  ),
  branch: (
    <MIcon>
      <line x1="6" x2="6" y1="3" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" />
    </MIcon>
  ),
  branchFilled: (
    <MIcon>
      <path d="M6 3v12" /><circle cx="18" cy="6" r="3" fill="currentColor" /><circle cx="6" cy="18" r="3" fill="currentColor" /><path d="M18 9a9 9 0 0 1-9 9" />
    </MIcon>
  ),
  dollar: (
    <MIcon>
      <line x1="12" x2="12" y1="2" y2="22" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </MIcon>
  ),
  dollarFilled: (
    <MIcon>
      <line x1="12" x2="12" y1="2" y2="22" strokeWidth={2.5} /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeWidth={2.5} />
    </MIcon>
  ),
  flag: (
    <MIcon>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" x2="4" y1="22" y2="15" />
    </MIcon>
  ),
  flagFilled: (
    <MIcon>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="currentColor" /><line x1="4" x2="4" y1="22" y2="15" />
    </MIcon>
  ),
  list: (
    <MIcon>
      <line x1="8" x2="21" y1="6" y2="6" /><line x1="8" x2="21" y1="12" y2="12" /><line x1="8" x2="21" y1="18" y2="18" /><line x1="3" x2="3.01" y1="6" y2="6" /><line x1="3" x2="3.01" y1="12" y2="12" /><line x1="3" x2="3.01" y1="18" y2="18" />
    </MIcon>
  ),
  listFilled: (
    <MIcon>
      <line x1="8" x2="21" y1="6" y2="6" strokeWidth={2.5} /><line x1="8" x2="21" y1="12" y2="12" strokeWidth={2.5} /><line x1="8" x2="21" y1="18" y2="18" strokeWidth={2.5} /><circle cx="3.5" cy="6" r="1.5" fill="currentColor" /><circle cx="3.5" cy="12" r="1.5" fill="currentColor" /><circle cx="3.5" cy="18" r="1.5" fill="currentColor" />
    </MIcon>
  ),
  search: (
    <MIcon>
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </MIcon>
  ),
  bell: (
    <MIcon>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </MIcon>
  ),
  sparkle: (
    <MIcon>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z" />
    </MIcon>
  ),
  chevronRight: (
    <MIcon size={16}>
      <path d="m9 18 6-6-6-6" />
    </MIcon>
  ),
  chevronLeft: (
    <MIcon size={16}>
      <path d="m15 18-6-6 6-6" />
    </MIcon>
  ),
  mail: (
    <MIcon size={16}>
      <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </MIcon>
  ),
  check: (
    <MIcon size={16}>
      <path d="M20 6 9 17l-5-5" />
    </MIcon>
  ),
  alert: (
    <MIcon size={16}>
      <circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" />
    </MIcon>
  ),
  send: (
    <MIcon size={16}>
      <path d="m22 2-7 20-4-9-9-4 20-7z" /><path d="M22 2 11 13" />
    </MIcon>
  ),
  x: (
    <MIcon size={16}>
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </MIcon>
  ),
};

// ── MCard ─────────────────────────────────────────────────────────────────────
export function MCard({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={mcls(
        'rounded-xl border border-[rgba(15,23,42,0.08)] bg-[var(--card)] p-4 shadow-sm',
        onClick && 'active:scale-[0.98] transition-transform',
        className,
      )}
    >
      {children}
    </div>
  );
}

// ── MBtn ────────────────────────────────────────────────────────────────────
export function MBtn({
  children,
  variant = 'primary',
  className,
  onClick,
  size = 'md',
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  className?: string;
  onClick?: () => void;
  size?: 'sm' | 'md';
}) {
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
  };
  const variants = {
    primary: 'bg-[var(--accent)] text-white active:opacity-90',
    secondary: 'bg-[var(--card)] text-[var(--text)] border border-[rgba(15,23,42,0.08)] active:bg-[rgba(15,23,42,0.04)]',
    ghost: 'text-[var(--text)] active:bg-[rgba(15,23,42,0.04)]',
    danger: 'bg-[#fff1f2] text-[#be123c] active:bg-[#ffe4e6]',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={mcls(
        'inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition-opacity',
        sizes[size],
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

// ── MBadge ──────────────────────────────────────────────────────────────────
export function MBadge({ tone, children, className }: { tone: MTone; children: ReactNode; className?: string }) {
  const t = toneClasses(tone);
  return (
    <span className={mcls('inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold', t.bg, t.text, className)}>
      {children}
    </span>
  );
}

// ── MDot ────────────────────────────────────────────────────────────────────
export function MDot({ tone, size = 8 }: { tone: MTone; size?: number }) {
  return <span className={mcls('inline-block rounded-full', toneDot(tone))} style={{ width: size, height: size }} />;
}

// ── MRing ─────────────────────────────────────────────────────────────────────
export function MRing({ value, size = 40, stroke = 4, className }: { value: number; size?: number; stroke?: number; className?: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 80 ? '#059669' : value >= 60 ? '#f59e0b' : '#94a3b8';
  return (
    <div className={mcls('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-[var(--text)]">{value}</span>
    </div>
  );
}

// ── MAppBar ─────────────────────────────────────────────────────────────────
export function MAppBar({
  title,
  left,
  right,
  className,
}: {
  title: ReactNode;
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={mcls('flex items-center justify-between px-4 py-3', className)}>
      <div className="flex items-center gap-2">{left}</div>
      <div className="text-sm font-semibold text-[var(--text)]">{title}</div>
      <div className="flex items-center gap-2">{right}</div>
    </div>
  );
}

// ── MSectionLabel ─────────────────────────────────────────────────────────────
export function MSectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={mcls('px-4 pt-5 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]', className)}>
      {children}
    </div>
  );
}

// ── MSwipeRow ───────────────────────────────────────────────────────────────
export function MSwipeRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={mcls('relative overflow-hidden rounded-xl', className)}>
      {children}
    </div>
  );
}
