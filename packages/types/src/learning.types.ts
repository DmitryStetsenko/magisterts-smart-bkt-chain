import { MisconceptionDto, SocraticHintDto } from './tasks.types';

/**
 * Теоретична капсула для Just-in-Time навчання
 */
export interface TheoryCapsuleDto {
  id: string;
  topicSlug: string;
  title: string;
  summary: string;
  markdownContent: string;
  codeExamples?: Array<{
    title: string;
    code: string;
    language: string;
  }>;
  keyTakeaways: string[];
  estimatedReadMinutes?: number;
}

/**
 * Стан інтерактивного Сократівського риштування (Scaffolding State)
 */
export interface ScaffoldingStateDto {
  taskId: string;
  totalHintsAvailable: number;
  unlockedHintLevel: number;
  cumulativePenaltyPct: number;
  activeHints: SocraticHintDto[];
  identifiedMisconception?: MisconceptionDto | null;
  theoryOffered: boolean;
}

/**
 * Фідбек адаптивної системи після спроби студента
 */
export interface AdaptiveFeedbackDto {
  isCorrect: boolean;
  score: number;
  message: string;
  misconceptionAlert?: MisconceptionDto | null;
  recommendedTheoryUrl?: string | null;
  canTryAgain: boolean;
  nextStepRecommendation?: string;
}

/**
 * Окрема змістова секція уроку в інтерактивному підручнику
 */
export interface LessonSectionDto {
  id: string;
  title: string;
  badge?: string;
  summary: string;
  conceptExplanation: string;
  codeSnippet?: {
    language: string;
    code: string;
    explanation: string;
  };
  misconceptionAlert?: {
    wrongBelief: string;
    realityExplanation: string;
    fixTip: string;
  };
  keyTakeaways: string[];
}

/**
 * Навчальний урок / юніт у межах модуля
 */
export interface LessonUnitDto {
  slug: string;
  moduleSlug: string;
  moduleNumber: number;
  title: string;
  gradeLevel: string;
  estimatedMinutes: number;
  summary: string;
  sections: LessonSectionDto[];
  /** Чи заблоковано юніт замком (вимагає опанування попередніх навичок) */
  isLocked?: boolean;
  /** Поточний відсоток майстерності P(L_n) * 100 (0..100) */
  masteryScore?: number;
  /** Чи зараховано юніт (майстерність досягнуто) */
  isMastered?: boolean;
  /** Перелік слігів пререквізитів, які необхідно закрити для доступу */
  prerequisiteSlugs?: string[];
  /** Чи доступна можливість скласти екстерном */
  testOutAvailable?: boolean;
}

/**
 * Модуль навчальної програми
 */
export interface CurriculumModuleDto {
  moduleNumber: number;
  moduleSlug: string;
  title: string;
  description: string;
  units: LessonUnitDto[];
  /** Чи заблоковано весь модуль */
  isLocked?: boolean;
  /** Середній рівень опанування модуля (0..100) */
  moduleMasteryScore?: number;
}

/**
 * Питання експрес-діагностики або тесту-екстерну (Test-Out)
 */
export interface DiagnosticQuestionDto {
  id: string;
  skillSlug: string;
  question: string;
  codeSnippet?: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }>;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
}

/**
 * Результат перевірки експрес-діагностики / Test-Out
 */
export interface DiagnosticEvaluationResultDto {
  skillSlug: string;
  passed: boolean;
  scorePct: number;
  newMasteryScore: number;
  unlockedUnits: string[];
  feedbackMessage: string;
}

/**
 * Повна навчальна програма курсу (Curriculum)
 */
export interface CourseCurriculumDto {
  courseSlug: string;
  courseTitle: string;
  description: string;
  gradeLevel: string;
  modules: CurriculumModuleDto[];
}

