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
    <html lang="uk" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen font-sans">
        {children}
      </body>
    </html>
  );
}
