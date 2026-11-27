'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  Compass,
  HelpCircle,
  History,
  Lock,
  MessageSquare,
  Network,
  RefreshCw,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Unlock,
} from 'lucide-react';
import { DrawerSection, ThemeSettingsSection, type SkillGraphNode } from '@sbc/ui';
import { resolveStudyUrl } from '@sbc/routes';
import type {
  PracticeIntegrityMode,
  TaskDto,
  TaskSequencerResultDto,
} from '@sbc/types';
import { SkillDagMap } from '@/features/skill-graph/ui/SkillDagMap';

export type StudentTab = 'task' | 'bkt' | 'tree' | 'settings';

export interface PracticeSidebarDrawerProps {
  activeTab: StudentTab;
  task: TaskDto | null;
  activeCourseSlug: string;
  taskDrawerSubTab: 'condition' | 'history';
  onSetTaskDrawerSubTab: (subTab: 'condition' | 'history') => void;
  effectiveSkillMode: PracticeIntegrityMode;
  isPolicyLocked: boolean;
  isSwitchingMode: boolean;
  policyClassroomName: string | null;
  strictModeUntil: string | null;
  isPostMasteryReview: boolean;
  gradedMastery: number | null;
  modeSwitchNotice: string | null;
  onRequestModeSwitch: (mode: PracticeIntegrityMode) => void;
  activeSkillMasteryPct: number;
  recommendation: TaskSequencerResultDto | null;
  isTheoryUnlocked: boolean;
  onOpenTheoryDrawer: (trigger: string) => void;
  onRequestFullLesson: (url: string) => void;
  revealedHintLevel: number;
  onRevealHint: (level: number, penaltyPct: number) => void;
  isSocraticHintsOpen: boolean;
  onToggleSocraticHints: (open: boolean) => void;
  hasFailedAttemptOnCurrentTask: boolean;
  taskSubmissions: any[];
  onRefreshTask: () => void;
  onRefreshSubmissions: (taskId: string) => void;
  graphNodes: SkillGraphNode[];
  inspectedSkill: SkillGraphNode | null;
  onSelectTab: (tab: StudentTab) => void;
  onStartInspectedSkillTask: () => void;
}

/**
 * Бічна панель тренажера студента (умова/режим, історія спроб, BKT DAG, інспектор вузла, налаштування).
 */
