'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Network, 
  BookOpen, 
  Settings, 
  ArrowRight,
  Database,
  Cpu,
  Download,
  Filter,
  Sparkles,
  Plus,
  Search,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Activity,
  Users
} from 'lucide-react';
import { AppShellLayout, Breadcrumbs, UserProfileDrawer, DrawerSection } from '@sbc/ui';
import { getAppBaseUrl } from '@sbc/routes';
import { SkillDagEditor } from '../features/skill-editor/ui/SkillDagEditor';
import { AdminSkillNode } from '../features/skill-editor/model/skill-editor.types';
import { CourseManager } from '../features/course-manager/ui/CourseManager';
import { DatasetExportCenter, DatasetStats } from '../features/dataset-export/ui/DatasetExportCenter';
import { BktAuditVerifierCenter } from '../features/verifier/ui/BktAuditVerifierCenter';
import { UserManagementCenter } from '../features/users/ui/UserManagementCenter';

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

  type AdminTab = 'dag' | 'courses' | 'users' | 'datasets' | 'verifier' | 'system';
  const [activeTab, setActiveTab] = useState<AdminTab>('dag');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState<boolean>(false);

  // Search & Filter state for Drawer Sections
  const [dagSearch, setDagSearch] = useState<string>('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [datasetFilter, setDatasetFilter] = useState<'ALL' | 'SUBMISSIONS' | 'HINTS' | 'THEORY' | 'ANNULMENTS' | 'RESETS'>('ALL');
  const [datasetUserFilter, setDatasetUserFilter] = useState<string>('');
  const [datasetStats, setDatasetStats] = useState<DatasetStats>({
    total: 0,
    submissions: 0,
    annulled: 0,
    hints: 0,
    theory: 0,
    resets: 0,
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  const filteredDagNodes = useMemo(() => {
    if (!dagSearch.trim()) return nodes;
    return nodes.filter(
      (n) =>
        n.title.toLowerCase().includes(dagSearch.toLowerCase()) ||
        n.slug.toLowerCase().includes(dagSearch.toLowerCase())
    );
  }, [nodes, dagSearch]);

  const handleTabClick = (tabId: string) => {
    const tab = tabId as AdminTab;
    if (activeTab === tab) {
      setIsDrawerOpen((prev) => !prev);
    } else {
      setActiveTab(tab);
      setIsDrawerOpen(true);
    }
  };

  const getDrawerConfig = () => {
    let title: React.ReactNode = 'Навігація';
    let icon = Network;
    let iconColor = 'text-emerald-400';

    if (activeTab === 'dag') {
      title = 'Вузли Графа Навичок';
      icon = Network;
      iconColor = 'text-emerald-400';
    } else if (activeTab === 'courses') {
      title = 'Каталог Курсів & Завдань';
      icon = BookOpen;
      iconColor = 'text-emerald-400';
    } else if (activeTab === 'users') {
      title = 'Керування Користувачами';
      icon = Users;
      iconColor = 'text-emerald-400';
    } else if (activeTab === 'datasets') {
      title = 'Аудит & ШІ Датасети';
      icon = Database;
      iconColor = 'text-emerald-400';
    } else if (activeTab === 'verifier') {
      title = 'Математичний Аудит BKT';
      icon = Activity;
      iconColor = 'text-emerald-400';
    } else if (activeTab === 'system') {
      title = 'Конфігурація Системи';
      icon = Settings;
      iconColor = 'text-purple-400';
    }

    return {
      isOpen: isDrawerOpen,
      widthClass: 'w-72 sm:w-80 shrink-0',
      title,
      icon,
      iconColor,
      onClose: () => setIsDrawerOpen(false),
      children: (
        <div className="flex flex-col divide-y divide-slate-800/70">
          {/* Drawer 1: DAG Editor Sidebar */}
          {activeTab === 'dag' && (
            <>
              <DrawerSection
                title="Навички курсу"
                icon={Network}
                badge={filteredDagNodes.length}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-2 pt-1">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Пошук навички за назвою..."
                      value={dagSearch}
                      onChange={(e) => setDagSearch(e.target.value)}
                      className="w-full pl-8 pr-2.5 py-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/50 pr-0.5">
                    {filteredDagNodes.map((node) => (
                      <div
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`py-2 px-1.5 transition-colors cursor-pointer flex items-center justify-between gap-2 rounded-lg ${
                          selectedNodeId === node.id
                            ? 'bg-emerald-500/10 text-emerald-300'
                            : 'hover:bg-slate-800/50 text-slate-300'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <div className="text-xs font-medium truncate">{node.title}</div>
                          <div className="text-[10px] text-slate-500 font-mono">/{node.slug}</div>
                        </div>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 uppercase shrink-0">
                          {node.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </DrawerSection>

              <DrawerSection
                title="BKT Параметри за замовчуванням"
                icon={Sparkles}
                defaultOpen={true}
              >
                <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80 flex flex-col">
                    <span className="text-[10px] text-slate-500 font-sans">Початкове P(L₀)</span>
                    <span className="text-emerald-400 font-bold mt-0.5">0.50</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80 flex flex-col">
                    <span className="text-[10px] text-slate-500 font-sans">Перехід P(T)</span>
                    <span className="text-emerald-400 font-bold mt-0.5">0.10</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80 flex flex-col">
                    <span className="text-[10px] text-slate-500 font-sans">Помилка P(S)</span>
                    <span className="text-rose-400 font-bold mt-0.5">0.10</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80 flex flex-col">
                    <span className="text-[10px] text-slate-500 font-sans">Вгадування P(G)</span>
                    <span className="text-indigo-400 font-bold mt-0.5">0.20</span>
                  </div>
                </div>
              </DrawerSection>
            </>
          )}

          {/* Drawer 2: Courses Sidebar */}
          {activeTab === 'courses' && (
            <>
              <DrawerSection
                title="Доступні курси"
                icon={BookOpen}
                badge="3"
                defaultOpen={true}
              >
                <div className="flex flex-col gap-1.5 pt-1">
                  {[
                    { title: 'JavaScript & Web Dev', slug: 'js-dev', modules: 5, active: true },
                    { title: 'Business English (B2)', slug: 'english-b2', modules: 3, active: false },
                    { title: 'Правознавство України', slug: 'ukraine-law', modules: 3, active: false },
                  ].map((c) => (
                    <div
                      key={c.slug}
                      className={`p-2 rounded-lg transition-colors flex items-center justify-between text-xs ${
                        c.active ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/25' : 'bg-slate-950/40 text-slate-400 border border-slate-800/80'
                      }`}
                    >
                      <span className="font-medium truncate">{c.title}</span>
                      <span className="text-[10px] font-mono opacity-80 shrink-0">{c.modules} мод.</span>
                    </div>
                  ))}
                </div>
              </DrawerSection>

              <DrawerSection
                title="Банк завдань"
                icon={Layers}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-1.5 text-xs text-slate-400 pt-1">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Тестові завдання (Single/Multi)</span>
                    <span className="font-mono text-white font-bold">18</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Відкриті есе (Text Essay)</span>
                    <span className="font-mono text-white font-bold">8</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Практичні вправи з кодом</span>
                    <span className="font-mono text-white font-bold">12</span>
                  </div>
                </div>
              </DrawerSection>
            </>
          )}

          {/* Drawer: Users & RBAC */}
          {activeTab === 'users' && (
            <>
              <DrawerSection
                title="Google OAuth & Доступ"
                icon={ShieldCheck}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-2 pt-1 text-xs text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
                    <span className="font-semibold text-emerald-400">Вхід в 1 клік (Google)</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Учні авторизуються через Google акаунт. При першому вході система створює профіль учня автоматично.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col gap-1">
                    <span className="font-semibold text-purple-400">Привілеї Викладача</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Роль TEACHER відкриває когортну аналітику, інспекцію аномалій та створення інвайт-кодів груп.
                    </p>
                  </div>
                </div>
              </DrawerSection>

              <DrawerSection
                title="Дидактичні Режими"
                icon={BookOpen}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-1.5 text-[11px] text-slate-400 pt-1">
                  <div className="flex flex-col gap-0.5 py-1 border-b border-slate-800/60">
                    <span className="text-indigo-300 font-semibold">FULL_CYCLE</span>
                    <span>Повний цикл: конспект у підручнику + тренажер з BKT.</span>
                  </div>
                  <div className="flex flex-col gap-0.5 py-1 border-b border-slate-800/60">
                    <span className="text-amber-300 font-semibold">TESTING_ONLY</span>
                    <span>Експрес-діагностика без обов'язкової теорії.</span>
                  </div>
                  <div className="flex flex-col gap-0.5 py-1">
                    <span className="text-purple-300 font-semibold">MODULAR</span>
                    <span>Вибірковий доступ до обраних модулів.</span>
                  </div>
                </div>
              </DrawerSection>
            </>
          )}

          {/* Drawer 3: Datasets & Audit Sidebar */}
          {activeTab === 'datasets' && (
            <>
              <DrawerSection
                title="Швидкий Експорт ШІ"
                icon={Download}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-2 pt-1">
                  <a
                    href={`${API_URL}/api/v1/bkt/activity-logs/export?format=jsonl`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-colors flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">JSONL Датасет</span>
                      <span className="text-[10px] text-slate-400">Для DKT, SAKT, PyTorch</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300">
                      .jsonl
                    </span>
                  </a>

                  <a
                    href={`${API_URL}/api/v1/bkt/activity-logs/export?format=csv`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 transition-colors flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">CSV Таблиця</span>
                      <span className="text-[10px] text-slate-400">Для Pandas, Excel, R</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300">
                      .csv
                    </span>
                  </a>
                </div>
              </DrawerSection>

              <DrawerSection
                title="Фільтрація Подій"
                icon={Filter}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-2 pt-1 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Тип події</span>
                    <div className="grid grid-cols-2 gap-1 select-none">
                      {[
                        { key: 'ALL', label: 'Всі' },
                        { key: 'SUBMISSIONS', label: 'Спроби' },
                        { key: 'ANNULMENTS', label: 'Анулювання' },
                        { key: 'HINTS', label: 'Підказки' },
                        { key: 'THEORY', label: 'Теорія' },
                        { key: 'RESETS', label: 'Скидання' },
                      ].map((item) => (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => setDatasetFilter(item.key as any)}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer text-left ${
                            datasetFilter === item.key
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 pt-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">Користувач</span>
                    <input
                      type="text"
                      placeholder="Фільтр за userId..."
                      value={datasetUserFilter}
                      onChange={(e) => setDatasetUserFilter(e.target.value)}
                      className="w-full px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </DrawerSection>

              <DrawerSection
                title="Метрики Аудиту"
                icon={Sparkles}
                badge={datasetStats.total}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-1.5 text-xs text-slate-400 pt-1">
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Спроб коду</span>
                    <span className="font-mono text-emerald-400 font-bold">{datasetStats.submissions}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Анулювань (Hard Neg)</span>
                    <span className="font-mono text-rose-400 font-bold">{datasetStats.annulled}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Підказок Сократа</span>
                    <span className="font-mono text-amber-400 font-bold">{datasetStats.hints}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span>Вивчення теорії</span>
                    <span className="font-mono text-blue-400 font-bold">{datasetStats.theory}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span>Скидань навичок</span>
                    <span className="font-mono text-purple-400 font-bold">{datasetStats.resets}</span>
                  </div>
                </div>
              </DrawerSection>
            </>
          )}

          {/* Drawer: BKT Verifier Sidebar */}
          {activeTab === 'verifier' && (
            <>
              <DrawerSection
                title="Регламент перевірки"
                icon={Activity}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-2 pt-1 text-xs text-slate-400">
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    Автономна верифікація математичної коректності BKT: перевірка чисельників, знаменників та апостеріорних ймовірностей $P(L_t)$ за формулами Баєса з точністю до $10^{-6}$.
                  </p>
                  <div className="flex items-center justify-between py-1 border-t border-slate-800/60 text-[11px]">
                    <span>Стандарт тесту:</span>
                    <span className="font-mono text-emerald-400 font-bold">10 Інваріантів</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-t border-slate-800/60 text-[11px]">
                    <span>Журнал подій:</span>
                    <span className="font-mono text-indigo-400">event_stream.jsonl</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-t border-slate-800/60 text-[11px]">
                    <span>Ротація логів:</span>
                    <span className="font-mono text-emerald-400">20 МБ (Safe)</span>
                  </div>
                </div>
              </DrawerSection>

              <DrawerSection
                title="Ключові формули BKT"
                icon={Sparkles}
                defaultOpen={true}
              >
                <div className="flex flex-col gap-2 pt-1 text-[11px] font-mono text-slate-300">
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-sans block mb-0.5">Правильна відповідь:</span>
                    <span className="text-emerald-400 font-semibold">[P(L)*(1-S)] / Den</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-sans block mb-0.5">Помилка:</span>
                    <span className="text-rose-400 font-semibold">[P(L)*S] / Den</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-sans block mb-0.5">Транзит знань:</span>
                    <span className="text-indigo-400 font-semibold">P(L|Obs) + (1-P(L|Obs))*P(T)</span>
                  </div>
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 font-sans block mb-0.5">Штраф Сократа:</span>
                    <span className="text-amber-400 font-semibold">ΔP * (1 - Penalty)</span>
                  </div>
                </div>
              </DrawerSection>
            </>
          )}

          {/* Drawer 4: System Sidebar */}
          {activeTab === 'system' && (
            <DrawerSection
              title="Web3 SBT Релейєр"
              icon={ShieldCheck}
              defaultOpen={true}
            >
              <div className="flex flex-col gap-2 pt-1 text-xs text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Мережа:</span>
                  <span className="font-mono text-emerald-400">Hardhat Local (31337)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Релейєр:</span>
                  <span className="text-emerald-400 font-semibold">Активний (Gasless)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Контракт SBT:</span>
                  <span className="font-mono text-[10px] text-purple-300">0x5FbDB...7108</span>
                </div>
              </div>
            </DrawerSection>
          )}
        </div>
      ),
    };
  };

  return (
    <>
      <AppShellLayout
        currentApp="admin"
        header={{
          appName: 'Smart-BKT-Chain',
          badgeText: 'Admin',
          logoIcon: ShieldCheck,
          logoColor: 'bg-emerald-500/15 text-emerald-400',
          courseBadge: (
            <span
              className="text-xs sm:text-[13px] font-normal text-slate-300 select-none tracking-normal"
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
                    : activeTab === 'users'
                    ? 'Користувачі & Доступ'
                    : activeTab === 'datasets'
                    ? 'Датасети для ШІ'
                    : activeTab === 'verifier'
                    ? 'Математичний аудит BKT'
                    : 'Система',
                  badge: activeTab === 'dag' ? `${nodes.length} навичок` : undefined,
                  isCurrent: true,
                },
              ]}
            />
          ),
          rightSlot: (
            <div className="flex items-center gap-2">
              <a
                href={getAppBaseUrl('teacher')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <span>Кабінет Викладача</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>

              <div className="h-4 w-[1px] bg-slate-800" />

              {/* 👤 Кнопка профілю адміністратора */}
              <button
                type="button"
                onClick={() => setIsProfileDrawerOpen(true)}
                className="flex items-center gap-2 hover:bg-slate-800/60 px-2 py-1 rounded-lg transition-colors cursor-pointer select-none text-left group"
                title="Натисніть для відкриття профілю адміністратора"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  АД
                </div>
                <div className="hidden lg:flex flex-col leading-none">
                  <span className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors">
                    Адміністратор CMS
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 mt-0.5">
                    ADMIN
                  </span>
                </div>
              </button>
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
            {
              id: 'users',
              icon: Users,
              title: 'Керування Користувачами & Доступом',
              activeColor: 'bg-emerald-600',
            },
            {
              id: 'datasets',
              icon: Database,
              title: 'Експорт Датасетів для ШІ & Аудит-Логи',
              activeColor: 'bg-emerald-600',
            },
            {
              id: 'verifier',
              icon: Activity,
              title: 'Математичний Аудит BKT & Верифікатор',
              activeColor: 'bg-emerald-600',
            },
          ],
          activeTab: activeTab,
          isDrawerOpen: isDrawerOpen,
          onTabClick: handleTabClick,
          onSettingsClick: () => handleTabClick('system'),
          isSettingsActive: activeTab === 'system',
        }}
        drawer={getDrawerConfig()}
        mainClassName="p-4 lg:p-6 overflow-y-auto flex flex-col gap-5 bg-slate-950"
      >
        <div className="flex flex-col gap-5 min-h-[400px]">
          {activeTab === 'dag' && (
            <div className="flex flex-col gap-4">
              <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Network className="w-4 h-4 text-emerald-400" />
                    <span>Конструктор Графа Навичок (Skill DAG Editor)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Налаштування початкових BKT-параметрів ($P(L_0), P(T), P(S), P(G)$) та управління вузлами графа
                  </p>
                </div>
              </div>

              <SkillDagEditor
                nodes={nodes}
                onSaveNode={handleSaveNode}
                onDeleteNode={handleDeleteNode}
              />
            </div>
          )}

          {activeTab === 'courses' && <CourseManager />}

          {activeTab === 'users' && <UserManagementCenter apiUrl={API_URL} />}

          {activeTab === 'datasets' && (
            <DatasetExportCenter
              apiUrl={API_URL}
              activeFilter={datasetFilter}
              onFilterChange={setDatasetFilter}
              userFilter={datasetUserFilter}
              onUserFilterChange={setDatasetUserFilter}
              onStatsChange={setDatasetStats}
            />
          )}

          {activeTab === 'verifier' && <BktAuditVerifierCenter apiUrl={API_URL} />}

          {activeTab === 'system' && (
            <div className="flex flex-col gap-4">
              <div className="pb-3 border-b border-slate-800/80">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span>Конфігурація Релейєра Web3 & Смарт-Контрактів</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Статус підключення Hardhat/Foundry, гаманців релейєра для Gasless SBT мінтингу.
                </p>
              </div>
            </div>
          )}
        </div>
      </AppShellLayout>

      {/* 👤 Спільний уніфікований Drawer профілю адміністратора */}
      <UserProfileDrawer
        isOpen={isProfileDrawerOpen}
        onClose={() => setIsProfileDrawerOpen(false)}
        user={{
          name: 'Адміністратор Системи',
          roleName: 'Методист CMS',
          roleBadge: 'ADMIN',
          subtitle: 'Root Governance · ID: sys-admin',
          initials: 'АД',
          avatarGradient: 'bg-gradient-to-tr from-emerald-600 to-teal-500',
        }}
        courses={[
          {
            slug: 'js-dev',
            title: 'JavaScript & Web Dev',
            category: 'Програмування',
            skillsCount: nodes.length,
            totalSkillsCount: nodes.length,
            completionPct: 100,
          },
        ]}
        stats={[
          {
            label: 'Активних навичок у DAG',
            value: nodes.length,
            icon: Network,
            iconColor: 'text-emerald-400',
            valueColor: 'text-emerald-400',
          },
          {
            label: 'Конфігурація Релейєра',
            value: 'ONLINE',
            icon: ShieldCheck,
            iconColor: 'text-teal-400',
            valueColor: 'text-teal-400',
          },
        ]}
        statsTitle="Статус Методичного Центру"
        quickLinks={[
          {
            label: 'Кабінет Викладача',
            href: getAppBaseUrl('teacher'),
            icon: BookOpen,
            iconColor: 'text-purple-400',
          },
          {
            label: 'Підручник Теорії',
            href: getAppBaseUrl('study'),
            icon: BookOpen,
            iconColor: 'text-blue-400',
          },
          {
            label: 'Документація Системи',
            href: getAppBaseUrl('docs'),
            icon: Database,
            iconColor: 'text-slate-400',
          },
        ]}
      />
    </>
  );
}
