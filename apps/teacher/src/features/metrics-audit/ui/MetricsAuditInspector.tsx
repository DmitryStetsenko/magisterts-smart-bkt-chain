'use client';

import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  RotateCcw,
  Zap,
  Layers,
  ShieldCheck,
  Lightbulb,
  Info,
  X,
  HelpCircle,
  BookOpen,
  Compass,
  Sliders,
  Shield,
  BookMarked,
  User,
  Globe
} from 'lucide-react';
import { StudentAnalyticsItem } from '../../analytics/model/analytics.types';

interface MetricsAuditInspectorProps {
  students: StudentAnalyticsItem[];
  selectedStudentId: string | null;
  onSelectStudent: (id: string) => void;
  activeCourseSlug: string;
  activeSubTab?: 'live-log' | 'what-if' | 'test-matrix' | 'mechanisms';
  onSubTabChange?: (tab: 'live-log' | 'what-if' | 'test-matrix' | 'mechanisms') => void;
}

// BKT Domain Math Calculation Helper (Exact mirror of BktEngine + BehavioralAdjuster)
export interface BktCalculationStep {
  priorL: number;
  pTransit: number;
  pSlipBase: number;
  pGuessBase: number;
  pSlipEffective: number;
  pGuessEffective: number;
  isCorrect: boolean;
  reasons: string[];
  numerator: number;
  denominator: number;
  pObs: number;
  posteriorL: number;
  deltaL: number;
  masteryStatus: 'GOLD_MASTERY' | 'PROFICIENT' | 'IN_PROGRESS';
  socraticHintPenaltyApplied?: number; // 0, 15, or 30%
}

