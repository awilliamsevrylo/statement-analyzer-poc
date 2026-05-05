// src/data/dashboard.ts
// Multi-file dashboard data for the Evrylo lifecycle.

export interface DashboardFile {
  id: string;
  borrower: string;
  loan_type: string;
  loan_amount: number;
  workflow: string;
  statements: number;
  accounts: number;
  status: 'draft' | 'processing' | 'needs-action' | 'completed' | 'failed';
  actions_open: number;
  flags: { critical: number; warning: number; info: number } | null;
  created: string;
  updated: string;
  close_date: string | null;
  primary_action: string;
  primary_target: string;
  note: string;
  is_primary?: boolean;
  progress_pct?: number;
  progress_step?: string;
  fail_reason?: string;
  fail_detail?: string;
}

export const dashboardFiles: DashboardFile[] = [
  {
    id: 'LO-2026-04823',
    borrower: 'Marcus Chen',
    loan_type: 'Conventional · Refinance',
    loan_amount: 612_000,
    workflow: 'General audit',
    statements: 18,
    accounts: 3,
    status: 'needs-action',
    actions_open: 7,
    flags: { critical: 1, warning: 2, info: 1 },
    created: '2026-04-22',
    updated: '2026-05-04T15:42:00',
    close_date: '2026-05-22',
    primary_action: 'Open file',
    primary_target: 'file',
    note: '$14,000 unsourced transfer · gift letter pending',
    is_primary: true,
  },
  {
    id: 'LO-2026-04823b',
    borrower: 'Barbara Amitrano',
    loan_type: 'Non-QM · BSL',
    loan_amount: 487_500,
    workflow: 'Bank statement loan',
    statements: 24,
    accounts: 4,
    status: 'completed',
    actions_open: 0,
    flags: { critical: 0, warning: 0, info: 0 },
    created: '2026-04-15',
    updated: '2026-05-02T09:18:00',
    close_date: '2026-05-15',
    primary_action: 'Open report',
    primary_target: 'report',
    note: 'Qualifying income: $22,672 / mo · ready for UW',
  },
  {
    id: 'LO-2026-05001',
    borrower: 'Maya Patel',
    loan_type: 'FHA · Purchase',
    loan_amount: 318_000,
    workflow: 'General audit',
    statements: 6,
    accounts: 2,
    status: 'processing',
    actions_open: 0,
    flags: null,
    created: '2026-05-04T14:02:00',
    updated: '2026-05-04T16:11:00',
    close_date: '2026-06-12',
    progress_pct: 62,
    progress_step: 'Detecting undisclosed debts',
    primary_action: 'View progress',
    primary_target: 'processing',
    note: 'Started 8 minutes ago',
  },
  {
    id: 'LO-2026-04992',
    borrower: 'Devon Walker',
    loan_type: 'Conventional · Purchase',
    loan_amount: 545_000,
    workflow: 'General audit',
    statements: 4,
    accounts: 2,
    status: 'failed',
    actions_open: 0,
    flags: null,
    created: '2026-05-04T11:30:00',
    updated: '2026-05-04T11:36:00',
    close_date: '2026-06-04',
    primary_action: 'Retry analysis',
    primary_target: 'failed',
    fail_reason: 'PDF could not be parsed',
    fail_detail: 'Wells Fargo 03-2026.pdf — pages 4–7 contain image scans without an OCR layer. Try a fresh PDF download from the bank.',
    note: 'Failed at step 3 of 9 · retryable',
  },
  {
    id: 'LO-2026-05022',
    borrower: 'Aisha Rahman',
    loan_type: 'Conventional · Purchase',
    loan_amount: 712_500,
    workflow: 'Bank statement loan',
    statements: 22,
    accounts: 3,
    status: 'needs-action',
    actions_open: 3,
    flags: { critical: 0, warning: 2, info: 1 },
    created: '2026-04-30',
    updated: '2026-05-04T08:55:00',
    close_date: '2026-05-30',
    primary_action: 'Open file',
    primary_target: 'file',
    note: 'September 2025 statement gap · 2 large deposits',
  },
  {
    id: 'LO-2026-05030',
    borrower: 'Tomás Vega',
    loan_type: 'VA · Purchase',
    loan_amount: 422_000,
    workflow: 'General audit',
    statements: 0,
    accounts: 0,
    status: 'draft',
    actions_open: 0,
    flags: null,
    created: '2026-05-03T16:42:00',
    updated: '2026-05-03T16:42:00',
    close_date: null,
    primary_action: 'Resume upload',
    primary_target: 'new',
    note: 'Borrower info entered · 0 of 2 statements uploaded',
  },
  {
    id: 'LO-2026-04875',
    borrower: 'Jen & Adrian Wu',
    loan_type: 'Jumbo · Refinance',
    loan_amount: 1_240_000,
    workflow: 'Bank statement loan',
    statements: 24,
    accounts: 4,
    status: 'completed',
    actions_open: 0,
    flags: { critical: 0, warning: 0, info: 0 },
    created: '2026-04-08',
    updated: '2026-04-26T14:00:00',
    close_date: '2026-05-08',
    primary_action: 'Open report',
    primary_target: 'report',
    note: 'Closed · sent to UW Apr 26',
  },
  {
    id: 'LO-2026-04901',
    borrower: 'Renee Okafor',
    loan_type: 'FHA · Refinance',
    loan_amount: 287_500,
    workflow: 'General audit',
    statements: 6,
    accounts: 2,
    status: 'needs-action',
    actions_open: 1,
    flags: { critical: 0, warning: 0, info: 1 },
    created: '2026-04-19',
    updated: '2026-05-01T10:20:00',
    close_date: '2026-05-29',
    primary_action: 'Open file',
    primary_target: 'file',
    note: '1 borrower upload received — review pending',
  },
];

