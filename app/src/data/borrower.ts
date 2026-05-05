// src/data/borrower.ts
// Borrower-driven scenario: Marcus Chen, refi on a 4-plex investment property,
// W-2 + rental + a little side business.

export interface Borrower {
  name: string;
  loan_number: string;
  loan_type: string;
  loan_amount: number;
  monthly_gross_income: number;
  aus_result: string;
  est_close_date: string;
  mlo: string;
  brokerage: string;
  large_deposit_threshold_pct: number;
  govt_loan_threshold_pct: number;
}

export const borrower: Borrower = {
  name: 'Marcus Chen',
  loan_number: 'LO-2026-04823',
  loan_type: 'Conventional · Refinance',
  loan_amount: 612_000,
  monthly_gross_income: 30_208,
  aus_result: 'Approve / Eligible',
  est_close_date: '2026-05-22',
  mlo: 'Stephanie Silverman',
  brokerage: 'LeaderOne Financial',
  large_deposit_threshold_pct: 50, // 50% of monthly gross
  govt_loan_threshold_pct: 1, // 1% of loan amount (not used here, conv loan)
};

export interface Account {
  id: string;
  bank: string;
  last4: string;
  type: string;
  months_provided: number;
  balance: number | null;
  statements: number;
  missing?: boolean;
}

export const accounts: Account[] = [
  { id: 'wf-7842', bank: 'Wells Fargo', last4: '7842', type: 'Personal Checking', months_provided: 6, balance: 18_402.18, statements: 6 },
  { id: 'chase-3921', bank: 'JPMorgan Chase', last4: '3921', type: 'Personal Savings', months_provided: 6, balance: 42_115.00, statements: 6 },
  { id: 'wf-biz-1109', bank: 'Wells Fargo', last4: '1109', type: 'Business Checking (Chen Consulting LLC)', months_provided: 6, balance: 8_240.55, statements: 6 },
  // The shadow account — referenced in transfers but never uploaded.
  { id: 'unknown-1234', bank: 'Unknown', last4: '1234', type: 'Not provided', months_provided: 0, balance: null, statements: 0, missing: true },
];

export interface MonthFlags {
  critical: number;
  warning: number;
  info: number;
}

export interface MonthData {
  key: string;
  label: string;
  deposits: number;
  withdrawals: number;
  net: number;
  flags: MonthFlags;
}

export const months: MonthData[] = [
  { key: '2025-10', label: 'Oct 2025', deposits: 28_410, withdrawals: 22_104, net: 6_306, flags: { critical: 0, warning: 1, info: 0 } },
  { key: '2025-11', label: 'Nov 2025', deposits: 31_205, withdrawals: 24_915, net: 6_290, flags: { critical: 0, warning: 0, info: 1 } },
  { key: '2025-12', label: 'Dec 2025', deposits: 34_002, withdrawals: 28_440, net: 5_562, flags: { critical: 0, warning: 1, info: 0 } },
  { key: '2026-01', label: 'Jan 2026', deposits: 29_815, withdrawals: 23_104, net: 6_711, flags: { critical: 0, warning: 0, info: 0 } },
  { key: '2026-02', label: 'Feb 2026', deposits: 47_104, withdrawals: 21_900, net: 25_204, flags: { critical: 1, warning: 1, info: 0 } },
  { key: '2026-03', label: 'Mar 2026', deposits: 46_812, withdrawals: 24_510, net: 22_302, flags: { critical: 0, warning: 1, info: 0 } },
  { key: '2026-04', label: 'Apr 2026', deposits: 52_310, withdrawals: 25_004, net: 27_306, flags: { critical: 1, warning: 0, info: 0 } },
];

export interface MissingMonth {
  account: string;
  month: string;
  reason: string;
}

export const missingMonths: MissingMonth[] = [
  { account: 'Wells Fargo ****7842', month: 'Sep 2025', reason: 'Statement not uploaded — gap between Aug and Oct cycle' },
];

export type Disposition =
  | 'ELIGIBLE_W2'
  | 'INTERNAL_TRANSFER'
  | 'TRANSFER_FROM_UNRECOGNIZED'
  | 'LARGE_DEPOSIT_ABOVE_INCOME'
  | 'LARGE_DEPOSIT_BELOW_THRESHOLD'
  | 'UNDISCLOSED_DEBT_MATCH'
  | 'FILTERED_DEBIT'
  | 'EARNEST_MONEY';

export interface Transaction {
  id: string;
  date: string;
  account: string;
  desc: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  disposition: Disposition;
  reason: string;
  matched_to?: string;
  day: number;
  severity?: 'critical' | 'warning' | 'info';
  trigger?: string;
}

