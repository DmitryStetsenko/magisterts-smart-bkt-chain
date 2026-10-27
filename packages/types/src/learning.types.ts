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
