'use client';

import MobileApp from '@/components/mobile/MobileApp';

export default function MobilePage() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-slate-100 p-8">
      <div className="text-center">
        <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">Mobile App Preview</div>
        <MobileApp />
        <p className="mt-4 text-sm text-slate-500">390×844 iPhone frame with 5-tab navigation</p>
      </div>
    </div>
  );
}
