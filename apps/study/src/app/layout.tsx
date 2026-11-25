import type { Metadata } from 'next';
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
      <body className="bg-[var(--sbc-bg-root,#121215)] text-[var(--sbc-text-primary,#f4f4f5)] antialiased selection:bg-blue-600 selection:text-white transition-colors">
        {children}
      </body>
    </html>
  );
}
