/**
 * Події поведінкової телеметрії у реальному часі
 */
export type TelemetryEventType =
  | 'KEYSTROKE'
  | 'PASTE'
  | 'FOCUS'
  | 'BLUR'
  | 'HINT_REQUESTED'
  | 'THEORY_OPENED'
  | 'OPTION_SELECTED'
  | 'SUBMISSION_CLICKED';

export interface TelemetryEventDto {
  sessionId: string;
  studentId: string;
  taskId: string;
  eventType: TelemetryEventType;
  timestamp: number;
  payload?: any;
}

export interface BehavioralMetricsDto {
  studentId: string;
  taskId: string;
  wpm: number;
  keystrokeCount: number;
  pasteCount: number;
  focusLostCount: number;
  reactionLatencyMs: number;
  rapidGuessingDetected: boolean;
  fatigueIndex?: number;
}