export const transactions: Transaction[] = [
  // April 2026
  { id: 't-001', date: '2026-04-15', account: 'wf-7842', desc: 'WIRE FROM CHASE SAVINGS ****3921', amount: 18_500, type: 'CREDIT', disposition: 'INTERNAL_TRANSFER', reason: 'Matched outbound from JPMorgan Chase ****3921 on 04/15 ($18,500). Linked accounts.', matched_to: 't-001b', day: 15 },
  { id: 't-001b', date: '2026-04-15', account: 'chase-3921', desc: 'OUTGOING WIRE TO WELLS FARGO ****7842', amount: -18_500, type: 'DEBIT', disposition: 'INTERNAL_TRANSFER', reason: 'Matched to inbound on Wells Fargo ****7842.', day: 15 },
  { id: 't-002', date: '2026-04-12', account: 'wf-7842', desc: 'ONLINE TRANSFER FROM ****1234', amount: 14_000, type: 'CREDIT', disposition: 'TRANSFER_FROM_UNRECOGNIZED', reason: 'Source account ****1234 not in statement set. Cannot trace funds.', severity: 'critical', day: 12 },
  { id: 't-003', date: '2026-04-10', account: 'wf-7842', desc: 'UPLIFT LOAN PMT #28', amount: -124.95, type: 'DEBIT', disposition: 'UNDISCLOSED_DEBT_MATCH', reason: 'Trigger word match: "UPLIFT". Monthly pattern, 6 occurrences.', trigger: 'UPLIFT', day: 10 },
  { id: 't-004', date: '2026-04-08', account: 'wf-7842', desc: 'ACH DEPOSIT EMPLOYER INC PAYROLL', amount: 6_842.12, type: 'CREDIT', disposition: 'ELIGIBLE_W2', reason: 'Recurring bi-weekly W-2 payroll, 12 occurrences.', day: 8 },
  { id: 't-005', date: '2026-04-05', account: 'wf-7842', desc: 'PINE PROPERTY MGMT', amount: -2_150, type: 'DEBIT', disposition: 'UNDISCLOSED_DEBT_MATCH', reason: 'Recurring monthly payment, 5 occurrences. Possible rent — not on 1003.', trigger: 'RENT', day: 5 },
  { id: 't-006', date: '2026-04-04', account: 'wf-7842', desc: 'WALMART SUPERCENTER', amount: -127.43, type: 'DEBIT', disposition: 'FILTERED_DEBIT', reason: 'Standard retail purchase.', day: 4 },
  { id: 't-007', date: '2026-04-03', account: 'wf-7842', desc: 'HONDA FINANCIAL SERVICES', amount: -487.32, type: 'DEBIT', disposition: 'UNDISCLOSED_DEBT_MATCH', reason: 'Lender payee match. 4 occurrences. Not on credit report.', trigger: 'HONDA FINANCIAL', day: 3 },
  { id: 't-008', date: '2026-04-02', account: 'wf-biz-1109', desc: 'EARNEST MONEY ESCROW - PACIFIC TITLE', amount: -12_000, type: 'DEBIT', disposition: 'EARNEST_MONEY', reason: 'Detected earnest money debit. Pacific Title escrow. Source chain pending.', day: 2 },
  // March 2026
  { id: 't-009', date: '2026-03-22', account: 'wf-7842', desc: 'ACH DEPOSIT EMPLOYER INC PAYROLL', amount: 6_842.12, type: 'CREDIT', disposition: 'ELIGIBLE_W2', reason: 'Recurring bi-weekly W-2 payroll.', day: 22 },
  { id: 't-010', date: '2026-03-15', account: 'wf-7842', desc: 'ZELLE FROM RYAN CHEN', amount: 16_000, type: 'CREDIT', disposition: 'LARGE_DEPOSIT_ABOVE_INCOME', reason: 'Exceeds 50% threshold ($15,104). Possible gift — needs gift letter.', severity: 'warning', day: 15 },
  { id: 't-011', date: '2026-03-12', account: 'wf-7842', desc: 'AFFIRM PURCHASE 4 OF 4', amount: -45.00, type: 'DEBIT', disposition: 'UNDISCLOSED_DEBT_MATCH', reason: 'Trigger word match: "AFFIRM". 3 occurrences.', trigger: 'AFFIRM', day: 12 },
  { id: 't-012', date: '2026-03-08', account: 'wf-7842', desc: 'ACH DEPOSIT EMPLOYER INC PAYROLL', amount: 6_842.12, type: 'CREDIT', disposition: 'ELIGIBLE_W2', reason: 'Recurring bi-weekly W-2 payroll.', day: 8 },
  // Feb 2026
  { id: 't-013', date: '2026-02-28', account: 'wf-7842', desc: 'TRANSFER FROM UNKNOWN ACCT ****1234', amount: 14_000, type: 'CREDIT', disposition: 'TRANSFER_FROM_UNRECOGNIZED', reason: 'Source account ****1234 not in statement set.', severity: 'critical', day: 28 },
  { id: 't-014', date: '2026-02-15', account: 'wf-7842', desc: 'ACH DEPOSIT EMPLOYER INC PAYROLL', amount: 6_842.12, type: 'CREDIT', disposition: 'ELIGIBLE_W2', reason: 'Recurring bi-weekly W-2 payroll.', day: 15 },
  { id: 't-015', date: '2026-02-10', account: 'wf-7842', desc: 'CASHIERS CHECK DEPOSIT', amount: 8_500, type: 'CREDIT', disposition: 'LARGE_DEPOSIT_BELOW_THRESHOLD', reason: 'Below 50% threshold ($15,104). Logged for record.', severity: 'info', day: 10 },
  // Jan 2026
  { id: 't-016', date: '2026-01-15', account: 'wf-7842', desc: 'ACH DEPOSIT EMPLOYER INC PAYROLL', amount: 6_842.12, type: 'CREDIT', disposition: 'ELIGIBLE_W2', reason: 'Recurring bi-weekly W-2 payroll.', day: 15 },
  { id: 't-017', date: '2026-01-04', account: 'wf-7842', desc: 'KLARNA PAYMENT 2/4', amount: -89.50, type: 'DEBIT', disposition: 'UNDISCLOSED_DEBT_MATCH', reason: 'Trigger word match: "KLARNA". 2 occurrences so far.', trigger: 'KLARNA', day: 4 },
];

