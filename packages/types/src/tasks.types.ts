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
  submittedAt: string;
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
  submittedAt: string;
  semanticScore?: number;
  teacherReviewStatus: string;
  referenceAnswer: string | null;
  rubrics: any | null;
  misconceptions: any | null;
  attemptsHistory?: ReviewAttemptDto[];
}
