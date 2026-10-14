/**
 * OpenTextHeuristicEvaluator — чистий доменний модуль багаторівневого евристичного
 * оцінювання текстових (відкритих) відповідей (Tier 1 Heuristics).
 *
 * Перевикористовуваний: без залежностей від NestJS / Prisma.
 * Може викликатися як на бекенді (API), так і на фронтенді (миттєвий пре-чек).
 */

export interface OpenTextRubricConfig {
  /** Обов'язкові або рекомендовані ключові поняття чи групи синонімів */
  keywords?: string[];
  /** Мінімальна кількість слів для зарахування */
  minWords?: number;
  /** Максимальна кількість слів (опціонально) */
  maxWords?: number;
  /** Текст самого запитання (для перевірки копіпасту умови) */
  taskQuestion?: string;
  /** Мінімальний поріг покриття понять для вердикту (0..1, дефолт 0.5) */
  minCoverageThreshold?: number;
}

export interface OpenTextEvaluationResult {
  isPassed: boolean;
  score: number; // 0..1
  wordCount: number;
  uniqueWordRatio: number;
  coveredKeywords: string[];
  missingKeywords: string[];
  conceptCoverageRatio: number;
  isQuestionCopyPaste: boolean;
  questionOverlapRatio: number;
  feedback: string;
  reasons: string[];
}

