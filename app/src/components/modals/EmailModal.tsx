// src/components/modals/EmailModal.tsx
// Email composer modal with templates and sent-state.

import { useState, useMemo } from 'react';
import { cls, Btn, I } from '@/components/UI';

export type EmailTemplate = 'missing-statement' | 'sourcing' | 'gift-letter' | 'request-statements';

export interface DepositContext {
  amount: number;
  date: string;
  desc: string;
  account: string;
}

interface TemplateData {
  subject: string;
  body: string;
  attachments: string[];
}

interface EmailModalProps {
  template?: EmailTemplate;
  depositContext?: DepositContext;
  onClose: () => void;
}

function buildTemplates(ctx?: DepositContext): Record<EmailTemplate, TemplateData> {
  return {
    'missing-statement': {
      subject: 'Documentation needed — missing September statement',
      body: `Hi Marcus,\n\nThank you for uploading your bank statements. We're reviewing your file for underwriting and noticed the September 2025 statement for Wells Fargo ****7842 is missing.\n\nCould you please upload the missing statement to your borrower portal? This helps us complete the audit trail and move your loan forward.\n\nIf you have any questions, just reply to this email.\n\nThanks,\nStephanie Silverman\nLeaderOne Financial`,
      attachments: [],
    },
    sourcing: {
      subject: ctx
        ? `Documentation needed — $${ctx.amount.toLocaleString()} transfer source`
        : 'Documentation needed — transfer source',
      body: ctx
        ? `Hi Marcus,\n\nDuring our bank statement review we found a $${ctx.amount.toLocaleString()} transfer into your ${ctx.account} account on ${ctx.date}.\n\nTo satisfy source-of-funds requirements, please provide:\n- A statement for the source account showing the outbound transfer, OR\n- A gift letter if these funds were a gift from a relative.\n\nLet me know if you need the gift letter template.\n\nThanks,\nStephanie Silverman\nLeaderOne Financial`
        : `Hi Marcus,\n\nDuring our bank statement review we found a transfer that requires additional documentation.\n\nTo satisfy source-of-funds requirements, please provide:\n- A statement for the source account showing the outbound transfer, OR\n- A gift letter if these funds were a gift from a relative.\n\nLet me know if you need the gift letter template.\n\nThanks,\nStephanie Silverman\nLeaderOne Financial`,
      attachments: [],
    },
    'gift-letter': {
      subject: 'Gift letter template — $16,000 Zelle deposit',
      body: `Hi Marcus,\n\nWe identified a $16,000 Zelle deposit from Ryan Chen on March 15, 2026. If this is a gift, we'll need a signed gift letter for underwriting.\n\nI've attached the standard gift letter template. Please have Ryan complete and sign it, then upload it to the borrower portal or email it back.\n\nLet me know if you have any questions.\n\nThanks,\nStephanie Silverman\nLeaderOne Financial`,
      attachments: ['Gift_Letter_Template_2026.pdf'],
    },
    'request-statements': {
      subject: 'Please upload remaining bank statements',
      body: `Hi Marcus,\n\nWe're ready to begin the bank statement analysis for your Conventional Refinance. Please upload the following statements to your borrower portal:\n\n- Wells Fargo ****7842 (last 2 months)\n- JPMorgan Chase ****3921 (last 2 months)\n- Wells Fargo Business ****1109 (last 2 months)\n\nOnce uploaded, our system will begin the audit automatically and flag any items that need your attention.\n\nThanks,\nStephanie Silverman\nLeaderOne Financial`,
      attachments: [],
    },
  };
}

export default function EmailModal({ template = 'missing-statement', depositContext, onClose }: EmailModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate>(template);
  const [to] = useState('marcus.chen@gmail.com');
  const [from] = useState('steph.morgan@evrylo.com');
  const templates = useMemo(() => buildTemplates(depositContext), [depositContext]);
  const [subject, setSubject] = useState(templates[template].subject);
  const [body, setBody] = useState(templates[template].body);
  const [attachments, setAttachments] = useState<string[]>(templates[template].attachments);
  const [sent, setSent] = useState(false);
  const [sentAt, setSentAt] = useState<string | null>(null);

  function applyTemplate(key: EmailTemplate) {
    setSelectedTemplate(key);
    const t = templates[key];
    setSubject(t.subject);
    setBody(t.body);
    setAttachments(t.attachments);
    setSent(false);
  }

  function handleSend() {
    setSent(true);
    setSentAt(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-6 backdrop-blur-sm">
      <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span className="text-[#eb7230]">{I.sparkle}</span>
            Borrower email — drafted by Evrylo
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            {I.x}
          </button>
        </div>

        {/* Sent state */}
        {sent && (
          <div className="flex items-center gap-3 border-b border-emerald-100 bg-emerald-50/60 px-6 py-3">
            <span className="text-emerald-600">{I.check}</span>
            <span className="text-sm font-medium text-emerald-800">
              Sent to {to}
            </span>
            <span className="ml-auto text-xs text-emerald-600">{sentAt}</span>
          </div>
        )}

        {/* Template selector */}
        <div className="flex gap-2 border-b border-slate-100 px-6 py-3">
          {(Object.keys(templates) as EmailTemplate[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => applyTemplate(key)}
              className={cls(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                selectedTemplate === key
                  ? 'bg-orange-50 text-[#eb7230] ring-1 ring-orange-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              {key.replace(/-/g, ' ')}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            <div className="grid grid-cols-[60px_1fr] items-center gap-3">
              <label className="text-xs font-medium text-slate-500">To</label>
              <input
                type="text"
                value={to}
                readOnly
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-[60px_1fr] items-center gap-3">
              <label className="text-xs font-medium text-slate-500">From</label>
              <input
                type="text"
                value={from}
                readOnly
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-[60px_1fr] items-center gap-3">
              <label className="text-xs font-medium text-slate-500">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-slate-300 focus:outline-none"
              />
            </div>
            <div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:outline-none"
              />
            </div>

            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-medium text-slate-500">Attachments</div>
                {attachments.map((file) => (
                  <div
                    key={file}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    {I.file}
                    <span className="text-xs text-slate-700">{file}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <span className="text-xs text-slate-400">
            CC: stephanie.silverman@leaderone.com (auto-bcc log)
          </span>
          <div className="flex items-center gap-2">
            <Btn variant="ghost" onClick={onClose}>
              Cancel
            </Btn>
            {!sent && (
              <Btn variant="secondary" onClick={() => applyTemplate(selectedTemplate)}>
                {I.sparkle}
                Regenerate
              </Btn>
            )}
            <Btn onClick={handleSend}>
              {I.send}
              {sent ? 'Sent' : 'Send & log'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
