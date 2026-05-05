// src/data/mobile.ts
// Mobile data — same scenario as desktop, restructured for mobile screens.

export interface MBorrower {
  name: string;
  initials: string;
  loan_number: string;
  loan_type: string;
  loan_amount: number;
  monthly_gross_income: number;
  est_close: string;
  days_to_close: number;
  status_label: string;
  property: string;
  brokerage: string;
}

export const mBorrower: MBorrower = {
  name: 'Marcus Chen',
  initials: 'MC',
  loan_number: 'LO-2026-04823',
  loan_type: 'Conventional Refi',
  loan_amount: 612_000,
  monthly_gross_income: 30_208,
  est_close: 'May 22',
  days_to_close: 17,
  status_label: 'Action needed',
  property: '4321 Oak St · 4-plex',
  brokerage: 'LeaderOne',
};

export interface MFileStats {
  qualifying_income: number;
  unsourced_funds: number;
  undisclosed_debts_count: number;
  undisclosed_debts_monthly: number;
  large_deposits_open: number;
  coverage: { months_required: number; months_provided: number; gap_label: string };
}

export const mFileStats: MFileStats = {
  qualifying_income: 30_208,
  unsourced_funds: 14_000,
  undisclosed_debts_count: 5,
  undisclosed_debts_monthly: 2_896.77,
  large_deposits_open: 2,
  coverage: { months_required: 6, months_provided: 5, gap_label: 'Sep 2025 missing' },
};

export interface MAction {
  id: string;
  priority: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  sub: string;
  cta: string;
  screen: string;
  amount?: number;
  badge: string;
  resolved?: boolean;
}

export const mActions: MAction[] = [
  {
    id: 'a1', priority: 'critical', title: '$14,000 unsourced transfer',
    sub: 'From ****1234 — statements not provided', cta: 'Email borrower', screen: 'sourcing',
    amount: 14_000, badge: 'Blocking close',
  },
  {
    id: 'a2', priority: 'warning', title: '$16,000 Zelle from Ryan Chen',
    sub: 'Possible gift — needs gift letter', cta: 'Request letter', screen: 'deposits',
    amount: 16_000, badge: 'Gift letter',
  },
  {
    id: 'a3', priority: 'warning', title: '5 undisclosed debt patterns',
    sub: 'UPLIFT, HONDA, AFFIRM, KLARNA, PINE', cta: 'Review', screen: 'debts',
    amount: 2_896.77, badge: 'DTI impact',
  },
  {
    id: 'a4', priority: 'info', title: 'September 2025 statement gap',
    sub: 'Wells Fargo ****7842 — Aug → Oct, missing Sep', cta: 'Request statement', screen: 'coverage',
    badge: 'Coverage',
  },
  {
    id: 'a5', priority: 'info', title: '$12,000 earnest money — sourced',
    sub: 'Trail complete. Pacific Title escrow.', cta: 'View trail', screen: 'sourcing',
    amount: 12_000, badge: 'Auto-sourced', resolved: true,
  },
];

export interface MNavItem {
  id: string;
  label: string;
  icon: string;
}

export const mNav: MNavItem[] = [
  { id: 'home', label: 'File', icon: 'home' },
  { id: 'sourcing', label: 'Trail', icon: 'branch' },
  { id: 'deposits', label: 'Deposits', icon: 'dollar' },
  { id: 'debts', label: 'Debts', icon: 'flag' },
  { id: 'audit', label: 'Audit', icon: 'list' },
];

export interface MCoverage {
  m: string;
  y: string;
  status: 'ok' | 'flag' | 'critical';
}

export const mCoverage: MCoverage[] = [
  { m: 'Oct', y: '25', status: 'ok' },
  { m: 'Nov', y: '25', status: 'ok' },
  { m: 'Dec', y: '25', status: 'ok' },
  { m: 'Jan', y: '26', status: 'ok' },
  { m: 'Feb', y: '26', status: 'flag' },
  { m: 'Mar', y: '26', status: 'flag' },
  { m: 'Apr', y: '26', status: 'critical' },
];

export interface MChainNode {
  tone: string;
  label: string;
  detail: string;
  isUnknown?: boolean;
  isPerson?: boolean;
  terminal?: boolean;
}

