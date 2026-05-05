'use client';

import type { ReactNode } from 'react';
import { Card } from '@/components/UI';

interface AgentEmailCardProps {
  from: string;
  to?: string;
  cc?: string;
  re?: string;
  subject?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AgentEmailCard({
  from, to, cc, re, subject, children, footer,
}: AgentEmailCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="space-y-0.5 border-b border-slate-100 bg-slate-50/50 px-5 py-3 text-[11px] text-slate-600">
        <HeaderRow label="From">{from}</HeaderRow>
        {to && <HeaderRow label="To">{to}</HeaderRow>}
        {cc && <HeaderRow label="Cc">{cc}</HeaderRow>}
        {re && <HeaderRow label="Re"><span className="font-medium text-slate-900">{re}</span></HeaderRow>}
        {subject && <HeaderRow label="Subject"><span className="font-medium text-slate-900">{subject}</span></HeaderRow>}
      </div>
      <div className="px-6 pt-5 pb-4">{children}</div>
      {footer && (
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3">{footer}</div>
      )}
    </Card>
  );
}

function HeaderRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <span className="inline-block w-12 text-slate-400">{label}</span>
      {children}
    </div>
  );
}
