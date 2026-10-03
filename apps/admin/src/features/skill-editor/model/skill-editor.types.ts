export interface AdminSkillNode {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  parentSkillIds: string[];
  pInit: number;
  pTransit: number;
  pSlip: number;
  pGuess: number;
}
