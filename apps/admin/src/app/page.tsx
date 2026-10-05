'use client';

import React, { useState } from 'react';
import { ShieldCheck, Network, Layers, Settings, BookOpen, Plus, Database, ArrowRight } from 'lucide-react';

export default function AdminCMSDashboard() {
  const [activeTab, setActiveTab] = useState<'dag' | 'courses' | 'system'>('dag');

  return (
    <main className="min-h-screen p-6 max-w-7xl mx-auto flex flex-col gap-6 text-slate-100 font-sans">
      {/* Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>Smart-BKT-Chain System Admin & CMS</span>
            </h1>
            <p className="text-sm text-slate-400">
              Адміністративна панель: управління курсами, задачником, DAG-графом та Web3 релейєром
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:3003"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <span>Кабінет Викладача</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 bg-slate-900/80 p-1.5 border border-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('dag')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'dag'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Skill DAG Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>CMS Курсів та Задач</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'system'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Системні Налаштування & Web3</span>
        </button>
      </div>

      {/* Main CMS Body Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl min-h-[400px]">
        {activeTab === 'dag' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Network className="w-5 h-5 text-indigo-400" />
                  <span>Конструктор Графа Навичок (Skill DAG Editor)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Налаштування початкових BKT-параметрів ($P(L_0), P(T), P(S), P(G)$) та топологічних залежностей
                </p>
              </div>

              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer">
                <Plus className="w-4 h-4" />
                <span>Створити Новий Вузол</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {['js-basics', 'js-functions', 'js-collections', 'js-async', 'js-oop'].map((slug, idx) => (
                <div key={slug} className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col gap-2">
                  <span className="text-[10px] uppercase font-mono text-indigo-400 font-bold">Модуль {idx + 1}</span>
                  <h4 className="text-sm font-bold text-white">{slug}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono mt-2">
                    <span>Prior P(L0): 0.5</span>
                    <span>Transit P(T): 0.2</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="flex flex-col gap-4 items-center justify-center py-12 text-center">
            <Database className="w-12 h-12 text-slate-600 animate-pulse" />
            <h3 className="text-lg font-bold text-white">CMS Модуль Задач та Тест-Кейсів</h3>
            <p className="text-xs text-slate-400 max-w-md">
              Тут розгортається візуальний конструктор практичних завдань із можливістю додавання відкритих та секретних тест-кейси прямо в БД PostgreSQL.
            </p>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              <span>Конфігурація Релейєра Web3 & Смарт-Контрактів</span>
            </h3>
            <p className="text-xs text-slate-400">
              Статус підключення Hardhat/Foundry, гаманців релейєра для Gasless SBT мінтингу.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
