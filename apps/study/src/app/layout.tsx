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
    <html lang="uk" className="dark">
      <body className="bg-[#070a13] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
