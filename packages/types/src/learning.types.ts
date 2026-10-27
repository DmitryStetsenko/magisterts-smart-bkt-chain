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
