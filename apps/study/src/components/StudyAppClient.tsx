'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Minus,
  Lock,
  Unlock
} from 'lucide-react';
import { DrawerSection, AppShellLayout, Breadcrumbs } from '@sbc/ui';
import { ROUTES, buildStudyToPracticeUrl } from '@sbc/routes';
import { SCHOOL_WEB_CURRICULUM, LessonUnit, LessonSection, CurriculumModule } from '../data/school-web-curriculum';
import { CodePlayground } from './CodePlayground';
import { 
  ReaderFloatingToolbar, 
  ReaderSettings, 
  DEFAULT_READER_SETTINGS,
  ReadingTheme, 
  ReadingFont, 
  ReadingFontSize 
} from './ReaderFloatingToolbar';

interface StudyAppClientProps {
  initialCourseSlug?: string;
  initialModuleSlug?: string;
  initialUnitSlug?: string;
}

export function StudyAppClient({
  initialCourseSlug = 'web-algorithms-school',
  initialModuleSlug = 'school-alg-basics',
  initialUnitSlug = 'variables-and-types',
}: StudyAppClientProps) {
  const router = useRouter();

  const [activeCourseSlug, setActiveCourseSlug] = useState<string>(initialCourseSlug);
  const [selectedModuleSlug, setSelectedModuleSlug] = useState<string>(initialModuleSlug);
  const [selectedUnitSlug, setSelectedUnitSlug] = useState<string>(initialUnitSlug);

  // Оновлюємо стан, якщо змінилися вхідні параметри маршруту
  useEffect(() => {
    if (initialCourseSlug) setActiveCourseSlug(initialCourseSlug);
    if (initialModuleSlug) setSelectedModuleSlug(initialModuleSlug);
    if (initialUnitSlug) setSelectedUnitSlug(initialUnitSlug);
  }, [initialCourseSlug, initialModuleSlug, initialUnitSlug]);

  // 🔒 Mastery-Gated Progression State (відслідковування опанованих модулів та P(L))
  const [unlockedModules, setUnlockedModules] = useState<Record<string, boolean>>({
    'school-alg-basics': true, // Модуль 1 відкритий за замовчуванням
    'school-alg-branching': false,
    'school-alg-loops': false,
    'school-alg-functions': false,
    'school-alg-data-structures': false,
    'school-web-dom': false,
    'school-web-projects': false,
  });

  const [moduleMasteryScores, setModuleMasteryScores] = useState<Record<string, number>>({
    'school-alg-basics': 92, // Модуль 1 уже закріплений на 92%
    'school-alg-branching': 45,
    'school-alg-loops': 0,
    'school-alg-functions': 0,
    'school-alg-data-structures': 0,
    'school-web-dom': 0,
    'school-web-projects': 0,
  });

  // Navigation Rail state
  type StudyTab = 'curriculum' | 'playground' | 'glossary' | 'settings';
  const [activeTab, setActiveTab] = useState<StudyTab>('curriculum');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);

  // 📖 Zen Reading Mode State: початково стандартні налаштування
  const [readerSettings, setReaderSettings] = useState<ReaderSettings>(DEFAULT_READER_SETTINGS);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Клавіатурна гаряча клавіша F для входу/виходу з режиму фокусного читання
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable) {
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setReaderSettings((prev) => {
          if (prev.isFocusMode) {
            return {
              ...DEFAULT_READER_SETTINGS,
              isFocusMode: false,
            };
          } else {
            return {
              ...prev,
              isFocusMode: true,
              theme: 'sepia',
              font: 'sans',
              fontSize: 'normal',
              maxWidth: 'standard',
            };
          }
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Слухач скролу головного контенту для розрахунку прогресу
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const totalScroll = target.scrollHeight - target.clientHeight;
    if (totalScroll > 0) {
      const progress = (target.scrollTop / totalScroll) * 100;
      setScrollProgress(progress);
    } else {
      setScrollProgress(0);
    }
  };

  const handleTabClick = (tab: StudyTab) => {
    if (activeTab === tab) {
      setIsDrawerOpen((prev) => !prev);
    } else {
      setActiveTab(tab);
      setIsDrawerOpen(true);
    }
  };

  const handleSelectUnit = (moduleSlug: string, unitSlug: string) => {
    setSelectedModuleSlug(moduleSlug);
    setSelectedUnitSlug(unitSlug);
    // Клієнтська навігація за канонічним роутом без перезавантаження
    router.push(ROUTES.study.unit(activeCourseSlug, moduleSlug, unitSlug));
  };

  const currentModule = SCHOOL_WEB_CURRICULUM.modules.find(m => m.moduleSlug === selectedModuleSlug) || SCHOOL_WEB_CURRICULUM.modules[0];
  const currentUnit = currentModule.units.find(u => u.slug === selectedUnitSlug) || currentModule.units[0];

  const activeTheme = readerSettings.isFocusMode ? readerSettings.theme : 'night';
  const activeFont = readerSettings.isFocusMode ? readerSettings.font : 'sans';
  const activeFontSize = readerSettings.isFocusMode ? readerSettings.fontSize : 'normal';
  const activeMaxWidth = readerSettings.isFocusMode ? readerSettings.maxWidth : 'wide';

  const themeClasses: Record<ReadingTheme, string> = {
    night: 'bg-slate-950 text-slate-100',
    sepia: 'bg-[#f4ecd8] text-[#5b4636] border-[#e3d7be] selection:bg-[#e4d3b2] selection:text-[#3d2e22]',
    oled: 'bg-black text-neutral-100 selection:bg-neutral-800',
  };

  const fontClasses: Record<ReadingFont, string> = {
    sans: 'font-sans',
    serif: 'font-serif',
  };

  const fontSizeClasses: Record<ReadingFontSize, string> = {
    compact: 'text-[13px] leading-relaxed',
    normal: 'text-[15px] leading-relaxed',
    large: 'text-[17px] leading-loose',
    xlarge: 'text-[19px] leading-loose',
  };

  const maxWidthClasses: Record<string, string> = {
    narrow: 'max-w-2xl',
    standard: 'max-w-3xl',
    wide: 'max-w-5xl',
  };

  const contentBgClasses = 
    activeTheme === 'sepia' 
      ? 'bg-[#ede2cb] text-[#4a392b] border-[#decfae]' 
      : activeTheme === 'oled' 
        ? 'bg-neutral-900/90 text-neutral-100 border-neutral-800' 
        : 'bg-slate-900/60 text-slate-100 border-slate-800/80';

  const practiceUrl = buildStudyToPracticeUrl(
    activeCourseSlug,
    currentModule.moduleSlug,
    currentUnit.slug,
    currentModule.moduleSlug
  );

  // Конфігурація для уніфікованого Drawer
  const drawerConfig = {
    curriculum: {
      title: 'Зміст розділу та уроки',
      icon: BookOpen,
      iconColor: 'text-blue-400',
    },
    playground: {
      title: 'Пісочниця коду',
      icon: Code2,
      iconColor: 'text-emerald-400',
    },
    glossary: {
      title: 'Атлас оман і понять',
      icon: Lightbulb,
      iconColor: 'text-purple-400',
    },
    settings: {
      title: 'Налаштування середовища',
      icon: Settings,
      iconColor: 'text-amber-400',
    },
  }[activeTab];

  return (
    <AppShellLayout
      currentApp="study"
      className={`${themeClasses[activeTheme]} ${fontClasses[activeFont]} antialiased transition-colors duration-200 selection:bg-blue-500/20`}
      header={{
        appName: 'Smart-BKT-Chain',
        badgeText: 'Study Portal v2.0',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        logoColor: 'bg-blue-600/20 border-blue-500/30 text-blue-400',
        hideHeader: readerSettings.isFocusMode,
        centerSlot: (
          <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span className="font-semibold text-slate-300 max-w-[200px] truncate">{SCHOOL_WEB_CURRICULUM.courseTitle}</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-blue-400 font-bold">Модуль {currentModule.moduleNumber}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 max-w-[160px] truncate">{currentUnit.title}</span>
          </div>
        ),
        rightSlot: (
          <div className="flex items-center gap-3">
            <div className="relative min-w-[180px] sm:min-w-[240px]">
              <select
                id="study-course-select"
                value={activeCourseSlug}
                onChange={(e) => setActiveCourseSlug(e.target.value)}
                className="w-full appearance-none px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:border-blue-500 cursor-pointer pr-8 shadow-inner"
              >
                <option value="web-algorithms-school" className="bg-slate-900 text-white py-1">
                  📚 {SCHOOL_WEB_CURRICULUM.courseTitle}
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-slate-200">Дмитро Стеценко</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Учень
              </span>
            </div>
          </div>
        ),
      }}
      navigationRail={{
        hideRail: readerSettings.isFocusMode,
        activeTab,
        isDrawerOpen,
        onTabClick: (tabId) => handleTabClick(tabId as StudyTab),
        onSettingsClick: () => handleTabClick('settings'),
        isSettingsActive: activeTab === 'settings',
        tabs: [
          {
            id: 'curriculum',
            icon: BookOpen,
            title: 'Зміст курсу та уроки',
            activeColor: 'bg-blue-600',
          },
          {
            id: 'playground',
            icon: Code2,
            title: 'Інтерактивна пісочниця коду',
            activeColor: 'bg-emerald-600',
          },
          {
            id: 'glossary',
            icon: Lightbulb,
            title: 'Атлас типових оман та помилок',
            activeColor: 'bg-purple-600',
          },
        ],
      }}
      drawer={
        !readerSettings.isFocusMode
          ? {
              isOpen: isDrawerOpen,
              title: drawerConfig.title,
              icon: drawerConfig.icon,
              iconColor: drawerConfig.iconColor,
              headerBadge: `Модуль ${currentModule.moduleNumber}`,
              children: (
                <>
                  {activeTab === 'curriculum' && (
                    <>
                      <DrawerSection
                        title="Навчальна дисципліна"
                        icon={GraduationCap}
                        iconColor="text-blue-400"
                        badge="10-11 кл"
                        badgeColor="blue"
                        defaultOpen={true}
                      >
                        <div className="flex flex-col gap-1.5 p-1">
                          <div className="text-xs font-semibold text-white">
                            {SCHOOL_WEB_CURRICULUM.courseTitle}
                          </div>
                          <div className="text-[11px] text-slate-400 leading-relaxed">
                            {SCHOOL_WEB_CURRICULUM.description}
                          </div>
                        </div>
                      </DrawerSection>

                      <DrawerSection
                        title="Тематичні модулі"
                        icon={Layers}
                        iconColor="text-indigo-400"
                        badge={`${SCHOOL_WEB_CURRICULUM.modules.length}`}
                        badgeColor="indigo"
                        defaultOpen={true}
                      >
                        <div className="flex flex-col gap-1">
                          {SCHOOL_WEB_CURRICULUM.modules.map((mod) => {
                            const isUnlocked = unlockedModules[mod.moduleSlug] ?? false;
                            const masteryScore = moduleMasteryScores[mod.moduleSlug] ?? 0;
                            const isCurrent = mod.moduleSlug === selectedModuleSlug;

                            return (
                              <button
                                key={mod.moduleSlug}
                                onClick={() => {
                                  setSelectedModuleSlug(mod.moduleSlug);
                                  if (mod.units.length > 0) {
                                    handleSelectUnit(mod.moduleSlug, mod.units[0].slug);
                                  }
                                }}
                                className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex flex-col gap-1.5 cursor-pointer relative ${
                                  isCurrent
                                    ? 'bg-blue-600/15 border-blue-500/40 text-blue-200'
                                    : 'bg-slate-800/40 border-slate-800 hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono text-[10px] text-slate-400">
                                    Модуль {mod.moduleNumber}
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    {isUnlocked ? (
                                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                        <Unlock className="w-2.5 h-2.5" />
                                        <span>{masteryScore}%</span>
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20" title="Потрібно опанувати попередній модуль у тренажері (BKT ≥ 85%)">
                                        <Lock className="w-2.5 h-2.5" />
                                        <span>Заблоковано</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="font-medium text-xs leading-snug line-clamp-1">
                                  {mod.title.replace(/^Модуль \d+:\s*/, '')}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </DrawerSection>

                      <DrawerSection
                        title={`Уроки: Модуль ${currentModule.moduleNumber}`}
                        icon={BookOpen}
                        iconColor="text-emerald-400"
                        badge={`${currentModule.units.length}`}
                        badgeColor="emerald"
                        defaultOpen={true}
                      >
                        <div className="flex flex-col gap-1">
                          {currentModule.units.map((unit, idx) => {
                            const isCurrentUnit = unit.slug === selectedUnitSlug;
                            return (
                              <button
                                key={unit.slug}
                                onClick={() => handleSelectUnit(currentModule.moduleSlug, unit.slug)}
                                className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-center justify-between cursor-pointer ${
                                  isCurrentUnit
                                    ? 'bg-emerald-600/20 text-emerald-200 border border-emerald-500/40 font-semibold'
                                    : 'hover:bg-slate-800/60 text-slate-300 hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2 overflow-hidden pr-2">
                                  <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-mono shrink-0">
                                    {idx + 1}
                                  </span>
                                  <span className="truncate">{unit.title}</span>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                  {unit.estimatedMinutes} хв
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </DrawerSection>
                    </>
                  )}

                  {activeTab === 'playground' && (
                    <div className="p-2 flex flex-col gap-3">
                      <div className="text-xs text-slate-400 leading-relaxed">
                        Ви можете експериментувати з кодом безпосередньо у бічній панелі. Результат виконання виводиться у реальному часі.
                      </div>
                      <CodePlayground
                        initialCode={`// Спробуйте змінити значення:
const greeting = "Привіт, 10 клас!";
let counter = 1;
counter = counter + 1;
console.log(greeting, "Номер спроби:", counter);`}
                        autoRun={true}
                      />
                    </div>
                  )}

                  {activeTab === 'glossary' && (
                    <div className="flex flex-col gap-2 p-1">
                      <div className="text-xs text-slate-400 mb-1">
                        Каталог типових оман та алгоритмічних підказок поточного розділу:
                      </div>
                      {currentUnit.sections
                        .filter(s => s.misconceptionAlert)
                        .map((s, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 flex flex-col gap-1.5">
                            <span className="text-amber-400 font-bold text-xs flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{s.title}</span>
                            </span>
                            <p className="text-[11px] text-amber-200/90 italic">
                              {s.misconceptionAlert?.wrongBelief}
                            </p>
                            <p className="text-[11px] text-slate-300">
                              {s.misconceptionAlert?.fixTip}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="p-2 flex flex-col gap-4 text-xs text-slate-300">
                      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col gap-2">
                        <span className="font-bold text-white flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>Режим фокусного читання (Zen Focus)</span>
                        </span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Натисніть клавішу <kbd className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded font-mono border border-slate-700">F</kbd> на клавіатурі або скористайтеся плаваючою панеллю інструментів унизу екрана для приховування меню та вибору теми.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ),
            }
          : undefined
      }
      onMainScroll={handleScroll}
      mainClassName={`px-4 py-8 sm:px-8 lg:px-12 items-center transition-all ${
        readerSettings.isFocusMode ? 'focus-mode' : ''
      }`}
    >
          <div className={`w-full ${maxWidthClasses[activeMaxWidth]} flex flex-col gap-8`}>
            
            {/* Хлібні крихти та метаінформація уроку */}
            <div className="flex flex-col gap-2.5 border-b pb-4 opacity-90">
              <Breadcrumbs
                items={[
                  {
                    label: SCHOOL_WEB_CURRICULUM.courseTitle,
                    onClick: () => handleSelectUnit(SCHOOL_WEB_CURRICULUM.modules[0].moduleSlug, SCHOOL_WEB_CURRICULUM.modules[0].units[0].slug),
                  },
                  {
                    label: `Модуль ${currentModule.moduleNumber}`,
                    onClick: () => handleSelectUnit(currentModule.moduleSlug, currentModule.units[0].slug),
                  },
                  {
                    label: currentUnit.title,
                    badge: currentUnit.gradeLevel,
                    isCurrent: true,
                  },
                ]}
              />

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {currentUnit.title}
              </h1>

              <div className="flex items-center gap-4 text-xs opacity-75 mt-1 font-mono">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Час опрацювання: ~{currentUnit.estimatedMinutes} хв</span>
                </span>
                <span>•</span>
                <span>{currentUnit.sections.length} тематичні блоки</span>
              </div>
            </div>

            {/* Коротке дидактичне резюме параграфа */}
            <div className={`p-4 sm:p-5 rounded-2xl ${contentBgClasses} border leading-relaxed text-sm`}>
              <div className="font-bold text-xs uppercase tracking-wider mb-1.5 opacity-70 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Дидактичний фокус уроку:</span>
              </div>
              <p className="opacity-95">{currentUnit.summary}</p>
            </div>

            {/* Секції навчального матеріалу */}
            <div className="flex flex-col gap-10">
              {currentUnit.sections.map((sec) => (
                <section
                  key={sec.id}
                  id={sec.id}
                  className="flex flex-col gap-4 scroll-mt-20"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase tracking-wider">
                      {sec.badge}
                    </span>
                    <h3 className="text-lg font-bold tracking-tight">
                      {sec.title}
                    </h3>
                  </div>

                  <p className="text-xs font-medium opacity-80 italic pl-1 border-l-2 border-blue-500/40">
                    {sec.summary}
                  </p>

                  <div className={`${fontSizeClasses[activeFontSize]} whitespace-pre-line leading-relaxed opacity-95`}>
                    {sec.conceptExplanation}
                  </div>

                  {sec.codeSnippet && (
                    <div className="flex flex-col gap-2 my-2">
                      <CodePlayground
                        initialCode={sec.codeSnippet.code}
                        autoRun={true}
                      />
                      {sec.codeSnippet.explanation && (
                        <span className="text-[11px] opacity-70 italic px-2">
                          💡 {sec.codeSnippet.explanation}
                        </span>
                      )}
                    </div>
                  )}

                  {sec.misconceptionAlert && (
                    <div id={`misconception-${sec.id}`} className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex flex-col gap-2.5">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <span>💡 УВАГА! ТИПОВА КОГНІТИВНА ОМАНА УЧНІВ:</span>
                      </div>
                      <div className="text-xs text-amber-200/90 italic pl-6">
                        {sec.misconceptionAlert.wrongBelief}
                      </div>
                      <div className="text-xs pl-6 leading-relaxed opacity-90">
                        <strong className="text-amber-300 font-semibold">Чому це хибно: </strong>
                        {sec.misconceptionAlert.realityExplanation}
                      </div>
                      <div className="text-xs text-emerald-300 pl-6 flex items-center gap-1.5 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                        <span>{sec.misconceptionAlert.fixTip}</span>
                      </div>
                    </div>
                  )}

                  <div className={`p-4 rounded-xl ${contentBgClasses} border flex flex-col gap-2`}>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-300">
                      <Lightbulb className="w-3.5 h-3.5 text-blue-400" />
                      <span>Головні тези для запам'ятовування:</span>
                    </div>
                    <ul className="flex flex-col gap-1 pl-4 list-disc text-xs opacity-80 leading-relaxed">
                      {sec.keyTakeaways.map((item, tIdx) => (
                        <li key={tIdx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </section>
              ))}
            </div>

            {/* 🚀 ШЛЮЗ ПІДТВЕРДЖЕННЯ КОМПЕТЕНЦІЇ ТА ВІДКРИТТЯ НАСТУПНИХ ТЕМ */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/40 to-emerald-950/40 border border-blue-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mt-6 shadow-xl backdrop-blur-md">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Теоретичний блок опрацьовано
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      BKT-поріг для розблокування: ≥ 85%
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    Відкрито практичний модуль підтвердження компетенції
                  </h4>
                  <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                    Щоб розблокувати наступний модуль курсу, підтвердіть засвоєння навички в Тренажері. 
                    Після успішного розв'язання практичних задач BKT-секвенсор автоматично відкриє доступ до наступної теми.
                  </p>
                </div>
              </div>

              <a
                href={practiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer shrink-0"
              >
                <span>Підтвердити компетенцію в Тренажері</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* 🛠️ ПЛАВАЮЧА ПАНЕЛЬ ЗРУЧНОГО ЧИТАННЯ (Zen Reading Floating Toolbar) */}
          <ReaderFloatingToolbar
            settings={readerSettings}
            onUpdateSettings={setReaderSettings}
            scrollProgressPct={scrollProgress}
            estimatedMinutesLeft={currentUnit.estimatedMinutes}
          />
    </AppShellLayout>
  );
}
