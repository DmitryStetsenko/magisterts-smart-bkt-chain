/**
 * Behavioral Adjuster — динамічна корекція параметрів BKT (Slip / Guess)
 * на основі поведінкової телеметрії для ОДНІЄЇ конкретної відповіді.
 *
 * Чистий доменний модуль: без залежностей від NestJS / Prisma.
 * Скориговані значення НЕ мають зберігатися як базові параметри у bkt_states.
 */

export interface BehavioralSignals {
  /** Тип завдання (SINGLE_CHOICE, MULTIPLE_CHOICE, CODE, ESSAY, ...) */
  taskType: string;
  /** Чи правильна відповідь */
  isCorrect: boolean;
  /** Поточна ймовірність засвоєння P(L) */
  currentMastery: number;
  /** Час від показу завдання до відповіді, мс */
  reactionLatencyMs?: number;
  /** Частка стирань серед усіх натискань (0..1) */
  deletionRatio?: number;
  /** Кількість довгих пауз під час набору */
  pauseCount?: number;
  /** Частка пройдених тестів для CODE (0..1) */
  passedTestsRatio?: number;
}

export interface BaseSlipGuess {
  pSlip: number;
  pGuess: number;
}

export interface AdjustedSlipGuess extends BaseSlipGuess {
  /** Людинозрозумілі пояснення корекцій (для bkt_histories / викладача) */
  reasons: string[];
}

export const ADJUSTER_CONFIG = {
  FAST_CHOICE_LATENCY_MS: 3500,
  GUESS_ON_FAST_CHOICE: 0.85,
  HIGH_MASTERY: 0.7,
  LOW_MASTERY: 0.3,
  CONFIDENT_DELETION_RATIO: 0.15,
  CHAOTIC_DELETION_RATIO: 0.4,
  CHAOTIC_PAUSE_COUNT: 5,
  NEAR_PASS_TESTS_RATIO: 0.7,
  SLIP_CARELESS: 0.3,
  SLIP_EDGE_CASE: 0.25,
  SLIP_TRUE_LACK: 0.05,
  MIN_P: 0.01,
  MAX_P: 0.9,
} as const;

const CHOICE_TYPES = new Set(['SINGLE_CHOICE', 'MULTIPLE_CHOICE']);

export class BehavioralAdjuster {
  static adjust(base: BaseSlipGuess, s: BehavioralSignals): AdjustedSlipGuess {
    const C = ADJUSTER_CONFIG;
    let { pSlip, pGuess } = base;
    const reasons: string[] = [];

    // ── Guess: занадто швидка правильна відповідь у тестах з вибором ──
    if (
      s.isCorrect &&
      CHOICE_TYPES.has(s.taskType) &&
      s.reactionLatencyMs !== undefined &&
      s.reactionLatencyMs > 0 &&
      s.reactionLatencyMs < C.FAST_CHOICE_LATENCY_MS
    ) {
      pGuess = Math.max(pGuess, C.GUESS_ON_FAST_CHOICE);
      reasons.push(`G↑ ${pGuess}: відповідь за ${s.reactionLatencyMs} мс — можливе вгадування`);
    }

    // ── Slip: аналізується лише для неправильних відповідей ──
    if (!s.isCorrect) {
      const chaotic =
        (s.deletionRatio ?? 0) >= C.CHAOTIC_DELETION_RATIO ||
        (s.pauseCount ?? 0) >= C.CHAOTIC_PAUSE_COUNT;

      if (chaotic) {
        if (s.currentMastery <= C.LOW_MASTERY) {
          pSlip = Math.min(pSlip, C.SLIP_TRUE_LACK);
          reasons.push(`S↓ ${pSlip}: хаотичні правки при низькому засвоєнні — справжнє незнання`);
        }
        // інакше — залишаємо базовий S (учень губиться)
      } else if (
        s.taskType === 'CODE' &&
        s.passedTestsRatio !== undefined &&
        s.passedTestsRatio >= C.NEAR_PASS_TESTS_RATIO &&
        s.passedTestsRatio < 1
      ) {
        pSlip = Math.max(pSlip, C.SLIP_EDGE_CASE);
        reasons.push(`S↑ ${pSlip}: пройдено ${Math.round(s.passedTestsRatio * 100)}% тестів — неуважність на граничному випадку`);
      } else if (
        s.currentMastery >= C.HIGH_MASTERY &&
        s.deletionRatio !== undefined &&
        s.deletionRatio <= C.CONFIDENT_DELETION_RATIO
      ) {
        pSlip = Math.max(pSlip, C.SLIP_CARELESS);
        reasons.push(`S↑ ${pSlip}: впевнений набір при високому засвоєнні — ймовірна описка`);
      }
    }

    return {
      pSlip: clamp(pSlip, C.MIN_P, C.MAX_P),
      pGuess: clamp(pGuess, C.MIN_P, C.MAX_P),
      reasons,
    };
  }
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
