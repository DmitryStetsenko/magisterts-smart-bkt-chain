import { Binary, Code, Languages, Scale } from 'lucide-react';

export interface CoursePresetItem {
  id: string;
  presetTitle: string;
  title: string;
  slug: string;
  categorySlug: string;
  targetAudience: string;
  defaultMasteryThreshold: number;
  description: string;
  icon: any;
  color: 'emerald' | 'amber' | 'purple' | 'indigo';
  badge: string;
}

export const COURSE_PRESETS: CoursePresetItem[] = [
  {
    id: 'it-frontend',
    presetTitle: 'Веб-розробка (Frontend / Fullstack)',
    title: 'Сучасна веб-розробка та веб-інтерфейси',
    slug: 'web-engineering-frontend',
    categorySlug: 'prog-it',
    targetAudience: '10–11 класи, Студенти IT-спеціальностей',
    defaultMasteryThreshold: 0.85,
    description:
      'Практичний курс: семантична розмітка HTML5, стилізація CSS Flex/Grid, динамічний JavaScript та робота з DOM.',
    icon: Code,
    color: 'emerald',
    badge: 'P(L) ≥ 0.85 • IT',
  },
  {
    id: 'stem-math',
    presetTitle: 'Точні Науки & Математика (STEM)',
    title: 'Дискретна математика та основи алгоритмізації',
    slug: 'discrete-math-algorithms',
    categorySlug: 'exact-sciences',
    targetAudience: 'Студенти 1–2 курсів ВНЗ, Профільні STEM-ліцеї',
    defaultMasteryThreshold: 0.9,
    description:
      'Фундаментальний курс: теорія графів, комбінаторика, булева алгебра та базові алгоритми з підвищеним порогом BKT.',
    icon: Binary,
    color: 'amber',
    badge: 'P(L) ≥ 0.90 • STEM',
  },
  {
    id: 'law-civics',
    presetTitle: 'Право & Цифрова Безпека',
    title: 'Основи правознавства та цифрове право',
    slug: 'digital-law-civics',
    categorySlug: 'law-social',
    targetAudience: 'Старшокласники, Громадянська освіта, Студенти',
    defaultMasteryThreshold: 0.85,
    description:
      'Конституційні засади правової держави, захист цифрових прав, інтелектуальна власність та захист даних.',
    icon: Scale,
    color: 'purple',
    badge: 'P(L) ≥ 0.85 • Право',
  },
  {
    id: 'languages-english',
    presetTitle: 'Ділова & Технічна Англійська',
    title: 'Business & Tech English (B2)',
    slug: 'business-tech-english',
    categorySlug: 'languages',
    targetAudience: 'IT-фахівці, Студенти міжнародних програм',
    defaultMasteryThreshold: 0.8,
    description:
      'Професійна комунікація для технічних фахівців: технічна документація, ділове листування та підготовка до технічних інтервʼю.',
    icon: Languages,
    color: 'indigo',
    badge: 'P(L) ≥ 0.80 • B2',
  },
];