export interface ChainNode {
  kind: 'origin' | 'step' | 'terminal' | 'unknown';
  label: string;
  amount?: number;
  account?: string;
  date?: string;
  sourced: boolean;
  evidence?: string;
  action?: string;
  note?: string;
}

export interface SourcingChain {
  id: string;
  title: string;
  status: 'partial' | 'unsourced' | 'pending-letter';
  target_account: string;
  target_date: string;
  target_amount: number;
  nodes: ChainNode[];
}

export const sourcingChains: SourcingChain[] = [
  {
    id: 'chain-earnest',
    title: 'Earnest money — $12,000',
    status: 'partial',
    target_account: 'Pacific Title Escrow',
    target_date: '2026-04-02',
    target_amount: 12_000,
    nodes: [
      { kind: 'origin', label: 'Earnest money cleared escrow', amount: 12_000, account: 'Pacific Title', date: '2026-04-02', sourced: true },
      { kind: 'step', label: 'Cashiers check from Wells Fargo Business ****1109', amount: 12_000, account: 'wf-biz-1109', date: '2026-04-01', sourced: true, evidence: 'Statement page 4, debit $12,000 — purpose memo "EM 4321 OAK ST"' },
      { kind: 'step', label: 'Funded by transfer from JPMorgan Chase ****3921', amount: 12_000, account: 'chase-3921', date: '2026-03-30', sourced: true, evidence: 'Internal transfer matched. Funds seasoned 60+ days in Chase.' },
      { kind: 'terminal', label: 'Funds seasoned over 60 days', sourced: true, note: 'No further sourcing required per Fannie Mae guidelines.' },
    ],
  },
  {
    id: 'chain-14k',
    title: '$14,000 transfer — UNSOURCED',
    status: 'unsourced',
    target_account: 'Wells Fargo ****7842',
    target_date: '2026-04-12',
    target_amount: 14_000,
    nodes: [
      { kind: 'origin', label: 'Inbound to Wells Fargo ****7842', amount: 14_000, account: 'wf-7842', date: '2026-04-12', sourced: false },
      { kind: 'step', label: 'From account ****1234 — statements not provided', account: 'unknown-1234', amount: 14_000, date: '2026-04-12', sourced: false, evidence: 'No statements uploaded for ****1234. Cannot trace upstream.', action: 'Request statements from borrower' },
      { kind: 'unknown', label: 'Trail breaks here', sourced: false, note: 'Without ****1234 statements, the $14,000 cannot be source-and-seasoned. Underwriter will likely back this out of available funds.' },
    ],
  },
  {
    id: 'chain-zelle',
    title: 'Zelle from Ryan Chen — $16,000',
    status: 'pending-letter',
    target_account: 'Wells Fargo ****7842',
    target_date: '2026-03-15',
    target_amount: 16_000,
    nodes: [
      { kind: 'origin', label: 'Inbound Zelle to Wells Fargo ****7842', amount: 16_000, account: 'wf-7842', date: '2026-03-15', sourced: false },
      { kind: 'step', label: 'From: Ryan Chen (likely family — same surname)', sourced: false, evidence: 'Borrower 1003 lists no joint account holders. Possible gift from relative.', action: 'Request gift letter' },
      { kind: 'unknown', label: 'Awaiting gift letter', sourced: false, note: 'Gift letter required: donor name, relationship, amount, no-repayment language, donor account statement.' },
    ],
  },
];

