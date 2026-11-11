import type { BktEvaluationUpdateDto } from './bkt.types';

/**
 * Модальності та типи завдань платформи Smart-BKT-Chain
 */
export type TaskType = 'CODE' | 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TEXT_ESSAY' | 'OPEN_TEXT';

export type TaskDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'ADVANCED';

export type SubmissionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ERROR';

export type TeacherReviewStatus = 'NONE' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUPERSEDED';

/**
 * Варіант відповіді у квізі
 */
export interface QuizOptionDto {
  id: string;
  text: string;
}

/**
 * Відкритий або секретний тест-кейс для завдання з програмування
 */
export interface TestCaseDto {
  id?: string;
  input: string;
  expectedOutput: string;
  isSecret?: boolean;
}

/**
 * Рівень Сократівської підказки
 */
export interface SocraticHintDto {
  level: number;
  hint: string;
  penaltyPct: number;
}

/**
 * Типова когнітивна омана учня для дидактичного аналізу
 */
export interface MisconceptionDto {
  id: string;
  triggerOptionId?: string;
  triggerPattern?: string;
  title: string;
  explanation: string;
  recommendedReviewUrl?: string;
}

/**
 * Повна DTO модель навчального завдання (Task)
 */
export interface TaskDto {
  id: string;
  skillId: string;
  taskType: TaskType;
  title: string;
  description: string;
  starterCode?: string | null;
  options?: QuizOptionDto[] | null;
  referenceAnswer?: string | null;
  rubrics?: any;
  misconceptions?: MisconceptionDto[] | null;
  socraticHints?: SocraticHintDto[] | null;
  studyUnitUrl?: string | null;
  difficulty: TaskDifficulty;
  topic?: string | null;
  subConcept?: string | null;
  timeLimitMs?: number;
  memoryLimitMb?: number;
  testCases?: TestCaseDto[];
  skill?: {
    id: string;
    slug: string;
    title: string;
    courseId?: string | null;
  };
}

/**
 * DTO для створення нового навчального завдання в банку
 */
export interface CreateTaskDto {
  skillId: string;
  title: string;
  description: string;
  taskType: TaskType;
  difficulty?: TaskDifficulty;
  starterCode?: string;
  options?: QuizOptionDto[];
  referenceAnswer?: string;
  socraticHints?: SocraticHintDto[];
  studyUnitUrl?: string;
  topic?: string;
  subConcept?: string;
  testCases?: TestCaseDto[];
}

/**
 * DTO для створення нової BKT-компетенції (Skill Node)
 */
export interface CreateSkillNodeDto {
  title: string;
  slug?: string;
  description?: string;
  difficulty?: TaskDifficulty;
  category?: string;
  orderIndex?: number;
  pL0?: number;
  pT?: number;
  pS?: number;
  pG?: number;
}

/**
 * Результат виконання та подання завдання студентом
 */
export interface SubmissionDto {
  id?: string;
  taskId: string;
  studentId: string;
  code?: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  status: SubmissionStatus;
  score: number;
  revealedHintLevel?: number;
  appliedPenaltyPct?: number;
  executionTimeMs?: number;
  errorMessage?: string | null;
  feedback?: string | null;
  detectedMisconception?: MisconceptionDto | null;
  createdAt?: string | Date;
}

/**
 * Спроба учня для історії перевірки викладачем
 */
export interface ReviewAttemptDto {
  id: string;
  attemptNumber: number;
  answerText: string;
  status: string;
  teacherReviewStatus: string;
  teacherComment?: string | null;
  submittedAt: string | Date;
}

/**
 * Елемент черги ручної перевірки робіт викладачем
 */
export interface ReviewQueueItemDto {
  submissionId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  skillId?: string;
  skillSlug?: string;
  skillTitle: string;
  answerText: string;
  attemptNumber?: number;
  totalAttempts?: number;
  submittedAt: string | Date;
  semanticScore?: number;
  teacherReviewStatus: string;
  teacherComment?: string | null;
  referenceAnswer: string | null;
  rubrics: any | null;
  misconceptions: any | null;
  attemptsHistory?: ReviewAttemptDto[];
}

/**
 * Вхідний контракт запиту на перевірку завдання (POST /api/v1/bkt/evaluate)
 */
export interface SubmitTaskPayloadDto {
  userId?: string;
  taskId: string;
  code?: string;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  essayAnswer?: string;
  reactionLatencyMs?: number;
  deletionRatio?: number;
  pauseCount?: number;
  pasteEvents?: number;
  typingWpm?: number;
  revealedHintLevel?: number;
  appliedPenaltyPct?: number;
  isAbandoned?: boolean;
}

/**
 * Результат виконання окремого тест-кейсу для задачі з кодом
 */
export interface CodeTestDetailDto {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

/**
 * Конфігурація рубрик для багаторівневого семантичного оцінювання відкритих відповідей
 */
export interface SemanticJudgeRubricsDto {
  keywords?: string[];
  minWords?: number;
  maxWords?: number;
  criteria?: Array<{ name: string; weight: number; description: string }>;
}

/**
 * Вихідний контракт семантичного оцінювача (OpenAnswerEvaluatorService)
 */
export interface SemanticEvaluationOutputDto {
  tierUsed: 'TIER_1_HEURISTICS' | 'TIER_2_SIMILARITY' | 'TIER_3_LLM_JUDGE';
  isPassed: boolean;
  score: number;
  confidenceScore: number;
  correctness: number;
  completeness: number;
  keyConceptsCovered: string[];
  missingConcepts: string[];
  detectedMisconceptions: string[];
  studentFeedback: string;
  needsTeacherReview: boolean;
  reasons: string[];
}

/**
 * Повна відповідь ендпоінту POST /api/v1/bkt/evaluate для кабінету студента
 */
export interface TaskEvaluationResponseDto {
  submissionId: string;
  isPassed: boolean;
  feedback: string;
  semanticScore?: number;
  teacherReviewStatus: TeacherReviewStatus | string;
  semanticDetails?: SemanticEvaluationOutputDto | null;
  testDetails?: CodeTestDetailDto[];
  taskType: TaskType | string;
  bktUpdate?: BktEvaluationUpdateDto;
  teacherComment?: string | null;
  detectedMisconception?: MisconceptionDto | null;
  recommendedTheoryUrl?: string | null;
  offerJustInTimeTheory?: boolean;
  appliedHintPenaltyPct?: number;
}
