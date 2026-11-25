import type { Metadata } from 'next';
import { ThemeInitScript, ThemeProvider } from '@sbc/ui';
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
      <head>
        <ThemeInitScript />
      </head>
      <body className="bg-[var(--sbc-bg-root,#181818)] text-[var(--sbc-text-primary,#cccccc)] antialiased selection:bg-indigo-500 selection:text-white transition-colors">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
