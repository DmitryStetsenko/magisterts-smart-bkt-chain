export interface StudentAnalyticsItem {
  studentId: string;
  name: string;
  email: string;
  skillMastery: Record<string, number>; // skillSlug -> pMastery
  avgWpm: number;
  copyPasteRatio: number;
  fatigueIndex: number; // 0.0 to 1.0
  lastActive: string;
}