export class OpenTextHeuristicEvaluator {
  /**
   * Оцінює письмову відповідь на базі конфігурації рубрики
   */
  static evaluate(
    answerText: string,
    config: OpenTextRubricConfig = {},
  ): OpenTextEvaluationResult {
    const text = (answerText || '').trim();
    const minWords = config.minWords ?? 5;
    const maxWords = config.maxWords;
    const keywords = config.keywords ?? [];
    const minCoverage = config.minCoverageThreshold ?? (keywords.length > 0 ? 0.5 : 1.0);
    const reasons: string[] = [];

    // 1. Токенізація слів (підтримка укр/англ та дефісів)
    const words = text
      .toLowerCase()
      .split(/[\s,.;:!?()\[\]"'/\\«»]+/)
      .filter((w) => w.length > 1);

    const wordCount = words.length;

    // 2. Аналіз Type-Token Ratio (унікальність слів для відсікання "бла бла бла")
    const uniqueWords = new Set(words);
    const uniqueWordRatio = wordCount > 0 ? uniqueWords.size / wordCount : 0;

    // 3. Перевірка копіпасту запитання завдання
    let isQuestionCopyPaste = false;
    let questionOverlapRatio = 0;

    if (config.taskQuestion && config.taskQuestion.trim().length > 0 && wordCount > 0) {
      const qWords = config.taskQuestion
        .toLowerCase()
        .split(/[\s,.;:!?()[\]"'/\\«»]+/)
        .filter((w) => w.length > 1);
      const qWordSet = new Set(qWords);

      if (qWordSet.size > 0) {
        const overlapCount = words.filter((w) => qWordSet.has(w)).length;
        questionOverlapRatio = overlapCount / wordCount;

        // Якщо понад 60% слів студента — це слова з умови запитання
        if (questionOverlapRatio >= 0.6 && wordCount >= 5) {
          isQuestionCopyPaste = true;
          reasons.push(
            `Перекриття з текстом запитання ${Math.round(questionOverlapRatio * 100)}% (підозра на копіпаст умови)`,
          );
        }
      }
    }

    // 4. Покриття ключових понять (з підтримкою синонімів через "|" або регулярних виразів)
    const coveredKeywords: string[] = [];
    const missingKeywords: string[] = [];
    const lowerText = text.toLowerCase();

    for (const kw of keywords) {
      // Підтримка кількох синонімів у форматі "термін1|термін2|synonym"
      const variants = kw
        .toLowerCase()
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean);

      const isFound = variants.some((v) => {
        // Перевірка входження підрядка або кореня
        return lowerText.includes(v);
      });

      if (isFound) {
        coveredKeywords.push(kw);
      } else {
        missingKeywords.push(kw);
      }
    }

    const conceptCoverageRatio =
      keywords.length > 0 ? coveredKeywords.length / keywords.length : 1.0;

    // 5. Розрахунок інтегрального скору (0..1)
    let score = 0;

    // Штрафи за спам / повтори / копіпаст
    if (wordCount < minWords) {
      reasons.push(`Обсяг відповіді (${wordCount} сл.) менший за мінімальний (${minWords} сл.)`);
    }

    if (maxWords && wordCount > maxWords) {
      reasons.push(`Обсяг відповіді перевищує максимальний (${wordCount} > ${maxWords} сл.)`);
    }

    if (uniqueWordRatio < 0.45 && wordCount >= 6) {
      reasons.push(
        `Низька лексична різноманітність (${Math.round(uniqueWordRatio * 100)}% унікальних слів) — ознака тавтології`,
      );
    }

    if (keywords.length > 0) {
      if (conceptCoverageRatio >= minCoverage) {
        reasons.push(
          `Покрито ${coveredKeywords.length}/${keywords.length} ключових понять (${Math.round(conceptCoverageRatio * 100)}%)`,
        );
      } else {
        reasons.push(
          `Недостатнє розкриття ключових понять (${coveredKeywords.length}/${keywords.length})`,
        );
      }
    }

    // Розрахунок підсумкового балу
    if (isQuestionCopyPaste) {
      score = 0.1;
    } else if (wordCount === 0) {
      score = 0.0;
    } else {
      const lengthFactor = Math.min(1.0, wordCount / minWords);
      const diversityFactor = Math.min(1.0, uniqueWordRatio / 0.6);
      const conceptFactor = conceptCoverageRatio;

      if (keywords.length > 0) {
        score = 0.6 * conceptFactor + 0.25 * lengthFactor + 0.15 * diversityFactor;
      } else {
        score = 0.7 * lengthFactor + 0.3 * diversityFactor;
      }
    }

    score = Math.min(1.0, Math.max(0.0, Number(score.toFixed(2))));

    // Критерій зарахування (Passed)
    const isLengthOk = wordCount >= minWords;
    const isCoverageOk = keywords.length === 0 || conceptCoverageRatio >= minCoverage;
    const isQualityOk = !isQuestionCopyPaste && (wordCount < 6 || uniqueWordRatio >= 0.45);

    const isPassed = isLengthOk && isCoverageOk && isQualityOk && score >= 0.6;

    // Генерація конструктивного фідбеку
    let feedback = '';
    if (isQuestionCopyPaste) {
      feedback =
        'Схоже, відповідь здебільшого дублює саме запитання. Будь ласка, сформулюйте визначення власними словами.';
    } else if (wordCount < minWords) {
      feedback = `Відповідь занадто коротка (${wordCount} сл.). Спробуйте детальніше розкрити думку (мінімум ${minWords} слів).`;
    } else if (missingKeywords.length > 0 && conceptCoverageRatio < minCoverage) {
      feedback = `У відповіді бракує ключових аспектів теми. Зверніть увагу на поняття: ${missingKeywords.map((k) => `«${k.split('|')[0]}»`).join(', ')}.`;
    } else if (isPassed) {
      feedback = `Чудово! Відповідь змістовна та розкриває ключові концепції (${coveredKeywords.map((k) => `«${k.split('|')[0]}»`).join(', ')}).`;
    } else {
      feedback = 'Відповідь врахована, проте потребує більшої точності та аргументованості.';
    }

    return {
      isPassed,
      score,
      wordCount,
      uniqueWordRatio: Number(uniqueWordRatio.toFixed(2)),
      coveredKeywords,
      missingKeywords,
      conceptCoverageRatio: Number(conceptCoverageRatio.toFixed(2)),
      isQuestionCopyPaste,
      questionOverlapRatio: Number(questionOverlapRatio.toFixed(2)),
      feedback,
      reasons,
    };
  }
}
