'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const features = [
    {
      title: 'BKT Engine',
      description: 'Адаптивна математична модель Bayesian Knowledge Tracing для точного оцінювання та прогнозування ймовірності засвоєння навичок.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
        </svg>
      ),
    },
    {
      title: 'LLM Judge & AST',
      description: 'Каскадна перевірка рішень від статичного аналізу структури коду (AST) до інтелектуального семантичного оцінювання мовною моделлю.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1H9L8 4zm.5 12h7a1.5 1.5 0 001.5-1.5v-7A1.5 1.5 0 0015.5 4h-7A1.5 1.5 0 007 5.5v7A1.5 1.5 0 008.5 16z" />
        </svg>
      ),
    },
    {
      title: 'Blockchain Layer',
      description: 'Децентралізований рівень довіри: динамічні дипломи dNFT (ERC-721) та Soulbound-угоди ISA (ERC-5192) із захистом від втрати.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Type Safety',
      description: 'Наскрізна типізація між реляційною базою даних (Prisma), смарт-контрактами (Solidity) та API (NestJS/Next.js).',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-zinc-50 text-zinc-900'}`}>
      {/* HEADER */}
      <header className={`sticky top-0 z-50 h-[73px] flex items-center justify-between px-6 sm:px-12 border-b backdrop-blur-md ${isDarkMode ? 'bg-zinc-950/80 border-zinc-900' : 'bg-white/80 border-zinc-200'}`}>
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-all">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-base">
            S
          </div>
          <span className="text-md font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Smart-BKT-Chain
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com/DmitryStetsenko/magisterts-smart-bkt-chain"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-zinc-300 hover:text-white hover:bg-zinc-800' : 'bg-white border-zinc-200 text-zinc-700 hover:text-black hover:bg-zinc-50'}`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
            <span className="hidden sm:inline">GitHub</span>
          </a>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-lg border transition-all ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-yellow-400 hover:bg-zinc-800' : 'bg-white border-zinc-200 text-indigo-600 hover:bg-zinc-50'}`}
            title="Змінити тему"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364-3.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 sm:py-24 text-center max-w-5xl mx-auto space-y-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border-indigo-500/25">
            AlgoProof.org / KnowLedger.org
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl">
            Децентралізована система{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              адаптивного навчання
            </span>
          </h1>
          <p className={`text-base sm:text-xl max-w-2xl mx-auto leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-650'}`}>
            Поєднання Bayesian Knowledge Tracing (BKT) та технологій Blockchain для автоматизованого підтвердження компетенцій та динамічної сертифікації.
          </p>
        </div>

        {/* NAVIGATION BUTTONS */}
        <div className="flex flex-wrap gap-4 justify-center pt-4">
          <Link
            href="/roadmap/"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Дорожня карта
          </Link>
          <Link
            href="/tech/"
            className={`px-6 py-3.5 rounded-xl border font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-850 hover:text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-black'
            }`}
          >
            Технічний стек
          </Link>
          <Link
            href="/pm/"
            className={`px-6 py-3.5 rounded-xl border font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-850 hover:text-white' : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:text-black'
            }`}
          >
            Управління & Jira
          </Link>
        </div>

        {/* CORE FEATURES GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pt-12 text-left">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl ${
                isDarkMode 
                  ? 'bg-zinc-900/40 backdrop-blur-sm border-zinc-900 hover:border-zinc-850' 
                  : 'bg-white border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center gap-3.5 mb-4">
                <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold tracking-tight">{feat.title}</h3>
              </div>
              <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-650'}`}>
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className={`py-8 px-6 sm:px-12 border-t text-center text-xs ${isDarkMode ? 'border-zinc-900 text-zinc-600' : 'border-zinc-200 text-zinc-450'}`}>
        <p>© 2026 Smart-BKT-Chain. Магістерське науково-практичне дослідження. Усі права захищено.</p>
      </footer>
    </div>
  );
}
