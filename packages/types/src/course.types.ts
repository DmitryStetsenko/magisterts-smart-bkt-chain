import { SkillNodeDto } from './sequencing.types';

/**
 * Модуль навчального курсу (дидактична підструктура курсу)
 */
export interface CourseModuleDto {
  id: string;
  courseId: string;
  slug: string;
  title: string;
  description?: string | null;
  orderIndex: number;
  theoryUrl?: string | null;
  minMasteryThreshold?: number;
  skills?: SkillNodeDto[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * DTO створення нового модуля в курсі
 */
export interface CreateCourseModuleDto {
  title: string;
  slug?: string;
  description?: string;
  orderIndex?: number;
  theoryUrl?: string;
  minMasteryThreshold?: number;
}

/**
 * DTO оновлення модуля в курсі
 */
export interface UpdateCourseModuleDto {
  title?: string;
  slug?: string;
  description?: string;
  orderIndex?: number;
  theoryUrl?: string;
  minMasteryThreshold?: number;
}

/**
 * Предметна категорія / галузь знань навчальних курсів
 */
export interface CourseCategoryDto {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  orderIndex: number;
  coursesCount?: number;
  courses?: any[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * DTO створення нової категорії курсів
 */
export interface CreateCourseCategoryDto {
  title: string;
  slug?: string;
  description?: string;
  icon?: string;
  orderIndex?: number;
}

/**
 * DTO оновлення категорії курсів
 */
export interface UpdateCourseCategoryDto {
  title?: string;
  slug?: string;
  description?: string;
  icon?: string;
  orderIndex?: number;
}

/**
 * DTO оновлення параметрів курсу
 */
export interface UpdateCourseDto {
  title?: string;
  slug?: string;
  description?: string;
  icon?: string;
  targetAudience?: string;
  isPublished?: boolean;
  defaultMasteryThreshold?: number;
  categoryId?: string | null;
}

/**
 * DTO створення курсу
 */
export interface CreateCourseDto {
  title: string;
  slug?: string;
  description?: string;
  icon?: string;
  targetAudience?: string;
  isPublished?: boolean;
  defaultMasteryThreshold?: number;
  categoryId?: string | null;
}

/**
 * DTO імпорту структури курсу з таблиць (Excel / Google Sheets)
 */
export interface ImportCourseWorkbookDto {
  course: {
    title: string;
    slug: string;
    category?: string;
    description?: string;
    targetAudience?: string;
    difficultyLevel?: string;
    bktMasteryThreshold?: number;
    icon?: string;
    isPublished?: boolean;
  };
  modules: Array<{
    orderIndex: number;
    title: string;
    slug: string;
    theoryUrl?: string;
    bktThreshold?: number;
    description?: string;
  }>;
  skills: Array<{
    moduleSlug: string;
    orderIndex: number;
    title: string;
    slug: string;
    difficulty?: string;
    prerequisites?: string;
    pL0?: number;
    pT?: number;
    pS?: number;
    pG?: number;
  }>;
  theories?: Array<{
    moduleSlug: string;
    hookIntro?: string;
    conceptsMarkdown?: string;
    codeLang?: string;
    codeSnippet?: string;
    codeExplanation?: string;
    misconceptionTitle?: string;
    misconceptionExplanation?: string;
    takeawaysList?: string;
  }>;
  tasks?: Array<{
    skillSlug: string;
    orderIndex?: number;
    taskType?: string;
    difficulty?: string;
    title: string;
    prompt: string;
    starterCode?: string;
    testCasesJson?: string;
    hintsList?: string;
  }>;
  overwriteExisting?: boolean;
}

/**
 * DTO запиту на генерацію каркасу курсу за допомогою ШІ (Gemini 2.5 API)
 */
export interface AiCourseScaffoldRequestDto {
  prompt: string;
  targetAudience?: string;
  category?: string;
  moduleCount?: number;
  tasksPerSkill?: number;
  targetPl?: number;
  apiKey?: string;
}

/**
 * Канонічна структура розібраного курсу з 5 аркушів для передачі між ШІ/клієнтом та бекендом
 */
export type ParsedCourseImportDto = ImportCourseWorkbookDto;


