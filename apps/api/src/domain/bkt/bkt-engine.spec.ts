import { BktEngine } from './bkt-engine';

describe('BktEngine (Bayesian Knowledge Tracing Core)', () => {
  it('should increase P(L_t) after a correct response', () => {
    const initialParams = { pMastery: 0.5, pTransit: 0.2, pSlip: 0.1, pGuess: 0.2 };
    const result = BktEngine.calculateNextState(initialParams, true);

    expect(result.pMasteryPrior).toBe(0.5);
    expect(result.pMasteryPosterior).toBeGreaterThan(0.5);
    expect(result.pMasteryPosterior).toBe(0.8545); // Standard BKT formula calculation
  });

  it('should decrease P(L_t) after an incorrect response', () => {
    const initialParams = { pMastery: 0.5, pTransit: 0.2, pSlip: 0.1, pGuess: 0.2 };
    const result = BktEngine.calculateNextState(initialParams, false);

    expect(result.pMasteryPrior).toBe(0.5);
    expect(result.pMasteryPosterior).toBeLessThan(0.5);
    expect(result.pMasteryPosterior).toBe(0.2889);
  });

  it('should reach mastery threshold (>= 0.95) after consecutive correct responses', () => {
    let pMastery = 0.5;
    const params = { pTransit: 0.2, pSlip: 0.1, pGuess: 0.2 };

    // Response 1: correct
    pMastery = BktEngine.calculateNextState({ ...params, pMastery }, true).pMasteryPosterior;
    expect(pMastery).toBe(0.8545);

    // Response 2: correct
    pMastery = BktEngine.calculateNextState({ ...params, pMastery }, true).pMasteryPosterior;
    expect(pMastery).toBe(0.9708);

    expect(BktEngine.isMastered(pMastery)).toBe(true);
  });

  it('should clamp posterior probability between 0.0001 and 0.9999', () => {
    const highResult = BktEngine.calculateNextState({ pMastery: 0.9999, pTransit: 0.5 }, true);
    expect(highResult.pMasteryPosterior).toBeLessThanOrEqual(0.9999);

    const lowResult = BktEngine.calculateNextState({ pMastery: 0.0001, pSlip: 0.9, pGuess: 0.01 }, false);
    expect(lowResult.pMasteryPosterior).toBeGreaterThanOrEqual(0.0001);
  });
});
