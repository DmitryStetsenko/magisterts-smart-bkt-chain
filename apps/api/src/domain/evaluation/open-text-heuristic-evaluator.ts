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
  isGibberish: boolean;
  isKeywordStuffing: boolean;
  needsTeacherReview: boolean;
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

    // 1. Токенізація слів (підтримка укр/англ та розділення склеєних слів)
    // Якщо студент склеїв слова типу "чергаmicrotask" або "microtaskчерга", розділяємо їх за межею кирилиця/латиниця
    const normalizedText = text
      .replace(/([\p{Script=Cyrillic}]+)([\p{Script=Latin}]+)/gu, '$1 $2')
      .replace(/([\p{Script=Latin}]+)([\p{Script=Cyrillic}]+)/gu, '$1 $2');

    const words = normalizedText
      .toLowerCase()
      .split(/[\s,.;:!?()\[\]"'/\\«»]+/)
      .filter((w) => w.length > 1);

    const wordCount = words.length;

    // 2. Аналіз Type-Token Ratio (унікальність слів для відсікання повторів)
    const uniqueWords = new Set(words);
    const uniqueWordRatio = wordCount > 0 ? uniqueWords.size / wordCount : 0;

    // 3. Аналіз на абракадабру / беззмістовні літеросполучення (Gibberish / Keyboard mashing filter)
    let isGibberish = false;
    if (wordCount >= 4) {
      // Підрахунок слів із нетиповою структурою: відсутність голосних, хаотичні повтори клавіш типу "фіва", "asdf"
      const vowelsPattern = /[аеєиіїоуюяaeiouy]/i;
      const suspiciousWords = words.filter((w) => {
        // Якщо слово довше 2 символів і в ньому немає жодної голосної літери
        if (w.length >= 3 && !vowelsPattern.test(w)) return true;
        // Патерни хаотичного набору сусідніх клавіш (QWERTY / ЙЦУКЕН / ФІВАПРОЛ / ASDF)
        if (/(asdf|qwer|zxcv|йцук|фіва|івап|вапр|апро|прол|ролд|длап|швап|поіш|ячсм)/i.test(w)) return true;
        // Аномально низьке співвідношення голосних у довгому слові (наприклад, 1 голосна на 6+ приголосних)
        const vowelCount = (w.match(/[аеєиіїоуюяaeiouy]/gi) || []).length;
        if (w.length >= 6 && vowelCount / w.length < 0.2) return true;
        // Повторення одного символу 3+ разів підряд
        if (/(.)\1\1/.test(w)) return true;
        return false;
      });

      const suspiciousRatio = suspiciousWords.length / wordCount;
      if (suspiciousRatio >= 0.25) {
        isGibberish = true;
        reasons.push(
          `Виявлено ознаки абракадабри або хаотичного набору символів (${Math.round(suspiciousRatio * 100)}% невалідних слів)`,
        );
      }
    }

    // 3.1. Перевірка на "Keyword Stuffing" / беззмістовний перелік слів без синтаксичної структури речення
    let isKeywordStuffing = false;
    if (wordCount >= 4) {
      const rawLines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      const avgWordsPerLine = rawLines.length > 0 ? wordCount / rawLines.length : wordCount;

      // Чи має відповідь крапки або розділові знаки кінця речень
      const hasProperPunctuation = /[.!?]/.test(text);

      // Якщо студент ввів слова стовпчиком (в середньому <= 2.2 слів на рядок при кількості рядків >= 3)
      // без крапок і знаків пунктуації
      const isVerticalWordList = rawLines.length >= 3 && avgWordsPerLine <= 2.2 && !hasProperPunctuation;

      // Перевірка наявності коротких слів-паразитів / сміття (<= 2 літер) що складають понад 30% слів
      const allTokens = text.toLowerCase().split(/\s+/).filter(Boolean);
      const shortTokens = allTokens.filter((w) => w.replace(/[^\p{L}\p{N}]/gu, '').length <= 2);
      const shortWordRatio = allTokens.length > 0 ? shortTokens.length / allTokens.length : 0;
      const isOverwhelmingShortWords = shortWordRatio >= 0.35 && allTokens.length >= 6;

      // Перевірка на циклічний луп (багаторазовий повтор однієї й тієї самої фрази / термінів)
      // Рахуємо повтори 3-грам слів: якщо одна 3-грама повторюється 3+ разів
      let maxNgramRepeats = 0;
      if (words.length >= 6) {
        const trigramCounts = new Map<string, number>();
        for (let i = 0; i <= words.length - 3; i++) {
          const trigram = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
          const cnt = (trigramCounts.get(trigram) || 0) + 1;
          trigramCounts.set(trigram, cnt);
          if (cnt > maxNgramRepeats) maxNgramRepeats = cnt;
        }
      }
      const isLoopingSpam = maxNgramRepeats >= 3;

      // Перевірка відсутності предикатів/дієслів та вкрай низької унікальності при великому обсязі
      // Якщо в тексті понад 15 слів, але унікальних слів менше 6 (зациклений набір 4-5 термінів)
      const isRepetitiveKeywordLoop = wordCount >= 12 && uniqueWords.size <= 5;

      if (isVerticalWordList || isOverwhelmingShortWords || isLoopingSpam || isRepetitiveKeywordLoop) {
        isKeywordStuffing = true;
        reasons.push(
          isLoopingSpam || isRepetitiveKeywordLoop
            ? `Виявлено циклічне повторення одних і тих самих термінів (фразовий спам/looping)`
            : `Виявлено ознаки штучного переліку слів (Keyword Stuffing) без зв'язної граматичної структури речень`,
        );
      }
    }

    // 4. Перевірка копіпасту запитання завдання
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

    // 5. Покриття ключових понять (з підтримкою синонімів через "|" або регулярних виразів)
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
      keywords.length > 0 ? coveredKeywords.length / keywords.length : 0.0;

    // 6. Розрахунок інтегрального скору (0..1)
    let score = 0;

    // Штрафи за спам / повтори / копіпаст / абракадабру
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
    } else {
      reasons.push('У завданні не задано ключові критерії — потрібна верифікація викладачем');
    }

    // Розрахунок підсумкового балу
    if (isGibberish || isQuestionCopyPaste) {
      score = 0.05;
    } else if (isKeywordStuffing) {
      // Суттєвий штраф за беззмістовний перелік слів: не більше 0.35, статус PENDING_REVIEW
      score = Math.min(0.35, 0.4 * conceptCoverageRatio);
    } else if (wordCount === 0) {
      score = 0.0;
    } else {
      const lengthFactor = Math.min(1.0, wordCount / minWords);
      const diversityFactor = Math.min(1.0, uniqueWordRatio / 0.6);
      const conceptFactor = conceptCoverageRatio;

      if (keywords.length > 0) {
        score = 0.65 * conceptFactor + 0.20 * lengthFactor + 0.15 * diversityFactor;
      } else {
        // Якщо рубрики взагалі не були задані, максимальний бал не може перевищувати 0.45 (сіра зона для викладача)
        score = Math.min(0.45, 0.3 * lengthFactor + 0.15 * diversityFactor);
      }
    }

    score = Math.min(1.0, Math.max(0.0, Number(score.toFixed(2))));

    // Критерій зарахування (Passed)
    const isLengthOk = wordCount >= minWords;
    const hasMeaningfulContent = !isGibberish && !isQuestionCopyPaste && !isKeywordStuffing;
    const isCoverageOk = keywords.length > 0 ? conceptCoverageRatio >= minCoverage : false;
    const isQualityOk = hasMeaningfulContent && (wordCount < 6 || uniqueWordRatio >= 0.45);

    const isPassed = isLengthOk && isCoverageOk && isQualityOk && score >= 0.6;

    // Генерація конструктивного фідбеку
    let feedback = '';
    if (isGibberish) {
      feedback = 'Відповідь містить хаотичний набір літер або беззмістовні слова. Будь ласка, напишіть осмислену відповідь українською або англійською мовою.';
    } else if (isKeywordStuffing) {
      feedback =
        'Відповідь виглядає як ізольований перелік слів або тегів без зв’язного пояснення. Будь ласка, викладіть думку повними реченнями та поясніть взаємозв’язок понять.';
    } else if (isQuestionCopyPaste) {
      feedback =
        'Схоже, відповідь здебільшого дублює саме запитання. Будь ласка, сформулюйте визначення власними словами.';
    } else if (wordCount < minWords) {
      feedback = `Відповідь занадто коротка (${wordCount} сл.). Спробуйте детальніше розкрити думку (мінімум ${minWords} слів).`;
    } else if (missingKeywords.length > 0 && conceptCoverageRatio < minCoverage) {
      feedback = `У відповіді бракує ключових аспектів теми. Зверніть увагу на поняття: ${missingKeywords.map((k) => `«${k.split('|')[0]}»`).join(', ')}.`;
    } else if (isPassed) {
      feedback = `Чудово! Відповідь змістовна та розкриває ключові концепції (${coveredKeywords.map((k) => `«${k.split('|')[0]}»`).join(', ')}).`;
    } else {
      feedback = 'Відповідь врахована, проте потребує більшої точності або перевірки викладачем.';
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
      isGibberish,
      isKeywordStuffing,
      needsTeacherReview: !isPassed || isGibberish || isKeywordStuffing || keywords.length === 0,
      feedback,
      reasons,
    };
  }
}
