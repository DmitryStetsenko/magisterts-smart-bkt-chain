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

/**
 * Наскрізна таксономія подій екосистеми (Brainstorm #16)
 */
export type ActivityEventType =
  // Підручник (apps/study)
  | 'THEORY_UNIT_ENTERED'
  | 'THEORY_SCROLL_PROGRESS'
  | 'THEORY_PLAYGROUND_RUN'
  | 'THEORY_UNIT_EXITED'
  // Тренажер (apps/student)
  | 'TASK_VIEWED'
  | 'HINT_REQUESTED'
  | 'THEORY_DRAWER_OPENED'
  | 'THEORY_DRAWER_CLOSED'
  | 'CODE_EXECUTION_TEST'
  | 'MISCONCEPTION_TRIGGERED'
  // Академічні рішення
  | 'TASK_ABANDON_PROMPTED'
  | 'TASK_ABANDON_CONFIRMED'
  | 'STUDENT_SKILL_RESET'
  // Результат та телеметрія
  | 'TASK_SUBMITTED'
  | 'TELEMETRY_ANOMALY'
  // Педагогічні інтервенції викладача
  | 'TEACHER_REVIEW_APPROVED'
  | 'TEACHER_REVIEW_REJECTED'
  | 'TEACHER_SUBMISSION_ANNULLED'
  | 'TEACHER_MODULE_REVOKED'
  | 'TEACHER_SCORE_OVERRIDDEN';

export interface StudentActivityLogDto {
  id: string;
  userId: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    role: string;
    avatarUrl?: string | null;
  } | null;
  userName?: string | null;
  userEmail?: string | null;
  actorId: string;
  actorRole: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'RECRUITER';
  courseId?: string | null;
  skillId?: string | null;
  taskId?: string | null;
  submissionId?: string | null;
  eventType: ActivityEventType | string;
  payload: Record<string, any>;
  createdAt: string;
}

export interface CreateActivityLogDto {
  userId: string;
  actorId?: string;
  actorRole?: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'RECRUITER';
  courseId?: string;
  skillId?: string;
  taskId?: string;
  submissionId?: string;
  eventType: ActivityEventType | string;
  payload?: Record<string, any>;
}

export interface AnnulSubmissionPayloadDto {
  submissionId: string;
  teacherId?: string;
  reason: 'PLAGIARISM' | 'AI_GENERATED_SUSPECTED' | 'IRRESPONSIBLE_GUESS' | 'CODE_MISMATCH' | 'OTHER';
  comment: string;
  penaltyMultiplier?: number;
}

