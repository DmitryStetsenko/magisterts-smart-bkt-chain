export interface StudentAnalyticsItem {
  id?: string;
  studentId?: string;
  name: string;
  email: string;
  averageMastery?: number;
  bktBySkill?: Record<string, number>;
  skillMastery?: Record<string, number>;
  telemetryBySkill?: Record<string, { wpm: number; copyPasteRatio: number; fatigueIndex: number }>;
  wpm?: number;
  avgWpm?: number;
  copyPasteRatio: number;
  fatigueIndex: number;
  peakAnomaly?: {
    hasAnomaly: boolean;
    peakSkillSlug?: string;
    peakSkillTitle?: string;
    copyPasteRatio: number;
  };
  unstarted?: boolean;
  lastActive?: string;
}

