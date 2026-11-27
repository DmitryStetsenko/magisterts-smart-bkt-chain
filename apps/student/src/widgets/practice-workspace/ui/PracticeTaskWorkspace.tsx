'use client';

import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  GraduationCap,
  HelpCircle,
  Lock,
  Network,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { Badge } from '@sbc/ui';
import { getAppBaseUrl } from '@sbc/routes';
import type {
  CodeTestDetailDto,
  TaskDto,
  TaskEvaluationResponseDto,
  TaskSequencerResultDto,
} from '@sbc/types';
import { MonacoCodeEditor } from '@/features/code-editor/ui/MonacoCodeEditor';
import { QuizTaskEditor } from '@/features/quiz-editor/ui/QuizTaskEditor';
import { EssayTaskEditor } from '@/features/essay-editor/ui/EssayTaskEditor';

export interface PracticeTaskWorkspaceProps {
  task: TaskDto;
  currentUserId: string;
  source?: string;
  unitSlug?: string;
  isTestingOnlyMode: boolean;
  isTheoryUnlocked: boolean;
  recommendation: TaskSequencerResultDto | null;
  annulmentAlert: {
    reason: string;
    comment?: string;
    pMasteryUpdated?: number;
  } | null;
  onDismissAnnulmentAlert: () => void;
  code: string;
  onChangeCode: (value: string) => void;
  essayAnswer: string;
  onChangeEssayAnswer: (value: string) => void;
  isSubmitting: boolean;
  evalResult: TaskEvaluationResponseDto | null;
  hasRemediationTask: boolean;
  consecutiveFailures: number;
  onEvaluate: (payload: Record<string, any>) => void;
  onNextTask: () => void;
  onOpenRemediationTask: (taskId?: string) => void;
  onOpenTheoryDrawer: (trigger: string) => void;
  onOpenSkillTree: () => void;
  onOpenSocraticHints: () => void;
}

/**
 * Основна робоча область розв'язання завдання (умова, редактор Monaco/Quiz/Essay, фідбек BKT та JIT scaffolding).
 */
