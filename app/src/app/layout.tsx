import type { ReactNode } from 'react';
import './globals.css';
import ClientShell from './_components/ClientShell';

export const metadata = {
  title: 'Evrylo — AI Loan Officer Assistant',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
