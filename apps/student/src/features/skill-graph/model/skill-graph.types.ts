export type SkillStatus = 'MASTERED' | 'IN_PROGRESS' | 'LOCKED';

export interface SkillTelemetryStats {
  wpm: number;
  copyPasteRatio: number;
  fatigueIndex: number;
}

export interface SkillAdjustmentSummary {
  id?: string;
  taskId?: string;
  taskTitle?: string;
  taskType?: string;
  taskDescription?: string;
  taskOptions?: any;
  pSlipUsed?: number | null;
  pGuessUsed?: number | null;
  adjustReasons: string[];
  isCorrect: boolean;
  createdAt: string;
}

export interface SkillGraphNode {
  id: string;
  slug: string;
  title: string;
  description: string;
  pMastery: number;
  status: SkillStatus;
  parentSkillIds: string[];
  tasksCount?: number;
  telemetry?: SkillTelemetryStats;
  recentAdjustments?: SkillAdjustmentSummary[];
  hasGuessAnomaly?: boolean;
  hasCopyPasteAnomaly?: boolean;
  tasks?: any[];
}