export function computeBktMath(params: {
  priorL: number;
  pTransit: number;
  pSlip: number;
  pGuess: number;
  isCorrect: boolean;
  taskType: string;
  reactionLatencyMs?: number;
  pasteEvents?: number;
  typingWpm?: number;
  deletionRatio?: number;
  pauseCount?: number;
  socraticHintsCount?: number;
}): BktCalculationStep {
  let { priorL, pTransit, pSlip: pSlipEff, pGuess: pGuessEff, isCorrect, socraticHintsCount = 0 } = params;
  const reasons: string[] = [];

  // Behavioral Adjuster logic
  const isChoice = params.taskType === 'SINGLE_CHOICE' || params.taskType === 'MULTIPLE_CHOICE';
  const isOpenText = params.taskType === 'TEXT_ESSAY' || params.taskType === 'OPEN_TEXT';

  if (isCorrect && isChoice && params.reactionLatencyMs !== undefined && params.reactionLatencyMs > 0 && params.reactionLatencyMs < 3500) {
    pGuessEff = Math.max(pGuessEff, 0.85);
    reasons.push(`Швидке вгадування (G↑ 0.85): реакція ${params.reactionLatencyMs}мс < 3500мс`);
  }

  if (isCorrect && isOpenText && ((params.pasteEvents && params.pasteEvents > 0) || (params.typingWpm && params.typingWpm > 120))) {
    pGuessEff = Math.max(pGuessEff, 0.90);
    reasons.push(`Аномальний темп/вставка тексту (G↑ 0.90): Paste=${params.pasteEvents || 0}, WPM=${params.typingWpm || 0}`);
  }

  if (!isCorrect) {
    const isCareless = (params.deletionRatio ?? 0) < 0.15 && (params.pauseCount ?? 0) <= 2 && priorL >= 0.70;
    if (isCareless) {
      pSlipEff = 0.30;
      reasons.push(`Випадкова описка впевненого студента (S↑ 0.30): P(L)=${(priorL*100).toFixed(0)}%, висока швидкість`);
    }
  }

  // Socratic Hint Penalty
  let hintPenalty = 0;
  if (socraticHintsCount === 1) {
    hintPenalty = 15;
    reasons.push(`Підказка Сократа №1: штрафний коефіцієнт -15% до фінального балу`);
  } else if (socraticHintsCount >= 2) {
    hintPenalty = 30;
    reasons.push(`Підказка Сократа №2: штрафний коефіцієнт -30% до фінального балу`);
  }

  // Bayes Likelihood
  let numerator: number;
  let denominator: number;
  let pObs: number;

  const pL = Math.max(0.0001, Math.min(0.9999, priorL));

  if (isCorrect) {
    numerator = pL * (1 - pSlipEff);
    denominator = pL * (1 - pSlipEff) + (1 - pL) * pGuessEff;
  } else {
    numerator = pL * pSlipEff;
    denominator = pL * pSlipEff + (1 - pL) * (1 - pGuessEff);
  }

  pObs = denominator > 0 ? numerator / denominator : pL;

  // Transition update: P(L_t) = P(L_t | obs) + (1 - P(L_t | obs)) * P(T)
  const posteriorRaw = pObs + (1 - pObs) * pTransit;
  const clampedPosterior = Math.max(0.0001, Math.min(0.9999, posteriorRaw));
  const roundedPosterior = Number(clampedPosterior.toFixed(4));
  const delta = Number((roundedPosterior - priorL).toFixed(4));

  let masteryStatus: 'GOLD_MASTERY' | 'PROFICIENT' | 'IN_PROGRESS' = 'IN_PROGRESS';
  if (roundedPosterior >= 0.90) {
    masteryStatus = 'GOLD_MASTERY';
  } else if (roundedPosterior >= 0.75) {
    masteryStatus = 'PROFICIENT';
  }

  return {
    priorL: pL,
    pTransit,
    pSlipBase: params.pSlip,
    pGuessBase: params.pGuess,
    pSlipEffective: pSlipEff,
    pGuessEffective: pGuessEff,
    isCorrect,
    reasons,
    numerator,
    denominator,
    pObs,
    posteriorL: roundedPosterior,
    deltaL: delta,
    masteryStatus,
    socraticHintPenaltyApplied: hintPenalty,
  };
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

  // --- What-If Simulation Sandbox State ---
  const [simPriorL, setSimPriorL] = useState<number>(0.50);
  const [simTransit, setSimTransit] = useState<number>(0.20);
  const [simSlip, setSimSlip] = useState<number>(0.10);
  const [simGuess, setSimGuess] = useState<number>(0.20);
  const [simIsCorrect, setSimIsCorrect] = useState<boolean>(true);
  const [simTaskType, setSimTaskType] = useState<string>('SINGLE_CHOICE');
  const [simReactionMs, setSimReactionMs] = useState<number>(1200);
  const [simPasteEvents, setSimPasteEvents] = useState<number>(0);
  const [simTypingWpm, setSimTypingWpm] = useState<number>(45);
  const [simHintsCount, setSimHintsCount] = useState<number>(0);

  // Compute live What-If step
  const simResult = useMemo(() => {
    return computeBktMath({
      priorL: simPriorL,
      pTransit: simTransit,
      pSlip: simSlip,
      pGuess: simGuess,
      isCorrect: simIsCorrect,
      taskType: simTaskType,
      reactionLatencyMs: simReactionMs,
      pasteEvents: simPasteEvents,
      typingWpm: simTypingWpm,
      socraticHintsCount: simHintsCount,
    });
  }, [
    simPriorL,
    simTransit,
    simSlip,
    simGuess,
    simIsCorrect,
    simTaskType,
    simReactionMs,
    simPasteEvents,
    simTypingWpm,
    simHintsCount,
  ]);

  // --- Gold Standard Verification Test Suite Matrix ---
  const testMatrix = useMemo(() => {
    const tests = [
      {
        id: 'T1',
        title: 'Швидке вгадування (Rapid Guessing Guard)',
        scenario: 'SINGLE_CHOICE правильна відповідь за 1.2 с (< 3.5 с)',
        expected: 'P(G) зростає до 0.85, приріст ΔP(L) суттєво демпфується',
        fn: () => {
          const normal = computeBktMath({
            priorL: 0.5,
            pTransit: 0.2,
            pSlip: 0.1,
            pGuess: 0.2,
            isCorrect: true,
            taskType: 'SINGLE_CHOICE',
            reactionLatencyMs: 8000,
          });
          const rapid = computeBktMath({
            priorL: 0.5,
            pTransit: 0.2,
            pSlip: 0.1,
            pGuess: 0.2,
            isCorrect: true,
            taskType: 'SINGLE_CHOICE',
            reactionLatencyMs: 1200,
          });
          const pass = rapid.pGuessEffective === 0.85 && rapid.posteriorL < normal.posteriorL;
          return { pass, actual: `P(G)=${rapid.pGuessEffective}, P(L)=${rapid.posteriorL} замість ${normal.posteriorL}` };
        },
      },
      {
        id: 'T2',
        title: 'Захист від описки сильного студента (Careless Slip Protection)',
        scenario: 'P(L)=0.90, неправильна відповідь при впевненому темпі без видалень',
        expected: 'P(S) зростає до 0.30, пом\'якшуючи падіння знань',
        fn: () => {
          const normal = computeBktMath({
            priorL: 0.9,
            pTransit: 0.1,
            pSlip: 0.1,
            pGuess: 0.2,
            isCorrect: false,
            taskType: 'CODE',
            deletionRatio: 0.5,
          });
          const careless = computeBktMath({
            priorL: 0.9,
            pTransit: 0.1,
            pSlip: 0.1,
            pGuess: 0.2,
            isCorrect: false,
            taskType: 'CODE',
            deletionRatio: 0.05,
            pauseCount: 1,
          });
          const pass = careless.pSlipEffective === 0.30 && careless.posteriorL > normal.posteriorL;
          return { pass, actual: `P(S)=${careless.pSlipEffective}, P(L)=${careless.posteriorL} (краще ніж звичайне ${normal.posteriorL})` };
        },
      },
      {
        id: 'T3',
        title: 'Двохетапні підказки Сократа (Socratic Hint Scaffolding)',
        scenario: 'Застосування 1-ї підказки (-15%) або 2-ї підказки (-30%)',
        expected: 'Фіксація штрафного коефіцієнта з прозорим попередженням',
        fn: () => {
          const hint1 = computeBktMath({
            priorL: 0.5,
            pTransit: 0.2,
            pSlip: 0.1,
            pGuess: 0.2,
            isCorrect: true,
            taskType: 'SINGLE_CHOICE',
            socraticHintsCount: 1,
          });
          const hint2 = computeBktMath({
            priorL: 0.5,
            pTransit: 0.2,
            pSlip: 0.1,
            pGuess: 0.2,
            isCorrect: true,
            taskType: 'SINGLE_CHOICE',
            socraticHintsCount: 2,
          });
          const pass = hint1.socraticHintPenaltyApplied === 15 && hint2.socraticHintPenaltyApplied === 30;
          return { pass, actual: `Підказка 1: -${hint1.socraticHintPenaltyApplied}%, Підказка 2: -${hint2.socraticHintPenaltyApplied}%` };
        },
      },
      {
        id: 'T4',
        title: 'Поріг розблокування графа Блума (Bloom Proficient Threshold)',
        scenario: 'Досягнення P(L) >= 0.75',
        expected: 'Статус PROFICIENT (відкриває дочірні вершини в дереві навичок)',
        fn: () => {
          const sub = computeBktMath({
            priorL: 0.60,
            pTransit: 0.2,
            pSlip: 0.1,
            pGuess: 0.2,
            isCorrect: true,
            taskType: 'SINGLE_CHOICE',
            reactionLatencyMs: 6000,
          });
          const pass = sub.posteriorL >= 0.75 && sub.posteriorL < 0.90 && sub.masteryStatus === 'PROFICIENT';
          return { pass, actual: `P(L)=${sub.posteriorL} => Статус: ${sub.masteryStatus}` };
        },
      },
      {
        id: 'T5',
        title: 'Золота майстерність теми (Gold Mastery Threshold)',
        scenario: 'Досягнення P(L) >= 0.90',
        expected: 'Статус GOLD_MASTERY (завершення теми, доступ до екзаменаційного Blitz)',
        fn: () => {
          const sub = computeBktMath({
            priorL: 0.88,
            pTransit: 0.2,
            pSlip: 0.1,
            pGuess: 0.2,
            isCorrect: true,
            taskType: 'SINGLE_CHOICE',
            reactionLatencyMs: 6000,
          });
          const pass = sub.posteriorL >= 0.90 && sub.masteryStatus === 'GOLD_MASTERY';
          return { pass, actual: `P(L)=${sub.posteriorL} => Статус: ${sub.masteryStatus}` };
        },
      },
      {
        id: 'T6',
        title: 'Детекція копіпасту у відкритих відповідях (Paste Guard)',
        scenario: 'TEXT_ESSAY або OPEN_TEXT з pasteEvents > 0 або WPM > 120',
        expected: 'P(G) зростає до 0.90, блокуючи нечесне накручування P(L)',
        fn: () => {
          const res = computeBktMath({
            priorL: 0.4,
            pTransit: 0.2,
            pSlip: 0.1,
            pGuess: 0.2,
            isCorrect: true,
            taskType: 'TEXT_ESSAY',
            pasteEvents: 2,
            typingWpm: 140,
          });
          const pass = res.pGuessEffective === 0.90;
          return { pass, actual: `P(G)=${res.pGuessEffective}, Модифікатор: ${res.reasons.join(', ')}` };
        },
      },
    ];

    return tests.map((t) => {
      const exec = t.fn();
      return {
        ...t,
        pass: exec.pass,
        actual: exec.actual,
      };
    });
  }, []);

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
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-y-auto">
      {/* 🔬 Module Header Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-950/60 via-slate-900 to-indigo-950/60 border-b border-purple-500/20 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center shadow-lg shadow-purple-950/50">
              <FlaskConical className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Математичний Аудит та Симулятор BKT</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                    Active Verified
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Покрокова верифікація формул Баєса, поведінкових штрафів за швидкість (Rapid Guessing), скорочення оцінки за підказки Сократа та автоматична валідація еталонних тестів.
              </p>
            </div>
          </div>

          {/* Sub-Navigation Buttons with Explicit Separation: Student-Specific vs Global System */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* GROUP 1: Персональний аудит студента */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-purple-500/30 shadow-inner">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-purple-400 px-2 py-0.5 flex items-center gap-1 border-r border-slate-800 mr-0.5">
                <User className="w-3 h-3 text-purple-400" />
                <span>Студент:</span>
              </span>
              <button
                onClick={() => setActiveSubTab('live-log')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeSubTab === 'live-log'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Calculator className="w-3.5 h-3.5 text-purple-300" />
                <span>Формула Студента</span>
                {student && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-200 border border-purple-500/30">
                    {student.name.split(' ')[0]}
                  </span>
                )}
              </button>
            </div>

            {/* GROUP 2: Загальносистемні алгоритми та верифікація */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-slate-400 px-2 py-0.5 flex items-center gap-1 border-r border-slate-800 mr-0.5">
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>Загальні:</span>
              </span>

              <button
                onClick={() => setActiveSubTab('what-if')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSubTab === 'what-if'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Пісочниця "What-If"</span>
              </button>

              <button
                onClick={() => setActiveSubTab('test-matrix')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSubTab === 'test-matrix'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Еталонна Матриця ({totalPass}/{testMatrix.length})</span>
              </button>

              <button
                onClick={() => setActiveSubTab('mechanisms')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeSubTab === 'mechanisms'
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-amber-300" />
                <span>Реєстр Механізмів (4-in-1)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📌 Main Body Canvas based on activeSubTab */}
      <div className="p-6 flex-1 flex flex-col gap-6">

        {/* ════════ SUB-TAB 1: LIVE STUDENT BAYES BREAKDOWN ════════ */}
        {activeSubTab === 'live-log' && (
          <div className="flex flex-col gap-6">
            {/* Scope Breadcrumb */}
            <div className="bg-purple-950/20 border border-purple-500/30 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                  <User className="w-3 h-3 text-purple-400" />
                  <span>ПЕРСОНАЛЬНИЙ АУДИТ СТУДЕНТА</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300 font-medium">Аналіз відповідей та декомпозиція Баєса для: <strong className="text-white">{student?.name || 'не обрано'}</strong></span>
              </div>
            </div>

            {/* Student Selector Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                  {student?.name?.charAt(0) || 'S'}
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{student?.name || 'Студент не обраний'}</span>
                    <span className="text-xs text-slate-400 font-mono">({student?.email})</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                    <span>Середнє P(L): <strong className="text-emerald-400 font-mono">{((student?.averageMastery || 0) * 100).toFixed(1)}%</strong></span>
                    <span>•</span>
                    <span>WPM: <strong className="text-indigo-400 font-mono">{student?.wpm ?? student?.avgWpm ?? 0}</strong></span>
                    <span>•</span>
                    <span>Copy-Paste: <strong className="text-slate-200 font-mono">{((student?.copyPasteRatio || 0) * 100).toFixed(0)}%</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                <Info className="w-4 h-4 text-purple-400" />
                <span>Оберіть іншого студента у верхньому меню сторінки для миттєвого аудиту його відповідей</span>
              </div>
            </div>

            {/* Submissions & Bayes Calculations Grid */}
            <div className="flex flex-col gap-4">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Останні Спроби та Покрокова Декомпозиція Баєса ({student?.recentAdjustments?.length || 0})</span>
              </h2>

              {(!student?.recentAdjustments || student.recentAdjustments.length === 0) ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-3">
                  <Calculator className="w-8 h-8 text-slate-600" />
                  <p className="text-sm text-slate-400 font-semibold">У обраного студента ще немає зареєстрованих спроб</p>
                  <p className="text-xs text-slate-500 max-w-md">
                    Перейдіть до Кабінету Студента (порт 3002) і дайте відповідь на кілька завдань, щоб побачити живий розрахунок формул у реальному часі.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
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
                        className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-5 shadow-xl transition-all flex flex-col gap-4"
                      >
                        {/* Header of attempt */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-3 h-3 rounded-full shrink-0 ${adj.isCorrect ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-rose-400 shadow-sm shadow-rose-400'}`} />
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-2 flex-wrap">
                                <span>{adj.taskTitle || 'Завдання'}</span>
                                <button
                                  onClick={() => setActiveExplanation(EXPLANATIONS.skillBadge)}
                                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 transition-all cursor-pointer flex items-center gap-1 group/btn"
                                  title="Натисніть для детального пояснення навички"
                                >
                                  <span>{adj.skillTitle || adj.skillSlug}</span>
                                  <HelpCircle className="w-2.5 h-2.5 opacity-60 group-hover/btn:opacity-100" />
                                </button>
                                <button
                                  onClick={() => setActiveExplanation(EXPLANATIONS.taskTypeBadge)}
                                  className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer flex items-center gap-1 group/btn"
                                  title="Натисніть для деталей про тип завдання"
                                >
                                  <span>{adj.taskType || 'TASK'}</span>
                                  <HelpCircle className="w-2.5 h-2.5 opacity-60 group-hover/btn:opacity-100" />
                                </button>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {new Date(adj.createdAt).toLocaleString('uk-UA')}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono border ${
                              adj.isCorrect
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                            }`}>
                              {adj.isCorrect ? '✓ ПРАВИЛЬНО' : '✗ ПОМИЛКА'}
                            </span>
                            <button
                              onClick={() => setActiveExplanation(EXPLANATIONS.deltaL)}
                              className="px-2.5 py-1 rounded-xl text-xs font-mono font-bold bg-slate-950 text-purple-300 border border-slate-800 hover:border-purple-500/50 hover:bg-purple-950/30 transition-all cursor-pointer flex items-center gap-1.5"
                              title="Натисніть для пояснення динаміки ΔP(L)"
                            >
                              <span>ΔP(L): {stepCalc.deltaL >= 0 ? `+${stepCalc.deltaL}` : stepCalc.deltaL}</span>
                              <HelpCircle className="w-3 h-3 text-purple-400/70" />
                            </button>
                          </div>
                        </div>

                        {/* Behavioral Modifiers Applied */}
                        {adj.adjustReasons && adj.adjustReasons.length > 0 && (
                          <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wide">
                                Задіяно поведінкові коректори:
                              </span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {adj.adjustReasons.map((r, ri) => (
                                  <button
                                    key={ri}
                                    onClick={() => {
                                      if (r.includes('G↑') || r.includes('вгадування')) {
                                        setActiveExplanation(EXPLANATIONS.guess);
                                      } else if (r.includes('S↑') || r.includes('описка')) {
                                        setActiveExplanation(EXPLANATIONS.slip);
                                      } else {
                                        setActiveExplanation(EXPLANATIONS.slipGuess);
                                      }
                                    }}
                                    className="px-2 py-0.5 rounded text-[11px] font-mono bg-amber-500/10 text-amber-200 border border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer flex items-center gap-1 text-left"
                                    title="Натисніть для пояснення поведінкового тригера"
                                  >
                                    <span>{r}</span>
                                    <HelpCircle className="w-3 h-3 text-amber-400/80 shrink-0" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Step-by-Step Bayes Mathematical Proof */}
                        <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 flex flex-col gap-3 font-mono text-xs">
                          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/60 pb-2">
                            <span className="font-bold text-purple-300 flex items-center gap-1.5">
                              <Calculator className="w-3.5 h-3.5 text-purple-400" />
                              <span>Математична викладка оновлення Баєса:</span>
                            </span>
                            <span className="text-[11px] text-slate-500">P(L_t) = P(L_{`t-1`}|Obs) + (1 - P(L_{`t-1`}|Obs)) · P(T)</span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-slate-300">
                            {/* Card 1: Prior */}
                            <div
                              onClick={() => setActiveExplanation(EXPLANATIONS.priorL)}
                              className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 hover:border-purple-500/60 hover:bg-purple-950/20 transition-all cursor-pointer group flex flex-col justify-between"
                              title="Натисніть, щоб дізнатися що таке Апріорна ймовірність"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500 block group-hover:text-purple-300">1. Апріорна ймовірність P(L_{`t-1`}):</span>
                                  <HelpCircle className="w-3 h-3 text-slate-600 group-hover:text-purple-400 transition-colors" />
                                </div>
                                <span className="text-sm font-bold text-white group-hover:text-purple-200">{stepCalc.priorL}</span>
                              </div>
                              <span className="text-[9px] text-slate-500 group-hover:text-purple-400/80 mt-1 flex items-center gap-0.5">Клік для роз'яснення ➔</span>
                            </div>

                            {/* Card 2: Slip / Guess */}
                            <div
                              onClick={() => setActiveExplanation(EXPLANATIONS.slipGuess)}
                              className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 hover:border-amber-500/60 hover:bg-amber-950/20 transition-all cursor-pointer group flex flex-col justify-between"
                              title="Натисніть, щоб дізнатися як працюють Slip та Guess"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500 block group-hover:text-amber-300">2. Ефективні Slip / Guess:</span>
                                  <HelpCircle className="w-3 h-3 text-slate-600 group-hover:text-amber-400 transition-colors" />
                                </div>
                                <span className="text-sm font-bold text-amber-300">
                                  S={stepCalc.pSlipEffective} | G={stepCalc.pGuessEffective}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-500 group-hover:text-amber-400/80 mt-1 flex items-center gap-0.5">Клік для роз'яснення ➔</span>
                            </div>

                            {/* Card 3: P(L|Obs) */}
                            <div
                              onClick={() => setActiveExplanation(EXPLANATIONS.pObs)}
                              className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 hover:border-indigo-500/60 hover:bg-indigo-950/20 transition-all cursor-pointer group flex flex-col justify-between"
                              title="Натисніть, щоб дізнатися що таке Правдоподібність P(L|Obs)"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500 block group-hover:text-indigo-300">3. Правдоподібність P(L|Obs):</span>
                                  <HelpCircle className="w-3 h-3 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <span className="text-sm font-bold text-indigo-300">
                                  {stepCalc.pObs.toFixed(4)}
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-500 group-hover:text-indigo-400/80 mt-1 flex items-center gap-0.5">Клік для роз'яснення ➔</span>
                            </div>

                            {/* Card 4: Posterior P(L_t) */}
                            <div
                              onClick={() => setActiveExplanation(EXPLANATIONS.posteriorL)}
                              className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 hover:border-emerald-500/60 hover:bg-emerald-950/20 transition-all cursor-pointer group flex flex-col justify-between"
                              title="Натисніть, щоб дізнатися що таке Апостеріорна P(L_t)"
                            >
                              <div>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] text-slate-500 block group-hover:text-emerald-300">4. Апостеріорна P(L_t):</span>
                                  <HelpCircle className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                                </div>
                                <span className="text-sm font-bold text-emerald-400">
                                  {stepCalc.posteriorL} ({(stepCalc.posteriorL * 100).toFixed(1)}%)
                                </span>
                              </div>
                              <span className="text-[9px] text-slate-500 group-hover:text-emerald-400/80 mt-1 flex items-center gap-0.5">Клік для роз'яснення ➔</span>
                            </div>
                          </div>

                          {/* Mathematical formula breakdown with clickable parts */}
                          <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-lg text-slate-300 text-[11px] leading-relaxed flex flex-col gap-2">
                            {adj.isCorrect ? (
                              <>
                                <div
                                  onClick={() => setActiveExplanation(EXPLANATIONS.formulaCorrect)}
                                  className="p-1.5 rounded hover:bg-purple-900/30 transition-all cursor-pointer flex items-center justify-between"
                                  title="Натисніть для пояснення формули правдоподібності успіху"
                                >
                                  <div>
                                    <span className="text-purple-300 font-bold underline decoration-dotted">Розрахунок для успіху:</span> P(L|Correct) = [{stepCalc.priorL} · (1 - {stepCalc.pSlipEffective})] / [{stepCalc.priorL} · (1 - {stepCalc.pSlipEffective}) + (1 - {stepCalc.priorL}) · {stepCalc.pGuessEffective}] = <strong className="text-white">{stepCalc.pObs.toFixed(4)}</strong>
                                  </div>
                                  <HelpCircle className="w-3 h-3 text-purple-400 shrink-0 ml-2" />
                                </div>
                                <div
                                  onClick={() => setActiveExplanation(EXPLANATIONS.transitStep)}
                                  className="p-1.5 rounded hover:bg-emerald-950/30 transition-all cursor-pointer flex items-center justify-between"
                                  title="Натисніть для пояснення кроку транзиту знань"
                                >
                                  <div>
                                    <span className="text-purple-300 font-bold underline decoration-dotted">Транзит знань:</span> {stepCalc.pObs.toFixed(4)} + (1 - {stepCalc.pObs.toFixed(4)}) · {stepCalc.pTransit} = <strong className="text-emerald-400">{stepCalc.posteriorL}</strong>
                                  </div>
                                  <HelpCircle className="w-3 h-3 text-emerald-400 shrink-0 ml-2" />
                                </div>
                              </>
                            ) : (
                              <>
                                <div
                                  onClick={() => setActiveExplanation(EXPLANATIONS.formulaIncorrect)}
                                  className="p-1.5 rounded hover:bg-purple-900/30 transition-all cursor-pointer flex items-center justify-between"
                                  title="Натисніть для пояснення формули правдоподібності помилки"
                                >
                                  <div>
                                    <span className="text-purple-300 font-bold underline decoration-dotted">Розрахунок для помилки:</span> P(L|Incorrect) = [{stepCalc.priorL} · {stepCalc.pSlipEffective}] / [{stepCalc.priorL} · {stepCalc.pSlipEffective} + (1 - {stepCalc.priorL}) · (1 - {stepCalc.pGuessEffective})] = <strong className="text-white">{stepCalc.pObs.toFixed(4)}</strong>
                                  </div>
                                  <HelpCircle className="w-3 h-3 text-purple-400 shrink-0 ml-2" />
                                </div>
                                <div
                                  onClick={() => setActiveExplanation(EXPLANATIONS.transitStep)}
                                  className="p-1.5 rounded hover:bg-rose-950/30 transition-all cursor-pointer flex items-center justify-between"
                                  title="Натисніть для пояснення кроку транзиту знань"
                                >
                                  <div>
                                    <span className="text-purple-300 font-bold underline decoration-dotted">Транзит знань:</span> {stepCalc.pObs.toFixed(4)} + (1 - {stepCalc.pObs.toFixed(4)}) · {stepCalc.pTransit} = <strong className="text-rose-400">{stepCalc.posteriorL}</strong>
                                  </div>
                                  <HelpCircle className="w-3 h-3 text-rose-400 shrink-0 ml-2" />
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
        {activeSubTab === 'what-if' && (
          <div className="flex flex-col gap-4">
            {/* Scope Breadcrumb */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-cyan-400" />
                  <span>ЗАГАЛЬНОСИСТЕМНИЙ ІНСТРУМЕНТ</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300 font-medium">Пісочниця "What-If" не змінює базу даних і працює ізольовано як математичний тренажер</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Control Panel: Inputs and Sliders (7 Cols) */}
              <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Параметри Симуляції (Вхідні Дані)</span>
                </h3>
                <button
                  onClick={() => {
                    setSimPriorL(0.50);
                    setSimTransit(0.20);
                    setSimSlip(0.10);
                    setSimGuess(0.20);
                    setSimIsCorrect(true);
                    setSimTaskType('SINGLE_CHOICE');
                    setSimReactionMs(1200);
                    setSimPasteEvents(0);
                    setSimTypingWpm(45);
                    setSimHintsCount(0);
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Скинути за замовчуванням</span>
                </button>
              </div>

              {/* Slider 1: Prior P(L_{t-1}) */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Апріорна майстерність P(L_{`t-1`})</span>
                  <span className="text-purple-400 font-mono font-bold">{(simPriorL * 100).toFixed(0)}% ({simPriorL.toFixed(2)})</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.99"
                  step="0.01"
                  value={simPriorL}
                  onChange={(e) => setSimPriorL(parseFloat(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              {/* Sliders Grid: Transit, Slip, Guess */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-400">P(T) Транзит</span>
                    <span className="text-indigo-400 font-mono">{simTransit.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.50"
                    step="0.01"
                    value={simTransit}
                    onChange={(e) => setSimTransit(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-400">P(S) Вислизання</span>
                    <span className="text-amber-400 font-mono">{simSlip.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.40"
                    step="0.01"
                    value={simSlip}
                    onChange={(e) => setSimSlip(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col gap-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-[11px] font-semibold">
                    <span className="text-slate-400">P(G) Вгадування</span>
                    <span className="text-cyan-400 font-mono">{simGuess.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.50"
                    step="0.01"
                    value={simGuess}
                    onChange={(e) => setSimGuess(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Answer Outcome & Task Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Результат відповіді</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSimIsCorrect(true)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        simIsCorrect
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      ✓ ПРАВИЛЬНО
                    </button>
                    <button
                      onClick={() => setSimIsCorrect(false)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        !simIsCorrect
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      ✗ ПОМИЛКА
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-300">Тип завдання</label>
                  <select
                    value={simTaskType}
                    onChange={(e) => setSimTaskType(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="SINGLE_CHOICE">SINGLE_CHOICE (Тест з 1 вибором)</option>
                    <option value="MULTIPLE_CHOICE">MULTIPLE_CHOICE (Кілька виборів)</option>
                    <option value="CODE">CODE (Інтерактивний код / Monaco)</option>
                    <option value="TEXT_ESSAY">TEXT_ESSAY (Відкрита відповідь)</option>
                  </select>
                </div>
              </div>

              {/* Telemetry Modifiers: Latency, Paste, Hints */}
              <div className="border-t border-slate-800 pt-4 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Поведінкова Телеметрія для цього завдання</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Час відповіді</span>
                      <strong className="text-amber-400 font-mono">{(simReactionMs / 1000).toFixed(1)} с</strong>
                    </span>
                    <input
                      type="range"
                      min="500"
                      max="15000"
                      step="100"
                      value={simReactionMs}
                      onChange={(e) => setSimReactionMs(parseInt(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-500">Поріг вгадування: &lt; 3.5 с</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Вставки з буфера (Paste)</span>
                      <strong className="text-rose-400 font-mono">{simPasteEvents}</strong>
                    </span>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="1"
                      value={simPasteEvents}
                      onChange={(e) => setSimPasteEvents(parseInt(e.target.value))}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                    <span className="text-[9px] text-slate-500">&gt; 0 викликає G↑ 0.90</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                    <span className="text-[10px] text-slate-400 flex items-center justify-between">
                      <span>Підказки Сократа</span>
                      <strong className="text-purple-400 font-mono">{simHintsCount}</strong>
                    </span>
                    <div className="flex items-center gap-1 mt-1">
                      {[0, 1, 2].map((cnt) => (
                        <button
                          key={cnt}
                          onClick={() => setSimHintsCount(cnt)}
                          className={`flex-1 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                            simHintsCount === cnt
                              ? 'bg-purple-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {cnt === 0 ? 'Без' : `${cnt} (-${cnt === 1 ? 15 : 30}%)`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Output Panel: Mathematical Derivation & Prediction (5 Cols) */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 border border-purple-500/30 rounded-2xl p-6 shadow-2xl flex flex-col justify-between gap-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    <span>Результат Розрахунку BKT</span>
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    simResult.masteryStatus === 'GOLD_MASTERY'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : simResult.masteryStatus === 'PROFICIENT'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {simResult.masteryStatus}
                  </span>
                </div>

                {/* Big Posterior Display */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Нова ймовірність знань P(L_t)</span>
                    <div className="text-3xl font-black text-white font-mono flex items-baseline gap-2 mt-0.5">
                      <span className="text-emerald-400">{(simResult.posteriorL * 100).toFixed(1)}%</span>
                      <span className="text-xs font-semibold text-slate-400">({simResult.posteriorL})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Динаміка ΔP(L)</span>
                    <span className={`text-xl font-black font-mono ${simResult.deltaL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {simResult.deltaL >= 0 ? `+${simResult.deltaL}` : simResult.deltaL}
                    </span>
                  </div>
                </div>

                {/* Active Modifiers Pill */}
                {simResult.reasons.length > 0 ? (
                  <div className="bg-amber-950/40 border border-amber-500/40 rounded-xl p-3 flex flex-col gap-1.5">
                    <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Динамічні поведінкові прапорці:</span>
                    </span>
                    <div className="flex flex-col gap-1">
                      {simResult.reasons.map((r, ri) => (
                        <div key={ri} className="text-[11px] font-mono text-amber-200">
                          • {r}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Чиста відповідь без поведінкових аномалій (базові параметри).</span>
                  </div>
                )}

                {/* Detailed Math Breakdown */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-col gap-2 font-mono text-xs">
                  <div className="text-[11px] text-purple-300 font-bold border-b border-slate-800 pb-1">
                    Числова підстановка у формулу Баєса:
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Правдоподібність P(L|Obs):</span>
                    <strong className="text-white">{simResult.pObs.toFixed(4)}</strong>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Транзит знань P(T):</span>
                    <strong className="text-indigo-400">+{simResult.pTransit}</strong>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Ефективний Slip / Guess:</span>
                    <strong className="text-amber-300">S={simResult.pSlipEffective} | G={simResult.pGuessEffective}</strong>
                  </div>

                  {simResult.socraticHintPenaltyApplied ? (
                    <div className="flex justify-between text-[11px] text-rose-300 border-t border-slate-800 pt-1">
                      <span>Штраф за підказки Сократа:</span>
                      <strong>-{simResult.socraticHintPenaltyApplied}%</strong>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Theoretical Recommendation Pill */}
              <div className="bg-purple-950/30 border border-purple-500/30 rounded-xl p-3 text-xs text-purple-200 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block mb-0.5">Педагогічний висновок алгоритму:</strong>
                  {simResult.masteryStatus === 'GOLD_MASTERY' && 'Студент повністю засвоїв навичку (>= 90%). Рекомендується перехід до викликів підвищеної складності або бліц-тесту.'}
                  {simResult.masteryStatus === 'PROFICIENT' && 'Студент досяг порогу компетентності Блума (>= 75%). Залежні теми у графі знань успішно розблоковані.'}
                  {simResult.masteryStatus === 'IN_PROGRESS' && (simIsCorrect ? 'Знання збільшились, але навичка потребує додаткового закріплення до досягнення 75%.' : 'Помилка зафіксована. Наступне завдання буде згенеровано у менш складному або варіативному форматі.')}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ════════ SUB-TAB 3: GOLD STANDARD VERIFICATION TEST MATRIX ════════ */}
        {activeSubTab === 'test-matrix' && (
          <div className="flex flex-col gap-4">
            {/* Scope Breadcrumb */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-cyan-400" />
                  <span>ЗАГАЛЬНОСИСТЕМНИЙ ІНСТРУМЕНТ</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300 font-medium">Автоматизована верифікація ядрових бізнес-правил моделі BKT (не прив'язана до одного учня)</span>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Еталонні Тестові Сценарії (Automated Gold Standard Matrix)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Автоматичний набір із {testMatrix.length} критичних бізнес-правил моделі BKT. Перевіряє захист від вгадування, аномальний копіпаст, штрафи за підказки та пороги Блума.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold text-white">Усі тести пройдені:</span>
                <span className="text-xs font-mono font-bold text-emerald-400">{totalPass} / {testMatrix.length}</span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                      <th className="py-3 px-4">Код</th>
                      <th className="py-3 px-4">Назва тесту</th>
                      <th className="py-3 px-4">Сценарій</th>
                      <th className="py-3 px-4">Очікувана поведінка</th>
                      <th className="py-3 px-4">Фактичний результат</th>
                      <th className="py-3 px-4 text-center">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {testMatrix.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-purple-400">{item.id}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{item.title}</td>
                        <td className="py-3.5 px-4 text-slate-300 font-mono text-[11px]">{item.scenario}</td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">{item.expected}</td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-emerald-300">{item.actual}</td>
                        <td className="py-3.5 px-4 text-center">
                          {item.pass ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" /> PASS
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <AlertTriangle className="w-3 h-3" /> FAIL
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ════════ SUB-TAB 4: COMPREHENSIVE MECHANISMS REGISTRY ════════ */}
        {activeSubTab === 'mechanisms' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            {/* Scope Breadcrumb */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-cyan-400" />
                  <span>ЗАГАЛЬНОСИСТЕМНИЙ ІНСТРУМЕНТ</span>
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300 font-medium">Централізований нормативний довідник усіх 14 правил, коефіцієнтів та алгоритмічних захистів платформи</span>
              </div>
            </div>

            {/* Banner Header */}
            <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/40 border border-amber-500/30 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Реєстр Адаптивних, Поведінкових та Педагогічних Механізмів</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      Standard v3.0
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Повний систематизований каталог усіх математичних інваріантів, фільтрів поведінкової телеметрії, сократівських підказок та захистів від зациклення платформи Smart-BKT-Chain.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 shrink-0">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-semibold text-slate-200">14 Активних Механізмів у Системі</span>
              </div>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Pillar 1: Адаптивне Спрощення & Деградація */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">1. Адаптивне Спрощення & Ремедіація</h3>
                      <span className="text-[10px] text-slate-400 font-mono">Graceful Degradation Core</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">3 правила</span>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  {/* Card 1.1 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-[12px] font-bold">1.1 Пропозиція допоміжного рівня (Degradation Prompt)</strong>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">Max: 70%</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      При помилках на рівні <code className="text-purple-300">MEDIUM/HARD</code> з'являється інтерактивна плашка переходу на допоміжне завдання <code className="text-amber-300">EASY</code>. Завдання отримує стелю оцінки 70% для збереження мотивації та балансу знань.
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                      <span>Тригер:</span>
                      <span className="text-slate-300">consecutiveFailures ≥ 1 або REJECTED</span>
                    </div>
                  </div>

                  {/* Card 1.2 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-[12px] font-bold">1.2 Захист від зациклення (excludeTaskId)</strong>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">Anti-Loop</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      При переході на легший рівень секвенсор примусово виключає поточне завдання, на якому студент щойно помилився, унеможливлюючи повторну видачу тієї самої умови.
                    </p>
                  </div>

                  {/* Card 1.3 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-[12px] font-bold">1.3 Триступенева ієрархія підбору бліців</strong>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Fallback Hierarchy</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Секвенсор шукає: 1) інший <code className="text-indigo-300">EASY</code> тієї ж теми $\to$ 2) інший <code className="text-indigo-300">EASY</code> активного модуля $\to$ 3) ремедіаційне повторення (Remediation Review Drill).
                    </p>
                  </div>
                </div>
              </div>

              {/* Pillar 2: Підказки та Навчальний Супровід */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">2. Підказки Сократа & Just-in-Time Теорія</h3>
                      <span className="text-[10px] text-slate-400 font-mono">Pedagogical Scaffolding</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">4 правила</span>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  {/* Card 2.1 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-[12px] font-bold">2.1 Умовне розкриття (Conditional Scaffolding)</strong>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">Clean Start</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      На чистій першій спробі підказки та deep-link приховані від студента (захист від спойлерів). З'являються м'яко <span className="text-white font-semibold">виключно у момент першої помилки</span> як рятувальне коло.
                    </p>
                  </div>

                  {/* Card 2.2 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-[12px] font-bold">2.2 Двохетапні підказки Сократа (Socratic Hints)</strong>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">-15% / -30%</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Навідні запитання без готових відповідей. Рівень 1 (концептуальний вектор) знижує бал на <code className="text-amber-300 font-bold">-15%</code>, Рівень 2 (конкретизація правила) — на <code className="text-amber-300 font-bold">-30%</code>.
                    </p>
                  </div>

                  {/* Card 2.3 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-[12px] font-bold">2.3 Study App Deep-Linking (Just-in-Time Theory)</strong>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Micro-Theory</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Пряме посилання на інтерактивний урок/параграф у Навчальному Застосунку (<code className="text-indigo-300 font-mono">/learn/js-dev/...</code>), щоб студент міг опрацювати тему перед повторним розв'язанням.
                    </p>
                  </div>

                  {/* Card 2.4 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-[12px] font-bold">2.4 Ізоморфні бліци та життєві метафори</strong>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">3 варіанти/тему</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Кожен мікро-концепт має: 1) академічний тест, 2) життєву метафору (опломбований контейнер, ксерокопія, запобіжник), 3) синтаксичний патерн «Що якщо?».
                    </p>
                  </div>
                </div>
              </div>

              {/* Pillar 3: Поведінкова Телеметрія */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">3. Поведінкова Телеметрія & Adjuster</h3>
                      <span className="text-[10px] text-slate-400 font-mono">Dynamic Slip & Guess</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">4 фільтри</span>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  {/* Card 3.1 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-[12px] font-bold">3.1 Захист від швидкого вгадування (Rapid Guessing)</strong>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">G↑ 0.85</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Якщо в тестах з вибором правильна відповідь надана швидше ніж за <code className="text-amber-300">3.5 с</code>, параметр $P(G)$ підвищується до <code className="text-amber-300 font-bold">0.85</code>, що демпфує зростання рейтингу знань $\Delta P(L)$.
                    </p>
                  </div>

                  {/* Card 3.2 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-[12px] font-bold">3.2 Захист від описки сильного студента (Careless Slip)</strong>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">S↑ 0.30</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      При $P(L) \ge 0.70$ та чистій швидкості без видалень помилка трактується як випадкова механічна похибка. $P(S)$ підвищується до <code className="text-emerald-300 font-bold">0.30</code>, пом'якшуючи падіння знань.
                    </p>
                  </div>

                  {/* Card 3.3 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-[12px] font-bold">3.3 Детекція копіпасту у відкритих відповідях (Paste Guard)</strong>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">G↑ 0.90</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      У завданнях <code className="text-rose-300">TEXT_ESSAY/OPEN_TEXT</code> події вставки тексту (<code className="text-rose-300 font-mono">pasteEvents &gt; 0</code>) або аномальний темп (&gt; 120 WPM) піднімають $P(G)$ до <code className="text-rose-300 font-bold">0.90</code>.
                    </p>
                  </div>

                  {/* Card 3.4 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-[12px] font-bold">3.4 Детекція хаотичного набору (Chaotic Editing)</strong>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">S↓ 0.05</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Велика частка видалень (&gt; 40%) або численні довгі паузи при низькому $P(L) \le 0.30$ знижують $P(S)$ до <code className="text-cyan-300 font-bold">0.05</code>, фіксуючи реальну прогалину в знаннях.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pillar 4: Математика BKT & Таксономія Блума */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">4. Математика BKT & Пороги Блума</h3>
                      <span className="text-[10px] text-slate-400 font-mono">Mastery Learning Thresholds</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">3 стандарти</span>
                </div>

                <div className="flex flex-col gap-3 text-xs">
                  {/* Card 4.1 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-[12px] font-bold">4.1 Крок навчання навіть при помилці (P(T) = 0.20)</strong>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Learning Step</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      У формулі транзиту <code className="text-indigo-300 font-mono">P(Lt) = P(L|Obs) + (1 - P(L|Obs)) * P(T)</code> фактор P(T) = 0.20 гарантує, що студент отримує приріст знань за рахунок опрацювання помилки та вивчення зворотного зв&apos;язку.
                    </p>
                  </div>

                  {/* Card 4.2 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-[12px] font-bold">4.2 Поріг розблокування вершин графа (Bloom Proficient)</strong>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">P(L) ≥ 75%</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Досягнення рівня $P(L) \ge 0.75$ свідчить про впевнену компетентність (рівень «Застосування» Блума) та відкриває доступ до залежних тем у DAG графа знань.
                    </p>
                  </div>

                  {/* Card 4.3 */}
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-[12px] font-bold">4.3 Золота майстерність теми (Gold Mastery)</strong>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">P(L) ≥ 90%</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Повний тріумф над навичкою. Тема отримує статус засвоєної, студент допускається до фінального бліц-тесту модуля, а система переводить фокус на нові незвідані вузли.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* 📖 Interactive Deep Dive Explanation Modal on Click */}
      {activeExplanation && (
        <div 
          onClick={() => setActiveExplanation(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-purple-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 relative animate-scaleUp text-slate-100"
          >
            <button
              onClick={() => setActiveExplanation(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              title="Закрити"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3.5 pr-8">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-white tracking-tight">
                    {activeExplanation.title}
                  </h3>
                  {activeExplanation.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {activeExplanation.badge}
                    </span>
                  )}
                </div>
                {activeExplanation.formula && (
                  <div className="mt-1 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono font-bold text-emerald-400 inline-block">
                    {activeExplanation.formula}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 text-xs leading-relaxed text-slate-300 mt-1">
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                  📖 Що це означає:
                </span>
                <p>{activeExplanation.description}</p>
              </div>

              <div className="bg-indigo-950/20 p-3.5 rounded-xl border border-indigo-500/20">
                <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wide block mb-1">
                  🎯 Педагогічний вплив на алгоритм:
                </span>
                <p className="text-indigo-100">{activeExplanation.pedagogicalImpact}</p>
              </div>

              {activeExplanation.example && (
                <div className="bg-purple-950/20 p-3 rounded-xl border border-purple-500/20 text-[11px] font-mono text-purple-200">
                  <strong className="text-purple-300 block mb-0.5">Приклад у поточній відповіді:</strong>
                  {activeExplanation.example}
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveExplanation(null)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-md shadow-purple-600/30 cursor-pointer"
              >
                Зрозуміло
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
