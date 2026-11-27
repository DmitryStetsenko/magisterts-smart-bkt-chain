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
  socraticHintPenaltyApplied?: number;
}

export interface GoldStandardTestItem {
  id: string;
  title: string;
  scenario: string;
  expected: string;
  pass: boolean;
  actual: string;
}

/**
 * Еталонний розрахунок BKT з поведінковими модифікаторами (дзеркало серверного BktEngine + BehavioralAdjuster).
 */
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
  const { priorL, pTransit, pSlip: pSlipBase, pGuess: pGuessBase, isCorrect, socraticHintsCount = 0 } = params;
  let pSlipEff = pSlipBase;
  let pGuessEff = pGuessBase;
  const reasons: string[] = [];

  const isChoice = params.taskType === 'SINGLE_CHOICE' || params.taskType === 'MULTIPLE_CHOICE';
  const isOpenText = params.taskType === 'TEXT_ESSAY' || params.taskType === 'OPEN_TEXT';

  if (
    isCorrect &&
    isChoice &&
    params.reactionLatencyMs !== undefined &&
    params.reactionLatencyMs > 0 &&
    params.reactionLatencyMs < 3500
  ) {
    pGuessEff = Math.max(pGuessEff, 0.85);
    reasons.push(`Швидке вгадування (G↑ 0.85): реакція ${params.reactionLatencyMs}мс < 3500мс`);
  }

  if (
    isCorrect &&
    isOpenText &&
    ((params.pasteEvents && params.pasteEvents > 0) || (params.typingWpm && params.typingWpm > 120))
  ) {
    pGuessEff = Math.max(pGuessEff, 0.9);
    reasons.push(
      `Аномальний темп/вставка тексту (G↑ 0.90): Paste=${params.pasteEvents || 0}, WPM=${params.typingWpm || 0}`,
    );
  }

  if (!isCorrect) {
    const isCareless = (params.deletionRatio ?? 0) < 0.15 && (params.pauseCount ?? 0) <= 2 && priorL >= 0.7;
    if (isCareless) {
      pSlipEff = 0.3;
      reasons.push(
        `Випадкова описка впевненого студента (S↑ 0.30): P(L)=${(priorL * 100).toFixed(0)}%, висока швидкість`,
      );
    }
  }

  let hintPenalty = 0;
  if (socraticHintsCount === 1) {
    hintPenalty = 15;
    reasons.push('Підказка Сократа №1: штрафний коефіцієнт -15% до фінального балу');
  } else if (socraticHintsCount >= 2) {
    hintPenalty = 30;
    reasons.push('Підказка Сократа №2: штрафний коефіцієнт -30% до фінального балу');
  }

  const pL = Math.max(0.0001, Math.min(0.9999, priorL));
  let numerator: number;
  let denominator: number;

  if (isCorrect) {
    numerator = pL * (1 - pSlipEff);
    denominator = pL * (1 - pSlipEff) + (1 - pL) * pGuessEff;
  } else {
    numerator = pL * pSlipEff;
    denominator = pL * pSlipEff + (1 - pL) * (1 - pGuessEff);
  }

  const pObs = denominator > 0 ? numerator / denominator : pL;
  const posteriorRaw = pObs + (1 - pObs) * pTransit;
  const clampedPosterior = Math.max(0.0001, Math.min(0.9999, posteriorRaw));
  const roundedPosterior = Number(clampedPosterior.toFixed(4));
  const delta = Number((roundedPosterior - priorL).toFixed(4));

  let masteryStatus: 'GOLD_MASTERY' | 'PROFICIENT' | 'IN_PROGRESS' = 'IN_PROGRESS';
  if (roundedPosterior >= 0.9) {
    masteryStatus = 'GOLD_MASTERY';
  } else if (roundedPosterior >= 0.75) {
    masteryStatus = 'PROFICIENT';
  }

  return {
    priorL: pL,
    pTransit,
    pSlipBase,
    pGuessBase,
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

/**
 * Автоматична еталонна матриця верифікації 6 ключових правил BKT.
 */
export function buildGoldStandardTestMatrix(): GoldStandardTestItem[] {
  const specs = [
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
        return {
          pass,
          actual: `P(G)=${rapid.pGuessEffective}, P(L)=${rapid.posteriorL} замість ${normal.posteriorL}`,
        };
      },
    },
    {
      id: 'T2',
      title: 'Захист від описки сильного студента (Careless Slip Protection)',
      scenario: 'P(L)=0.90, неправильна відповідь при впевненому темпі без видалень',
      expected: "P(S) зростає до 0.30, пом'якшуючи падіння знань",
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
        const pass = careless.pSlipEffective === 0.3 && careless.posteriorL > normal.posteriorL;
        return {
          pass,
          actual: `P(S)=${careless.pSlipEffective}, P(L)=${careless.posteriorL} (краще ніж звичайне ${normal.posteriorL})`,
        };
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
        return {
          pass,
          actual: `Підказка 1: -${hint1.socraticHintPenaltyApplied}%, Підказка 2: -${hint2.socraticHintPenaltyApplied}%`,
        };
      },
    },
    {
      id: 'T4',
      title: 'Поріг розблокування графа Блума (Bloom Proficient Threshold)',
      scenario: 'Досягнення P(L) >= 0.75',
      expected: 'Статус PROFICIENT (відкриває дочірні вершини в дереві навичок)',
      fn: () => {
        const sub = computeBktMath({
          priorL: 0.6,
          pTransit: 0.2,
          pSlip: 0.1,
          pGuess: 0.2,
          isCorrect: true,
          taskType: 'SINGLE_CHOICE',
          reactionLatencyMs: 6000,
        });
        const pass = sub.posteriorL >= 0.75 && sub.posteriorL < 0.9 && sub.masteryStatus === 'PROFICIENT';
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
        const pass = sub.posteriorL >= 0.9 && sub.masteryStatus === 'GOLD_MASTERY';
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
        const pass = res.pGuessEffective === 0.9;
        return {
          pass,
          actual: `P(G)=${res.pGuessEffective}, Модифікатор: ${res.reasons.join(', ')}`,
        };
      },
    },
  ];

  return specs.map((t) => {
    const exec = t.fn();
    return {
      id: t.id,
      title: t.title,
      scenario: t.scenario,
      expected: t.expected,
      pass: exec.pass,
      actual: exec.actual,
    };
  });
}
