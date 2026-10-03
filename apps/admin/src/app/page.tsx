'use client';

import React, { useState } from 'react';
import { ShieldCheck, Network, Users, BarChart3, ArrowLeft } from 'lucide-react';
import { SkillDagEditor } from '../features/skill-editor/ui/SkillDagEditor';
import { AdminSkillNode } from '../features/skill-editor/model/skill-editor.types';

export default function AdminDashboardPage() {
  const [nodes, setNodes] = useState<AdminSkillNode[]>([
    {
      id: '1',
      slug: 'js-basics',
      title: 'Основи JavaScript та Синтаксис',
      description: 'Базові типи даних, змінне let/const та оператори',
      category: 'Programming',
      difficulty: 'EASY',
      parentSkillIds: [],
      pInit: 0.5,
      pTransit: 0.1,
      pSlip: 0.1,
      pGuess: 0.2,
    },
    {
      id: '2',
      slug: 'js-arrays',
      title: 'Масиви та Функціональні Методи',
      description: 'Методи map, filter, reduce та іммутабельність',
      category: 'Programming',
      difficulty: 'MEDIUM',
      parentSkillIds: ['js-basics'],
      pInit: 0.2,
      pTransit: 0.15,
      pSlip: 0.12,
      pGuess: 0.25,
    },
    {
      id: '3',
      slug: 'js-async',
      title: 'Асинхронне Програмування',
      description: 'Promises, async/await та подійний цикл',
      category: 'Programming',
      difficulty: 'HARD',
      parentSkillIds: ['js-arrays'],
      pInit: 0.1,
      pTransit: 0.2,
      pSlip: 0.15,
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
    <main className="min-h-screen p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header Bar */}
      <header className="flex flex-wrap items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/20 border border-purple-500/30 rounded-xl text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>Smart-BKT-Chain Admin Portal</span>
            </h1>
            <p className="text-sm text-slate-400">
              Панель викладача: інтерактивне управління графом знань (DAG) та піднормалізація параметрів BKT
            </p>
          </div>
        </div>

        <a
          href="http://localhost:3002"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Перейти у Кабінет Студента</span>
        </a>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <Network className="w-8 h-8 text-indigo-400" />
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Вузли Графа Знань</span>
            <h3 className="text-2xl font-bold text-white">{nodes.length} Вузли (DAG)</h3>
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

      {/* 🗺️ Interactive Skill DAG Editor Component */}
      <SkillDagEditor
        nodes={nodes}
        onSaveNode={handleSaveNode}
        onDeleteNode={handleDeleteNode}
      />
    </main>
  );
}
