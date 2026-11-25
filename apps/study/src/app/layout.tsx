import type { Metadata } from 'next';
import { ThemeInitScript } from '@sbc/ui';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart-BKT-Chain | Інтерактивний Навчальний Простір',
  description: 'Простір адаптивного інтерактивного навчання для розділу "Вебтехнології та алгоритмізація"',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className="dark" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
      </head>
      <body className="bg-[var(--sbc-bg-root,#181818)] text-[var(--sbc-text-primary,#cccccc)] antialiased selection:bg-blue-600 selection:text-white transition-colors">
        {children}
      </body>
    </html>
  );
}
