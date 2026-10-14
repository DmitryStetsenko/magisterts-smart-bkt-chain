import { OpenAnswerEvaluatorService } from './open-answer-evaluator.service';

describe('OpenAnswerEvaluatorService (Tier 1 -> Tier 2 -> Tier 3 Orchestration)', () => {
  let service: OpenAnswerEvaluatorService;

  beforeEach(() => {
    service = new OpenAnswerEvaluatorService();
  });

  it('повинен відхилити копіпаст запитання на рівні Tier 1', async () => {
    const res = await service.evaluate({
      answerText: 'Поясніть концепцію та призначення декораторів у мові TypeScript будь ласка.',
      taskTitle: 'TypeScript Decorators',
      taskDescription: 'Поясніть концепцію та призначення декораторів у мові TypeScript.',
      rubrics: {
        keywords: ['декоратор', 'функція'],
        minWords: 5,
      },
    });

    expect(res.tierUsed).toBe('TIER_1_HEURISTICS');
    expect(res.isPassed).toBe(false);
    expect(res.studentFeedback).toContain('дублює саме запитання');
    expect(res.needsTeacherReview).toBe(false);
  });

  it('повинен підтвердити відповідь через семантичну схожість з еталоном (Tier 2)', async () => {
    const reference = 'Декоратор це функція обгортка яка дозволяє модифікувати класи та їх члени через метадані.';
    const answer = 'Декоратор є функцією обгорткою що модифікує класи і додає метадані до методів.';

    const res = await service.evaluate({
      answerText: answer,
      taskTitle: 'TypeScript Decorators',
      referenceAnswer: reference,
      rubrics: {
        keywords: ['декоратор', 'функція', 'метадані'],
        minWords: 5,
      },
    });

    expect(res.isPassed).toBe(true);
    expect(res.score).toBeGreaterThanOrEqual(0.7);
    expect(res.keyConceptsCovered.length).toBeGreaterThanOrEqual(2);
  });

  it('повинен перенаправити відповідь у сірій зоні на перевірку викладачем (needsTeacherReview)', async () => {
    const answer = 'Декоратор це просто функція для коду.';

    const res = await service.evaluate({
      answerText: answer,
      taskTitle: 'TypeScript Decorators',
      referenceAnswer: 'Декоратор це функція вищого порядку що змінює поведінку класу чи властивості.',
      rubrics: {
        keywords: ['декоратор', 'вищого порядку', 'метадані'],
        minWords: 5,
      },
    });

    expect(res.tierUsed).toBe('TIER_3_LLM_JUDGE');
    expect(res.needsTeacherReview).toBe(true);
    expect(res.reasons.some((r) => r.includes('сіра зона'))).toBe(true);
  });
});
