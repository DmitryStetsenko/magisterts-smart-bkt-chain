import type { CourseDto } from '@sbc/types';

export type CourseItem = Partial<CourseDto> & {
  slug: string;
  title: string;
  category?: string;
};
