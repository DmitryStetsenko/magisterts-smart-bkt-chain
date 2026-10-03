export interface TelemetryMetrics {
  wpm: number;
  lastPauseMs: number;
  deleteCount: number;
  pasteEvents: number;
  totalKeystrokes: number;
}

export interface TelemetrySocketPayload {
  sessionId?: string;
  userId: string;
  taskId: string;
  keystrokePauseMs: number;
  wpm: number;
  deleteCount: number;
  pasteEvents: number;
}
