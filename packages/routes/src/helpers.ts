import { AppName, getAppBaseUrl } from './apps';

/**
 * Побудова абсолютного URL для міжпортального переходу з підтримкою query-параметрів
 */
export function buildCrossAppUrl(
  targetApp: AppName,
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>
): string {
  const baseUrl = getAppBaseUrl(targetApp);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(normalizedPath, baseUrl);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Хелпер переходу з підручника apps/study до тренажера apps/student (Шлюз перевірки компетенції)
 */
export function buildStudyToPracticeUrl(
  courseSlug: string,
  skillSlug: string,
  unitSlug?: string,
  moduleSlug?: string
): string {
  return buildCrossAppUrl('student', `/practice/${courseSlug}/${skillSlug}`, {
    source: 'study',
    unit: unitSlug,
    module: moduleSlug,
  });
}

/**
 * Хелпер переходу з тренажера apps/student до підручника apps/study (Ліквідація когнітивної омани)
 */
export function buildPracticeToStudyUrl(
  courseSlug: string,
  moduleSlug: string,
  unitSlug: string,
  misconceptionId?: string
): string {
  const hash = misconceptionId ? `#misconception-${misconceptionId}` : '';
  const path = `/courses/${courseSlug}/${moduleSlug}/${unitSlug}${hash}`;
  return buildCrossAppUrl('study', path);
}

/**
 * Нормалізатор відносного або абсолютного шляху уроку підручника у валідний міжпортальний URL
 */
export function resolveStudyUrl(studyUnitUrl: string): string {
  if (studyUnitUrl.startsWith('http://') || studyUnitUrl.startsWith('https://')) {
    return studyUnitUrl;
  }
  const cleanPath = studyUnitUrl.startsWith('/') ? studyUnitUrl : `/${studyUnitUrl}`;
  return buildCrossAppUrl('study', cleanPath);
}