export const PracticeSidebarDrawer: React.FC<PracticeSidebarDrawerProps> = ({
  activeTab,
  task,
  taskDrawerSubTab,
  onSetTaskDrawerSubTab,
  effectiveSkillMode,
  isPolicyLocked,
  isSwitchingMode,
  policyClassroomName,
  strictModeUntil,
  isPostMasteryReview,
  gradedMastery,
  modeSwitchNotice,
  onRequestModeSwitch,
  activeSkillMasteryPct,
  recommendation,
  isTheoryUnlocked,
  onOpenTheoryDrawer,
  onRequestFullLesson,
  revealedHintLevel,
  onRevealHint,
  isSocraticHintsOpen,
  onToggleSocraticHints,
  hasFailedAttemptOnCurrentTask,
  taskSubmissions,
  onRefreshTask,
  onRefreshSubmissions,
  graphNodes,
  inspectedSkill,
  onSelectTab,
  onStartInspectedSkillTask,
}) => {
  const [isDegradationTooltipOpen, setIsDegradationTooltipOpen] = useState(false);

  if (activeTab === 'task') {
    if (!task) return null;
    return (
      <div className="flex flex-col gap-3 flex-1">
        {/* Sub-tab navigation: Condition vs History */}
        <div className="bg-slate-950/60 p-0.5 rounded-lg flex items-center gap-0.5 border border-slate-800/60">
          <button
            type="button"
            onClick={() => onSetTaskDrawerSubTab('condition')}
            className={`flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none ${
              taskDrawerSubTab === 'condition'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Умова</span>
          </button>
          <button
            type="button"
            onClick={() => onSetTaskDrawerSubTab('history')}
            className={`flex-1 py-1.5 px-2.5 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer relative select-none ${
              taskDrawerSubTab === 'history'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Історія спроб</span>
            {taskSubmissions.length > 0 && (
              <span
                className={`text-[10px] font-mono ${
                  taskSubmissions.some((s) => s.teacherComment)
                    ? 'text-amber-300 font-bold'
                    : 'text-slate-400'
                }`}
              >
                ({taskSubmissions.length})
              </span>
            )}
          </button>
        </div>

        {taskDrawerSubTab === 'condition' ? (
          <div className="flex flex-col gap-3 flex-1">
            {/* Section 1: Режим проходження навички (TRAINING vs GRADED) */}
            <DrawerSection
              title="Режим проходження"
              icon={ShieldCheck}
              iconColor={effectiveSkillMode === 'GRADED' ? 'text-amber-400' : 'text-blue-400'}
              titleColor={
                effectiveSkillMode === 'GRADED'
                  ? 'text-amber-400 group-hover:text-amber-300'
                  : 'text-blue-400 group-hover:text-blue-300'
              }
              badge={effectiveSkillMode === 'GRADED' ? 'На оцінку' : 'Тренування'}
              defaultOpen={true}
            >
              <div className="py-1 flex flex-col gap-1.5">
                <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-slate-950/60 border border-slate-800/70">
                  <button
                    type="button"
                    disabled={isPolicyLocked || isSwitchingMode}
                    data-testid="mode-btn-training"
                    onClick={() => onRequestModeSwitch('TRAINING')}
                    className={`py-1.5 px-2 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      effectiveSkillMode === 'TRAINING'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : isPolicyLocked
                        ? 'text-slate-600 cursor-not-allowed'
                        : 'text-slate-400 hover:text-slate-200 cursor-pointer'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Тренування</span>
                  </button>
                  <button
                    type="button"
                    disabled={isPolicyLocked || isSwitchingMode}
                    data-testid="mode-btn-graded"
                    onClick={() => onRequestModeSwitch('GRADED')}
                    className={`py-1.5 px-2 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      effectiveSkillMode === 'GRADED'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : isPolicyLocked
                        ? 'text-slate-600 cursor-not-allowed'
                        : 'text-slate-400 hover:text-slate-200 cursor-pointer'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>На оцінку</span>
                  </button>
                </div>

                {isPolicyLocked && (
                  <div
                    data-testid="policy-locked-banner"
                    className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5"
                  >
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Зафіксовано викладачем
                      {policyClassroomName ? ` (${policyClassroomName})` : ''}
                      {strictModeUntil
                        ? ` до ${new Date(strictModeUntil).toLocaleTimeString('uk-UA', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}`
                        : ''}
                    </span>
                  </div>
                )}

                {isPostMasteryReview && (
                  <div
                    data-testid="post-mastery-review-badge"
                    className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      Оцінку збережено ({Math.round((gradedMastery || 0) * 100)}%) — режим повторення
                    </span>
                  </div>
                )}

                <p className="text-[11px] text-slate-400 leading-snug">
                  {effectiveSkillMode === 'GRADED'
                    ? 'Підручник заблоковано. Вихід чи зміна режиму скидає прогрес навички.'
                    : 'Підручник відкрито вільно без скидання прогресу.'}
                </p>

                {modeSwitchNotice && (
                  <div className="text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2.5 py-1.5 animate-fadeIn">
                    {modeSwitchNotice}
                  </div>
                )}
              </div>
            </DrawerSection>

            {/* Section 2: Активна навичка та поточний BKT стан */}
            <DrawerSection
              title="Поточна навичка та BKT стан"
              icon={Brain}
              iconColor="text-indigo-400"
              titleColor="text-indigo-400 group-hover:text-indigo-300"
              badge={`${Math.round(activeSkillMasteryPct)}%`}
              defaultOpen={false}
              className="border-t border-slate-800/80 pt-2.5"
            >
              <div className="flex flex-col gap-2 py-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-400">
                    {task.skill?.title || 'Навичка'}
                  </span>
                  <div className="flex items-center gap-2">
                    {recommendation?.isDifficultyDegraded && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsDegradationTooltipOpen((prev) => !prev)}
                          className="p-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 flex items-center justify-center transition-colors cursor-pointer group"
                          title="Адаптивне допоміжне завдання (натисніть для деталей)"
                          aria-label="Пояснення допоміжного рівня"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-400 group-hover:text-amber-300" />
                        </button>

                        {isDegradationTooltipOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setIsDegradationTooltipOpen(false)}
                            />
                            <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 animate-fadeIn">
                              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-slate-800 text-amber-300 font-bold text-xs">
                                <div className="flex items-center gap-1.5">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Допоміжне завдання</span>
                                </div>
                                <span className="text-[10px] text-amber-400 font-mono">
                                  Ліміт: {recommendation?.maxScoreCap ?? 70}%
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-300 leading-relaxed">
                                Складність знижена в адаптивному режимі, оскільки попередня спроба викликала труднощі.
                              </p>
                              <p className="text-[10px] text-amber-400/90 mt-2 font-medium">
                                Після засвоння поверніться до оригінального завдання для 100% майстерності.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      P(L):{' '}
                      <span className={activeSkillMasteryPct >= 90 ? 'text-emerald-400' : 'text-indigo-400'}>
                        {activeSkillMasteryPct.toFixed(1)}%
                      </span>
                    </span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      activeSkillMasteryPct >= 90 ? 'bg-emerald-400' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, activeSkillMasteryPct)}%` }}
                  />
                </div>
              </div>
            </DrawerSection>

            {/* Section 3: Навчальний модуль у разі труднощів */}
            <DrawerSection
              title="Матеріал для повторення"
              icon={BookOpen}
              iconColor="text-blue-400"
              titleColor="text-blue-400 group-hover:text-blue-300"
              defaultOpen={false}
              className="border-t border-slate-800/80 pt-2.5"
            >
              <div className="py-1.5 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-200">
                      Експрес-теорія (Just-in-Time)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {isTheoryUnlocked
                        ? 'Стисла довідка прямо в тренажері'
                        : 'Потрібна підказка Сократа 2+'}
                    </span>
                  </div>
                  <button
                    type="button"
                    disabled={!isTheoryUnlocked}
                    onClick={() => {
                      if (isTheoryUnlocked) {
                        onOpenTheoryDrawer('sidebar_button');
                      }
                    }}
                    data-testid="drawer-jit-theory-btn"
                    className={`px-2.5 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1 transition-colors shrink-0 ${
                      isTheoryUnlocked
                        ? 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer'
                        : 'bg-slate-800/60 text-slate-500 cursor-not-allowed border border-slate-700/40'
                    }`}
                    title={
                      isTheoryUnlocked
                        ? 'Читати теоретичну капсулу'
                        : "Заблоковано: активуйте підказку Сократа 2+ або зробіть спробу розв'язання"
                    }
                  >
                    {isTheoryUnlocked ? (
                      <>
                        <span>Читати</span>
                        <ArrowRight className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>Заблоковано</span>
                      </>
                    )}
                  </button>
                </div>
                {task.studyUnitUrl && (
                  <div className="pt-2 border-t border-slate-800/50 flex items-center justify-between gap-2 text-[11px]">
                    <span className="text-slate-400">Повний інтерактивний підручник</span>
                    <button
                      type="button"
                      data-testid="sidebar-open-full-lesson-btn"
                      onClick={() => onRequestFullLesson(resolveStudyUrl(task.studyUnitUrl!))}
                      className="text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Zen-урок</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </DrawerSection>

            {/* Section 4: Сократівські підказки */}
            <DrawerSection
              title="Сократівські підказки"
              icon={HelpCircle}
              iconColor={task.socraticHints && task.socraticHints.length > 0 ? 'text-amber-400' : 'text-slate-500'}
              titleColor={
                task.socraticHints && task.socraticHints.length > 0
                  ? 'text-amber-400 group-hover:text-amber-300'
                  : 'text-slate-500'
              }
              badge={
                task.socraticHints && task.socraticHints.length > 0
                  ? revealedHintLevel > 0
                    ? `-${task.socraticHints[revealedHintLevel - 1]?.penaltyPct ?? 0}%`
                    : `${task.socraticHints.length}`
                  : '0'
              }
              isOpen={
                isSocraticHintsOpen ||
                Boolean(
                  task.socraticHints &&
                    task.socraticHints.length > 0 &&
                    (hasFailedAttemptOnCurrentTask || revealedHintLevel > 0)
                )
              }
              onToggle={onToggleSocraticHints}
              className="border-t border-slate-800/80 pt-2.5"
            >
              {task.socraticHints && task.socraticHints.length > 0 ? (
                <div className="flex flex-col divide-y divide-slate-800/50">
                  {task.socraticHints.map((hintObj, idx) => {
                    const isRevealed = revealedHintLevel >= hintObj.level;
                    const canUnlock = revealedHintLevel === idx;

                    if (!isRevealed && !canUnlock) return null;

                    return (
                      <div key={idx} className="py-2 text-xs">
                        {isRevealed ? (
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between font-bold text-[11px] text-amber-300">
                              <span className="flex items-center gap-1.5">
                                <HelpCircle className="w-3 h-3 shrink-0" />
                                <span>Підказка {hintObj.level}:</span>
                                {hintObj.level >= 2 && (
                                  <span className="text-[10px] font-normal text-emerald-400 flex items-center gap-0.5">
                                    <Unlock className="w-2.5 h-2.5" />
                                    <span>Теорію розблоковано</span>
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] font-mono text-amber-400/80">
                                -{hintObj.penaltyPct}% балу
                              </span>
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-200">{hintObj.hint}</p>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onRevealHint(hintObj.level, hintObj.penaltyPct)}
                            className="w-full py-1.5 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-medium text-xs flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Розкрити підказку {hintObj.level}</span>
                              {hintObj.level === 2 && !isTheoryUnlocked && (
                                <span className="text-[10px] text-blue-300 font-normal flex items-center gap-0.5">
                                  <Unlock className="w-2.5 h-2.5" />
                                  <span>розблокує теорію</span>
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] font-mono text-amber-400">
                              (-{hintObj.penaltyPct}%)
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-2 flex items-center gap-2 text-slate-500 text-xs">
                  <HelpCircle className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  <span>Підказки Сократа не закладені для цієї вправи.</span>
                </div>
              )}
            </DrawerSection>

            {/* Section 5: Відкриті Тест-Кейси */}
            {task.taskType === 'CODE' && (task.testCases?.length ?? 0) > 0 && (
              <DrawerSection
                title="Відкриті Тест-Кейси"
                icon={Target}
                iconColor="text-emerald-400"
                titleColor="text-emerald-400 group-hover:text-emerald-300"
                badge={task.testCases?.length || 0}
                defaultOpen={false}
                className="border-t border-slate-800/80 pt-2.5"
              >
                <div className="flex flex-col divide-y divide-slate-800/50">
                  {(task.testCases || []).map((tc, idx) => (
                    <div key={idx} className="py-2 text-xs font-mono flex flex-col gap-0.5">
                      {tc.input && (
                        <span className="text-slate-400 text-[11px]">
                          {tc.input.startsWith('"') &&
                          !tc.input.startsWith('"eval:') &&
                          !tc.input.startsWith('[') ? (
                            <>
                              Перевірка змінної:{' '}
                              <code className="text-indigo-300">{tc.input.replace(/"/g, '')}</code>
                            </>
                          ) : tc.input.includes('eval:') ? (
                            <>
                              Обчислення виразу:{' '}
                              <code className="text-indigo-300">
                                {tc.input.replace('eval:', '').replace(/"/g, '')}
                              </code>
                            </>
                          ) : (
                            <>
                              Вхідні дані: <code className="text-indigo-300">{tc.input}</code>
                            </>
                          )}
                        </span>
                      )}
                      <span className="text-slate-400 text-[11px]">
                        Очікуваний вивід: <code className="text-emerald-300">{tc.expectedOutput}</code>
                      </span>
                    </div>
                  ))}
                </div>
              </DrawerSection>
            )}

            {/* Section 6: Параметри тестування */}
            <DrawerSection
              title="Параметри тестування"
              icon={SlidersHorizontal}
              iconColor="text-cyan-400"
              titleColor="text-cyan-400 group-hover:text-cyan-300"
              badge={task.difficulty || 'EASY'}
              defaultOpen={false}
              className="border-t border-slate-800/80 pt-2.5"
            >
              <div className="flex flex-col gap-2 py-1 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Формат тесту:</span>
                  <span className="font-mono font-medium text-slate-200">
                    {task.taskType === 'SINGLE_CHOICE'
                      ? 'Тест · 1 варіант'
                      : task.taskType === 'MULTIPLE_CHOICE'
                      ? 'Тест · Мульти-вибір'
                      : task.taskType === 'TEXT_ESSAY'
                      ? 'Розгорнуте есе'
                      : 'Кодинг · Sandbox'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>Складність:</span>
                  <span
                    className={`text-[11px] font-mono font-semibold uppercase ${
                      task.difficulty === 'HARD'
                        ? 'text-rose-400'
                        : task.difficulty === 'MEDIUM'
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {task.difficulty || 'EASY'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>Макс. бал:</span>
                  <span className="font-mono font-medium text-indigo-300">
                    {recommendation?.isDifficultyDegraded
                      ? `${recommendation?.maxScoreCap ?? 70}% (Адаптивний)`
                      : '100%'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-400">
                  <span>Телеметрія:</span>
                  <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {task.taskType === 'CODE' || task.taskType === 'TEXT_ESSAY'
                      ? 'WPM + Паузи + Paste'
                      : 'Латентність реакції'}
                  </span>
                </div>

                {task.topic && (
                  <div className="flex items-center justify-between text-slate-400 pt-1.5 border-t border-slate-800/60">
                    <span>Топік:</span>
                    <span
                      className="font-mono text-[11px] text-slate-300 truncate max-w-[140px]"
                      title={task.topic}
                    >
                      {task.topic}
                    </span>
                  </div>
                )}
              </div>
            </DrawerSection>

            {/* Section 7: Рекомендація BKT Engine */}
            {recommendation && (
              <DrawerSection
                title="Рекомендація BKT Engine"
                icon={Sparkles}
                iconColor="text-purple-400"
                titleColor="text-purple-400 group-hover:text-purple-300"
                defaultOpen={false}
                className="border-t border-slate-800/80 pt-2.5"
              >
                <div className="py-1 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-300 leading-relaxed">
                    <span className="font-semibold text-indigo-300">Логіка підбору: </span>
                    {recommendation.reason || 'Завдання обрано відповідно до вашого рівня засвоєння.'}
                  </div>
                </div>
              </DrawerSection>
            )}

            {/* Action Button */}
            <button
              onClick={onRefreshTask}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-colors cursor-pointer mt-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Оновити рекомендоване завдання</span>
            </button>
          </div>
        ) : (
          /* History Sub-tab */
          <div className="flex flex-col gap-3 flex-1">
            <DrawerSection
              title="Хронологія спроб та перевірок"
              icon={History}
              iconColor="text-purple-400"
              titleColor="text-purple-400 group-hover:text-purple-300"
              badge={taskSubmissions.length}
              defaultOpen={true}
              action={
                <button
                  type="button"
                  onClick={() => onRefreshSubmissions(task.id)}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer font-mono"
                  title="Оновити список спроб"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Оновити</span>
                </button>
              }
            >
              {taskSubmissions.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
                  <History className="w-5 h-5 text-slate-600" />
                  <span>Ви ще не надсилали спроб для цього завдання.</span>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-800/50 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                  {taskSubmissions.map((sub, idx) => {
                    const isLatest = idx === 0;
                    const isAnnulled = sub.teacherReviewStatus === 'ANNULLED' || sub.status === 'ANNULLED';
                    const isApproved =
                      !isAnnulled && (sub.teacherReviewStatus === 'APPROVED' || sub.status === 'ACCEPTED');
                    const isPending = !isAnnulled && sub.teacherReviewStatus === 'PENDING_REVIEW';
                    const isSuperseded = !isAnnulled && sub.teacherReviewStatus === 'SUPERSEDED';

                    return (
                      <div key={sub.id} className="py-2.5 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-white">
                              Спроба #{sub.attemptNumber || taskSubmissions.length - idx}
                            </span>
                            {isLatest && (
                              <span className="text-[10px] font-mono text-indigo-400">(остання)</span>
                            )}
                          </div>
                          <span
                            className={`text-[10px] font-mono font-bold ${
                              isAnnulled
                                ? 'text-rose-400 bg-rose-950/40 px-1 rounded'
                                : isApproved
                                ? 'text-emerald-400'
                                : isPending
                                ? 'text-amber-400'
                                : isSuperseded
                                ? 'text-slate-500'
                                : 'text-rose-400'
                            }`}
                          >
                            {isAnnulled
                              ? '⚠️ Анульовано'
                              : isApproved
                              ? '✓ Зараховано'
                              : isPending
                              ? '⏳ В черзі'
                              : isSuperseded
                              ? 'Замінено'
                              : '✕ Відхилено'}
                          </span>
                        </div>

                        <div className="text-[10px] text-slate-500 font-mono">
                          {new Date(sub.createdAt).toLocaleString()}
                        </div>

                        {isAnnulled && (
                          <div className="p-2 rounded-lg bg-rose-950/30 border border-rose-800/40 flex items-start gap-1.5 my-0.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                            <div className="flex flex-col text-[11px] text-rose-200">
                              <span className="font-semibold text-rose-300">
                                Спробу анульовано викладачем
                              </span>
                              {sub.teacherComment && (
                                <p className="italic text-rose-300/90 text-[10px] mt-0.5">
                                  &quot;{sub.teacherComment}&quot;
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {!isAnnulled && sub.teacherComment && (
                          <div className="pl-2.5 border-l-2 border-purple-500/50 flex flex-col gap-0.5 my-1">
                            <span className="text-purple-300 font-semibold text-[10px]">
                              Коментар викладача:
                            </span>
                            <p className="text-xs text-purple-100 italic leading-relaxed">
                              &quot;{sub.teacherComment}&quot;
                            </p>
                          </div>
                        )}

                        {sub.code && (
                          <details className="text-[11px] text-slate-400">
                            <summary className="cursor-pointer hover:text-slate-200 select-none">
                              Переглянути код відповіді
                            </summary>
                            <pre className="mt-1 p-2 bg-slate-950/80 rounded text-slate-300 font-mono text-[10px] overflow-x-auto max-h-36">
                              {sub.code}
                            </pre>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </DrawerSection>
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'bkt') {
    return (
      <div className="flex flex-col gap-3">
        <DrawerSection
          title="Граф зв'язків компетенцій"
          icon={Sparkles}
          iconColor="text-emerald-400"
          titleColor="text-emerald-400 group-hover:text-emerald-300"
          badge={graphNodes.length}
          defaultOpen={true}
        >
          <SkillDagMap nodes={graphNodes} activeSkillSlug={task?.skill?.slug} />

          <button
            type="button"
            onClick={() => onSelectTab('tree')}
            className="w-full py-2 px-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-indigo-300 hover:text-white font-medium text-xs flex items-center justify-center gap-2 border border-slate-700/60 hover:border-indigo-500/40 transition-colors cursor-pointer mt-2 select-none"
          >
            <Network className="w-3.5 h-3.5 text-indigo-400" />
            <span>Відкрити Дерево Знань на Екрані</span>
          </button>
        </DrawerSection>
      </div>
    );
  }

  if (activeTab === 'tree') {
    return (
      <div className="flex flex-col gap-3">
        {inspectedSkill ? (
          <div className="flex flex-col gap-3">
            <DrawerSection
              title="Статус модуля"
              icon={Network}
              iconColor="text-purple-400"
              titleColor="text-purple-400 group-hover:text-purple-300"
              badge={
                inspectedSkill.pMastery >= 0.95
                  ? 'Опановано'
                  : inspectedSkill.status === 'LOCKED'
                  ? 'Заблоковано'
                  : 'У процесі'
              }
              defaultOpen={true}
            >
              <div className="flex flex-col gap-1.5 py-1">
                <h3 className="text-xs font-bold text-white">{inspectedSkill.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {inspectedSkill.description || 'Ключовий модуль курсу для набуття практичних навичок.'}
                </p>
                {inspectedSkill.status === 'LOCKED' &&
                  (() => {
                    const reqVals = Object.values(inspectedSkill.parentThresholds || {});
                    const reqThr = reqVals.length > 0 ? Math.max(...reqVals) : 0.85;
                    return (
                      <div className="pl-2.5 border-l-2 border-rose-500/50 text-[11px] text-rose-300 mt-1">
                        Необхідно спершу засвоїти попередні залежні модулі до рівня P(L) ≥ {reqThr.toFixed(2)}.
                      </div>
                    );
                  })()}
              </div>
            </DrawerSection>

            <DrawerSection
              title="Майстерність BKT"
              icon={Brain}
              iconColor="text-emerald-400"
              titleColor="text-emerald-400 group-hover:text-emerald-300"
              badge={`${(inspectedSkill.pMastery * 100).toFixed(1)}%`}
              defaultOpen={false}
              className="border-t border-slate-800/80 pt-2.5"
            >
              <div className="py-1 flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Рівень P(L):</span>
                  <span
                    className={`font-mono font-bold ${
                      inspectedSkill.pMastery >= 0.9 ? 'text-emerald-400' : 'text-indigo-400'
                    }`}
                  >
                    {(inspectedSkill.pMastery * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      inspectedSkill.pMastery >= 0.9
                        ? 'bg-emerald-400'
                        : inspectedSkill.status === 'LOCKED'
                        ? 'bg-slate-700'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(100, inspectedSkill.pMastery * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0%</span>
                  <span>
                    Поріг: ≥{' '}
                    {Math.round(
                      (Object.values(inspectedSkill.parentThresholds || {}).length > 0
                        ? Math.max(...Object.values(inspectedSkill.parentThresholds || {}))
                        : 0.85) * 100
                    )}
                    %
                  </span>
                </div>
              </div>
            </DrawerSection>

            <DrawerSection
              title="Вимоги та залежності"
              icon={Compass}
              iconColor="text-indigo-400"
              titleColor="text-indigo-400 group-hover:text-indigo-300"
              defaultOpen={false}
              className="border-t border-slate-800/80 pt-2.5"
            >
              <div className="text-[11px] text-slate-300 py-1 flex items-center gap-1.5">
                {inspectedSkill.parentSkillIds.length === 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>Базовий стартовий вузол курсу.</span>
                  </>
                ) : inspectedSkill.status === 'LOCKED' ? (
                  <>
                    <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>
                      Потребує опанування попередніх навичок (P(L) ≥{' '}
                      {(Object.values(inspectedSkill.parentThresholds || {}).length > 0
                        ? Math.max(...Object.values(inspectedSkill.parentThresholds || {}))
                        : 0.85
                      ).toFixed(2)}
                      ).
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Усі пререквізити виконано! Модуль відкрито.</span>
                  </>
                )}
              </div>
            </DrawerSection>

            <button
              type="button"
              disabled={inspectedSkill.status === 'LOCKED'}
              onClick={onStartInspectedSkillTask}
              className={`w-full py-2 px-3 rounded-lg font-medium text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2 select-none ${
                inspectedSkill.status === 'LOCKED'
                  ? 'bg-slate-800/40 text-slate-500 cursor-not-allowed border border-slate-800/60'
                  : inspectedSkill.pMastery >= 0.9
                  ? 'bg-slate-800/60 hover:bg-slate-800 text-emerald-300 hover:text-white border border-slate-700/60 hover:border-emerald-500/40'
                  : 'bg-slate-800/60 hover:bg-slate-800 text-indigo-300 hover:text-white border border-slate-700/60 hover:border-indigo-500/40'
              }`}
            >
              {inspectedSkill.status === 'LOCKED' ? (
                <>
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Заблоковано</span>
                </>
              ) : (
                <span>
                  {inspectedSkill.pMastery >= 0.9 ? 'Повторити тему' : 'Розпочати вправу вузла →'}
                </span>
              )}
            </button>
          </div>
        ) : (
          <div className="text-slate-400 text-xs p-4 text-center">
            Виберіть вузол на карті або дереві знань для перегляду деталей.
          </div>
        )}
      </div>
    );
  }

  if (activeTab === 'settings') {
    return (
      <div className="flex flex-col divide-y divide-slate-800/70">
        <div className="pb-3">
          <ThemeSettingsSection />
        </div>

        <div className="pt-3">
          <DrawerSection
            title="Діагностика та середовище"
            icon={Settings}
            iconColor="text-amber-400"
            titleColor="text-amber-400 group-hover:text-amber-300"
            defaultOpen={false}
          >
            <div className="flex flex-col gap-3 text-xs text-slate-300 py-1">
              <p className="text-slate-400 text-xs leading-relaxed">
                Параметри середовища розробки та актуалізації моделі знань.
              </p>
              <button
                type="button"
                onClick={onRefreshTask}
                className="w-full py-2 px-3 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 hover:border-indigo-500/40 rounded-lg text-xs font-medium cursor-pointer transition-colors flex items-center justify-center gap-2 select-none"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Перезавантажити стан BKT</span>
              </button>
            </div>
          </DrawerSection>
        </div>
      </div>
    );
  }

  return null;
};
