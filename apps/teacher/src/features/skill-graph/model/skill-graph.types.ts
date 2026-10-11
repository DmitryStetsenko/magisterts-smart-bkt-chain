export type SkillStatus = 'MASTERED' | 'IN_PROGRESS' | 'LOCKED';

export interface SkillGraphNode {
  id: string;
  slug: string;
  title: string;
  description: string;
  pMastery: number;
  status: SkillStatus;
  parentSkillIds: string[];
}
