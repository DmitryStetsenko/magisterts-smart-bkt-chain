export interface InvariantTestRecord {
  id: number;
  name: string;
  prior: number;
  transit: number;
  slip: number;
  guess: number;
  is_correct: boolean;
  hint_penalty_pct: number;
  posterior: number;
  passed: boolean;
  status: 'PASSED' | 'FAILED';
  formula_obs: string;
  numerator: number;
  denominator: number;
}

export interface InvariantSummary {
  total: number;
  passed: number;
  failed: number;
  all_passed: boolean;
}

export interface LiveAuditRecord {
  timestamp: string;
  userId: string;
  taskId: string;
  prior: number;
  posterior_actual: number;
  posterior_expected: number;
  p_slip: number;
  p_guess: number;
  diff: number;
  is_match: boolean;
  status: string;
}

export interface LiveAuditData {
  log_path: string;
  file_exists: boolean;
  total_events: number;
  task_events: number;
  verified_count: number;
  mismatch_count: number;
  all_matched: boolean;
  records: LiveAuditRecord[];
}

export interface BktVerificationResponse {
  success: boolean;
  timestamp: string;
  exitCode?: number;
  executionTimeMs?: number;
  invariant_tests: InvariantTestRecord[];
  invariant_summary: InvariantSummary;
  live_audit: LiveAuditData;
  rawOutput?: string;
  error?: string;
}
