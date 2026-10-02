import { BktParameters, BktUpdateResult } from './bkt-types';

export class BktEngine {
  /**
   * Default standard BKT parameters if node parameters are not provided
   */
  public static readonly DEFAULT_PARAMS: BktParameters = {
    pMastery: 0.5, // Initial prior probability of knowing the skill P(L_0)
    pTransit: 0.2, // Probability of learning/transitioning P(T)
    pSlip: 0.1,    // Probability of slipping/error despite knowing P(S)
    pGuess: 0.2,   // Probability of guessing correctly P(G)
  };

  /**
   * Mastery threshold for considering a skill node mastered
   */
  public static readonly MASTERY_THRESHOLD = 0.95;

  /**
   * Calculates the posterior probability of mastery P(L_t) after an observation
   * @param currentParams Current BKT parameters (pMastery, pTransit, pSlip, pGuess)
   * @param isCorrect Whether the user answered/completed the task correctly
   * @returns BktUpdateResult containing prior, posterior, and timestamp
   */
  public static calculateNextState(
    currentParams: Partial<BktParameters> & { pMastery: number },
    isCorrect: boolean,
  ): BktUpdateResult {
    const pL = Math.max(0.0001, Math.min(0.9999, currentParams.pMastery));
    const pT = currentParams.pTransit ?? this.DEFAULT_PARAMS.pTransit;
    const pS = currentParams.pSlip ?? this.DEFAULT_PARAMS.pSlip;
    const pG = currentParams.pGuess ?? this.DEFAULT_PARAMS.pGuess;

    let pObs: number;

    if (isCorrect) {
      // P(L_t | correct) = [P(L_{t-1}) * (1 - P(S))] / [P(L_{t-1}) * (1 - P(S)) + (1 - P(L_{t-1})) * P(G)]
      const numerator = pL * (1 - pS);
      const denominator = pL * (1 - pS) + (1 - pL) * pG;
      pObs = numerator / denominator;
    } else {
      // P(L_t | incorrect) = [P(L_{t-1}) * P(S)] / [P(L_{t-1}) * P(S) + (1 - P(L_{t-1})) * (1 - P(G))]
      const numerator = pL * pS;
      const denominator = pL * pS + (1 - pL) * (1 - pG);
      pObs = numerator / denominator;
    }

    // Transition update: P(L_t) = P(L_t | obs) + (1 - P(L_t | obs)) * P(T)
    const pMasteryPosterior = pObs + (1 - pObs) * pT;

    // Clamp value to [0.0001, 0.9999] for numerical stability
    const clampedPosterior = Math.max(0.0001, Math.min(0.9999, pMasteryPosterior));

    return {
      pMasteryPrior: pL,
      pMasteryPosterior: Number(clampedPosterior.toFixed(4)),
      isCorrect,
      timestamp: new Date(),
    };
  }

  /**
   * Helper to check if a mastery probability meets or exceeds threshold (0.95)
   */
  public static isMastered(pMastery: number): boolean {
    return pMastery >= this.MASTERY_THRESHOLD;
  }
}
