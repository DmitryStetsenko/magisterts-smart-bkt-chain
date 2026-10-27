/**
 * Параметри BKT моделі та оцінки володіння навичкою
 */
export interface BktParametersDto {
  pInit: number;    // P(L_0) - початкова ймовірність знання
  pTransit: number; // P(T) - ймовірність переходу у стан знання
  pSlip: number;    // P(S) - ймовірність помилки при знанні
  pGuess: number;   // P(G) - ймовірність вгадування без знання
}

/**
 * Стан володіння навичкою для студента
 */
export interface BktStateDto {
  id?: string;
  studentId: string;
  skillId: string;
  skillSlug?: string;
  pKnown: number;          // P(L_n) - актуальна ймовірність володіння навичкою [0..1]
  isMastered: boolean;     // Чи досягнуто поріг майстерності (зазвичай >= 0.85 або 0.95)
  totalAttempts: number;
  correctAttempts: number;
  lastUpdated?: string | Date;
}

/**
 * Результат розрахунку оновлення стану BKT
 */
export interface BktUpdateResultDto {
  previousPknown: number;
  newPknown: number;
  isMastered: boolean;
  delta: number;
  skillId: string;
  skillSlug: string;
  adjustedParams?: {
    usedSlip: number;
    usedGuess: number;
    anomalyDetected: boolean;
    anomalyType?: string;
  };
}

/**
 * Аудиторський лог BKT транзакції (для блокчейну та верифікації)
 */
export interface BktAuditRecordDto {
  id: string;
  studentId: string;
  skillId: string;
  skillSlug: string;
  taskId: string;
  pKnownBefore: number;
  pKnownAfter: number;
  isCorrect: boolean;
  telemetrySnapshot?: {
    reactionLatencyMs?: number;
    keystrokeCount?: number;
    pasteCount?: number;
    wpm?: number;
  };
  blockchainProof?: {
    txHash?: string;
    blockNumber?: number;
    verifiedOnChain: boolean;
  };
  timestamp: string | Date;
}
