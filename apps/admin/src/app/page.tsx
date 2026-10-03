'use client';

import React from 'react';
import { ShieldCheck, Network, Users, BarChart3, Settings } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto flex flex-col gap-6">
      <header className="flex items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Smart-BKT-Chain Admin Portal</h1>
            <p className="text-sm text-slate-400">Панель викладача: аналітика BKT та аналіз навчальних траєкторій</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <Network className="w-8 h-8 text-indigo-400" />
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Вузли Графа Знань</span>
            <h3 className="text-2xl font-bold text-white">3 Вузли (DAG)</h3>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <Users className="w-8 h-8 text-emerald-400" />
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Активні Студенти</span>
            <h3 className="text-2xl font-bold text-white">1 Студент (Demo)</h3>
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <BarChart3 className="w-8 h-8 text-amber-400" />
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Середня Майстерність P(L)</span>
            <h3 className="text-2xl font-bold text-white">92.3%</h3>
          </div>
        </div>
      </div>
    </main>
  );
}
