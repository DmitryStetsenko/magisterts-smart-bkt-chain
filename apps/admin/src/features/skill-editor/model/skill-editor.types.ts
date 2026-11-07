import type { BktParametersDto, SkillNodeDto, TaskDifficulty } from '@sbc/types';

export interface AdminSkillNode
  extends Omit<SkillNodeDto, 'description' | 'category' | 'difficulty' | 'parentSkillIds' | 'pInit' | 'pTransit' | 'pSlip' | 'pGuess'>,
    BktParametersDto {
  description: string;
  category: string;
  difficulty: Extract<TaskDifficulty, 'EASY' | 'MEDIUM' | 'HARD'>;
  parentSkillIds: string[];
}
