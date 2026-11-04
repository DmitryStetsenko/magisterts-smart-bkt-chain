'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Network, 
  BookOpen, 
  Settings, 
  ArrowRight,
  Database,
  Cpu
} from 'lucide-react';
import { AppShellLayout, Breadcrumbs } from '@sbc/ui';
import { getAppBaseUrl } from '@sbc/routes';
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

  type AdminTab = 'dag' | 'courses' | 'system';
  const [activeTab, setActiveTab] = useState<AdminTab>('dag');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  const handleTabClick = (tabId: string) => {
    const tab = tabId as AdminTab;
    if (activeTab === tab) {
      setIsDrawerOpen((prev) => !prev);
    } else {
      setActiveTab(tab);
      setIsDrawerOpen(true);
    }
  };

  return (
    <AppShellLayout
      currentApp="admin"
      header={{
        appName: 'Smart-BKT-Chain',
        badgeText: 'Admin CMS Shell v2.0',
        logoIcon: ShieldCheck,
        logoColor: 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        courseBadge: (
          <span
            className="text-sm sm:text-[14px] font-normal text-slate-300 select-none tracking-normal"
            title="Методичний центр управління платформою"
          >
            Методичний центр
          </span>
        ),
        breadcrumbs: (
          <Breadcrumbs
            className="text-[11px]"
            items={[
              {
                label: 'CMS Адміністрування',
                onClick: () => handleTabClick('dag'),
              },
              {
                label: activeTab === 'dag'
                  ? 'Граф навичок'
                  : activeTab === 'courses'
                  ? 'Курси'
                  : 'Система',
                badge: `${nodes.length} навичок`,
                isCurrent: true,
              },
            ]}
          />
        ),
        rightSlot: (
          <div className="flex items-center gap-3">
            <a
              href={getAppBaseUrl('teacher')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            >
              <span>Кабінет Викладача</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        ),
      }}
      navigationRail={{
        tabs: [
          {
            id: 'dag',
            icon: Network,
            title: 'Конструктор Графа Навичок (Skill DAG Editor)',
            activeColor: 'bg-emerald-600',
          },
          {
            id: 'courses',
            icon: BookOpen,
            title: 'Керування Курсами & Завданнями',
            activeColor: 'bg-emerald-600',
          },
        ],
        activeTab: activeTab,
        isDrawerOpen: isDrawerOpen,
        onTabClick: handleTabClick,
        onSettingsClick: () => handleTabClick('system'),
        isSettingsActive: activeTab === 'system',
      }}
      mainClassName="p-4 lg:p-6 overflow-y-auto flex flex-col gap-4 bg-slate-950"
    >
      {/* 🧭 Єдині хлібні крихти платформи */}
      <Breadcrumbs
        className="text-[11px]"
        items={[
          {
            label: 'CMS Адміністрування',
            onClick: () => handleTabClick('dag'),
          },
          {
            label: activeTab === 'dag'
              ? 'Конструктор Skill DAG'
              : activeTab === 'courses'
              ? 'Реєстр курсів та завдань'
              : 'Системні налаштування',
            isCurrent: true,
          },
        ]}
      />

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl min-h-[400px]">
        {activeTab === 'dag' && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-emerald-400" />
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
    </AppShellLayout>
  );
}