export const PracticeTaskWorkspace: React.FC<PracticeTaskWorkspaceProps> = ({
  task,
  currentUserId,
  source,
  unitSlug,
  isTestingOnlyMode,
  isTheoryUnlocked,
  recommendation,
  annulmentAlert,
  onDismissAnnulmentAlert,
  code,
  onChangeCode,
  essayAnswer,
  onChangeEssayAnswer,
  isSubmitting,
  evalResult,
  hasRemediationTask,
  consecutiveFailures,
  onEvaluate,
  onNextTask,
  onOpenRemediationTask,
  onOpenTheoryDrawer,
  onOpenSkillTree,
  onOpenSocraticHints,
}) => {
  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto flex flex-col gap-4">
      <div className="w-full flex flex-col gap-4">
        {/* 🎓 Міжпортальна плашка повернення до Підручника Теорії (Cross-App Protocol) */}
        {source === 'study' && (
          <div className="w-full bg-blue-950/30 border border-blue-500/30 rounded-xl p-3.5 flex items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">
                    Шлюз перевірки компетенції з Підручника
                  </span>
                  <span className="text-[10px] font-mono text-blue-300">
                    {unitSlug || 'Теоретичний блок'}
                  </span>
                </div>
                <p className="text-xs text-blue-200/80 mt-0.5">
                  Ви перейшли для підтвердження знань. Після успішного проходження вправи BKT-секвенсор опрацює результат і розблокує подальші теми.
                </p>
              </div>
            </div>
            <a
              href={getAppBaseUrl('study')}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-blue-300 hover:text-white font-medium text-xs border border-blue-500/30 hover:border-blue-400 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>← До підручника</span>
            </a>
          </div>
        )}

        {/* ⚠️ Top Adaptive Degradation Notice Banner */}
        {recommendation?.isDifficultyDegraded && (
          <div className="w-full bg-[var(--sbc-bg-surface,#1f1f1f)] border border-amber-500/30 rounded-xl p-3.5 flex items-start sm:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold text-[var(--sbc-text-primary,#cccccc)]">
                    Рівень складності адаптовано
                  </span>
                  <span className="text-[10px] font-mono font-medium text-amber-400/90">
                    (Макс. бал: {recommendation?.maxScoreCap ?? 70}%)
                  </span>
                </div>
                <p className="text-xs text-[var(--sbc-text-muted,#909090)] mt-0.5 leading-relaxed max-w-3xl">
                  Система помітила труднощі в попередніх завданнях і тимчасово надала допоміжні питання для закріплення базових концепцій. Ви зможете повернутися до 100% балу після успішного освоєння теми.
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono text-amber-400/80">
                Тема: {task.topic || task.skill?.title || 'Навичка'}
              </span>
            </div>
          </div>
        )}

        {/* 📊 Active Task Compact Toolbar */}
        <div className="w-full pb-3 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-mono font-semibold text-indigo-400">
                {task.skill?.title || 'Навичка'}
              </span>
              {task.topic && (
                <>
                  <span className="text-slate-600">/</span>
                  <span className="font-mono text-[11px] text-slate-400">{task.topic}</span>
                </>
              )}
            </div>
            <h2 className="text-sm sm:text-base font-bold text-white">{task.title}</h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isTestingOnlyMode && (
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium"
                title="Викладач призначив режим тестування без обов'язкової теорії"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Лише тестування</span>
              </div>
            )}

            <div className="relative group">
              <button
                type="button"
                data-testid="open-jit-theory-btn"
                disabled={!isTheoryUnlocked}
                onClick={() => {
                  if (isTheoryUnlocked) {
                    onOpenTheoryDrawer('header_button');
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all select-none ${
                  isTheoryUnlocked
                    ? 'bg-blue-950/40 border border-blue-800/60 text-blue-300 hover:bg-blue-900/60 hover:text-white cursor-pointer shadow-sm shadow-blue-950/50'
                    : 'bg-slate-800/40 border border-slate-700/40 text-slate-500 cursor-not-allowed opacity-75'
                }`}
                title={
                  isTheoryUnlocked
                    ? 'Відкрити вбудовану теоретичну капсулу без переходу на іншу вкладку'
                    : undefined
                }
                aria-label={
                  isTheoryUnlocked
                    ? 'Відкрити вбудовану теоретичну капсулу'
                    : 'Експрес-теорія обмежена. Розблоковується після 2-ї підказки Сократа.'
                }
              >
                {isTheoryUnlocked ? (
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>Теорія</span>
                {!isTheoryUnlocked && (
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-400">
                    2+
                  </span>
                )}
              </button>

              {!isTheoryUnlocked && (
                <div
                  data-testid="jit-theory-locked-tooltip"
                  className="absolute right-0 top-full mt-1.5 hidden group-hover:flex flex-col gap-1 w-64 p-2.5 rounded-lg bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-md z-30 text-[11px] text-slate-300 leading-snug animate-fadeIn pointer-events-none"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Експрес-теорія обмежена</span>
                  </div>
                  <p className="text-slate-400 text-[10px]">
                    Спробуйте розв&apos;язати самостійно або скористайтеся підказками Сократа. Теорія розблокується після розкриття 2-ї підказки.
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={onOpenSkillTree}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              title="Відкрити Дерево Знань"
            >
              <Network className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Дерево знань</span>
            </button>
          </div>
        </div>

        {/* ⚠️ Сповіщення про анулювання спроби викладачем */}
        {annulmentAlert && (
          <div
            data-testid="annulment-alert"
            className="mb-4 p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 flex items-start justify-between gap-3 animate-fadeIn"
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white text-xs">
                    Вашу попередню відповідь анульовано викладачем
                  </span>
                  <Badge variant="danger" size="xs" mono>
                    Причина: {annulmentAlert.reason}
                  </Badge>
                </div>
                {annulmentAlert.comment && (
                  <p className="text-xs text-rose-300 italic mt-0.5">&quot;{annulmentAlert.comment}&quot;</p>
                )}
                {annulmentAlert.pMasteryUpdated !== undefined && (
                  <span className="text-[10px] font-mono text-slate-400 mt-0.5">
                    Показник P(L) перераховано до: {(annulmentAlert.pMasteryUpdated * 100).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onDismissAnnulmentAlert}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer shrink-0"
              title="Закрити сповіщення"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 📋 Централізована Стилізована Умова Завдання */}
        {task.description && (
          <div
            data-testid="task-condition-card"
            className="w-full rounded-xl bg-[var(--sbc-bg-surface,#1f1f1f)] border border-[var(--sbc-border-subtle,#2b2b2b)] p-4 sm:p-5 relative overflow-hidden transition-all"
          >
            <div className="absolute top-0 left-0 bottom-0 w-1 bg-indigo-500/80 rounded-l" />
            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span>Умова завдання</span>
              </div>
              <span className="text-[11px] font-mono text-[var(--sbc-text-tertiary,#6e6e6e)] font-medium">
                {task.taskType === 'CODE'
                  ? 'Практичний кодинг'
                  : task.taskType === 'TEXT_ESSAY'
                  ? 'Аналітичне есе'
                  : 'Тестове опитування'}
              </span>
            </div>
            <div className="text-sm sm:text-base font-medium text-[var(--sbc-text-primary,#cccccc)] leading-relaxed pl-0.5 font-sans max-w-4xl">
              {task.description.split(/(`[^`]+`)/g).map((part, i) =>
                part.startsWith('`') && part.endsWith('`') ? (
                  <code
                    key={i}
                    className="px-2 py-0.5 mx-1 rounded-md bg-[var(--sbc-bg-subtle,#262626)] border border-[var(--sbc-border-strong,#333333)] text-indigo-400 font-mono text-xs sm:text-sm font-semibold"
                  >
                    {part.slice(1, -1)}
                  </code>
                ) : (
                  part
                )
              )}
            </div>
          </div>
        )}

        {task.taskType === 'SINGLE_CHOICE' || task.taskType === 'MULTIPLE_CHOICE' ? (
          <QuizTaskEditor
            taskId={task.id}
            taskType={task.taskType}
            title={task.title}
            description={task.description}
            options={task.options || []}
            onSubmit={(payload) => onEvaluate(payload)}
            isSubmitting={isSubmitting}
            onNextTask={onNextTask}
            isPassed={Boolean(evalResult?.isPassed)}
          />
        ) : task.taskType === 'TEXT_ESSAY' ? (
          <EssayTaskEditor
            userId="demo-student"
            taskId={task.id}
            title={task.title}
            description={task.description}
            onChange={onChangeEssayAnswer}
            onSubmit={(telemetry) => onEvaluate({ essayAnswer, ...(telemetry || {}) })}
            isSubmitting={isSubmitting}
            onNextTask={onNextTask}
            isPassed={Boolean(evalResult?.isPassed)}
            isPendingReview={evalResult?.teacherReviewStatus === 'PENDING_REVIEW'}
          />
        ) : (
          <MonacoCodeEditor
            userId={currentUserId}
            taskId={task.id}
            initialCode={code}
            onChange={onChangeCode}
            onSubmit={(telemetry) => onEvaluate({ code, ...(telemetry || {}) })}
            isSubmitting={isSubmitting}
            onNextTask={onNextTask}
            isPassed={Boolean(evalResult?.isPassed)}
          />
        )}

        {/* Evaluation Result Panel */}
        {evalResult && (
          <div
            className={`pl-3.5 py-2.5 border-l-2 flex flex-col gap-3 shrink-0 ${
              evalResult.isPassed ? 'border-l-emerald-400 text-emerald-100' : 'border-l-rose-400 text-rose-100'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-2.5">
                {evalResult.isPassed ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex flex-col gap-0.5">
                  <h4 className="font-bold text-xs text-white">
                    {evalResult.isPassed ? 'Вітаємо! Перевірку пройдено' : 'Необхідне доопрацювання'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{evalResult.feedback}</p>
                </div>
              </div>

              {evalResult.bktUpdate && (
                <div className="flex items-center gap-1.5 text-xs font-mono shrink-0">
                  <span className="text-slate-500">P(L):</span>
                  <span className="text-slate-400">
                    {(evalResult.bktUpdate.pMasteryBefore * 100).toFixed(1)}%
                  </span>
                  <span className="text-slate-600">➔</span>
                  <span
                    className={`font-bold ${
                      evalResult.bktUpdate.pMasteryChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {(evalResult.bktUpdate.pMasteryAfter * 100).toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            {evalResult.testDetails && evalResult.testDetails.length > 0 && (
              <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-800/80 text-xs font-mono">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                  Результати перевірки тестів:
                </span>
                <div className="flex flex-col divide-y divide-slate-800/50">
                  {evalResult.testDetails.map((td: CodeTestDetailDto, i: number) => (
                    <div key={i} className="py-1.5 flex items-center justify-between gap-2 text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className={td.passed ? 'text-emerald-400' : 'text-rose-400'}>
                          {td.passed ? '✓' : '✕'}
                        </span>
                        <span className="text-slate-300">
                          {td.input && td.input.startsWith('"') && !td.input.includes('eval:')
                            ? `Змінна ${td.input.replace(/"/g, '')}`
                            : `Тест #${i + 1}`}
                          :
                        </span>
                        <span className="text-slate-500">Очікувалось:</span>
                        <code className="text-emerald-300">{td.expected}</code>
                        <span className="text-slate-600">|</span>
                        <span className="text-slate-500">Отримано:</span>
                        <code className={td.passed ? 'text-emerald-300' : 'text-rose-300'}>{td.actual}</code>
                      </div>
                      <Badge variant={td.passed ? 'success' : 'danger'} size="xs" mono>
                        {td.passed ? 'PASSED' : 'FAILED'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(evalResult.semanticScore !== undefined || evalResult.semanticDetails) && (
              <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <span>Семантична оцінка:</span>
                    <span className="font-mono font-bold text-indigo-400">
                      {evalResult.semanticScore !== undefined
                        ? `${Math.round(evalResult.semanticScore * 100)}%`
                        : '—'}
                    </span>
                  </span>

                  {evalResult.teacherReviewStatus === 'PENDING_REVIEW' ? (
                    <span className="text-[11px] font-mono text-amber-400">
                      ⏳ Очікує верифікації викладачем
                    </span>
                  ) : evalResult.teacherReviewStatus === 'APPROVED' ? (
                    <span className="text-[11px] font-mono text-emerald-400">
                      ✓ Підтверджено викладачем
                    </span>
                  ) : null}
                </div>

                {evalResult.semanticDetails && (
                  <div className="flex flex-col gap-1">
                    {evalResult.semanticDetails.keyConceptsCovered?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400">Розкрито поняття:</span>
                        {evalResult.semanticDetails.keyConceptsCovered.map((kw: string, i: number) => (
                          <span key={i} className="text-emerald-300 font-mono">
                            #{kw.split('|')[0]}
                          </span>
                        ))}
                      </div>
                    )}

                    {evalResult.semanticDetails.missingConcepts?.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="text-slate-400">Варто додати:</span>
                        {evalResult.semanticDetails.missingConcepts.map((kw: string, i: number) => (
                          <span key={i} className="text-rose-300 font-mono">
                            #{kw.split('|')[0]}
                          </span>
                        ))}
                      </div>
                    )}

                    {evalResult.semanticDetails.detectedMisconceptions?.length > 0 && (
                      <div className="text-rose-300 text-[11px]">
                        ⚠️ Виявлено когнітивну помилку: зверніть увагу на точність формулювання щодо теми.
                      </div>
                    )}
                  </div>
                )}

                {evalResult.teacherComment && (
                  <div className="pl-2.5 border-l-2 border-purple-500/50 flex flex-col gap-0.5 mt-1">
                    <span className="text-purple-300 font-semibold text-[11px]">Відгук викладача:</span>
                    <p className="text-xs text-purple-100 italic leading-relaxed">
                      &quot;{evalResult.teacherComment}&quot;
                    </p>
                  </div>
                )}
              </div>
            )}

            {!evalResult.isPassed && evalResult.detectedMisconception && (
              <div
                data-testid="misconception-alert"
                className="pt-2.5 border-t border-slate-800/80 flex flex-col gap-1.5"
              >
                <div className="pl-3 border-l-2 border-l-amber-400 flex flex-col gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Діагностика помилки: {evalResult.detectedMisconception.title}</span>
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {evalResult.detectedMisconception.explanation}
                  </p>
                </div>
              </div>
            )}

            {!evalResult.isPassed &&
              (evalResult.offerJustInTimeTheory ||
                (evalResult.bktUpdate?.pMasteryAfter ?? 1) < 0.35 ||
                Boolean(evalResult.detectedMisconception)) &&
              (isTheoryUnlocked ? (
                <div
                  data-testid="jit-theory-offer"
                  className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-200">
                        {(evalResult.bktUpdate?.pMasteryAfter ?? 1) < 0.35
                          ? 'Рівень опанування P(L) нижче 35% — рекомендуємо експрес-теорію'
                          : 'Швидке теоретичне пояснення за темою'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Перегляньте стислу теоретичну капсулу та зразок коду прямо в тренажері без втрати відповіді.
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    data-testid="jit-theory-offer-btn"
                    onClick={() => onOpenTheoryDrawer('evaluation_offer')}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Відкрити експрес-теорію</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  data-testid="jit-hint-guide"
                  className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-slate-200">
                        Потрібна допомога? Скористайтеся підказками Сократа
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Навідні запитання у бічній панелі допоможуть знайти розв&apos;язок самостійно без втрати завдання.
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    data-testid="jit-hint-guide-btn"
                    onClick={onOpenSocraticHints}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Переглянути підказку Сократа</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

            {!evalResult.isPassed && (
              <div className="pt-2.5 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`w-4 h-4 shrink-0 ${hasRemediationTask ? 'text-amber-400' : 'text-slate-500'}`}
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-200">
                      {consecutiveFailures >= 2 ? 'Помічено системні труднощі' : 'Складно з цим завданням?'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {hasRemediationTask
                        ? 'Ви можете переключитися на допоміжне адаптивне завдання легшого рівня (Max: 70%).'
                        : 'Допоміжний ізоморфний бліц для цього поняття не закладений у банку завдань.'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => hasRemediationTask && onOpenRemediationTask(task.id)}
                  disabled={!hasRemediationTask}
                  className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0 ${
                    hasRemediationTask
                      ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 cursor-pointer'
                      : 'bg-slate-900 text-slate-600 cursor-not-allowed opacity-60'
                  }`}
                  title={hasRemediationTask ? 'Перейти до легшого завдання' : 'Допоміжне завдання відсутнє в курсі'}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{hasRemediationTask ? 'Взяти допоміжне завдання' : 'Допоміжний бліц відсутній'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
