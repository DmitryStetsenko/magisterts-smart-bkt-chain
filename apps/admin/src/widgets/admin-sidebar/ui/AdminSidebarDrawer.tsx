'use client';

import React from 'react';
import {
  Activity,
  ArrowLeft,
  Binary,
  BookOpen,
  CheckCircle2,
  Code,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Filter,
  FlaskConical,
  Folder,
  Languages,
  Layers,
  Plus,
  Scale,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
} from 'lucide-react';
import { DrawerSection, ThemeSettingsSection } from '@sbc/ui';
import { getAppBaseUrl } from '@sbc/routes';
import type { CourseCategoryDto, CourseDto, CourseModuleDto } from '@sbc/types';
import { COURSE_PRESETS } from '@/shared/config/coursePresets';
import { downloadCourseExport, downloadCourseTemplate } from '@/features/course-manager/services/courseWorkbookService';
import type { DatasetStats } from '@/features/dataset-export/ui/DatasetExportCenter';

export type AdminTab = 'courses' | 'create_course' | 'users' | 'datasets' | 'verifier' | 'system';
export type CourseViewMode = 'LIST' | 'CREATE' | 'STUDIO' | 'THEORY';
export type DatasetFilterType = 'ALL' | 'SUBMISSIONS' | 'HINTS' | 'THEORY' | 'ANNULMENTS' | 'RESETS';

export interface AdminSidebarDrawerProps {
  apiUrl: string;
  activeTab: AdminTab;
  courseViewMode: CourseViewMode;
  selectedStudioCourse: CourseDto | null;
  onSetSelectedStudioCourse: (course: CourseDto | null) => void;
  selectedTheoryModule: CourseModuleDto | null;
  onBackToStudio: () => void;
  onOpenTheory: (course: CourseDto, module: CourseModuleDto) => void;
  onOpenStudio: (course: CourseDto) => void;
  onLoadCourses: () => void;
  studioSubTab: 'CURRICULUM' | 'SETTINGS';
  onSetStudioSubTab: (tab: 'CURRICULUM' | 'SETTINGS') => void;
  authorStep: number;
  maxUnlockedStep: number;
  onStepClick: (step: number) => void;
  onOpenAiScaffoldModal: () => void;
  onOpenImportModal: () => void;
  dynamicCourses: CourseDto[];
  categories: CourseCategoryDto[];
  selectedCourseSlug: string | null;
  onSelectCourseSlug: (slug: string | null) => void;
  selectedCategorySlug: string | null;
  onSelectCategorySlug: (slug: string | null) => void;
  courseStatusFilter: 'ALL' | 'PUBLISHED' | 'DRAFT';
  onSetCourseStatusFilter: (status: 'ALL' | 'PUBLISHED' | 'DRAFT') => void;
  datasetFilter: DatasetFilterType;
  onSetDatasetFilter: (filter: DatasetFilterType) => void;
  datasetUserFilter: string;
  onSetDatasetUserFilter: (val: string) => void;
  datasetActiveUsers: { userId: string; name: string; email?: string; count: number; role?: string }[];
  datasetStats: DatasetStats;
}

/**
 * Бічна навігаційно-інспекторська панель Адмін-CMS залежно від активної вкладки та режиму курсу.
 */
