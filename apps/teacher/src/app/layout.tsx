import React from 'react';
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart-BKT-Chain | Панель Викладача та Адміністратора',
  description: 'Управління графом знань, BKT параметрами та аналітика студентів',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className="dark" suppressHydrationWarning>
      <body className="bg-[var(--sbc-bg-root,#121215)] text-[var(--sbc-text-primary,#f4f4f5)] min-h-screen font-sans transition-colors">
        {children}
      </body>
    </html>
  );
}