export interface StatusMetaEntry {
  label: string;
  tone: string;
  dot: string;
  bg: string;
  text: string;
}

export const STATUS_META: Record<string, StatusMetaEntry> = {
  draft:        { label: 'Draft',         tone: 'neutral',  dot: '#94a3b8', bg: 'bg-slate-100',   text: 'text-slate-700' },
  processing:   { label: 'Processing',    tone: 'info',     dot: '#0284c7', bg: 'bg-sky-50',      text: 'text-sky-700' },
  'needs-action': { label: 'Needs action', tone: 'primary', dot: '#eb7230', bg: 'bg-orange-50',   text: 'text-orange-800' },
  completed:    { label: 'Completed',     tone: 'success',  dot: '#059669', bg: 'bg-emerald-50',  text: 'text-emerald-700' },
  failed:       { label: 'Failed',        tone: 'critical', dot: '#e11d48', bg: 'bg-rose-50',     text: 'text-rose-700' },
};

export interface ProcessingStep {
  id: string;
  label: string;
  detail: string;
}

export const PROCESSING_STEPS: ProcessingStep[] = [
  { id: 'upload',     label: 'Uploading PDFs',                     detail: 'Encrypting and storing in your workspace' },
  { id: 'validate',   label: 'Validating statement periods',       detail: 'Reading dates, account numbers, page counts' },
  { id: 'extract',    label: 'Extracting transactions',            detail: 'OCR pass + table parser per statement' },
  { id: 'classify',   label: 'Classifying deposits & debits',      detail: 'Payroll, P2P, ACH, transfers, fees' },
  { id: 'large',      label: 'Detecting large deposits',           detail: 'Anything above the qualifying-income threshold' },
  { id: 'debts',      label: 'Detecting undisclosed debts',        detail: 'Trigger-word + lender pattern match' },
  { id: 'sourcing',   label: 'Tracing source-of-funds chains',     detail: 'Linking inbound transfers to upstream accounts' },
  { id: 'coverage',   label: 'Checking coverage gaps',             detail: 'Statement continuity, missing months' },
  { id: 'report',     label: 'Building report',                    detail: 'Underwriter packet + audit trail' },
];

export interface FileActivity {
  ts: string;
  actor: string;
  kind: string;
  text: string;
  tone?: string;
}

export const fileActivity: FileActivity[] = [
  { ts: '2026-05-04T15:42:00', actor: 'Stephanie S.', kind: 'review', text: 'Opened Source-of-funds tab' },
  { ts: '2026-05-04T11:08:00', actor: 'Borrower', kind: 'upload', text: 'Uploaded Chase ****3921 statements (3 PDFs)', tone: 'success' },
  { ts: '2026-05-03T17:02:00', actor: 'Stephanie S.', kind: 'email', text: 'Sent: Documentation needed — $14,000 transfer', tone: 'info' },
  { ts: '2026-05-02T14:30:00', actor: 'Evrylo', kind: 'system', text: 'Analysis complete · 7 action items detected' },
];
