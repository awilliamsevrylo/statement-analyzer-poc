'use client';

// src/components/Navbar.tsx
// Top navigation bar for the branded header.

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cls } from './UI';
import { useAppContext } from '@/app/_components/AppContext';
import { totalUnresolvedDecisions } from '@/data/inbox';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { openNewAnalysis } = useAppContext();

  const isFilesActive = pathname === '/' || pathname.startsWith('/jobs/');
  const isInboxActive = pathname?.startsWith('/inbox') ?? false;
  const unread = totalUnresolvedDecisions();

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-7 py-4">
      {/* Left: Logo + Nav */}
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="28" height="28" rx="6" fill="#eb7230" />
            <path d="M8 20V8h5.5c2.5 0 4 1.2 4 3.2 0 1.4-.8 2.4-2 2.9l2.8 5.9H15.5l-2.4-5.4H10.5V20H8z" fill="white" />
          </svg>
          <span className="text-sm font-semibold text-slate-900">Evrylo</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            href="/"
            className={cls(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isFilesActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )}
          >
            Files
          </Link>
          <Link
            href="/inbox"
            className={cls(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              isInboxActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )}
          >
            Inbox
            {unread > 0 && (
              <span
                className={cls(
                  'inline-flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums',
                  isInboxActive
                    ? 'bg-white/20 text-white'
                    : 'bg-rose-100 text-rose-700',
                )}
              >
                {unread}
              </span>
            )}
          </Link>
          {(['Templates', 'Settings'] as const).map((label) => (
            <a
              key={label}
              href="#"
              aria-disabled="true"
              title="Coming soon"
              onClick={(e) => e.preventDefault()}
              className="cursor-not-allowed rounded-md px-3 py-1.5 text-sm font-medium text-slate-300"
            >
              {label}
            </a>
          ))}
        </nav>
      </div>

      {/* Right: Search + CTA + Avatar */}
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Search files…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                router.push(`/?q=${encodeURIComponent(query.trim())}`);
              }
            }}
            className="h-9 w-56 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
          />
          <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </span>
        </div>
        <button
          type="button"
          onClick={openNewAnalysis}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#eb7230] px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#d96526]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" /><path d="M12 5v14" />
          </svg>
          New analysis
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          SS
        </div>
      </div>
    </header>
  );
}
