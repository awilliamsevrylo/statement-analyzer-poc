// src/components/SideNav.tsx
// 260px sidebar for the file workbench.

import { cls, Badge } from './UI';

const TABS = [
  { id: 'summary',       label: 'Summary' },
  { id: 'sourcing',      label: 'Source-of-funds' },
  { id: 'deposits',      label: 'Large Deposits' },
  { id: 'undisclosed',   label: 'Undisclosed' },
  { id: 'audit',         label: 'Audit Trail' },
  { id: 'coverage',      label: 'Coverage' },
];

export default function SideNav({ activeTab = 'summary' }: { activeTab?: string }) {
  return (
    <div className="flex h-full flex-col">
      {/* Current file header */}
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Current file</div>
        <div className="mt-1 text-sm font-semibold text-slate-900">Marcus Chen</div>
        <div className="mt-0.5 text-xs text-slate-500">LO-2026-04823</div>
      </div>

      {/* Navigation tabs */}
      <nav className="flex-1 px-3 py-3">
        <div className="space-y-0.5">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <a
                key={tab.id}
                href={`#/jobs/LO-2026-04823/${tab.id}`}
                className={cls(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-orange-50 text-[#eb7230]'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                {tab.label}
                {tab.id === 'deposits' && (
                  <Badge tone="warning" className="ml-auto">2</Badge>
                )}
                {tab.id === 'undisclosed' && (
                  <Badge tone="critical" className="ml-auto">5</Badge>
                )}
                {tab.id === 'sourcing' && (
                  <Badge tone="primary" className="ml-auto">1 unsourced</Badge>
                )}
              </a>
            );
          })}
        </div>
      </nav>

      {/* Status section at bottom */}
      <div className="border-t border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-xs font-medium text-slate-700">Needs action</span>
        </div>
        <div className="mt-1 text-xs text-slate-500">7 open items · Close May 22</div>
      </div>
    </div>
  );
}