export interface MChain {
  id: string;
  status: string;
  amount: number;
  date: string;
  title: string;
  target: string;
  headline: string;
  nodes: MChainNode[];
  actions: string[];
}

export const mChains: MChain[] = [
  {
    id: 'chain-14k', status: 'unsourced', amount: 14_000, date: '2026-04-12',
    title: '$14,000 transfer',
    target: 'Wells Fargo ****7842',
    headline: 'Trail breaks at ****1234',
    nodes: [
      { tone: 'critical', label: 'Inbound to Wells Fargo ****7842', detail: 'Apr 12, 2026 · $14,000' },
      { tone: 'critical', label: 'From ****1234', detail: 'Statements not provided', isUnknown: true },
      { tone: 'critical', label: 'Trail breaks here', detail: 'Cannot source-and-season without ****1234 statements.', terminal: true },
    ],
    actions: ['Email borrower for statements', 'Mark as gift', 'Back out of funds'],
  },
  {
    id: 'chain-zelle', status: 'pending', amount: 16_000, date: '2026-03-15',
    title: '$16,000 Zelle from Ryan Chen',
    target: 'Wells Fargo ****7842',
    headline: 'Awaiting gift letter',
    nodes: [
      { tone: 'warning', label: 'Inbound Zelle', detail: 'Mar 15, 2026 · $16,000' },
      { tone: 'warning', label: 'From: Ryan Chen', detail: 'Same surname — likely family', isPerson: true },
      { tone: 'warning', label: 'Awaiting gift letter', detail: 'Need donor name, relationship, no-repayment language, donor statement.', terminal: true },
    ],
    actions: ['Send gift letter template', 'Request donor statement'],
  },
  {
    id: 'chain-earnest', status: 'sourced', amount: 12_000, date: '2026-04-02',
    title: '$12,000 earnest money',
    target: 'Pacific Title',
    headline: 'Trail complete — funds seasoned',
    nodes: [
      { tone: 'success', label: 'Earnest money cleared escrow', detail: 'Pacific Title · Apr 2, 2026' },
      { tone: 'success', label: 'Cashiers check from WF Business ****1109', detail: 'Apr 1, 2026 · memo "EM 4321 OAK ST"' },
      { tone: 'success', label: 'Funded by transfer from Chase ****3921', detail: 'Mar 30, 2026 · seasoned 60+ days' },
      { tone: 'success', label: 'Funds seasoned 60+ days', detail: 'No further sourcing required (Fannie Mae).', terminal: true },
    ],
    actions: ['View report section'],
  },
];

export interface MDeposit {
  id: string;
  date: string;
  dateFull: string;
  amount: number;
  desc: string;
  account: string;
  severity: string;
  status: string;
  note: string;
  chain?: string;
}

export const mDeposits: MDeposit[] = [
  {
    id: 'd1', date: 'Apr 12', dateFull: 'Apr 12, 2026', amount: 14_000,
    desc: 'Online transfer from ****1234', account: 'WF ****7842',
    severity: 'critical', status: 'Unsourced',
    note: 'Source account not in statement set.',
    chain: 'chain-14k',
  },
  {
    id: 'd2', date: 'Mar 15', dateFull: 'Mar 15, 2026', amount: 16_000,
    desc: 'Zelle from Ryan Chen', account: 'WF ****7842',
    severity: 'warning', status: 'Gift letter pending',
    note: 'Same surname — likely family.',
    chain: 'chain-zelle',
  },
  {
    id: 'd3', date: 'Apr 15', dateFull: 'Apr 15, 2026', amount: 18_500,
    desc: 'Wire from Chase Savings ****3921', account: 'WF ****7842',
    severity: 'success', status: 'Auto-sourced',
    note: 'Internal transfer — both accounts in set.',
  },
  {
    id: 'd4', date: 'Feb 10', dateFull: 'Feb 10, 2026', amount: 8_500,
    desc: 'Cashiers check deposit', account: 'WF ****7842',
    severity: 'info', status: 'Below threshold',
    note: '$15,104 threshold not crossed.',
  },
];

export interface MDebt {
  id: string;
  payee: string;
  monthly: number;
  occurrences: number;
  confidence: number;
  type: string;
  tag: string;
  note: string;
}

