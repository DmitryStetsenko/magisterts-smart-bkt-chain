import { BookOpen, Code2, Scale } from 'lucide-react';
import type { CourseDto } from '@sbc/types';

export type CourseItem = Omit<Partial<CourseDto>, 'icon'> & {
  slug: string;
  title: string;
  description?: string;
  icon?: any;
  skillSlugs: string[];
};

export const DEFAULT_COURSES: CourseItem[] = [
  {
    slug: 'js-dev',
    title: 'JavaScript & Web Dev',
    icon: Code2,
    skillSlugs: ['js-basics', 'js-functions', 'js-collections', 'js-async', 'js-oop'],
  },
  {
    slug: 'english-b2',
    title: 'Business English (B2)',
    icon: BookOpen,
    skillSlugs: ['eng-grammar', 'eng-vocab', 'eng-writing'],
  },
  {
    slug: 'ukraine-law',
    title: 'Правознавство України',
    icon: Scale,
    skillSlugs: ['law-basics', 'law-constitutional', 'law-case-analysis'],
  },
];
