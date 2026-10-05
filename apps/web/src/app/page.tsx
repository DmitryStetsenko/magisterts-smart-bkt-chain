'use client';

import React from 'react';
import { Brain, Sparkles, GraduationCap, ShieldCheck, Settings, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
            <Brain className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Smart-BKT-Chain</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:3002"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Кабінет Студента</span>
          </a>
          <a
            href="http://localhost:3003"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Кабінет Викладача</span>
          </a>
          <a
            href="http://localhost:3004"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs font-semibold border border-slate-800 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span>Admin CMS</span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="w-full max-w-5xl mx-auto px-6 py-16 flex flex-col items-center text-center gap-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Адаптивне Навчання Нового Покоління з BKT & Web3</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight">
          Персоналізований Навчальний Трек на Основі <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-indigo-400 to-purple-400">Bayesian Knowledge Tracing</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Smart-BKT-Chain аналізує темп набору, затримки та самостійність виконання завдань у реальному часі, будуючи унікальний орієнтований граф навичок (DAG) для кожного студента.
        </p>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-6 text-left">
          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between gap-6 hover:border-emerald-500/40 transition-all">
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 w-fit">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Портал Студента</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Monaco Code Editor із збором поведінкової телеметрії, відкриті тест-кейси та інтерактивний граф навичок.
              </p>
            </div>
            <a
              href="http://localhost:3002"
              className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
            >
              <span>Увійти як Студент</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between gap-6 hover:border-purple-500/40 transition-all">
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 w-fit">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Кабінет Викладача</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Жива BKT Heatmap аналітика студентів, виявлення копіювання (Copy-Paste Ratio) та аналіз втоми.
              </p>
            </div>
            <a
              href="http://localhost:3003"
              className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
            >
              <span>Увійти як Викладач</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col justify-between gap-6 hover:border-indigo-500/40 transition-all">
            <div className="flex flex-col gap-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 w-fit">
                <Settings className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Системний Admin & CMS</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Конструктор Графа Навичок (Skill DAG Editor), управління курсами, задачами та Web3 смарт-контрактами.
              </p>
            </div>
            <a
              href="http://localhost:3004"
              className="inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
            >
              <span>Адміністрування</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-6 text-center text-xs font-mono text-slate-500">
        Smart-BKT-Chain © 2026 • Master&apos;s Research Project • Adaptive Learning Architecture
      </footer>
    </div>
  );
}
