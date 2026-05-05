'use client';

// src/components/mobile/PhoneFrame.tsx
import type { ReactNode } from 'react';

export default function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto box-content overflow-hidden rounded-[58px] border-[12px] border-[#1c1c1e] bg-[#1c1c1e] shadow-2xl"
      style={{ width: 390, height: 844 }}
    >
      {/* Inner screen */}
      <div
        className="relative h-full w-full overflow-hidden rounded-[48px] bg-[var(--bg)]"
        style={{
          ['--accent' as string]: '#eb7230',
          ['--bg' as string]: '#f6f5f3',
          ['--card' as string]: '#ffffff',
          ['--text' as string]: '#0f172a',
          ['--border' as string]: 'rgba(15,23,42,0.08)',
        }}
      >
        {/* Dynamic Island */}
        <div className="pointer-events-none absolute left-1/2 top-3 z-50 h-[35px] w-[126px] -translate-x-1/2 rounded-full bg-black" />

        {/* Content */}
        <div className="h-full w-full overflow-hidden">
          {children}
        </div>

        {/* Home indicator */}
        <div className="pointer-events-none absolute bottom-2 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-full bg-black/80" />
      </div>
    </div>
  );
}