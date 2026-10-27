import { TaskDifficulty, TaskType } from './tasks.types';

/**
 * Тип адаптивного кроку, який рекомендує секвенсор
 */
export type AdaptiveStepType =
  | 'ADVANCE'          // Перехід вперед по графу до наступного вузла чи теми
  | 'REINFORCE'        // Закріплення матеріалу на тому ж рівні
  | 'REMEDIATE'        // Деградація складності або перехід до легшого ізоморфного завдання
  | 'THEORY_REVIEW'    // Пропозиція переглянути теоретичний матеріал перед наступною спробою
  | 'BLOCKED';         // Блокування через невиконані пререквізити

/**
 * Рекомендація секвенсора завдань (TaskSequencer)
 */
export interface SequencingRecommendationDto {
  nextTaskId: string | null;
  recommendedDifficulty: TaskDifficulty;
  stepType: AdaptiveStepType;
  reason: string;
  targetSkillSlug: string;
  targetSkillTitle: string;
  hasRemediationTask: boolean;
  activeModality?: TaskType;
  studyUnitUrl?: string | null;
  suggestedAction?: 'TRY_TASK' | 'READ_THEORY' | 'CALL_TEACHER';
}

/**
 * DTO представлення вузла навички в графі (Skill DAG Node)
 */
export interface SkillNodeDto {
  id: string;
  courseId?: string | null;
  slug: string;
  title: string;
  description: string;
  category: string;
  difficulty: TaskDifficulty;
  parentSkillIds?: string[];
  childSkillIds?: string[];
  requiredMastery?: number;
  pInit?: number;
  pTransit?: number;
  pSlip?: number;
  pGuess?: number;
}

/**
 * Курс або навчальна дисципліна
 */
export interface CourseDto {
  id: string;
  slug: string;
  title: string;
  description: string;
  category?: string;
  icon?: string | null;
  skills?: SkillNodeDto[];
}
