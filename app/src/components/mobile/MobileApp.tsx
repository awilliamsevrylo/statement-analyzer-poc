'use client';

// src/components/mobile/MobileApp.tsx
import { useState } from 'react';
import PhoneFrame from './PhoneFrame';
import HomeScreen from './HomeScreen';
import SourcingScreen from './SourcingScreen';
import DepositsScreen from './DepositsScreen';
import DebtsScreen from './DebtsScreen';
import AuditScreen from './AuditScreen';
import { mNav } from '@/data/mobile';
import { MI } from './MobileUI';

const ICONS: Record<string, React.ReactNode> = {
  home: MI.home,
  homeFilled: MI.homeFilled,
  sourcing: MI.branch,
  sourcingFilled: MI.branchFilled,
  deposits: MI.dollar,
  depositsFilled: MI.dollarFilled,
  debts: MI.flag,
  debtsFilled: MI.flagFilled,
  audit: MI.list,
  auditFilled: MI.listFilled,
};

export default function MobileApp() {
  const [screen, setScreen] = useState('home');

  const navigateTo = (target: string) => setScreen(target);
  const goBack = () => setScreen('home');

  return (
    <PhoneFrame>
      <div className="relative h-full w-full">
        {/* Screens */}
        <div className="h-full w-full overflow-hidden">
          {screen === 'home' && <HomeScreen onNav={navigateTo} />}
          {screen === 'sourcing' && <SourcingScreen onBack={goBack} />}
          {screen === 'deposits' && <DepositsScreen onBack={goBack} />}
          {screen === 'debts' && <DebtsScreen onBack={goBack} />}
          {screen === 'audit' && <AuditScreen onBack={goBack} />}
        </div>

        {/* Tab bar */}
        <div className="absolute bottom-4 left-3 right-3 z-40">
          <div className="flex items-center justify-around rounded-2xl border border-[rgba(15,23,42,0.08)] bg-white px-2 py-2 shadow-lg">
            {mNav.map((item) => {
              const active = screen === item.id || (screen !== 'home' && screen === item.id);
              const filledKey = `${item.id}Filled`;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setScreen(item.id)}
                  className="flex flex-col items-center gap-0.5 px-2 py-1"
                >
                  <span className={active ? 'text-[var(--accent)]' : 'text-[#94a3b8]'}>
                    {active && ICONS[filledKey] ? ICONS[filledKey] : ICONS[item.id] ?? ICONS[item.icon]}
                  </span>
                  <span
                    className={
                      active ? 'text-[10px] font-medium text-[var(--accent)]' : 'text-[10px] font-medium text-[#94a3b8]'
                    }
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}