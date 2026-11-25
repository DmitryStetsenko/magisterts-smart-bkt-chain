import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart-BKT-Chain | Студентський Кабінет',
  description: 'Адаптивна платформа навчання з оцінкою знань BKT та аналізом телеметрії коду',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className="dark" suppressHydrationWarning>
      <body className="bg-[var(--sbc-bg-root,#121215)] text-[var(--sbc-text-primary,#f4f4f5)] antialiased selection:bg-indigo-500 selection:text-white transition-colors">
        {children}
      </body>
    </html>
  );
}
