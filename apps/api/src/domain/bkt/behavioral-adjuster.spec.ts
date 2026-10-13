import { BehavioralAdjuster } from './behavioral-adjuster';
import { BktEngine } from './bkt-engine';

const BASE = { pSlip: 0.1, pGuess: 0.2 };

describe('BehavioralAdjuster (dynamic Slip/Guess)', () => {
  it('keeps base params when no signals', () => {
    const r = BehavioralAdjuster.adjust(BASE, { taskType: 'CODE', isCorrect: true, currentMastery: 0.5 });
    expect(r).toEqual({ ...BASE, reasons: [] });
  });

  it('raises Guess for fast correct choice answer', () => {
    const r = BehavioralAdjuster.adjust(BASE, {
      taskType: 'SINGLE_CHOICE', isCorrect: true, currentMastery: 0.3, reactionLatencyMs: 900,
    });
    expect(r.pGuess).toBe(0.85);
    expect(r.reasons[0]).toContain('G↑');
  });

  it('does not raise Guess for slow or wrong answers', () => {
    expect(BehavioralAdjuster.adjust(BASE, {
      taskType: 'SINGLE_CHOICE', isCorrect: true, currentMastery: 0.3, reactionLatencyMs: 5000,
    }).pGuess).toBe(0.2);
    expect(BehavioralAdjuster.adjust(BASE, {
      taskType: 'SINGLE_CHOICE', isCorrect: false, currentMastery: 0.3, reactionLatencyMs: 900,
    }).pGuess).toBe(0.2);
  });

  it('raises Slip for confident typo by strong student', () => {
    const r = BehavioralAdjuster.adjust(BASE, {
      taskType: 'CODE', isCorrect: false, currentMastery: 0.9, deletionRatio: 0.05,
    });
    expect(r.pSlip).toBe(0.3);
  });

  it('raises Slip when most code tests pass (edge case miss)', () => {
    const r = BehavioralAdjuster.adjust(BASE, {
      taskType: 'CODE', isCorrect: false, currentMastery: 0.5, passedTestsRatio: 0.8,
    });
    expect(r.pSlip).toBe(0.25);
  });

  it('lowers Slip for chaotic editing at low mastery', () => {
    const r = BehavioralAdjuster.adjust(BASE, {
      taskType: 'CODE', isCorrect: false, currentMastery: 0.2, deletionRatio: 0.6,
    });
    expect(r.pSlip).toBe(0.05);
  });

  it('keeps base Slip for chaotic editing at mid/high mastery', () => {
    const r = BehavioralAdjuster.adjust(BASE, {
      taskType: 'CODE', isCorrect: false, currentMastery: 0.9, deletionRatio: 0.05, pauseCount: 8,
    });
    expect(r.pSlip).toBe(0.1);
  });

  it('softens mastery drop for strong student typo (integration with BktEngine)', () => {
    const adj = BehavioralAdjuster.adjust(BASE, {
      taskType: 'CODE', isCorrect: false, currentMastery: 0.9, deletionRatio: 0.05,
    });
    const fixed = BktEngine.calculateNextState({ pMastery: 0.9, pTransit: 0.1, ...BASE }, false);
    const dynamic = BktEngine.calculateNextState({ pMastery: 0.9, pTransit: 0.1, pSlip: adj.pSlip, pGuess: adj.pGuess }, false);
    expect(dynamic.pMasteryPosterior).toBeGreaterThan(fixed.pMasteryPosterior + 0.2);
  });
});
