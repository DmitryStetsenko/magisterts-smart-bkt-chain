'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  ChevronDown,
  AlertTriangle, 
  CheckCircle2, 
  Code2, 
  Clock, 
  GraduationCap, 
  ArrowRight,
  ExternalLink,
  Flame,
  Lightbulb,
  User,
  ShieldCheck,
  Settings,
  HelpCircle,
  Network,
  Plus,
  Minus
} from 'lucide-react';
import { DrawerSection } from '@sbc/ui';
import { SCHOOL_WEB_CURRICULUM, LessonUnit, LessonSection } from '../data/school-web-curriculum';
import { CodePlayground } from '../components/CodePlayground';

export default function StudyPortalHomePage() {
  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string>('school-alg-basics');
  const [selectedUnitSlug, setSelectedUnitSlug] = useState<string>('variables-and-types');
  const [activeCourseSlug, setActiveCourseSlug] = useState<string>('web-algorithms-school');

  // Navigation Rail state
  type StudyTab = 'curriculum' | 'playground' | 'glossary' | 'settings';
  const [activeTab, setActiveTab] = useState<StudyTab>('curriculum');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  const handleTabClick = (tab: StudyTab) => {
    if (activeTab === tab) {
      setIsDrawerOpen((prev) => !prev);
    } else {
      setActiveTab(tab);
      setIsDrawerOpen(true);
    }
  };

  const currentModule = SCHOOL_WEB_CURRICULUM.modules.find(m => m.moduleSlug === selectedModuleSlug) || SCHOOL_WEB_CURRICULUM.modules[0];
  const currentUnit = currentModule.units.find(u => u.slug === selectedUnitSlug) || currentModule.units[0];

  return (
    <div className="h-screen w-screen bg-slate-950 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* 📌 1. ЄДИНА ФІКСОВАНА ШАПКА ПЛАТФОРМИ (Header) */}
      <header className="h-14 w-full bg-slate-900 border-b border-slate-800/90 px-4 flex items-center justify-between shrink-0 z-30 shadow-md">
        {/* Ліва частина: Логотип платформи та бейдж режиму */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Smart-BKT-Chain</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                  Інтерактивний Підручник
                </span>
              </h1>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-slate-800 hidden sm:block"></div>

          {/* Індикатор модуля та курсу */}
          <div className="hidden md:flex items-center gap-2">
            <div className="p-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-400">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-slate-200 leading-tight">
                {currentModule.title.split(':')[0]}: {currentModule.title.split(':')[1] || currentModule.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {SCHOOL_WEB_CURRICULUM.gradeLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Права частина: Селектор курсу та Профіль користувача */}
        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px] sm:min-w-[260px]">
            <select
              id="study-course-select"
              value={activeCourseSlug}
              onChange={(e) => setActiveCourseSlug(e.target.value)}
              className="w-full appearance-none px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8 shadow-inner"
            >
              <option value="web-algorithms-school" className="bg-slate-900 text-white py-1">
                🎓 Вебтехнології та алгоритмізація (10–11 кл)
              </option>
              <option value="js-dev" className="bg-slate-900 text-white py-1">
                📚 JavaScript & Web Dev (Fullstack)
              </option>
              <option value="english-b2" className="bg-slate-900 text-white py-1">
                🌐 Business & Tech English (B2)
              </option>
              <option value="ukraine-law" className="bg-slate-900 text-white py-1">
                ⚖️ Правознавство України
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-slate-200">Дмитро Стеценко</span>
          </div>
        </div>
      </header>

      {/* 🧭 2. ГОЛОВНА РОБОЧА ЗОНА З БІЧНИМ RAIL ТА ШТОРКОЮ */}
      <div className="flex-1 flex overflow-hidden">
        {/* 🎨 Opera-Style Slim Left Navigation Rail (Ярлики) */}
        <nav className="w-14 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-3 shrink-0 z-20 shadow-xl">
          {/* Ярлик 1: Програма курсу та Уроки */}
          <button
            onClick={() => handleTabClick('curriculum')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'curriculum'
                ? isDrawerOpen
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 ring-1 ring-blue-400/50'
                  : 'bg-blue-950/80 text-blue-300 border border-blue-500/30 hover:bg-blue-900/90 hover:text-white'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title={
              activeTab === 'curriculum'
                ? isDrawerOpen
                  ? 'Зміст курсу відкритий (клік розгорне підручник на весь екран)'
                  : 'Підручник на весь екран (клік поверне бічний зміст)'
                : 'Програма та розділи курсу'
            }
          >
            <BookOpen className="w-5 h-5" />
            {activeTab === 'curriculum' && isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-5 bg-blue-400 rounded-r-full shadow-sm shadow-blue-400"></span>
            )}
            {activeTab === 'curriculum' && !isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-2 bg-blue-400/70 rounded-r-full"></span>
            )}
          </button>

          {/* Ярлик 2: Пісочниця коду */}
          <button
            onClick={() => handleTabClick('playground')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'playground'
                ? isDrawerOpen
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/40 ring-1 ring-emerald-400/50'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/90 hover:text-white'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Експериментальна Пісочниця JavaScript"
          >
            <Code2 className="w-5 h-5" />
            {activeTab === 'playground' && isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-5 bg-emerald-400 rounded-r-full shadow-sm shadow-emerald-400"></span>
            )}
            {activeTab === 'playground' && !isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-2 bg-emerald-400/70 rounded-r-full"></span>
            )}
          </button>

          {/* Ярлик 3: Глосарій та Омани */}
          <button
            onClick={() => handleTabClick('glossary')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'glossary'
                ? isDrawerOpen
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40 ring-1 ring-purple-400/50'
                  : 'bg-purple-950/80 text-purple-300 border border-purple-500/30 hover:bg-purple-900/90 hover:text-white'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            title="Атлас когнітивних оман та глосарій термінів"
          >
            <Lightbulb className="w-5 h-5" />
            {activeTab === 'glossary' && isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-5 bg-purple-400 rounded-r-full shadow-sm shadow-purple-400"></span>
            )}
            {activeTab === 'glossary' && !isDrawerOpen && (
              <span className="absolute -left-1 w-1 h-2 bg-purple-400/70 rounded-r-full"></span>
            )}
          </button>

          {/* Нижня частина бічного рейлу: Наскрізні ярлики додатків екосистеми */}
          <div className="mt-auto flex flex-col items-center gap-2.5">
            <div className="w-8 h-[1px] bg-slate-800/80 my-1"></div>

            {/* Ярлик: Студентський Тренажер (apps/student) */}
            <a
              href="http://localhost:3002"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 flex items-center justify-center hover:bg-indigo-600/30 hover:border-indigo-500/40 transition-all cursor-pointer shadow-sm"
              title="Кабінет Студента / Тренажер BKT (Student Portal - 3002)"
            >
              <Sparkles className="w-4 h-4" />
            </a>

            {/* Ярлик: Кабінет Викладача (apps/teacher) */}
            <a
              href="http://localhost:3003"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-purple-600/15 text-purple-400 border border-purple-500/20 flex items-center justify-center hover:bg-purple-600/30 hover:border-purple-500/40 transition-all cursor-pointer shadow-sm"
              title="Кабінет Викладача (Teacher Portal - 3003)"
            >
              <User className="w-4 h-4" />
            </a>

            {/* Ярлик: Панель Адміністратора CMS (apps/admin) */}
            <a
              href="http://localhost:3004"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-xl bg-emerald-600/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-600/30 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm"
              title="Адміністративна Панель CMS DAG (Admin Portal - 3004)"
            >
              <Network className="w-4 h-4" />
            </a>

            <div className="w-8 h-[1px] bg-slate-800/80 my-1"></div>

            {/* Налаштування підручника */}
            <button
              onClick={() => handleTabClick('settings')}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
                activeTab === 'settings'
                  ? isDrawerOpen
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/40 ring-1 ring-amber-400/50'
                    : 'bg-amber-950/80 text-amber-300 border border-amber-500/30 hover:bg-amber-900/90 hover:text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Налаштування відображення"
            >
              <Settings className="w-5 h-5" />
              {activeTab === 'settings' && isDrawerOpen && (
                <span className="absolute -left-1 w-1 h-5 bg-amber-400 rounded-r-full shadow-sm shadow-amber-400"></span>
              )}
              {activeTab === 'settings' && !isDrawerOpen && (
                <span className="absolute -left-1 w-1 h-2 bg-amber-400/70 rounded-r-full"></span>
              )}
            </button>
          </div>
        </nav>

        {/* 📂 3. ВИСУВНА БІЧНА ПАНЕЛЬ (Side Drawer з уніфікованими DrawerSection за Правилом 7) */}
        {isDrawerOpen && (
          <aside className="w-full sm:w-[340px] lg:w-[380px] bg-slate-900/95 border-r border-slate-800 flex flex-col shrink-0 shadow-2xl backdrop-blur-xl animate-fadeIn z-10 overflow-hidden">
            {/* Шапка бічної панелі */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90 backdrop-blur-md">
              <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                {activeTab === 'curriculum' && (
                  <>
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span>Зміст розділу та уроки</span>
                  </>
                )}
                {activeTab === 'playground' && (
                  <>
                    <Code2 className="w-4 h-4 text-emerald-400" />
                    <span>Пісочниця коду</span>
                  </>
                )}
                {activeTab === 'glossary' && (
                  <>
                    <Lightbulb className="w-4 h-4 text-purple-400" />
                    <span>Атлас оман і понять</span>
                  </>
                )}
                {activeTab === 'settings' && (
                  <>
                    <Settings className="w-4 h-4 text-amber-400" />
                    <span>Налаштування середовища</span>
                  </>
                )}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                Модуль {currentModule.moduleNumber}
              </span>
            </div>

            {/* Вміст бічної панелі: структурований через акордеонні секції DrawerSection */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
              {activeTab === 'curriculum' && (
                <>
                  {/* Секція 1: Огляд поточного курсу */}
                  <DrawerSection
                    title="Навчальна дисципліна"
                    icon={GraduationCap}
                    iconColor="text-blue-400"
                    titleColor="text-blue-400 group-hover:text-blue-300"
                    defaultOpen={true}
                  >
                    <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col gap-1.5">
                      <span className="text-xs font-bold text-white">{SCHOOL_WEB_CURRICULUM.courseTitle}</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {SCHOOL_WEB_CURRICULUM.description}
                      </p>
                    </div>
                  </DrawerSection>

                  {/* Секція 2: Модулі та теми (Інтерактивний список) */}
                  <DrawerSection
                    title="Модулі програми (7 модулів)"
                    icon={Layers}
                    iconColor="text-indigo-400"
                    titleColor="text-indigo-400 group-hover:text-indigo-300"
                    badge={SCHOOL_WEB_CURRICULUM.modules.length}
                    badgeColor="bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
                    defaultOpen={true}
                    className="border-t border-slate-800/80 pt-2.5"
                  >
                    <div className="flex flex-col gap-1.5">
                      {SCHOOL_WEB_CURRICULUM.modules.map((mod) => {
                        const isModActive = mod.moduleSlug === selectedModuleSlug;
                        return (
                          <div key={mod.moduleSlug} className="flex flex-col gap-1">
                            <button
                              onClick={() => {
                                setSelectedModuleSlug(mod.moduleSlug);
                                if (mod.units.length > 0) {
                                  setSelectedUnitSlug(mod.units[0].slug);
                                }
                              }}
                              className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between cursor-pointer ${
                                isModActive
                                  ? 'bg-blue-600/20 border-blue-500/60 text-white font-bold shadow-md shadow-blue-900/30'
                                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 truncate pr-2">
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                                  isModActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {mod.moduleNumber}
                                </span>
                                <span className="truncate">{mod.title.split(':')[1] || mod.title}</span>
                              </div>
                              <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isModActive ? 'rotate-90 text-blue-400' : 'text-slate-600'}`} />
                            </button>

                            {/* Список уроків для вибраного модуля */}
                            {isModActive && (
                              <div className="flex flex-col gap-1 pl-4 my-1 border-l-2 border-blue-500/30 ml-3">
                                {mod.units.map((unit) => {
                                  const isUnitActive = unit.slug === selectedUnitSlug;
                                  return (
                                    <button
                                      key={unit.slug}
                                      onClick={() => setSelectedUnitSlug(unit.slug)}
                                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between cursor-pointer ${
                                        isUnitActive
                                          ? 'bg-blue-600 text-white font-bold shadow-sm'
                                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                      }`}
                                    >
                                      <span className="truncate">{unit.title}</span>
                                      <span className="text-[10px] font-mono opacity-80 shrink-0 ml-1.5">{unit.estimatedMinutes} хв</span>
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </DrawerSection>

                  {/* Секція 3: Швидкий перехід до закріплення на практиці */}
                  <DrawerSection
                    title="Практичне закріплення"
                    icon={Sparkles}
                    iconColor="text-emerald-400"
                    titleColor="text-emerald-400 group-hover:text-emerald-300"
                    defaultOpen={true}
                    className="border-t border-slate-800/80 pt-2.5"
                  >
                    <div className="p-3 bg-gradient-to-br from-emerald-950/30 to-teal-950/30 border border-emerald-500/30 rounded-xl flex flex-col gap-2">
                      <span className="text-xs font-bold text-emerald-200">Готові до тестування?</span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Після вивчення теорії перейдіть до тренажера Monaco Editor для оцінки $P(L_n)$.
                      </p>
                      <a
                        href="http://localhost:3002"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
                      >
                        <span>Запустити тренажер</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </DrawerSection>
                </>
              )}

              {activeTab === 'playground' && (
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col gap-2 text-xs text-slate-300">
                  <span className="font-bold text-emerald-400">💡 Інструкція пісочниці</span>
                  <p className="leading-relaxed">
                    Тут ви можете писати та запускати довільний JavaScript код для тестування гіпотез.
                    Використовуйте <code className="text-blue-300">console.log(...)</code> для перегляду значень у реальному часі.
                  </p>
                </div>
              )}

              {activeTab === 'glossary' && (
                <div className="flex flex-col gap-2.5">
                  <div className="p-3 bg-purple-950/20 border border-purple-500/30 rounded-xl flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-purple-300">Атлас типових оман (Misconceptions)</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Систематизований реєстр найчастіших хибних думок учнів, які виявляє штучний інтелект секвенсора.
                    </p>
                  </div>
                  {currentUnit.sections.filter(s => s.misconceptionAlert).map((s, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col gap-1 text-xs">
                      <span className="font-bold text-amber-400">⚠️ {s.misconceptionAlert?.wrongBelief}</span>
                      <p className="text-[11px] text-slate-300">{s.misconceptionAlert?.realityExplanation}</p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col gap-3 text-xs">
                  <span className="font-bold text-amber-400">Параметри читання</span>
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span>Авто-запуск прикладів коду:</span>
                    <input type="checkbox" defaultChecked className="rounded accent-blue-600" />
                  </label>
                  <label className="flex items-center justify-between text-slate-300 cursor-pointer">
                    <span>Підсвічувати когнітивні омани:</span>
                    <input type="checkbox" defaultChecked className="rounded accent-amber-500" />
                  </label>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* 💻 4. ГОЛОВНЕ ПОЛОТНО ПІДРУЧНИКА (Main Reading Canvas) */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
          {/* Верхня смуга хлібних крихт (Breadcrumbs) */}
          <div className="px-8 py-3.5 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>{currentModule.title.split(':')[0]}</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-blue-400 font-bold">{currentUnit.title}</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Час на опрацювання: ~{currentUnit.estimatedMinutes} хв</span>
            </div>
          </div>

          {/* Тіло матеріалу уроку */}
          <div className="max-w-4xl mx-auto w-full px-8 py-8 flex flex-col gap-8">
            {/* Шапка теми */}
            <div className="flex flex-col gap-3 border-b border-slate-800/80 pb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{currentUnit.gradeLevel} • Модуль {currentUnit.moduleNumber}</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">{currentUnit.title}</h2>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                {currentUnit.summary}
              </p>
            </div>

            {/* Секції уроку з теорією, кодом та оманами */}
            <div className="flex flex-col gap-10">
              {currentUnit.sections.map((sec, idx) => (
                <section key={sec.id} id={sec.id} className="flex flex-col gap-4 scroll-mt-20">
                  {/* Заголовок секції */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="text-lg font-bold text-white tracking-wide">{sec.title}</h3>
                    </div>
                    {sec.badge && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {sec.badge}
                      </span>
                    )}
                  </div>

                  {/* Теоретичне пояснення */}
                  <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/40 p-5 rounded-2xl border border-slate-800/80">
                    {sec.conceptExplanation}
                  </div>

                  {/* Інтерактивна пісочниця коду */}
                  {sec.codeSnippet && (
                    <CodePlayground
                      title={`Живий приклад: ${sec.title}`}
                      initialCode={sec.codeSnippet.code}
                    />
                  )}

                  {/* Блок попередження про типову когнітивну оману (Misconception Alert) */}
                  {sec.misconceptionAlert && (
                    <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-2.5">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>💡 УВАГА! ТИПОВА КОГНІТИВНА ОМАНА УЧНІВ:</span>
                      </div>
                      <div className="text-xs text-amber-200/90 italic pl-6">
                        {sec.misconceptionAlert.wrongBelief}
                      </div>
                      <div className="text-xs text-slate-300 pl-6 leading-relaxed">
                        <strong className="text-amber-300 font-semibold">Чому це хибно: </strong>
                        {sec.misconceptionAlert.realityExplanation}
                      </div>
                      <div className="text-xs text-emerald-300 pl-6 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                        <span>{sec.misconceptionAlert.fixTip}</span>
                      </div>
                    </div>
                  )}

                  {/* Ключові висновки (Key Takeaways) */}
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                      <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                      <span>Головні тези для запам'ятовування:</span>
                    </div>
                    <ul className="flex flex-col gap-1 pl-4 list-disc text-xs text-slate-400 leading-relaxed">
                      {sec.keyTakeaways.map((item, tIdx) => (
                        <li key={tIdx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              ))}
            </div>

            {/* Блок переходу до практики у Студентському Тренажері */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-purple-950/40 border border-blue-500/30 flex items-center justify-between gap-4 mt-6">
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Теорію опановано! Час закріпити навичку на практиці</span>
                </h4>
                <p className="text-xs text-slate-300">
                  Перейдіть до Студентського Кабінету Smart-BKT-Chain для проходження адаптивних завдань та оцінки знань BKT.
                </p>
              </div>
              <a
                href="http://localhost:3002"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
              >
                <span>Почати тренування</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
