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
 * Нормалізатор відносного або абсолютного шляху уроку підручника у валідний міжпортальний URL.
 * Автоматично відображає legacy-шляхи `/learn/...` із банків завдань на актуальні маршрути App Router `apps/study`.
 */
export function resolveStudyUrl(studyUnitUrl: string): string {
  if (studyUnitUrl.startsWith('http://') || studyUnitUrl.startsWith('https://')) {
    return studyUnitUrl;
  }

  const [rawPath, hashPart] = studyUnitUrl.split('#');
  let cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;

  if (cleanPath.startsWith('/learn/')) {
    const lower = cleanPath.toLowerCase();
    if (
      lower.includes('variables-and-types') ||
      lower.includes('variables-declaration') ||
      lower.includes('primitive-types') ||
      lower.includes('type-coercion')
    ) {
      cleanPath = '/courses/web-algorithms-school/school-alg-basics/variables-and-types';
    } else if (
      lower.includes('linear-calculations') ||
      lower.includes('string-templates') ||
      lower.includes('operators')
    ) {
      cleanPath = '/courses/web-algorithms-school/school-alg-basics/linear-calculations';
    } else if (
      lower.includes('boolean-conditions') ||
      lower.includes('grade-evaluation') ||
      lower.includes('branching') ||
      lower.includes('conditional')
    ) {
      cleanPath = '/courses/web-algorithms-school/school-alg-branching/conditional-logic';
    } else if (
      lower.includes('loop') ||
      lower.includes('iteration') ||
      lower.includes('array') ||
      lower.includes('collection') ||
      lower.includes('function')
    ) {
      cleanPath = '/courses/web-algorithms-school/school-alg-loops/loops-and-iteration';
    } else if (lower.includes('dom') || lower.includes('event')) {
      cleanPath = '/courses/web-algorithms-school/school-web-dom-events/dom-manipulation-events';
    } else if (
      lower.includes('project') ||
      lower.includes('validation') ||
      lower.includes('search') ||
      lower.includes('async') ||
      lower.includes('oop')
    ) {
      cleanPath = '/courses/web-algorithms-school/school-web-applied-projects/form-validation-search';
    } else {
      cleanPath = '/courses/web-algorithms-school';
    }
  }

  const baseResolved = buildCrossAppUrl('study', cleanPath);
  return hashPart ? `${baseResolved}#${hashPart}` : baseResolved;
}

