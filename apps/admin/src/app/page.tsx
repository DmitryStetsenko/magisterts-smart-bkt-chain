'use client';

import React, { useState } from 'react';
import { ShieldCheck, Network, Settings, BookOpen, Database, ArrowRight, GraduationCap, User } from 'lucide-react';
import { SkillDagEditor } from '../features/skill-editor/ui/SkillDagEditor';
import { AdminSkillNode } from '../features/skill-editor/model/skill-editor.types';
import { CourseManager } from '../features/course-manager/ui/CourseManager';

export default function AdminCMSDashboard() {
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

  // Unified Navigation State:
  // activeTab defines which workspace / module is active.
  // isDrawerOpen controls whether its companion sidebar drawer is visible.
  type AdminTab = 'dag' | 'courses' | 'system';
  const [activeTab, setActiveTab] = useState<AdminTab>('dag');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  const handleTabClick = (tab: AdminTab) => {
    if (activeTab === tab) {
      // Toggle sidebar open/collapsed without changing active workspace
      setIsDrawerOpen((prev) => !prev);
    } else {
      // Switch workspace & ensure drawer is open
      setActiveTab(tab);
      setIsDrawerOpen(true);
    }
  };

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* 📌 Sticky Top Navigation Bar */}
      <header className="h-14 w-full bg-slate-900 border-b border-slate-800/90 px-4 flex items-center justify-between shrink-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-lg text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Smart-BKT-Chain</span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                Admin CMS Shell v2.0
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:3003"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <span>Кабінет Викладача</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* 🧭 Main Workspace Area with Left Opera Icon Rail */}
      <div className="flex-1 flex overflow-hidden">
        {/* 🎨 Opera-Style Vertical Icon Rail */}
        <nav className="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-3 shrink-0 z-20 shadow-xl">
          <button
            onClick={() => handleTabClick('dag')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'dag'
                ? isDrawerOpen
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-1 ring-indigo-400/50'
                  : 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/90 hover:text-white'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title={
              activeTab === 'dag'
                ? isDrawerOpen
                  ? 'Конструктор DAG відкритий (клік згорне сайдбар на весь екран)'
                  : 'Конструктор DAG на весь екран (клік відкриє сайдбар)'
                : 'Skill DAG Builder'
            }
          >
            <Network className="w-5 h-5" />
            {activeTab === 'dag' && isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-5 bg-indigo-400 rounded-r-full shadow-sm shadow-indigo-400"></span>
            )}
            {activeTab === 'dag' && !isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-2 bg-indigo-400/70 rounded-r-full"></span>
            )}
          </button>

          <button
            onClick={() => handleTabClick('courses')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'courses'
                ? isDrawerOpen
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-1 ring-indigo-400/50'
                  : 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/90 hover:text-white'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title={
              activeTab === 'courses'
                ? isDrawerOpen
                  ? 'CMS курсів відкрита (клік згорне сайдбар на весь екран)'
                  : 'CMS курсів на весь екран (клік відкриє сайдбар)'
                : 'CMS Курсів та Задач'
            }
          >
            <BookOpen className="w-5 h-5" />
            {activeTab === 'courses' && isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-5 bg-indigo-400 rounded-r-full shadow-sm shadow-indigo-400"></span>
            )}
            {activeTab === 'courses' && !isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-2 bg-indigo-400/70 rounded-r-full"></span>
            )}
          </button>

          <div className="mt-auto flex flex-col items-center gap-2.5">
            <div className="w-8 h-[1px] bg-slate-800/80 my-1"></div>

            <a
              href="http://localhost:3006"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/20 flex items-center justify-center hover:bg-blue-600/30 hover:border-blue-500/40 transition-all"
              title="Інтерактивний Підручник (Study Space - 3006)"
            >
              <GraduationCap className="w-4 h-4" />
            </a>

            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 flex items-center justify-center hover:bg-indigo-600/30 hover:border-indigo-500/40 transition-all"
              title="Кабінет Студента (Student Portal - 3002)"
            >
              <Database className="w-4 h-4" />
            </a>

            <a
              href="http://localhost:3003"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-purple-600/15 text-purple-400 border border-purple-500/20 flex items-center justify-center hover:bg-purple-600/30 hover:border-purple-500/40 transition-all"
              title="Кабінет Викладача (Teacher Portal - 3003)"
            >
              <User className="w-4 h-4" />
            </a>

            <div className="w-8 h-[1px] bg-slate-800/80 my-1"></div>

            <button
              onClick={() => handleTabClick('system')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeTab === 'system'
                  ? isDrawerOpen
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/40 ring-1 ring-amber-400/50'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-500/30 hover:bg-amber-900/90 hover:text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Системні Налаштування & Web3"
            >
              <Settings className="w-5 h-5" />
              {activeTab === 'system' && isDrawerOpen && (
                <span className="absolute -left-1 w-1 h-5 bg-amber-400 rounded-r-full shadow-sm shadow-amber-400"></span>
              )}
              {activeTab === 'system' && !isDrawerOpen && (
                <span className="absolute -left-1 w-1 h-2 bg-amber-400/70 rounded-r-full"></span>
              )}
            </button>
          </div>
        </nav>

        {/* 💻 Center Main Canvas */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto flex flex-col gap-6 bg-slate-950">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl min-h-[400px]">
            {activeTab === 'dag' && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Network className="w-5 h-5 text-indigo-400" />
                    <span>Конструктор Графа Навичок (Skill DAG Editor)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Налаштування початкових BKT-параметрів ($P(L_0), P(T), P(S), P(G)$) та управління вузлами графа
                  </p>
                </div>

                <SkillDagEditor
                  nodes={nodes}
                  onSaveNode={handleSaveNode}
                  onDeleteNode={handleDeleteNode}
                />
              </div>
            )}

            {activeTab === 'courses' && <CourseManager />}

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
      </div>
    </div>
  );
}
