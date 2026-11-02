/**
 * Канонічний Реєстр Маршрутів платформи Smart-BKT-Chain
 * Відповідно до Правила 10 AGENTS.md та Brainstorm 12 (docs/brainstorm/12_seo_routing_architecture.md)
 */

export interface DeepLinkStudyParams {
  source?: 'study';
  unit?: string;
  module?: string;
}

export interface DeepLinkMisconceptionParams {
  misconceptionId?: string;
}

export const ROUTES = {
  /**
   * Підручник теорії та довідник концепцій (apps/study, порт 3006)
   */
  study: {
    root: '/',
    course: (courseSlug: string) => `/courses/${courseSlug}`,
    module: (courseSlug: string, moduleSlug: string) => `/courses/${courseSlug}/${moduleSlug}`,
    unit: (courseSlug: string, moduleSlug: string, unitSlug: string) =>
      `/courses/${courseSlug}/${moduleSlug}/${unitSlug}`,
    misconception: (courseSlug: string, moduleSlug: string, unitSlug: string, misconceptionId: string) =>
      `/courses/${courseSlug}/${moduleSlug}/${unitSlug}#misconception-${misconceptionId}`,
  },

  /**
   * Інтерактивний тренажер навичок BKT (apps/student, порт 3002)
   */
  student: {
    root: '/',
    practice: (courseSlug: string, skillSlug: string) => `/practice/${courseSlug}/${skillSlug}`,
    practiceWithContext: (courseSlug: string, skillSlug: string, params?: DeepLinkStudyParams) => {
      const base = `/practice/${courseSlug}/${skillSlug}`;
      if (!params) return base;
      const search = new URLSearchParams();
      if (params.source) search.set('source', params.source);
      if (params.unit) search.set('unit', params.unit);
      if (params.module) search.set('module', params.module);
      const queryStr = search.toString();
      return queryStr ? `${base}?${queryStr}` : base;
    },
  },

  /**
   * Кабінет викладача та когортна аналітика (apps/teacher, порт 3003)
   */
  teacher: {
    root: '/',
    curriculum: (courseSlug: string, skillSlug?: string) =>
      skillSlug ? `/curriculum/${courseSlug}/${skillSlug}` : `/curriculum/${courseSlug}`,
    studentAudit: (studentId: string, courseSlug?: string) =>
      courseSlug ? `/audit/${studentId}?course=${courseSlug}` : `/audit/${studentId}`,
    reviews: (courseSlug?: string) =>
      courseSlug ? `/reviews?course=${courseSlug}` : `/reviews`,
  },

  /**
   * CMS редагування графу навичок та BKT параметрів (apps/admin, порт 3004)
   */
  admin: {
    root: '/',
    graph: (courseSlug: string, skillSlug?: string) =>
      skillSlug ? `/graph/${courseSlug}/${skillSlug}` : `/graph/${courseSlug}`,
    courses: '/courses',
    bktTuning: '/bkt-tuning',
  },

  /**
   * Портал системної документації (apps/docs, порт 3005)
   */
  docs: {
    root: '/',
    roadmap: '/roadmap',
    architecture: '/architecture',
    telemetry: '/telemetry',
    tasks: '/tasks',
  },

  /**
   * Публічний лендинг платформи (apps/web, порт 3001)
   */
  web: {
    root: '/',
  },
} as const;
