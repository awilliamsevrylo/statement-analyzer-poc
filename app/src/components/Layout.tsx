// src/components/Layout.tsx
// Wrapper for workbench pages: fixed sidebar + fluid main.

import type { ReactNode } from 'react';

export default function Layout({ sidebar, main }: { sidebar: ReactNode; main: ReactNode }) {
  return (
    <div className="grid min-h-[100dvh] grid-cols-[260px_1fr] bg-slate-50">
      <aside className="sticky top-0 h-[100dvh] border-r border-slate-200 bg-white">
        {sidebar}
      </aside>
      <main className="min-w-0">
        {main}
      </main>
    </div>
  );
}
