import {
  OpenTextHeuristicEvaluator,
  OpenTextRubricConfig,
} from './open-text-heuristic-evaluator';

describe('OpenTextHeuristicEvaluator (Domain Unit Tests)', () => {
  const sampleConfig: OpenTextRubricConfig = {
    minWords: 5,
    keywords: ['декоратор|wrapping', 'функція|target', 'метадані|reflect'],
    minCoverageThreshold: 0.6,
    taskQuestion: 'Поясніть концепцію та призначення декораторів у мові TypeScript.',
  };

  it('повинен зарахувати змістовну відповідь із покриттям ключових понять', () => {
    const answer =
      'Декоратор це спеціальна функція обгортка яка дозволяє модифікувати клас та читати метадані.';
    const res = OpenTextHeuristicEvaluator.evaluate(answer, sampleConfig);

    expect(res.isPassed).toBe(true);
    expect(res.score).toBeGreaterThanOrEqual(0.7);
    expect(res.coveredKeywords.length).toBe(3);
    expect(res.missingKeywords.length).toBe(0);
    expect(res.isQuestionCopyPaste).toBe(false);
    expect(res.feedback).toContain('Чудово!');
  });

  it('повинен відхилити відповідь якщо обсяг занадто малий', () => {
    const answer = 'Декоратор це функція.';
    const res = OpenTextHeuristicEvaluator.evaluate(answer, sampleConfig);

    expect(res.isPassed).toBe(false);
    expect(res.wordCount).toBeLessThan(5);
    expect(res.reasons.some((r) => r.includes('менший за мінімальний'))).toBe(true);
  });

  it('повинен виявити тавтологію або спам повторів (Type-Token Ratio)', () => {
    const answer = 'декоратор декоратор декоратор декоратор декоратор декоратор декоратор';
    const res = OpenTextHeuristicEvaluator.evaluate(answer, sampleConfig);

    expect(res.isPassed).toBe(false);
    expect(res.uniqueWordRatio).toBeLessThan(0.45);
    expect(res.reasons.some((r) => r.includes('Низька лексична різноманітність'))).toBe(true);
  });

  it('повинен виявити копіпаст умови самого запитання', () => {
    const answer = 'Поясніть концепцію та призначення декораторів у мові TypeScript будь ласка.';
    const res = OpenTextHeuristicEvaluator.evaluate(answer, sampleConfig);

    expect(res.isPassed).toBe(false);
    expect(res.isQuestionCopyPaste).toBe(true);
    expect(res.questionOverlapRatio).toBeGreaterThanOrEqual(0.7);
    expect(res.feedback).toContain('дублює саме запитання');
  });

  it('повинен підтримувати синоніми через розділювач "|"', () => {
    const answer =
      'Wrapping навколо методів забезпечує модифікацію target об’єкта та додає службові дані.';
    const res = OpenTextHeuristicEvaluator.evaluate(answer, sampleConfig);

    expect(res.coveredKeywords).toEqual(
      expect.arrayContaining(['декоратор|wrapping', 'функція|target']),
    );
    expect(res.conceptCoverageRatio).toBeGreaterThanOrEqual(0.6);
  });

  it('повинен відхиляти беззмістовний набір символів (gibberish / keyboard mashing)', () => {
    const gibberishAnswer = 'івлоапроішвапро івдлапроішвпро йцукенгшщзх ївапролд';
    const res = OpenTextHeuristicEvaluator.evaluate(gibberishAnswer, sampleConfig);

    expect(res.isPassed).toBe(false);
    expect(res.isGibberish).toBe(true);
    expect(res.score).toBeLessThanOrEqual(0.1);
    expect(res.feedback).toContain('хаотичний набір літер');
  });

  it('повинен обмежувати бал та вимагати перевірку викладача якщо критерії не налаштовані', () => {
    const answer = 'Тут написана якась відповідь без налаштованих ключових слів у завданні.';
    const res = OpenTextHeuristicEvaluator.evaluate(answer, { minWords: 5 });

    expect(res.needsTeacherReview).toBe(true);
    expect(res.score).toBeLessThanOrEqual(0.45);
    expect(res.isPassed).toBe(false);
  });

  it('повинен відхиляти Keyword Stuffing (ізольований стовпчик слів без зв’язного речення)', () => {
    const stuffingAnswer = `це
щось
про
чергу
др
microtask
macrotask
call stack
дддю`;
    const eventLoopConfig: OpenTextRubricConfig = {
      minWords: 5,
      keywords: ['microtask', 'macrotask', 'call stack', 'черга'],
      minCoverageThreshold: 0.5,
    };

    const res = OpenTextHeuristicEvaluator.evaluate(stuffingAnswer, eventLoopConfig);

    expect(res.isPassed).toBe(false);
    expect(res.isKeywordStuffing).toBe(true);
    expect(res.score).toBeLessThanOrEqual(0.35);
    expect(res.needsTeacherReview).toBe(true);
    expect(res.feedback).toContain('ізольований перелік слів');
  });
});
