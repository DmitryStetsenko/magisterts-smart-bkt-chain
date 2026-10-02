/**
 * BKT Core Parameters & Domain Types
 */

export interface BktParameters {
  pMastery: number; // P(L_t) - Current probability of mastery
  pTransit: number; // P(T) - Probability of transition/learning
  pSlip: number;    // P(S) - Probability of slip (error despite knowing)
  pGuess: number;   // P(G) - Probability of guess (correct response despite not knowing)
}

export interface BktUpdateResult {
  pMasteryPrior: number;
  pMasteryPosterior: number;
  isCorrect: boolean;
  timestamp: Date;
}