export interface LargeDeposit {
  id: string;
  date: string;
  account: string;
  desc: string;
  amount: number;
  severity: 'critical' | 'warning' | 'info';
  recurring: boolean;
  source_status: string;
  chain_id?: string;
  note: string;
}

export const largeDeposits: LargeDeposit[] = [
  {
    id: 'ld-001', date: '2026-04-12', account: 'wf-7842', desc: 'ONLINE TRANSFER FROM ****1234',
    amount: 14_000, severity: 'critical', recurring: false, source_status: 'UNSOURCED',
    chain_id: 'chain-14k',
    note: 'Source account ****1234 not in statement set. Statements have not been provided.',
  },
  {
    id: 'ld-002', date: '2026-03-15', account: 'wf-7842', desc: 'ZELLE FROM RYAN CHEN',
    amount: 16_000, severity: 'warning', recurring: false, source_status: 'PENDING_LETTER',
    chain_id: 'chain-zelle',
    note: 'Possible gift from relative. Gift letter required.',
  },
  {
    id: 'ld-003', date: '2026-04-15', account: 'wf-7842', desc: 'WIRE FROM CHASE SAVINGS ****3921',
    amount: 18_500, severity: 'info', recurring: false, source_status: 'AUTO_SOURCED',
    note: 'Internal transfer — both accounts in statement set. Trail complete.',
  },
  {
    id: 'ld-004', date: '2026-02-10', account: 'wf-7842', desc: 'CASHIERS CHECK DEPOSIT',
    amount: 8_500, severity: 'info', recurring: false, source_status: 'BELOW_THRESHOLD',
    note: 'Below $15,104 threshold. Logged but does not require sourcing.',
  },
];

export interface UndisclosedDebt {
  id: string;
  payee: string;
  monthly: number;
  occurrences: number;
  first_seen: string;
  confidence: number;
  type: string;
  trigger_match: string;
  note: string;
}

export const undisclosedDebts: UndisclosedDebt[] = [
  {
    id: 'ud-001', payee: 'UPLIFT LOAN PMT', monthly: 124.95, occurrences: 6, first_seen: '2025-11',
    confidence: 92, type: 'LENDER', trigger_match: 'UPLIFT',
    note: 'Short-term financing platform. Payments do not appear on credit report. Likely undisclosed installment.',
  },
  {
    id: 'ud-002', payee: 'HONDA FINANCIAL', monthly: 487.32, occurrences: 4, first_seen: '2025-12',
    confidence: 88, type: 'LENDER', trigger_match: 'HONDA FINANCIAL',
    note: 'Auto finance. Recently opened — credit report may be 30–60 days behind.',
  },
  {
    id: 'ud-003', payee: 'PINE PROPERTY MGMT', monthly: 2_150.00, occurrences: 5, first_seen: '2025-10',
    confidence: 85, type: 'RENT', trigger_match: 'Property management pattern',
    note: 'Borrower may be paying rent. 1003 housing declaration shows "owns primary residence" — contradicts.',
  },
  {
    id: 'ud-004', payee: 'AFFIRM PURCHASE', monthly: 45.00, occurrences: 3, first_seen: '2026-01',
    confidence: 72, type: 'LENDER', trigger_match: 'AFFIRM',
    note: 'BNPL purchase plan. Final payment in 2026-04. Low DTI impact but document for completeness.',
  },
  {
    id: 'ud-005', payee: 'KLARNA PAYMENT', monthly: 89.50, occurrences: 2, first_seen: '2026-01',
    confidence: 64, type: 'LENDER', trigger_match: 'KLARNA',
    note: 'Two occurrences only — pattern still forming. Monitor.',
  },
];

export const dispositionLabels: Record<Disposition, string> = {
  ELIGIBLE_W2: 'Eligible · W-2',
  INTERNAL_TRANSFER: 'Internal transfer',
  TRANSFER_FROM_UNRECOGNIZED: 'Unsourced transfer',
  LARGE_DEPOSIT_ABOVE_INCOME: 'Large deposit',
  LARGE_DEPOSIT_BELOW_THRESHOLD: 'Below threshold',
  UNDISCLOSED_DEBT_MATCH: 'Undisclosed debt',
  FILTERED_DEBIT: 'Filtered debit',
  EARNEST_MONEY: 'Earnest money',
};
