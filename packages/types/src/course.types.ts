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
