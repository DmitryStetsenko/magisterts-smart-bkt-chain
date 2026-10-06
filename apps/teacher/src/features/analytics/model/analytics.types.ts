export interface StudentAnalyticsItem {
  id?: string;
  studentId?: string;
  name: string;
  email: string;
  averageMastery?: number;
  bktBySkill?: Record<string, number>;
  skillMastery?: Record<string, number>;
  wpm?: number;
  avgWpm?: number;
  copyPasteRatio: number;
  fatigueIndex: number;
  unstarted?: boolean;
  lastActive?: string;
}
