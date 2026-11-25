import React from 'react';
import type { Metadata } from 'next';
import { ThemeInitScript } from '@sbc/ui';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart-BKT-Chain | Панель Викладача',
  description: 'Управління графом знань, BKT параметрами та аналітика студентів',
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
      <body className="bg-[var(--sbc-bg-root,#181818)] text-[var(--sbc-text-primary,#cccccc)] min-h-screen font-sans transition-colors">
        {children}
      </body>
    </html>
  );
}
