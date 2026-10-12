export type SkillStatus = 'MASTERED' | 'IN_PROGRESS' | 'LOCKED';

export interface SkillTelemetryStats {
  wpm: number;
  copyPasteRatio: number;
  fatigueIndex: number;
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
}

