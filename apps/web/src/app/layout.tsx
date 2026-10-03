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
    <html lang="uk" className="dark">
      <body className="bg-[#090d16] text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