export const mDebts: MDebt[] = [
  { id: 'ud1', payee: 'UPLIFT LOAN PMT', monthly: 124.95, occurrences: 6, confidence: 92, type: 'Lender', tag: 'BNPL',
    note: 'Short-term financing. Not on credit report.' },
  { id: 'ud2', payee: 'HONDA FINANCIAL', monthly: 487.32, occurrences: 4, confidence: 88, type: 'Auto loan', tag: 'Auto',
    note: 'Recently opened — credit may be 30–60d behind.' },
  { id: 'ud3', payee: 'PINE PROPERTY MGMT', monthly: 2_150, occurrences: 5, confidence: 85, type: 'Possible rent', tag: 'Rent',
    note: '1003 says "owns primary residence" — contradicts.' },
  { id: 'ud4', payee: 'AFFIRM PURCHASE', monthly: 45.00, occurrences: 3, confidence: 72, type: 'BNPL', tag: 'BNPL',
    note: 'Final payment 2026-04. Low DTI impact.' },
  { id: 'ud5', payee: 'KLARNA PAYMENT', monthly: 89.50, occurrences: 2, confidence: 64, type: 'BNPL', tag: 'BNPL',
    note: 'Pattern still forming. Monitor.' },
];

export interface MAuditEntry {
  id: string;
  date: string;
  desc: string;
  amount: number;
  tone: string;
  chip: string;
}

export const mAudit: MAuditEntry[] = [
  { id: 'au1', date: 'Apr 15', desc: 'Wire from Chase ****3921', amount: 18_500, tone: 'transfer', chip: 'Internal' },
  { id: 'au2', date: 'Apr 12', desc: 'Online transfer from ****1234', amount: 14_000, tone: 'critical', chip: 'Unsourced' },
  { id: 'au3', date: 'Apr 10', desc: 'UPLIFT LOAN PMT #28', amount: -124.95, tone: 'debt', chip: 'Undisclosed' },
  { id: 'au4', date: 'Apr 8', desc: 'Employer Inc payroll', amount: 6_842.12, tone: 'income', chip: 'W-2' },
  { id: 'au5', date: 'Apr 5', desc: 'Pine Property Mgmt', amount: -2_150, tone: 'debt', chip: 'Undisclosed' },
  { id: 'au6', date: 'Apr 4', desc: 'Walmart Supercenter', amount: -127.43, tone: 'neutral', chip: 'Filtered' },
  { id: 'au7', date: 'Apr 3', desc: 'Honda Financial Services', amount: -487.32, tone: 'debt', chip: 'Undisclosed' },
  { id: 'au8', date: 'Apr 2', desc: 'Earnest money — Pacific Title', amount: -12_000, tone: 'transfer', chip: 'Earnest' },
  { id: 'au9', date: 'Mar 22', desc: 'Employer Inc payroll', amount: 6_842.12, tone: 'income', chip: 'W-2' },
  { id: 'au10', date: 'Mar 15', desc: 'Zelle from Ryan Chen', amount: 16_000, tone: 'warning', chip: 'Large deposit' },
  { id: 'au11', date: 'Mar 12', desc: 'Affirm purchase 4 of 4', amount: -45.00, tone: 'debt', chip: 'Undisclosed' },
  { id: 'au12', date: 'Feb 28', desc: 'Transfer from ****1234', amount: 14_000, tone: 'critical', chip: 'Unsourced' },
  { id: 'au13', date: 'Feb 10', desc: 'Cashiers check deposit', amount: 8_500, tone: 'info', chip: 'Logged' },
];

export interface MEmailDraft {
  to: string;
  cc: string;
  from: string;
  reply_to: string;
  subject: string;
  body: string;
}

export const mEmailDraft: MEmailDraft = {
  to: 'marcus.chen@gmail.com',
  cc: '',
  from: 'Stephanie via Evrylo <noreply@evrylo.com>',
  reply_to: 'stephanie.s@leaderone.com',
  subject: 'Quick item needed for your loan — deposit on April 12',
  body: `Hi Marcus,

Quick one for the file: on April 12 there's a $14,000 transfer into your Wells Fargo ****7842 from an account ending in 1234. Underwriting will need statements for that source account so we can complete the paper trail.

Could you upload the most recent two months for ****1234 in the borrower portal? It takes a couple of minutes.

If those funds were a gift, no statements needed — just let me know and I'll send you the gift-letter template instead.

Thanks!
Stephanie`,
};