export const AdminSidebarDrawer: React.FC<AdminSidebarDrawerProps> = ({
  apiUrl,
  activeTab,
  courseViewMode,
  selectedStudioCourse,
  onSetSelectedStudioCourse,
  selectedTheoryModule,
  onBackToStudio,
  onOpenTheory,
  onOpenStudio,
  onLoadCourses,
  studioSubTab,
  onSetStudioSubTab,
  authorStep,
  maxUnlockedStep,
  onStepClick,
  onOpenAiScaffoldModal,
  onOpenImportModal,
  dynamicCourses,
  categories,
  selectedCourseSlug,
  onSelectCourseSlug,
  selectedCategorySlug,
  onSelectCategorySlug,
  courseStatusFilter,
  onSetCourseStatusFilter,
  datasetFilter,
  onSetDatasetFilter,
  datasetUserFilter,
  onSetDatasetUserFilter,
  datasetActiveUsers,
  datasetStats,
}) => {
  return (
    <div className="flex flex-col divide-y divide-slate-800/70">
      {/* Drawer: Course Theory Builder Mode */}
      {(activeTab === 'courses' || activeTab === 'create_course') &&
        courseViewMode === 'THEORY' &&
        selectedStudioCourse &&
        selectedTheoryModule && (
          <>
            <div className="p-2 border-b border-slate-800/60">
              <button
                type="button"
                onClick={onBackToStudio}
                className="w-full py-2 px-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors flex items-center gap-2 text-xs cursor-pointer group"
                title="Повернутися до Студії курсу"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 shrink-0" />
                <div className="flex flex-col text-left min-w-0">
                  <span className="font-semibold text-slate-200">До Студії курсу</span>
                  <span className="text-[10px] text-slate-500 font-mono truncate">{selectedStudioCourse.title}</span>
                </div>
              </button>
            </div>

            <DrawerSection title="Зміст уроку (5 блоків)" icon={BookOpen} defaultOpen={true}>
              <div className="flex flex-col gap-1 pt-1 text-xs">
                {[
                  { id: 'theory-card-summary', num: '1.', numColor: 'text-blue-400', label: 'Вступ & Мета теми', tag: 'Summary' },
                  { id: 'theory-card-concepts', num: '2.', numColor: 'text-emerald-400', label: 'Теоретичні поняття', tag: 'Concepts' },
                  { id: 'theory-card-code', num: '3.', numColor: 'text-indigo-400', label: 'Приклад коду', tag: 'Snippet' },
                  { id: 'theory-card-misconception', num: '4.', numColor: 'text-amber-400', label: 'Картка омани', tag: 'Alert', amberText: true },
                  { id: 'theory-card-takeaways', num: '5.', numColor: 'text-purple-400', label: 'Ключові висновки', tag: 'Takeaways' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent('admin-theory-scroll-to-card', { detail: { cardId: item.id } }))
                    }
                    className="w-full p-2 rounded-lg text-left text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`${item.numColor} font-bold font-mono`}>{item.num}</span>
                      <span className={`truncate ${item.amberText ? 'text-amber-300/90' : ''}`}>{item.label}</span>
                    </div>
                    <span className={`text-[10px] font-mono ${item.amberText ? 'text-amber-500/80' : 'text-slate-500'}`}>
                      {item.tag}
                    </span>
                  </button>
                ))}
              </div>
            </DrawerSection>

            <DrawerSection title="Дидактичні шаблони" icon={Sparkles} defaultOpen={false}>
              <div className="flex flex-col gap-1 pt-1 text-xs">
                {[
                  { preset: 'html', dot: 'bg-emerald-400', label: 'HTML (Базова розмітка)' },
                  { preset: 'js', dot: 'bg-indigo-400', label: 'JavaScript (Змінні & Типи)' },
                  { preset: 'css', dot: 'bg-teal-400', label: 'CSS (Flexbox Розкладка)' },
                  { preset: 'python', dot: 'bg-amber-400', label: 'Python (Синтаксис & Типи)' },
                ].map((item) => (
                  <button
                    key={item.preset}
                    type="button"
                    onClick={() =>
                      window.dispatchEvent(new CustomEvent('admin-theory-apply-preset', { detail: { preset: item.preset } }))
                    }
                    className="w-full py-1.5 px-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/60 text-left transition-colors font-medium cursor-pointer flex items-center gap-2"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${item.dot} shrink-0`} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </DrawerSection>

            <DrawerSection
              title="Теми цього курсу"
              icon={Layers}
              badge={`${selectedStudioCourse.modules?.length || 0} тем`}
              defaultOpen={false}
            >
              <div className="flex flex-col divide-y divide-slate-800/50 pt-1 max-h-56 overflow-y-auto">
                {(selectedStudioCourse.modules || []).map((m, idx) => {
                  const isCurrent = m.id === selectedTheoryModule.id;
                  const hasTheory = Boolean(m.description && m.description.trim().length > 0);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onOpenTheory(selectedStudioCourse, m)}
                      className={`w-full py-2 px-2 text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'bg-emerald-500/15 text-emerald-300 font-semibold border-l-2 border-emerald-400 pl-2'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-1">
                        <span className="font-mono text-[10px] text-slate-500 shrink-0">#{idx + 1}</span>
                        <span className="truncate">{m.title}</span>
                      </div>
                      <span className={`text-[9px] font-mono shrink-0 ${hasTheory ? 'text-emerald-400' : 'text-slate-600'}`}>
                        {hasTheory ? '✓ готова' : 'порожньо'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </DrawerSection>

            <DrawerSection title="Зовнішній перегляд" icon={ExternalLink} defaultOpen={false}>
              <div className="flex flex-col gap-1.5 pt-1 text-xs">
                <a
                  href={`${getAppBaseUrl('study')}/learn/${selectedStudioCourse.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white transition-colors flex items-center justify-between group cursor-pointer"
                >
                  <span className="font-semibold truncate">Zen Focus у Підручнику</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                </a>
              </div>
            </DrawerSection>
          </>
        )}

      {/* Drawer: Course Studio Mode */}
      {(activeTab === 'courses' || activeTab === 'create_course') &&
        courseViewMode === 'STUDIO' &&
        selectedStudioCourse && (() => {
          const mods = selectedStudioCourse.modules || [];
          const totalMods = mods.length;
          const modsWithTheory = mods.filter((m) => Boolean(m.theoryUrl)).length;
          let tSkills = 0;
          let tTasks = 0;
          let codeCount = 0;
          let quizCount = 0;

          mods.forEach((m) => {
            if (m.skills) {
              tSkills += m.skills.length;
              m.skills.forEach((s: any) => {
                if (s.tasks) {
                  tTasks += s.tasks.length;
                  s.tasks.forEach((t: any) => {
                    if (t.taskType === 'CODE') codeCount++;
                    else quizCount++;
                  });
                }
              });
            }
          });

          if (tSkills === 0 && selectedStudioCourse.skills) {
            tSkills = selectedStudioCourse.skills.length;
            selectedStudioCourse.skills.forEach((s: any) => {
              if (s.tasks) {
                tTasks += s.tasks.length;
                s.tasks.forEach((t: any) => {
                  if (t.taskType === 'CODE') codeCount++;
                  else quizCount++;
                });
              }
            });
          }

          return (
            <>
              <DrawerSection
                title="Готовність курсу"
                icon={CheckCircle2}
                badge={selectedStudioCourse.isPublished ? 'PUBLISHED' : 'DRAFT'}
                defaultOpen={false}
              >
                <div className="flex flex-col gap-2 pt-1 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800/80">
                    <span className="text-[11px] text-slate-400">Статус курсу:</span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const nextStatus = !selectedStudioCourse.isPublished;
                          const res = await fetch(`${apiUrl}/api/v1/courses/${selectedStudioCourse.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ isPublished: nextStatus }),
                          });
                          if (res.ok) {
                            const updated = await res.json();
                            onSetSelectedStudioCourse(updated);
                            onLoadCourses();
                          }
                        } catch {}
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer border ${
                        selectedStudioCourse.isPublished
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25'
                          : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                      }`}
                    >
                      {selectedStudioCourse.isPublished ? '✓ Опубліковано' : '● Чернетка'}
                    </button>
                  </div>

                  <div className="flex flex-col divide-y divide-slate-800/50 text-[11px]">
                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400">📖 Конспекти теорії:</span>
                      <span className={`font-mono ${modsWithTheory > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {modsWithTheory}/{totalMods} тем
                      </span>
                    </div>
                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400">🎯 BKT-компетенції:</span>
                      <span className="font-mono text-slate-200">{tSkills} навичок</span>
                    </div>
                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400">📝 Банк завдань:</span>
                      <span className="font-mono text-indigo-400">
                        {tTasks} вправ ({codeCount} код, {quizCount} тест)
                      </span>
                    </div>
                    <div className="py-1.5 flex items-center justify-between">
                      <span className="text-slate-400">⚖️ Поріг майстерності:</span>
                      <span className="font-mono text-emerald-400">
                        P(L) ≥ {selectedStudioCourse.defaultMasteryThreshold ?? 0.85}
                      </span>
                    </div>
                  </div>
                </div>
              </DrawerSection>

              <DrawerSection title="Маршрут автора курсу" icon={Layers} badge={`Крок ${authorStep} з 5`} defaultOpen={true}>
                <div className="flex flex-col gap-1.5 pt-1 text-xs">
                  {[
                    {
                      num: 1,
                      title: 'Базові метадані',
                      sub: `Паспорт: /${selectedStudioCourse.slug}`,
                      stat: `✓ P(L) ≥ ${selectedStudioCourse.defaultMasteryThreshold ?? 0.85}`,
                    },
                    { num: 2, title: 'Модульна структура', sub: 'Тематичні розділи курсу', stat: `✓ ${totalMods} тем` },
                    { num: 3, title: 'Граф компетенцій (DAG)', sub: 'Компетенції та пререквізити BKT', stat: `✓ ${tSkills} навичок` },
                    {
                      num: 4,
                      title: 'Конспекти & Підручник',
                      sub: '5-блочний Zen Focus конспект',
                      stat: modsWithTheory > 0 ? `✓ ${modsWithTheory}/${totalMods}` : `${modsWithTheory}/${totalMods}`,
                    },
                    { num: 5, title: 'Банк адаптивних завдань', sub: 'Симуляція BKT та завдання', stat: `✓ ${tTasks} вправ` },
                  ].map((st) => {
                    const isCurrent = authorStep === st.num;
                    const isUnlocked = st.num <= maxUnlockedStep;
                    const isLocked = !isUnlocked;

                    return (
                      <button
                        key={st.num}
                        type="button"
                        disabled={isLocked}
                        onClick={() => onStepClick(st.num)}
                        className={`w-full p-2 text-left rounded-lg transition-colors flex items-start gap-2.5 ${
                          isCurrent
                            ? 'bg-emerald-500/15 border-l-2 border-emerald-400 pl-2 text-emerald-300 font-semibold cursor-pointer'
                            : isUnlocked
                            ? 'hover:bg-slate-800/60 text-slate-300 cursor-pointer'
                            : 'opacity-40 text-slate-500 cursor-not-allowed select-none'
                        }`}
                        title={
                          isLocked
                            ? `Крок ${st.num} заблоковано. Завершіть попередні кроки, щоб відкрити цей етап.`
                            : isCurrent
                            ? `Поточний активний етап: ${st.title}`
                            : `Перейти до кроку ${st.num}: ${st.title}`
                        }
                      >
                        <span
                          className={`font-mono text-[10px] font-bold px-1 py-0.5 rounded shrink-0 mt-0.5 ${
                            isCurrent
                              ? 'text-emerald-400 bg-emerald-500/20'
                              : isUnlocked
                              ? 'text-slate-300 bg-slate-800'
                              : 'text-slate-600 bg-slate-900'
                          }`}
                        >
                          {isLocked ? '🔒' : st.num}
                        </span>
                        <div className="flex flex-col min-w-0 w-full">
                          <div className="flex items-center justify-between gap-1">
                            <span className={`truncate ${isCurrent ? 'text-white' : isUnlocked ? 'text-slate-200' : 'text-slate-500'}`}>
                              {st.title}
                            </span>
                            <span
                              className={`text-[10px] font-mono shrink-0 ${
                                isCurrent ? 'text-emerald-400' : isUnlocked ? 'text-slate-400' : 'text-slate-600'
                              }`}
                            >
                              {isLocked ? 'Недоступно' : isCurrent ? 'Зараз' : st.stat}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 truncate">{st.sub}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </DrawerSection>

              <DrawerSection title="Тестування модуля" icon={FlaskConical} defaultOpen={false}>
                <div className="flex flex-col gap-2 pt-1 text-xs">
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Симуляція адаптивного розв&apos;язку учня та калібрування BKT:
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      onSetStudioSubTab('CURRICULUM');
                      window.dispatchEvent(new CustomEvent('admin-studio-open-test-module'));
                    }}
                    className="w-full py-2 px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-colors flex items-center justify-center gap-2 font-semibold cursor-pointer"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                    <span>🧪 Тестова пісочниця автора</span>
                  </button>

                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800 text-[10px] text-slate-400 font-mono">
                    <span className="text-emerald-400 font-bold">BKT динаміка:</span> ~3–4 успішні відповіді підряд піднімуть P(L) до 0.85.
                  </div>
                </div>
              </DrawerSection>

              <DrawerSection title="Дії та інструменти" icon={Settings} defaultOpen={false}>
                <div className="flex flex-col gap-1.5 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onSetStudioSubTab('CURRICULUM');
                      window.dispatchEvent(new CustomEvent('admin-studio-open-create-module'));
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>+ Додати модуль</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSetStudioSubTab('CURRICULUM');
                      window.dispatchEvent(new CustomEvent('admin-studio-open-create-skill'));
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <Target className="w-3.5 h-3.5 text-indigo-400" />
                    <span>+ Додати компетенцію</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSetStudioSubTab('CURRICULUM')}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-left transition-colors flex items-center justify-between cursor-pointer ${
                      studioSubTab === 'CURRICULUM'
                        ? 'bg-slate-800 text-white font-medium'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      <span>План &amp; DAG</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {selectedStudioCourse.modules?.length || 0} тем
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSetStudioSubTab('SETTINGS')}
                    className={`w-full py-1.5 px-2.5 rounded-lg text-left transition-colors flex items-center justify-between cursor-pointer ${
                      studioSubTab === 'SETTINGS'
                        ? 'bg-slate-800 text-white font-medium'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Параметри &amp; BKT</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">
                      P(L) ≥ {selectedStudioCourse.defaultMasteryThreshold ?? 0.85}
                    </span>
                  </button>

                  <div className="pt-1.5 border-t border-slate-800/60 flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={onOpenAiScaffoldModal}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/40 transition-colors flex items-center gap-2 font-medium cursor-pointer"
                      title="ШІ-Генератор: побудувати новий навчальний курс (Gemini 2.5 API)"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>✨ Згенерувати курс (ШІ)</span>
                    </button>

                    <button
                      type="button"
                      onClick={onOpenImportModal}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors flex items-center gap-2 font-medium cursor-pointer"
                      title="Імпортувати навчальний курс з Excel (.xlsx) або Google Sheets"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Імпорт з Excel (.xlsx)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadCourseExport(selectedStudioCourse)}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-colors flex items-center gap-2 font-medium cursor-pointer"
                      title="Експортувати курс у 5-вкладковий Excel (.xlsx)"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Експорт курсу (.xlsx)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadCourseTemplate()}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center gap-2 font-medium cursor-pointer"
                      title="Завантажити еталонний шаблон курсу (.xlsx)"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Шаблон Excel (.xlsx)</span>
                    </button>
                  </div>
                </div>
              </DrawerSection>

              <DrawerSection title="Живий перегляд" icon={ExternalLink} defaultOpen={false}>
                <div className="flex flex-col gap-1.5 pt-1 text-xs">
                  <a
                    href={`${getAppBaseUrl('study')}/learn/${selectedStudioCourse.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white transition-colors flex items-center justify-between group cursor-pointer"
                    title="Відкрити конспекти уроків у Підручнику"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate">Підручник (Теорія)</span>
                        <span className="text-[10px] font-mono text-slate-500 truncate">/learn/{selectedStudioCourse.slug}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 shrink-0" />
                  </a>

                  <a
                    href={`${getAppBaseUrl('student')}/practice/${selectedStudioCourse.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-950/60 hover:bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white transition-colors flex items-center justify-between group cursor-pointer"
                    title="Спробувати інтерактивні завдання у Тренажері"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <Code className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold truncate">Тренажер (BKT)</span>
                        <span className="text-[10px] font-mono text-slate-500 truncate">/practice/{selectedStudioCourse.slug}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 shrink-0" />
                  </a>
                </div>
              </DrawerSection>
            </>
          );
        })()}

      {/* Drawer: Course Create Mode */}
      {((activeTab === 'courses' && courseViewMode === 'CREATE') ||
        (activeTab === 'create_course' && (!selectedStudioCourse || courseViewMode === 'CREATE'))) && (
        <>
          <DrawerSection title="Дидактичні шаблони" icon={Sparkles} badge={`${COURSE_PRESETS.length}`} defaultOpen={true}>
            <div className="flex flex-col divide-y divide-slate-800/50 pt-1">
              {COURSE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('admin-course-apply-preset', { detail: preset }));
                  }}
                  className="w-full py-2.5 px-2 text-left transition-colors cursor-pointer flex flex-col gap-1 group rounded-md hover:bg-slate-800/60"
                  title={`Заповнити форму шаблоном: ${preset.presetTitle}`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2 min-w-0">
                      <preset.icon
                        className={`w-3.5 h-3.5 shrink-0 ${
                          preset.color === 'emerald'
                            ? 'text-emerald-400'
                            : preset.color === 'amber'
                            ? 'text-amber-400'
                            : preset.color === 'purple'
                            ? 'text-purple-400'
                            : 'text-indigo-400'
                        }`}
                      />
                      <span className="text-xs font-medium text-slate-200 group-hover:text-white truncate">
                        {preset.presetTitle}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">{preset.badge}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1 pl-5.5">{preset.description}</p>
                </button>
              ))}
            </div>
          </DrawerSection>

          <DrawerSection title="Маршрут автора курсу" icon={Layers} defaultOpen={false}>
            <div className="flex flex-col gap-1.5 pt-1 text-xs">
              <div className="p-2 rounded-lg bg-emerald-500/10 border-l-2 border-emerald-400 flex items-start gap-2.5">
                <span className="font-mono text-[10px] font-bold text-emerald-400 px-1 py-0.5 rounded bg-emerald-500/20 shrink-0 mt-0.5">
                  1
                </span>
                <div className="flex flex-col min-w-0 w-full">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-emerald-300">Базові метадані</span>
                    <span className="text-[10px] font-mono text-emerald-400">Поточний крок</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Назва, слаг, категорія та BKT-поріг</span>
                </div>
              </div>

              {[
                { num: 2, title: 'Модульна структура', sub: 'Тематичні розділи курсу' },
                { num: 3, title: 'Граф компетенцій (Skill DAG)', sub: 'Навички та пререквізити BKT' },
                { num: 4, title: 'Конспекти & Підручник', sub: '5-блочний Zen Focus конспект' },
                { num: 5, title: 'Банк адаптивних завдань', sub: 'Завдання з оцінкою P(T), P(G), P(S)' },
              ].map((st) => (
                <div
                  key={st.num}
                  className="w-full p-2 text-left rounded-lg transition-colors flex items-start gap-2.5 opacity-40 bg-slate-900/30 text-slate-500 select-none cursor-not-allowed"
                  title={`Крок ${st.num} заблоковано. Завершіть базові метадані курсу, щоб перейти до цього етапу.`}
                >
                  <span className="font-mono text-[10px] font-bold text-slate-600 px-1 py-0.5 rounded bg-slate-950 shrink-0 mt-0.5">
                    🔒
                  </span>
                  <div className="flex flex-col min-w-0 w-full">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-medium text-slate-400 truncate">
                        {st.num}. {st.title}
                      </span>
                      <span className="text-[9px] font-mono text-slate-600 shrink-0">🔒 Заблоковано</span>
                    </div>
                    <span className="text-[10px] text-slate-600 truncate">{st.sub}</span>
                  </div>
                </div>
              ))}
            </div>
          </DrawerSection>
        </>
      )}

      {/* Drawer: Courses List Mode */}
      {activeTab === 'courses' && courseViewMode === 'LIST' && (
        <>
          <DrawerSection title="Курси платформи" icon={BookOpen} badge={`${dynamicCourses.length}`} defaultOpen={true}>
            <div className="flex flex-col divide-y divide-slate-800/50 pt-1">
              {dynamicCourses.length === 0 ? (
                <div className="p-3 text-[11px] text-slate-500 italic text-center">Завантаження курсів...</div>
              ) : (
                dynamicCourses.map((c) => {
                  const isSelected = selectedCourseSlug === c.slug;
                  const modsCount = c.modules?.length || 0;
                  const isPublished = c.isPublished !== false;

                  return (
                    <div
                      key={c.id || c.slug}
                      className={`w-full py-1.5 px-2 text-left text-xs transition-colors flex items-center justify-between group rounded-md ${
                        isSelected
                          ? 'bg-emerald-500/15 text-emerald-300 font-semibold border-l-2 border-emerald-400 pl-2'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => onSelectCourseSlug(isSelected ? null : c.slug)}
                        className="flex items-center gap-2 min-w-0 pr-1 flex-1 text-left cursor-pointer"
                        title={isSelected ? `Скинути фільтр курсу: ${c.title}` : `Фільтрувати за курсом: ${c.title}`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${isPublished ? 'bg-emerald-400' : 'bg-amber-400'}`}
                          title={isPublished ? 'Опубліковано' : 'Чернетка'}
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="truncate font-medium text-slate-200 group-hover:text-white">{c.title}</span>
                          <span className="text-[10px] font-mono text-slate-500 truncate">
                            /{c.slug} • {modsCount} {modsCount === 1 ? 'модуль' : modsCount < 5 ? 'модулі' : 'модулів'}
                          </span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenStudio(c)}
                        className="shrink-0 px-2 py-0.5 rounded text-[10px] font-mono font-medium text-slate-400 hover:text-emerald-300 hover:bg-slate-700/60 transition-colors cursor-pointer border border-transparent hover:border-slate-700"
                        title="Відкрити Студію курсу"
                      >
                        Студія →
                      </button>
                    </div>
                  );
                })
              )}

              {selectedCourseSlug && (
                <div className="pt-2 px-1">
                  <button
                    type="button"
                    onClick={() => onSelectCourseSlug(null)}
                    className="w-full py-1 text-[11px] text-center text-slate-400 hover:text-white hover:bg-slate-800/60 rounded transition-colors cursor-pointer font-mono"
                  >
                    ✕ Скинути вибір курсу (показати всі)
                  </button>
                </div>
              )}
            </div>
          </DrawerSection>

          <DrawerSection title="Предметні категорії" icon={Folder} badge={String(categories.length || 4)} defaultOpen={false}>
            <div className="flex flex-col divide-y divide-slate-800/50 pt-1">
              <button
                type="button"
                onClick={() => {
                  onSelectCategorySlug(null);
                  onSelectCourseSlug(null);
                }}
                className={`w-full py-1.5 pr-2 text-left text-xs transition-colors cursor-pointer flex items-center justify-between rounded-r ${
                  selectedCategorySlug === null
                    ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400 pl-2'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/40 pl-2.5'
                }`}
              >
                <span className="truncate">Всі напрями</span>
                <span className="text-[10px] font-mono opacity-70 shrink-0">{dynamicCourses.length || 4} курсів</span>
              </button>

              {(categories.length > 0
                ? categories
                : [
                    { id: '1', slug: 'prog-it', title: 'Програмування & IT', icon: 'Code', coursesCount: 2 },
                    { id: '2', slug: 'languages', title: 'Іноземні Мови', icon: 'Languages', coursesCount: 1 },
                    { id: '3', slug: 'law-social', title: 'Право & Суспільствознавство', icon: 'Scale', coursesCount: 1 },
                    { id: '4', slug: 'exact-sciences', title: 'Точні Науки & Математика', icon: 'Binary', coursesCount: 0 },
                  ]
              ).map((cat: any) => {
                const isSelected = selectedCategorySlug === cat.slug;
                return (
                  <button
                    key={cat.id || cat.slug}
                    type="button"
                    onClick={() => {
                      onSelectCategorySlug(isSelected ? null : cat.slug);
                      onSelectCourseSlug(null);
                    }}
                    className={`w-full py-2 pr-2 text-left text-xs transition-colors cursor-pointer flex items-center justify-between group rounded-r ${
                      isSelected
                        ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400 pl-2'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40 pl-2.5'
                    }`}
                    title={cat.title}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <span className="shrink-0">
                        {cat.icon === 'Code' ? (
                          <Code className="w-3.5 h-3.5 text-emerald-400" />
                        ) : cat.icon === 'Languages' ? (
                          <Languages className="w-3.5 h-3.5 text-indigo-400" />
                        ) : cat.icon === 'Scale' ? (
                          <Scale className="w-3.5 h-3.5 text-purple-400" />
                        ) : cat.icon === 'Binary' ? (
                          <Binary className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Folder className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </span>
                      <span className={`truncate ${isSelected ? 'font-semibold text-emerald-300' : 'font-medium group-hover:text-slate-200'}`}>
                        {cat.title}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono opacity-80 shrink-0 text-slate-500">{cat.coursesCount ?? 0}</span>
                  </button>
                );
              })}
            </div>
          </DrawerSection>

          <DrawerSection title="Статус публікації" icon={ShieldCheck} defaultOpen={false}>
            <div className="flex flex-col gap-1 pt-1 text-xs">
              <button
                type="button"
                onClick={() => onSetCourseStatusFilter('ALL')}
                className={`w-full py-1.5 px-2.5 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between ${
                  courseStatusFilter === 'ALL'
                    ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <span>Всі курси</span>
                <span className="text-[10px] font-mono text-slate-500">{dynamicCourses.length}</span>
              </button>
              <button
                type="button"
                onClick={() => onSetCourseStatusFilter('PUBLISHED')}
                className={`w-full py-1.5 px-2.5 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between ${
                  courseStatusFilter === 'PUBLISHED'
                    ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Опубліковані</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  {dynamicCourses.filter((c) => c.isPublished !== false).length}
                </span>
              </button>
              <button
                type="button"
                onClick={() => onSetCourseStatusFilter('DRAFT')}
                className={`w-full py-1.5 px-2.5 rounded-lg text-left transition-colors cursor-pointer flex items-center justify-between ${
                  courseStatusFilter === 'DRAFT'
                    ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Чернетки</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400">
                  {dynamicCourses.filter((c) => c.isPublished === false).length}
                </span>
              </button>
            </div>
          </DrawerSection>

          <DrawerSection title="Банк завдань" icon={Layers} defaultOpen={false}>
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
          <DrawerSection title="Google OAuth & Доступ" icon={ShieldCheck} defaultOpen={true}>
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

          <DrawerSection title="Дидактичні Режими" icon={BookOpen} defaultOpen={false}>
            <div className="flex flex-col gap-1.5 text-[11px] text-slate-400 pt-1">
              <div className="flex flex-col gap-0.5 py-1 border-b border-slate-800/60">
                <span className="text-indigo-300 font-semibold">FULL_CYCLE</span>
                <span>Повний цикл: конспект у підручнику + тренажер з BKT.</span>
              </div>
              <div className="flex flex-col gap-0.5 py-1 border-b border-slate-800/60">
                <span className="text-amber-300 font-semibold">TESTING_ONLY</span>
                <span>Експрес-діагностика без обов&apos;язкової теорії.</span>
              </div>
              <div className="flex flex-col gap-0.5 py-1">
                <span className="text-purple-300 font-semibold">MODULAR</span>
                <span>Вибірковий доступ до обраних модулів.</span>
              </div>
            </div>
          </DrawerSection>
        </>
      )}

      {/* Drawer: Datasets & Audit Sidebar */}
      {activeTab === 'datasets' && (
        <>
          <DrawerSection title="Швидкий Експорт ШІ" icon={Download} defaultOpen={false}>
            <div className="flex flex-col gap-2 pt-1">
              <a
                href={`${apiUrl}/api/v1/bkt/activity-logs/export?format=jsonl`}
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
                href={`${apiUrl}/api/v1/bkt/activity-logs/export?format=csv`}
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

          <DrawerSection title="Фільтрація Подій" icon={Filter} defaultOpen={true}>
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
                      onClick={() => onSetDatasetFilter(item.key as DatasetFilterType)}
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
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Користувач</span>
                  {datasetUserFilter && (
                    <button
                      type="button"
                      onClick={() => onSetDatasetUserFilter('')}
                      className="text-[10px] text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      Скинути
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Пошук за ім'ям чи email..."
                    value={datasetUserFilter}
                    onChange={(e) => onSetDatasetUserFilter(e.target.value)}
                    className="w-full pl-2.5 pr-6 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                  {datasetUserFilter && (
                    <button
                      type="button"
                      onClick={() => onSetDatasetUserFilter('')}
                      className="absolute right-2 top-1 text-slate-500 hover:text-white text-xs cursor-pointer"
                      title="Очистити фільтр"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {datasetActiveUsers.length > 0 && (
                  <div className="flex flex-col divide-y divide-slate-800/50 mt-1 max-h-48 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => onSetDatasetUserFilter('')}
                      className={`w-full py-1.5 px-2 text-left text-xs transition-colors cursor-pointer flex items-center justify-between rounded ${
                        !datasetUserFilter
                          ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400 pl-1.5'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                      }`}
                    >
                      <span className="truncate">Всі користувачі</span>
                      <span className="text-[10px] font-mono opacity-70">{datasetStats.total}</span>
                    </button>
                    {datasetActiveUsers.slice(0, 8).map((u) => {
                      const isSelected = datasetUserFilter === u.userId || datasetUserFilter === u.name;
                      return (
                        <button
                          key={u.userId}
                          type="button"
                          onClick={() => onSetDatasetUserFilter(isSelected ? '' : u.userId)}
                          className={`w-full py-1.5 px-2 text-left text-xs transition-colors cursor-pointer flex items-center justify-between group rounded ${
                            isSelected
                              ? 'bg-emerald-500/10 text-emerald-300 font-semibold border-l-2 border-emerald-400 pl-1.5'
                              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                          }`}
                          title={u.email || u.userId}
                        >
                          <div className="flex items-center gap-1.5 min-w-0 pr-1">
                            <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-300 shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate">{u.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 shrink-0">{u.count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </DrawerSection>

          <DrawerSection title="Метрики Аудиту" icon={Sparkles} badge={datasetStats.total} defaultOpen={false}>
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
          <DrawerSection title="Регламент перевірки" icon={Activity} defaultOpen={true}>
            <div className="flex flex-col gap-2 pt-1 text-xs text-slate-400">
              <p className="text-[11px] leading-relaxed text-slate-400">
                Автономна верифікація математичної коректності BKT: перевірка чисельників, знаменників та
                апостеріорних ймовірностей $P(L_t)$ за формулами Баєса з точністю до $10^{-6}$.
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

          <DrawerSection title="Ключові формули BKT" icon={Sparkles} defaultOpen={false}>
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

      {/* Drawer: System Sidebar */}
      {activeTab === 'system' && (
        <>
          <div className="pb-3">
            <ThemeSettingsSection />
          </div>

          <div className="pt-3">
            <DrawerSection title="Web3 SBT Релейєр" icon={ShieldCheck} defaultOpen={false}>
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
          </div>
        </>
      )}
    </div>
  );
};
