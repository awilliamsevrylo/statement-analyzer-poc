// src/pages/ReportViewer.tsx
import { useParams } from 'react-router-dom';
import { Btn } from '@/components/UI';
import { dashboardFiles } from '@/data/dashboard';

const PAGES = [
  { num: 1, title: 'Cover sheet', subtitle: 'Borrower summary & loan details' },
  { num: 2, title: 'Income analysis', subtitle: 'Qualifying income calculation' },
  { num: 3, title: 'Deposit findings', subtitle: 'Large deposits & source-of-funds' },
  { num: 4, title: 'Debt findings', subtitle: 'Undisclosed debt patterns' },
  { num: 5, title: 'Coverage audit', subtitle: 'Statement gaps & month flags' },
];

export default function ReportViewer() {
  const { jobId } = useParams<{ jobId: string }>();

  const file = dashboardFiles.find((f) => f.id === jobId);

  const handlePrint = () => window.print();
  const handleDownload = () => {
    // eslint-disable-next-line no-console
    console.log('Download PDF triggered for', jobId);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-slate-100">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-7 py-3.5">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-semibold text-slate-900">
            Report · Job {jobId ?? '—'}
          </h1>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
            {PAGES.length} pages
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="secondary" onClick={handlePrint}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect width="12" height="8" x="6" y="14" rx="2" />
            </svg>
            Print
          </Btn>
          <Btn variant="primary" onClick={handleDownload}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" />
            </svg>
            Download PDF
          </Btn>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {file ? (
            PAGES.map((page) => (
              <div
                key={page.num}
                className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm"
                style={{ aspectRatio: '8.5 / 11' }}
              >
                <div className="text-center">
                  <div className="text-sm font-medium text-slate-400">Page {page.num}</div>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">{page.title}</h2>
                  <p className="mt-0.5 text-sm text-slate-500">{page.subtitle}</p>
                  <div className="mt-4 text-xs text-slate-400">Preview unavailable</div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white py-20">
              <div className="text-sm text-slate-500">No pages in this report yet.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
