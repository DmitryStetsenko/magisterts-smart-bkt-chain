import { MisconceptionMatcher } from './misconception-matcher';
import type { MisconceptionDto } from '@sbc/types';

describe('MisconceptionMatcher', () => {
  const quizMisconceptions: MisconceptionDto[] = [
    {
      id: 'misc-const-reassign',
      triggerOptionId: 'a',
      title: 'Плутанина між let та const',
      explanation: 'Ключове слово const створює незмінну прив’язку — для лічильника потрібно використовувати let.',
      recommendedReviewUrl: '/courses/web-algorithms-school/school-alg-basics/variables-and-types',
    },
    {
      id: 'misc-var-hoisting',
      triggerOptionId: 'c',
      title: 'Застаріле оголошення var',
      explanation: 'var ігнорує блочну область видимості та може спричинити витік змінної за межі блоку.',
    },
  ];

  const codeMisconceptions: MisconceptionDto[] = [
    {
      id: 'misc-assign-in-if',
      triggerPattern: 'if\\s*\\([^=)]*=[^=]',
      title: 'Присвоєння (=) замість порівняння (===) в умові if',
      explanation: 'Одинарний знак = записує значення у змінну замість перевірки рівності. Використовуйте ===.',
    },
    {
      id: 'misc-const-mutation-error',
      triggerPattern: 'Assignment to constant variable',
      title: 'Спроба перезаписати константу під час виконання',
      explanation: 'Змінна була оголошена через const, тому її не можна змінювати у циклі або формулі.',
    },
  ];

  it('never triggers a misconception when the submission passed', () => {
    const result = MisconceptionMatcher.matchSubmission(quizMisconceptions, {
      taskType: 'SINGLE_CHOICE',
      isPassed: true,
      selectedOptionId: 'a',
    });
    expect(result).toBeNull();
  });

  it('matches SINGLE_CHOICE distractor by triggerOptionId', () => {
    const result = MisconceptionMatcher.matchSubmission(quizMisconceptions, {
      taskType: 'SINGLE_CHOICE',
      isPassed: false,
      selectedOptionId: 'a',
    });
    expect(result).not.toBeNull();
    expect(result?.id).toBe('misc-const-reassign');
  });

  it('matches MULTIPLE_CHOICE wrong distractor and missing:<id> rule', () => {
    const multiMisc: MisconceptionDto[] = [
      {
        id: 'misc-wrong-party',
        triggerOptionId: 'c',
        title: 'Плутанина між правом та обов’язком',
        explanation: 'Участь у політичних партіях є правом громадянина (ст. 36 КУ), а не конституційним обов’язком.',
      },
      {
        id: 'misc-missing-taxes',
        triggerOptionId: 'missing:b',
        title: 'Пропущено конституційний обов’язок сплати податків',
        explanation: 'Стаття 67 Конституції України прямо закріплює обов’язок кожного сплачувати податки і збори.',
      },
    ];

    const distractorHit = MisconceptionMatcher.matchSubmission(multiMisc, {
      taskType: 'MULTIPLE_CHOICE',
      isPassed: false,
      selectedOptionIds: ['a', 'c'],
    });
    expect(distractorHit?.id).toBe('misc-wrong-party');

    const missingHit = MisconceptionMatcher.matchSubmission(multiMisc, {
      taskType: 'MULTIPLE_CHOICE',
      isPassed: false,
      selectedOptionIds: ['a', 'd'],
    });
    expect(missingHit?.id).toBe('misc-missing-taxes');
  });

  it('matches CODE submission against source regex pattern and runtime error output', () => {
    const sourceHit = MisconceptionMatcher.matchSubmission(codeMisconceptions, {
      taskType: 'CODE',
      isPassed: false,
      code: 'function check(x) {\n  if (x = 5) return true;\n  return false;\n}',
      failedOutputs: ['false'],
    });
    expect(sourceHit?.id).toBe('misc-assign-in-if');

    const runtimeHit = MisconceptionMatcher.matchSubmission(codeMisconceptions, {
      taskType: 'CODE',
      isPassed: false,
      code: 'const count = 0; count = count + 1;',
      failedOutputs: ['Error: Assignment to constant variable.'],
    });
    expect(runtimeHit?.id).toBe('misc-const-mutation-error');
  });

  it('handles invalid regex patterns gracefully via case-insensitive substring fallback', () => {
    const brokenRegexMisc: MisconceptionDto[] = [
      {
        id: 'misc-unclosed-bracket',
        triggerPattern: 'arr[0',
        title: 'Незакрита квадратна дужка індексації',
        explanation: 'Перевірте синтаксис звернення до елемента масиву arr[0].',
      },
    ];

    const hit = MisconceptionMatcher.matchSubmission(brokenRegexMisc, {
      taskType: 'CODE',
      isPassed: false,
      code: 'const first = arr[0;',
    });
    expect(hit?.id).toBe('misc-unclosed-bracket');
  });

  it('normalizes both legacy string[] and MisconceptionDto[] for OpenAnswerEvaluatorService', () => {
    const mixed = [
      'Звільнення на лікарняному дозволене завжди',
      {
        id: 'm1',
        title: 'Ігнорування ст. 40 КЗпП',
        explanation: 'Роботодавець не має права звільняти працівника в період тимчасової непрацездатності.',
      },
    ];

    const normalized = MisconceptionMatcher.normalizeForOpenText(mixed);
    expect(normalized).toHaveLength(2);
    expect(normalized[0]).toContain('Звільнення на лікарняному');
    expect(normalized[1]).toContain('Ігнорування ст. 40 КЗпП');
  });
});
