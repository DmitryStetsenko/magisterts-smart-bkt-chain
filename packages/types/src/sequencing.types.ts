import { TaskDifficulty, TaskDto, TaskType } from './tasks.types';
import type { CourseModuleDto } from './course.types';

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
 * Доменне представлення вузла навички для алгоритму секвенування (TaskSequencer)
 */
export interface SkillNodeDomainDto {
  id: string;
  slug: string;
  title: string;
  parentSkillIds: string[];
}

/**
 * Доменне представлення завдання для алгоритму секвенування (TaskSequencer)
 */
export interface TaskDomainDto {
  id: string;
  skillId: string;
  title: string;
  difficulty: string;
  taskType?: string | null;
  topic?: string | null;
  subConcept?: string | null;
}

/**
 * Стан засвоєння навички студентом для секвенсора
 */
export interface StudentSkillStateDto {
  skillId: string;
  pMastery: number;
}

/**
 * Причина вибору завдання алгоритмом TaskSequencer
 */
export type SequencerReasonType =
  | 'PRACTICE_CURRENT_SKILL'
  | 'ADVANCE_NEXT_SKILL'
  | 'REVIEW_COMPLETED'
  | 'MODULE_TASKS_EXHAUSTED';

/**
 * Фактичний результат роботи доменного алгоритму TaskSequencer.recommendNextTask
 */
export interface TaskSequencerResultDto {
  recommendedSkill: SkillNodeDomainDto;
  recommendedTask: TaskDomainDto;
  reason: SequencerReasonType;
  currentMastery: number;
  isExhausted?: boolean;
  isDifficultyDegraded?: boolean;
  maxScoreCap?: number;
}

/**
 * Відповідь ендпоінту GET /api/v1/tasks/recommended
 */
export interface RecommendedTaskResponseDto {
  task: TaskDto;
  recommendation: TaskSequencerResultDto | null;
  hasRemediationTask: boolean;
}

/**
 * Рекомендація секвенсора завдань (розширений високорівневий контракт)
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
  moduleId?: string | null;
  orderIndex?: number;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  difficulty?: TaskDifficulty | string;
  parentSkillIds?: string[];
  childSkillIds?: string[];
  parentDependencies?: Array<{ parentSkillId: string }>;
  tasks?: Array<Partial<TaskDto> & { id: string; title: string }>;
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
  id?: string;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  icon?: string | null;
  targetAudience?: string | null;
  isPublished?: boolean;
  defaultMasteryThreshold?: number;
  modules?: CourseModuleDto[];
  skills?: SkillNodeDto[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
