'use client';

// Cross-page client state. Owned by `ClientShell` (the root client component
// under `app/layout.tsx`). Every page is a consumer because `ClientShell`
// wraps `{children}`.
//
// What lives here vs. local useState:
//   - HERE: state that >1 page needs to read or write (modal trigger, decision map).
//   - NOT HERE: per-page UI state (filter chips, search query, expanded rows).
//
// See docs/STATE.md for the full state model.

import { createContext, useContext } from 'react';

/** The three options on every Pattern-E (boolean decision) email. */
export type DecisionChoice = 'yes' | 'no' | 'chat';

export interface AppContextValue {
  /** Triggers `<NewAnalysisModal>` from anywhere. Both Navbar and Dashboard call this. */
  openNewAnalysis: () => void;
  /**
   * Map keyed by Inbox `agent-decision` event id. Drives:
   *   - Navbar's rose unread-count badge (counts unresolved decisions across all threads).
   *   - Inbox left-rail per-thread badge (same, scoped to one thread).
   *   - Inbox right pane: replaces the seed `decision.resolvedWith` so the
   *     "Selected" pill renders on the chosen option.
   */
  resolvedDecisions: Record<string, DecisionChoice>;
  /**
   * Mark a single decision resolved. Idempotent — overwrites any previous choice.
   * Side-effect of appending the follow-up `agent-outbound` event lives in
   * `InboxPage`, not here, because only the page knows which thread to mutate.
   */
  setResolvedDecision: (eventId: string, choice: DecisionChoice) => void;
}

export const AppContext = createContext<AppContextValue | null>(null);

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within ClientShell');
  return ctx;
}
