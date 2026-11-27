'use client';

import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Layers,
  ShieldCheck,
  Lightbulb,
  Info,
  HelpCircle,
  BookOpen,
  Compass,
  Shield,
  BookMarked,
  User,
} from 'lucide-react';
import { Modal, Button, Badge } from '@sbc/ui';
import { StudentAnalyticsItem } from '../../analytics/model/analytics.types';
import {
  computeBktMath,
  buildGoldStandardTestMatrix,
  type BktCalculationStep,
} from '../model/bktMath';
import { MetricsWhatIfSandbox } from './MetricsWhatIfSandbox';
import { MetricsTestMatrixTab } from './MetricsTestMatrixTab';
import { MetricsMechanismsTab } from './MetricsMechanismsTab';

export type { BktCalculationStep };
export { computeBktMath };

interface MetricsAuditInspectorProps {
  students: StudentAnalyticsItem[];
  selectedStudentId: string | null;
  onSelectStudent: (id: string) => void;
  activeCourseSlug: string;
  activeSubTab?: 'live-log' | 'what-if' | 'test-matrix' | 'mechanisms';
  onSubTabChange?: (tab: 'live-log' | 'what-if' | 'test-matrix' | 'mechanisms') => void;
}

export function MetricsAuditInspector({
  students,
  selectedStudentId,
  activeSubTab: externalSubTab,
  onSubTabChange,
}: MetricsAuditInspectorProps) {
  // Navigation sub-tabs inside the Audit Module
  const [internalSubTab, setInternalSubTab] = useState<'live-log' | 'what-if' | 'test-matrix' | 'mechanisms'>('live-log');
  const activeSubTab = externalSubTab !== undefined ? externalSubTab : internalSubTab;
  const setActiveSubTab = (tab: 'live-log' | 'what-if' | 'test-matrix' | 'mechanisms') => {
    setInternalSubTab(tab);
    onSubTabChange?.(tab);
  };

  // Selected student for audit
  const student = students.find((s) => (s.id || s.studentId || s.email) === selectedStudentId) || students[0];

  // --- Gold Standard Verification Test Suite Matrix ---
  const testMatrix = useMemo(() => buildGoldStandardTestMatrix(), []);

  // State for explanation modal when clicking on elements in the formula
  const [activeExplanation, setActiveExplanation] = useState<{
    title: string;
    badge?: string;
    formula?: string;
    description: string;
    pedagogicalImpact: string;
    example?: string;
  } | null>(null);

  // Explanations Dictionary for interactive clicks
  const EXPLANATIONS: Record<string, {
    title: string;
    badge?: string;
    formula?: string;
    description: string;
    pedagogicalImpact: string;
    example?: string;
  }> = {
    priorL: {
      title: '1. Апріорна Ймовірність Засвоєння — P(L_{t-1})',
      badge: 'Prior Knowledge',
      formula: '0.0001 ≤ P(L_{t-1}) ≤ 0.9999',
      description: 'Початкова або накопичена з попередніх завдань ймовірність того, що студент володіє цією конкретною навичкою/підтемою ДО здійснення поточної спроби. Стартує з 0.10 (базовий новачок) або 0.50.',
      pedagogicalImpact: 'Визначає базу довіри моделі до знань студента. Що вища апріорна ймовірність, то менше одинична помилка збиває оцінку (спрацьовує захист від описок Careless Slip).',
      example: 'P(L)=0.5387 означає, що система оцінює рівень розуміння студентом теми «Змінні const vs let» приблизно у 53.9%.',
    },
    slip: {
      title: 'Параметр Вислизання — P(Slip) або P(S)',
      badge: 'Slip Probability',
      formula: 'P(S) = P(Incorrect | Known)',
      description: 'Ймовірність того, що студент, який насправді знає матеріал, припуститься прикрої помилки (механічна описка, неуважність, випадковий клік не туди). Базове значення за замовчуванням: 0.10.',
      pedagogicalImpact: 'Якщо сильний студент робить швидку помилку без хаотичних правок, система динамічно підвищує P(S) до 0.30, рятуючи його від обвалу прогресу.',
      example: 'S=0.10 означає 10% ризик помилитися через випадковий фактор навіть при повному розумінні.',
    },
    guess: {
      title: 'Параметр Вгадування — P(Guess) або P(G)',
      badge: 'Guess Probability',
      formula: 'P(G) = P(Correct | Not Known)',
      description: 'Ймовірність того, що студент, який не знає правильної відповіді, випадково вгадає її (наприклад, у тесті з 4 варіантами теоретичний шанс 25%). Базове значення: 0.20.',
      pedagogicalImpact: 'Якщо час відповіді підозріло малий (< 3.5 с) або виявлено вставку з буфера, P(G) динамічно злітає до 0.85–0.90, блокуючи фіктивне зростання рейтингу знань.',
      example: 'G=0.20 означає 20% імовірність інтуїтивного вгадування.',
    },
    slipGuess: {
      title: '2. Ефективні Коефіцієнти Slip / Guess',
      badge: 'Behavioral Parameters',
      formula: 'S = P(S_eff),  G = P(G_eff)',
      description: 'Скориговані поведінковою телеметрією ймовірності випадкової помилки (Slip) та сліпого вгадування (Guess) для цієї конкретної відповіді.',
      pedagogicalImpact: 'Нівелює спроби швидкого клікання без читання умов та захищає старанних студентів від штрафу за друкарські похибки.',
      example: 'S=0.1 | G=0.2 — базові чисті параметри без виявлених поведінкових аномалій.',
    },
    pObs: {
      title: '3. Правдоподібність Спостереження — P(L | Obs)',
      badge: 'Bayes Likelihood',
      formula: 'P(L|Obs) = [P(L) · Likelihood] / [Total Probability of Obs]',
      description: 'Проміжне баєсівське оновлення знань виключно на основі того, чи правильну відповідь надав студент. Для помилки враховує вислизання S, для успіху — вгадування G.',
      pedagogicalImpact: 'Показує "чисту" силу сигналу даної спроби до врахування того, що студент міг чогось навчитися у процесі вирішення (транзит знань).',
      example: 'Після помилки при апріорному 0.5387 ймовірність володіння темою падає до 0.1274.',
    },
    posteriorL: {
      title: '4. Фінальна Апостеріорна Майстерність — P(L_t)',
      badge: 'Updated Mastery',
      formula: 'P(L_t) = P(L | Obs) + (1 - P(L | Obs)) · P(T)',
      description: 'Оновлена після завершення завдання підсумкова ймовірність засвоєння навички. Включає фактор транзиту знань P(T)=0.20 (навіть помилившись і прочитавши пояснення, студент робить крок уперед).',
      pedagogicalImpact: 'Поріг ≥ 75% розблоковує наступні вершини у графі знань (Bloom Proficient). Поріг ≥ 90% дає золоту майстерність (Gold Mastery) та завершує тему.',
      example: '0.3019 (30.2%) — актуальний рівень студента зафіксовано в системі.',
    },
    deltaL: {
      title: 'Динаміка Приросту / Спадання — ΔP(L)',
      badge: 'Mastery Delta',
      formula: 'ΔP(L) = P(L_t) - P(L_{t-1})',
      description: 'Різниця між новим і старим рівнем знань. Для правильної відповіді завжди додатня (+Δ), для помилки — від\'ємна (-Δ).',
      pedagogicalImpact: 'Дає змогу викладачу миттєво побачити крутизну навчання та виявити падіння, що вимагають втручання.',
      example: '-0.2368 означає падіння майстерності на 23.7 відсоткових пунктів через допущену помилку.',
    },
    formulaCorrect: {
      title: 'Розрахунок Баєса для Правильної Відповіді',
      badge: 'Correct Update Step',
      formula: 'P(L|Correct) = [P(L) · (1 - S)] / [P(L) · (1 - S) + (1 - P(L)) · G]',
      description: 'Формула правдоподібності успіху. Чисельник відображає ймовірність того, що студент знав і не схибив (1 - S). Знаменник враховує також шанс не знати, але вгадати (G).',
      pedagogicalImpact: 'Якщо G високий (швидке вгадування), знаменник зростає, а приріст знань практично обнуляється.',
      example: 'P(L|Correct) = [0.5 · 0.9] / [0.5 · 0.9 + 0.5 · 0.2] = 0.45 / 0.55 = 0.8182.',
    },
    formulaIncorrect: {
      title: 'Розрахунок Баєса для Помилкової Відповіді',
      badge: 'Incorrect Update Step',
      formula: 'P(L|Incorrect) = [P(L) · S] / [P(L) · S + (1 - P(L)) · (1 - G)]',
      description: 'Формула правдоподібності при помилці. Знижує впевненість моделі, але ніколи не обнуляє її в нуль одразу, оскільки враховує ймовірність неуважності P(Slip)=0.10. При стартовому рівні 50% перша помилка дає проміжне P(L|Incorrect) ≈ 11.1%, а разом із кроком транзиту P(T)=0.20 підсумковий бал стає 28.9%.',
      pedagogicalImpact: 'Захист від випадкової разової помилки (Slip) та плавне зниження: замість покарання нулем система фіксує падіння (-21.1%) і продовжує моніторинг стабільності.',
      example: 'При P(L)=0.50: [0.50 · 0.1] / [0.50 · 0.1 + 0.50 · 0.8] = 0.05 / 0.45 = 0.1111 (11.1%).',
    },
    transitStep: {
      title: 'Крок Транзиту Навчання — P(Transit) або P(T) & Нижня Асимптота',
      badge: 'Learning Transition & Lower Bound',
      formula: 'P(L_t) = P(L | Obs) + (1 - P(L | Obs)) · P(T)',
      description: 'Фактор навчання під час виконання завдання (P(T)=0.20). Увага: P(T) є математичною нижньою асимптотою системи (BKT Lower Bound ≈ 22.86%). Якщо студент робить 5-10 помилок поспіль або багаторазово клікає один і той самий хибний варіант, динаміка падіння загасає (-21% ➔ -5% ➔ -0.8% ➔ -0.1% ➔ 0.00%) і зупиняється на позначці ~23%.',
      pedagogicalImpact: 'Модель BKT базується на аксіомі, що живий студент при спробі взаємодії з завданням не може мати 0% шансів на навчання. Коли рейтинг наближається до 23%, система не обнуляє його, а вмикає компенсатори: пропонує Сократівські підказки та адаптивну деградацію складності («Взяти допоміжне завдання»).',
      example: 'Після 1-ї помилки: 0.1111 + 0.8889 · 0.20 = 0.2889 (28.9%). Навіть при P(Obs)=0 підсумкове P(L) ≥ P(T) = 0.20.',
    },
    taskTypeBadge: {
      title: 'Тип Навчального Завдання',
      badge: 'Task Format',
      formula: 'SINGLE_CHOICE | MULTIPLE_CHOICE | CODE | TEXT_ESSAY',
      description: 'Формат інтерактивного виклику. Для тестів SINGLE_CHOICE діє захист від швидкого вгадування по таймінгу (< 3.5 с). Для CODE діє запуск у пісочниці та аналіз пауз. Для TEXT_ESSAY діє детекція копіпасту та семантичний NLP аналіз.',
      pedagogicalImpact: 'Визначає алгоритмічний профіль телеметрії та застосовані поведінкові фільтри.',
      example: 'SINGLE_CHOICE: тест з одним правильним варіантом серед перемішаних альтернатив.',
    },
    skillBadge: {
      title: 'Компетентнісний Вузол / Модуль Графа',
      badge: 'Skill Node',
      formula: 'DAG Node: js-basics (Модуль 1)',
      description: 'Академічна одиниця знань у графовій моделі курсу (Knowledge DAG). Кожна навичка відстежує свій окремий незалежний стан P(L) у таблиці bkt_states.',
      pedagogicalImpact: 'Досягнення порогу P(L) ≥ 0.75 у Модулі 1 відкриває доступ до залежних тем Модуля 2 «Умовні конструкції та Функції».',
      example: 'Модуль 1: Змінні, Типи та Оператори (js-basics).',
    }
  };

  const totalPass = testMatrix.filter((t) => t.pass).length;

  return (
    <div className="flex flex-col gap-5">
      {/* 🔬 Clean Unified Sub-Navigation Toolbar */}
      <div className="pb-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FlaskConical className="w-4 h-4 text-purple-400" />
          <h1 className="text-sm font-bold text-white">Математичний Аудит та Симулятор BKT</h1>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800/60">
          <button
            onClick={() => setActiveSubTab('live-log')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'live-log'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Формула Студента</span>
            {student && (
              <span className="text-[10px] font-mono text-purple-300">
                ({student.name.split(' ')[0]})
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('what-if')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'what-if'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Пісочниця "What-If"</span>
          </button>

          <button
            onClick={() => setActiveSubTab('test-matrix')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'test-matrix'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Еталонна Матриця ({totalPass}/{testMatrix.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('mechanisms')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              activeSubTab === 'mechanisms'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Реєстр Механізмів (4-in-1)</span>
          </button>
        </div>
      </div>

      {/* 📌 Main Body Canvas based on activeSubTab */}
      <div className="flex flex-col gap-5">

        {/* ════════ SUB-TAB 1: LIVE STUDENT BAYES BREAKDOWN ════════ */}
        {activeSubTab === 'live-log' && (
          <div className="flex flex-col gap-4">
            {/* Compact Student Status Bar */}
            <div className="pb-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-white">{student?.name || 'Студент не обраний'}</span>
                <span className="text-slate-500 font-mono">({student?.email})</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 font-mono">
                <span>Середнє P(L): <strong className="text-emerald-400">{((student?.averageMastery || 0) * 100).toFixed(1)}%</strong></span>
                <span>WPM: <strong className="text-indigo-400">{student?.wpm ?? student?.avgWpm ?? 0}</strong></span>
                <span>Copy-Paste: <strong className="text-slate-200">{((student?.copyPasteRatio || 0) * 100).toFixed(0)}%</strong></span>
              </div>
            </div>

            {/* Submissions & Bayes Calculations Feed */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>Останні Спроби та Покрокова Декомпозиція Баєса ({student?.recentAdjustments?.length || 0})</span>
                </h2>
              </div>

              {(!student?.recentAdjustments || student.recentAdjustments.length === 0) ? (
                <div className="border border-dashed border-slate-800/80 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
                  <Calculator className="w-8 h-8 text-slate-600" />
                  <p className="text-sm text-slate-400 font-semibold">У обраного студента ще немає зареєстрованих спроб</p>
                  <p className="text-xs text-slate-500 max-w-md">
                    Перейдіть до Кабінету Студента (порт 3002) і дайте відповідь на кілька завдань, щоб побачити живий розрахунок формул у реальному часі.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {student.recentAdjustments.map((adj, index) => {
                    const stepCalc = computeBktMath({
                      priorL: student.bktBySkill?.[adj.skillSlug] ?? 0.5,
                      pTransit: 0.2,
                      pSlip: adj.pSlipUsed ?? 0.1,
                      pGuess: adj.pGuessUsed ?? 0.2,
                      isCorrect: adj.isCorrect,
                      taskType: adj.taskType || 'SINGLE_CHOICE',
                      reactionLatencyMs: 2500,
                    });

                    return (
                      <div
                        key={adj.id || index}
                        className="py-4.5 first:pt-2 last:pb-2 flex flex-col gap-3.5"
                      >
                        {/* Header of attempt: Clean typography without heavy borders */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${adj.isCorrect ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="text-xs font-bold text-white truncate max-w-md">
                                {adj.taskTitle || 'Завдання'}
                              </span>

                              <button
                                type="button"
                                onClick={() => setActiveExplanation(EXPLANATIONS.skillBadge)}
                                className="text-[10px] font-mono text-purple-400 hover:text-purple-300 transition-colors cursor-pointer flex items-center gap-0.5"
                                title="Натисніть для детального пояснення навички"
                              >
                                <span>{adj.skillTitle || adj.skillSlug}</span>
                                <HelpCircle className="w-2.5 h-2.5 opacity-60" />
                              </button>

                              <span className="text-slate-600 font-mono text-[10px]">·</span>

                              <button
                                type="button"
                                onClick={() => setActiveExplanation(EXPLANATIONS.taskTypeBadge)}
                                className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors cursor-pointer flex items-center gap-0.5"
                                title="Натисніть для деталей про тип завдання"
                              >
                                <span>{adj.taskType || 'TASK'}</span>
                                <HelpCircle className="w-2.5 h-2.5 opacity-60" />
                              </button>

                              <span className="text-slate-600 font-mono text-[10px]">·</span>

                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(adj.createdAt).toLocaleString('uk-UA')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className={`text-xs font-mono font-semibold ${
                              adj.isCorrect
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }`}>
                              {adj.isCorrect ? '✓ ПРАВИЛЬНО' : '✗ ПОМИЛКА'}
                            </span>

                            <button
                              type="button"
                              onClick={() => setActiveExplanation(EXPLANATIONS.deltaL)}
                              className="text-xs font-mono font-bold text-purple-300 hover:text-purple-200 transition-colors cursor-pointer flex items-center gap-1"
                              title="Натисніть для пояснення динаміки ΔP(L)"
                            >
                              <span>ΔP(L): {stepCalc.deltaL >= 0 ? `+${stepCalc.deltaL}` : stepCalc.deltaL}</span>
                              <HelpCircle className="w-3 h-3 opacity-60" />
                            </button>
                          </div>
                        </div>

                        {/* Behavioral Modifiers Applied */}
                        {adj.adjustReasons && adj.adjustReasons.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-amber-300/90 pt-0.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-[10px] text-amber-400/90 font-semibold uppercase tracking-wider">
                              Коректори:
                            </span>
                            {adj.adjustReasons.map((r, ri) => (
                              <button
                                key={ri}
                                type="button"
                                onClick={() => {
                                  if (r.includes('G↑') || r.includes('вгадування')) {
                                    setActiveExplanation(EXPLANATIONS.guess);
                                  } else if (r.includes('S↑') || r.includes('описка')) {
                                    setActiveExplanation(EXPLANATIONS.slip);
                                  } else {
                                    setActiveExplanation(EXPLANATIONS.slipGuess);
                                  }
                                }}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 transition-colors cursor-pointer flex items-center gap-1"
                                title="Натисніть для пояснення поведінкового тригера"
                              >
                                <span>{r}</span>
                                <HelpCircle className="w-2.5 h-2.5 opacity-60" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Step-by-Step Bayes Mathematical Proof (Clean flat layout without nested box) */}
                        <div className="flex flex-col gap-2.5 font-mono text-xs">
                          <div className="flex items-center justify-between text-slate-400 text-[11px]">
                            <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                              <Calculator className="w-3.5 h-3.5 text-purple-400" />
                              <span>Математична викладка оновлення Баєса</span>
                            </span>
                            <span className="text-[10px] text-slate-500">
                              P(L_t) = P(L_{`t-1`}|Obs) + (1 - P(L_{`t-1`}|Obs)) · P(T)
                            </span>
                          </div>

                          {/* 4-Column Flat Metric Cards */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-slate-300">
                            {/* Card 1: Prior */}
                            <div
                              onClick={() => setActiveExplanation(EXPLANATIONS.priorL)}
                              className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80 hover:border-purple-500/50 hover:bg-slate-850/60 transition-colors cursor-pointer group flex flex-col justify-between"
                              title="Натисніть, щоб дізнатися що таке Апріорна ймовірність"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500 group-hover:text-purple-300 transition-colors">1. Апріорна P(L_{`t-1`}):</span>
                                  <HelpCircle className="w-3 h-3 text-slate-600 group-hover:text-purple-400 transition-colors" />
                                </div>
                                <span className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">{stepCalc.priorL}</span>
                              </div>
                              <span className="text-[9px] text-slate-500 group-hover:text-purple-400 mt-1">Клік для роз'яснення ➔</span>
                            </div>

                            {/* Card 2: Slip / Guess */}
                            <div
                              onClick={() => setActiveExplanation(EXPLANATIONS.slipGuess)}
                              className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80 hover:border-amber-500/50 hover:bg-slate-850/60 transition-colors cursor-pointer group flex flex-col justify-between"
                              title="Натисніть, щоб дізнатися як працюють Slip та Guess"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500 group-hover:text-amber-300 transition-colors">2. Slip / Guess:</span>
                                  <HelpCircle className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
                                </div>
                                <span className="text-sm font-bold text-amber-300">
                                  S={stepCalc.pSlipEffective} | G={stepCalc.pGuessEffective}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-500 group-hover:text-amber-400 mt-1">Клік для роз'яснення ➔</span>
                            </div>

                            {/* Card 3: P(L|Obs) */}
                            <div
                              onClick={() => setActiveExplanation(EXPLANATIONS.pObs)}
                              className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-850/60 transition-colors cursor-pointer group flex flex-col justify-between"
                              title="Натисніть, щоб дізнатися що таке Правдоподібність P(L|Obs)"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500 group-hover:text-indigo-300 transition-colors">3. Правдоподібність P(L|Obs):</span>
                                  <HelpCircle className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <span className="text-sm font-bold text-indigo-300">
                                  {stepCalc.pObs.toFixed(4)}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-500 group-hover:text-indigo-400 mt-1">Клік для роз'яснення ➔</span>
                            </div>

                            {/* Card 4: Posterior P(L_t) */}
                            <div
                              onClick={() => setActiveExplanation(EXPLANATIONS.posteriorL)}
                              className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-850/60 transition-colors cursor-pointer group flex flex-col justify-between"
                              title="Натисніть, щоб дізнатися що таке Апостеріорна P(L_t)"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500 group-hover:text-emerald-300 transition-colors">4. Апостеріорна P(L_t):</span>
                                  <HelpCircle className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                                </div>
                                <span className="text-sm font-bold text-emerald-400">
                                  {stepCalc.posteriorL} ({(stepCalc.posteriorL * 100).toFixed(1)}%)
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-500 group-hover:text-emerald-400 mt-1">Клік для роз'яснення ➔</span>
                            </div>
                          </div>

                          {/* Mathematical formula breakdown with clickable parts */}
                          <div className="p-2.5 bg-slate-950/60 border border-slate-800/80 rounded-lg text-slate-300 text-[11px] leading-relaxed flex flex-col gap-1.5">
                            {adj.isCorrect ? (
                              <>
                                <div
                                  onClick={() => setActiveExplanation(EXPLANATIONS.formulaCorrect)}
                                  className="py-1 px-1.5 rounded hover:bg-slate-900/60 transition-colors cursor-pointer flex items-center justify-between"
                                  title="Натисніть для пояснення формули правдоподібності успіху"
                                >
                                  <div>
                                    <span className="text-purple-400 font-semibold">Розрахунок для успіху:</span> P(L|Correct) = [{stepCalc.priorL} · (1 - {stepCalc.pSlipEffective})] / [{stepCalc.priorL} · (1 - {stepCalc.pSlipEffective}) + (1 - {stepCalc.priorL}) · {stepCalc.pGuessEffective}] = <strong className="text-white">{stepCalc.pObs.toFixed(4)}</strong>
                                  </div>
                                  <HelpCircle className="w-3 h-3 text-purple-400 shrink-0 ml-2 opacity-60" />
                                </div>
                                <div
                                  onClick={() => setActiveExplanation(EXPLANATIONS.transitStep)}
                                  className="py-1 px-1.5 rounded hover:bg-slate-900/60 transition-colors cursor-pointer flex items-center justify-between"
                                  title="Натисніть для пояснення кроку транзиту знань"
                                >
                                  <div>
                                    <span className="text-purple-400 font-semibold">Транзит знань:</span> {stepCalc.pObs.toFixed(4)} + (1 - {stepCalc.pObs.toFixed(4)}) · {stepCalc.pTransit} = <strong className="text-emerald-400">{stepCalc.posteriorL}</strong>
                                  </div>
                                  <HelpCircle className="w-3 h-3 text-emerald-400 shrink-0 ml-2 opacity-60" />
                                </div>
                              </>
                            ) : (
                              <>
                                <div
                                  onClick={() => setActiveExplanation(EXPLANATIONS.formulaIncorrect)}
                                  className="py-1 px-1.5 rounded hover:bg-slate-900/60 transition-colors cursor-pointer flex items-center justify-between"
                                  title="Натисніть для пояснення формули правдоподібності помилки"
                                >
                                  <div>
                                    <span className="text-purple-400 font-semibold">Розрахунок для помилки:</span> P(L|Incorrect) = [{stepCalc.priorL} · {stepCalc.pSlipEffective}] / [{stepCalc.priorL} · {stepCalc.pSlipEffective} + (1 - {stepCalc.priorL}) · (1 - {stepCalc.pGuessEffective})] = <strong className="text-white">{stepCalc.pObs.toFixed(4)}</strong>
                                  </div>
                                  <HelpCircle className="w-3 h-3 text-purple-400 shrink-0 ml-2 opacity-60" />
                                </div>
                                <div
                                  onClick={() => setActiveExplanation(EXPLANATIONS.transitStep)}
                                  className="py-1 px-1.5 rounded hover:bg-slate-900/60 transition-colors cursor-pointer flex items-center justify-between"
                                  title="Натисніть для пояснення кроку транзиту знань"
                                >
                                  <div>
                                    <span className="text-purple-400 font-semibold">Транзит знань:</span> {stepCalc.pObs.toFixed(4)} + (1 - {stepCalc.pObs.toFixed(4)}) · {stepCalc.pTransit} = <strong className="text-rose-400">{stepCalc.posteriorL}</strong>
                                  </div>
                                  <HelpCircle className="w-3 h-3 text-rose-400 shrink-0 ml-2 opacity-60" />
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════ SUB-TAB 2: WHAT-IF SIMULATION SANDBOX ════════ */}
        {activeSubTab === 'what-if' && <MetricsWhatIfSandbox />}

        {/* ════════ SUB-TAB 3: GOLD STANDARD VERIFICATION TEST MATRIX ════════ */}
        {activeSubTab === 'test-matrix' && (
          <MetricsTestMatrixTab testMatrix={testMatrix} totalPass={totalPass} />
        )}

        {/* ════════ SUB-TAB 4: COMPREHENSIVE MECHANISMS REGISTRY ════════ */}
        {activeSubTab === 'mechanisms' && <MetricsMechanismsTab />}

      </div>

      {/* 📖 Interactive Deep Dive Explanation Modal on Click */}
      <Modal
        isOpen={Boolean(activeExplanation)}
        onClose={() => setActiveExplanation(null)}
        size="lg"
        icon={
          <div className="w-10 h-10 rounded-xl bg-purple-950/50 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-purple-400" />
          </div>
        }
        title={
          activeExplanation ? (
            <span className="flex items-center gap-2 flex-wrap">
              <span>{activeExplanation.title}</span>
              {activeExplanation.badge && (
                <Badge variant="accent" size="xs" mono>{activeExplanation.badge}</Badge>
              )}
            </span>
          ) : undefined
        }
        subtitle={
          activeExplanation?.formula ? (
            <code className="mt-1 px-2 py-0.5 bg-[var(--sbc-bg-subtle,#262626)] rounded border border-[var(--sbc-border-subtle,#2b2b2b)] text-[11px] font-mono font-bold text-emerald-400 inline-block">
              {activeExplanation.formula}
            </code>
          ) : undefined
        }
        footer={
          <div className="flex justify-end">
            <Button variant="primary" size="sm" onClick={() => setActiveExplanation(null)}>
              Зрозуміло
            </Button>
          </div>
        }
      >
        {activeExplanation && (
          <div className="flex flex-col gap-3 text-xs leading-relaxed text-[var(--sbc-text-muted,#909090)]">
            <div className="bg-[var(--sbc-bg-subtle,#262626)] p-3.5 rounded-xl border border-[var(--sbc-border-subtle,#2b2b2b)]">
              <span className="text-[11px] font-bold text-[var(--sbc-text-primary,#cccccc)] uppercase tracking-wide block mb-1">
                📖 Що це означає:
              </span>
              <p>{activeExplanation.description}</p>
            </div>

            <div className="bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-500/20">
              <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide block mb-1">
                🎯 Педагогічний вплив на алгоритм:
              </span>
              <p className="text-[var(--sbc-text-primary,#cccccc)]">{activeExplanation.pedagogicalImpact}</p>
            </div>

            {activeExplanation.example && (
              <div className="bg-purple-950/20 p-3 rounded-xl border border-purple-500/20 text-[11px] font-mono text-purple-200">
                <strong className="text-purple-300 block mb-0.5">Приклад у поточній відповіді:</strong>
                {activeExplanation.example}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
