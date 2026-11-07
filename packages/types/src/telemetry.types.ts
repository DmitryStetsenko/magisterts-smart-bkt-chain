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

/**
 * Клієнтські агреговані метрики набору коду/тексту у реальному часі
 */
export interface TelemetryMetricsDto {
  wpm: number;
  lastPauseMs: number;
  deleteCount: number;
  pasteEvents: number;
  totalKeystrokes: number;
}

/**
 * Payload WebSocket-повідомлення `telemetry_data` між редактором студента та TelemetryGateway
 */
export interface TelemetrySocketPayloadDto {
  sessionId?: string;
  userId: string;
  taskId: string;
  keystrokePauseMs: number;
  wpm: number;
  deleteCount: number;
  pasteEvents: number;
}

/**
 * Push-сповіщення WebSocket про нове подання або зміну статусу перевірки
 */
export interface StudentSubmissionWsNotificationDto {
  userId: string;
  taskId: string;
  skillId: string;
  isPassed: boolean;
  teacherReviewStatus: string;
  submissionId: string;
}
