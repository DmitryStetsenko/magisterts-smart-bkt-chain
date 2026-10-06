'use client';

import React, { useState } from 'react';
import { ShieldCheck, Network, Settings, BookOpen, Database, ArrowRight } from 'lucide-react';
import { SkillDagEditor } from '../features/skill-editor/ui/SkillDagEditor';
import { AdminSkillNode } from '../features/skill-editor/model/skill-editor.types';
import { CourseManager } from '../features/course-manager/ui/CourseManager';

export default function AdminCMSDashboard() {
  const [activeTab, setActiveTab] = useState<'dag' | 'courses' | 'system'>('dag');

  const [nodes, setNodes] = useState<AdminSkillNode[]>([
    {
      id: '1',
      slug: 'js-basics',
      title: 'Модуль 1: Синтаксис & База',
      description: 'Базові типи даних, змінні let/const та цикли',
      category: 'Core Fundamentals',
      difficulty: 'EASY',
      parentSkillIds: [],
      pInit: 0.5,
      pTransit: 0.2,
      pSlip: 0.1,
      pGuess: 0.2,
    },
    {
      id: '2',
      slug: 'js-functions',
      title: 'Модуль 2: Функції & Closures',
      description: 'Arrow functions, замикання та rest/spread',
      category: 'Core Fundamentals',
      difficulty: 'EASY',
      parentSkillIds: ['js-basics'],
      pInit: 0.4,
      pTransit: 0.2,
      pSlip: 0.1,
      pGuess: 0.2,
    },
    {
      id: '3',
      slug: 'js-collections',
      title: 'Модуль 3: Масиви & Обʼєкти',
      description: 'Методи map, filter, reduce та обхід обʼєктів',
      category: 'Data Structures',
      difficulty: 'MEDIUM',
      parentSkillIds: ['js-functions'],
      pInit: 0.3,
      pTransit: 0.2,
      pSlip: 0.1,
      pGuess: 0.2,
    },
    {
      id: '4',
      slug: 'js-async',
      title: 'Модуль 4: Асинхронність',
      description: 'Promises, async/await та обробка помилок',
      category: 'Advanced JS',
      difficulty: 'HARD',
      parentSkillIds: ['js-collections'],
      pInit: 0.2,
      pTransit: 0.2,
      pSlip: 0.1,
      pGuess: 0.2,
    },
    {
      id: '5',
      slug: 'js-oop',
      title: 'Модуль 5: ООП & Прототипи',
      description: 'Класи ES6, extends та прототипи',
      category: 'Object Oriented',
      difficulty: 'HARD',
      parentSkillIds: ['js-async'],
      pInit: 0.1,
      pTransit: 0.2,
      pSlip: 0.1,
      pGuess: 0.2,
    },
  ]);

  const handleSaveNode = (updatedNode: AdminSkillNode) => {
    setNodes((prev) => {
      const exists = prev.some((n) => n.id === updatedNode.id);
      if (exists) {
        return prev.map((n) => (n.id === updatedNode.id ? updatedNode : n));
      }
      return [...prev, updatedNode];
    });
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
  };

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
              Адміністративна панель: управління вузлами графа знань (Skill DAG), курсами та Web3 релейєром
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
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-400" />
                <span>Конструктор Графа Навичок (Skill DAG Editor)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Налаштування початкових BKT-параметрів ($P(L_0), P(T), P(S), P(G)$) та додавання/редагування/видалення вузлів графа
              </p>
            </div>

            <SkillDagEditor
              nodes={nodes}
              onSaveNode={handleSaveNode}
              onDeleteNode={handleDeleteNode}
            />
          </div>
        )}

        {activeTab === 'courses' && (
          <CourseManager />
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
