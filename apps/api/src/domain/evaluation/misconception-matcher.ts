import type { MisconceptionDto, TaskType } from '@sbc/types';

export interface MisconceptionMatchContext {
  taskType: TaskType | string;
  isPassed: boolean;
  selectedOptionId?: string;
  selectedOptionIds?: string[];
  code?: string;
  essayAnswer?: string;
  failedOutputs?: string[];
  semanticDetectedMisconceptions?: string[];
}

/**
 * Pure domain service for diagnosing student cognitive misconceptions
 * across polyglot task modalities (SINGLE_CHOICE, MULTIPLE_CHOICE, CODE, TEXT_ESSAY).
 */
export class MisconceptionMatcher {
  /**
   * Adapts either legacy `string[]` or structured `MisconceptionDto[]` into plain strings
   * for N-gram cosine similarity checks in OpenAnswerEvaluatorService.
   */
  static normalizeForOpenText(rawMisconceptions: unknown): string[] {
    if (!Array.isArray(rawMisconceptions)) {
      return [];
    }

    const normalized: string[] = [];
    for (const item of rawMisconceptions) {
      if (typeof item === 'string' && item.trim().length > 0) {
        normalized.push(item.trim());
      } else if (this.isStructuredMisconception(item)) {
        const text = item.triggerPattern?.trim() || `${item.title}. ${item.explanation}`.trim();
        if (text.length > 0) {
          normalized.push(text);
        }
      }
    }

    return normalized;
  }

  /**
   * Matches a failed student submission against task-specific cognitive traps (`MisconceptionDto[]`).
   * Returns `null` when the submission passed or no specific misconception pattern matched.
   */
  static matchSubmission(
    rawMisconceptions: unknown,
    context: MisconceptionMatchContext,
  ): MisconceptionDto | null {
    if (context.isPassed) {
      return null;
    }

    const items = Array.isArray(rawMisconceptions) ? rawMisconceptions : [];
    const structured = items.filter((item): item is MisconceptionDto =>
      this.isStructuredMisconception(item),
    );

    const taskType = String(context.taskType);

    if (taskType === 'SINGLE_CHOICE') {
      if (!context.selectedOptionId) return null;
      return (
        structured.find(
          (m) => Boolean(m.triggerOptionId) && m.triggerOptionId === context.selectedOptionId,
        ) || null
      );
    }

    if (taskType === 'MULTIPLE_CHOICE') {
      const selectedIds = context.selectedOptionIds || [];
      for (const m of structured) {
        if (!m.triggerOptionId) continue;
        if (m.triggerOptionId.startsWith('missing:')) {
          const requiredId = m.triggerOptionId.slice('missing:'.length);
          if (requiredId && !selectedIds.includes(requiredId)) {
            return m;
          }
        } else if (selectedIds.includes(m.triggerOptionId)) {
          return m;
        }
      }
      return null;
    }

    if (taskType === 'TEXT_ESSAY' || taskType === 'OPEN_TEXT') {
      const answer = context.essayAnswer || '';
      for (const m of structured) {
        if (m.triggerPattern && this.matchesPattern(m.triggerPattern, answer)) {
          return m;
        }
      }

      if (context.semanticDetectedMisconceptions && context.semanticDetectedMisconceptions.length > 0) {
        const firstDetected = context.semanticDetectedMisconceptions[0];
        const matchedStructured = structured.find(
          (m) =>
            m.triggerPattern === firstDetected ||
            `${m.title}. ${m.explanation}`.trim() === firstDetected,
        );
        if (matchedStructured) {
          return matchedStructured;
        }
        return {
          id: 'semantic-misconception',
          title: 'Виявлено можливу концептуальну неточність',
          explanation: `Ваша відповідь збігається з типовим хибним твердженням: «${firstDetected}». Перевірте ключові визначення теми.`,
        };
      }

      return null;
    }

    // Default / CODE modality: match triggerPattern against submitted source code or failed runtime outputs
    const codeHaystack = context.code || '';
    const outputHaystack = (context.failedOutputs || []).join('\n');

    for (const m of structured) {
      if (!m.triggerPattern) continue;
      if (
        this.matchesPattern(m.triggerPattern, codeHaystack) ||
        (outputHaystack.length > 0 && this.matchesPattern(m.triggerPattern, outputHaystack))
      ) {
        return m;
      }
    }

    return null;
  }

  private static isStructuredMisconception(item: unknown): item is MisconceptionDto {
    if (typeof item !== 'object' || item === null) return false;
    const candidate = item as Record<string, unknown>;
    return typeof candidate.title === 'string' && typeof candidate.explanation === 'string';
  }

  private static matchesPattern(pattern: string, text: string): boolean {
    if (!pattern || !text) return false;

    // Support explicit `/regex/flags` syntax or standard regular expression strings
    const slashRegexMatch = pattern.match(/^\/(.+)\/([gimsuy]*)$/);
    try {
      if (slashRegexMatch) {
        const regex = new RegExp(slashRegexMatch[1], slashRegexMatch[2] || 'm');
        return regex.test(text);
      }
      const regex = new RegExp(pattern, 'im');
      return regex.test(text);
    } catch {
      return text.toLowerCase().includes(pattern.toLowerCase());
    }
  }
}
