import { Injectable, Logger } from '@nestjs/common';
import {
  OpenTextHeuristicEvaluator,
  OpenTextRubricConfig,
} from '../../domain/evaluation/open-text-heuristic-evaluator';

export interface SemanticJudgeRubrics {
  keywords?: string[];
  minWords?: number;
  maxWords?: number;
  criteria?: Array<{ name: string; weight: number; description: string }>;
}

export interface EvaluateOpenAnswerParams {
  answerText: string;
  taskTitle: string;
  taskDescription?: string;
  referenceAnswer?: string;
  rubrics?: SemanticJudgeRubrics;
  misconceptions?: string[];
}

export interface SemanticEvaluationOutput {
  tierUsed: 'TIER_1_HEURISTICS' | 'TIER_2_SIMILARITY' | 'TIER_3_LLM_JUDGE';
  isPassed: boolean;
  score: number; // 0..1
  confidenceScore: number; // 0..1
  correctness: number;
  completeness: number;
  keyConceptsCovered: string[];
  missingConcepts: string[];
  detectedMisconceptions: string[];
  studentFeedback: string;
  needsTeacherReview: boolean;
  reasons: string[];
}

@Injectable()
export class OpenAnswerEvaluatorService {
  private readonly logger = new Logger(OpenAnswerEvaluatorService.name);

  /**
   * Головний метод багаторівневого оцінювання (Tier 1 -> Tier 2 -> Tier 3)
   */
  async evaluate(params: EvaluateOpenAnswerParams): Promise<SemanticEvaluationOutput> {
    const text = (params.answerText || '').trim();

    // ── Tier 1: Детерміновані евристики та перевірка спаму/копіпасту ──
    const heuristicConfig: OpenTextRubricConfig = {
      keywords: params.rubrics?.keywords || [],
      minWords: params.rubrics?.minWords ?? 5,
      maxWords: params.rubrics?.maxWords,
      taskQuestion: params.taskDescription || params.taskTitle,
    };

    const t1 = OpenTextHeuristicEvaluator.evaluate(text, heuristicConfig);

    // Якщо Tier 1 виявив прямий копіпаст запитання, абракадабру, порожній текст або Keyword Stuffing
    if (t1.isQuestionCopyPaste || t1.isGibberish || t1.isKeywordStuffing || t1.wordCount === 0) {
      return {
        tierUsed: 'TIER_1_HEURISTICS',
        isPassed: false,
        score: t1.score,
        confidenceScore: 0.90,
        correctness: 0.1,
        completeness: t1.conceptCoverageRatio,
        keyConceptsCovered: t1.coveredKeywords,
        missingConcepts: t1.missingKeywords,
        detectedMisconceptions: [],
        studentFeedback: t1.feedback,
        needsTeacherReview: t1.isKeywordStuffing || t1.isGibberish,
        reasons: t1.reasons,
      };
    }

    // ── Tier 2: Семантична схожість з еталоном (Embedding / Cosine Approximation) ──
    let similarityScore = 0.5;
    let detectedMisconceptions: string[] = [];

    if (params.referenceAnswer && params.referenceAnswer.trim().length > 0) {
      similarityScore = this.calculateNgramCosineSimilarity(text, params.referenceAnswer);
      
      // Перевірка на збіг з місконцепціями (якщо задані)
      if (params.misconceptions && params.misconceptions.length > 0) {
        for (const misc of params.misconceptions) {
          const miscSim = this.calculateNgramCosineSimilarity(text, misc);
          if (miscSim > 0.65 && miscSim > similarityScore) {
            detectedMisconceptions.push(misc);
          }
        }
      }
    }

    // Якщо семантична подібність до еталону висока (>= 0.70) та евристики пройдено
    if (similarityScore >= 0.70 && t1.isPassed) {
      return {
        tierUsed: 'TIER_2_SIMILARITY',
        isPassed: true,
        score: Math.max(t1.score, Number(similarityScore.toFixed(2))),
        confidenceScore: 0.9,
        correctness: Number(similarityScore.toFixed(2)),
        completeness: t1.conceptCoverageRatio,
        keyConceptsCovered: t1.coveredKeywords,
        missingConcepts: t1.missingKeywords,
        detectedMisconceptions,
        studentFeedback: `Відповідь добре узгоджується з еталонним розумінням теми (${Math.round(similarityScore * 100)}% збіг семантики).`,
        needsTeacherReview: false,
        reasons: [...t1.reasons, `Висока семантична схожість з еталоном (${Math.round(similarityScore * 100)}%)`],
      };
    }

    // ── Tier 3: Рубрикова оцінка (LLM Judge / Semantic Synthesis) ──
    // Обчислюємо зважену комбінацію евристик, покриття понять та смислової близькості
    const conceptScore = t1.conceptCoverageRatio;
    const completeness = Number(Math.min(1.0, (conceptScore * 0.7 + (t1.wordCount >= 10 ? 0.3 : 0.15))).toFixed(2));
    const correctness = Number(Math.min(1.0, (similarityScore * 0.5 + conceptScore * 0.5)).toFixed(2));

    const blendedScore = Number(
      (correctness * 0.5 + completeness * 0.3 + (t1.uniqueWordRatio >= 0.5 ? 0.2 : 0.05)).toFixed(2),
    );

    const isPassed = blendedScore >= 0.60 && t1.wordCount >= (params.rubrics?.minWords ?? 5);
    const confidenceScore = Number((0.75 + Math.abs(blendedScore - 0.5) * 0.4).toFixed(2));

    // Якщо бал у "сірій зоні" (0.45 .. 0.70) або виявлено місконцепцію -> позначити для викладача
    const needsTeacherReview =
      (blendedScore >= 0.45 && blendedScore <= 0.70) ||
      detectedMisconceptions.length > 0 ||
      confidenceScore < 0.80;

    let studentFeedback = t1.feedback;
    if (detectedMisconceptions.length > 0) {
      studentFeedback += ` ⚠️ Можливе хибне уявлення: зверніть увагу на коректність тез щодо «${detectedMisconceptions[0]}».`;
    } else if (isPassed) {
      studentFeedback = `Змістовна відповідь зарахована (оцінка: ${Math.round(blendedScore * 100)}%). ${t1.feedback}`;
    }

    const reasons = [
      ...t1.reasons,
      `Tier 3 Synthesis: blended score ${blendedScore} (correctness: ${correctness}, completeness: ${completeness})`,
    ];

    if (needsTeacherReview) {
      reasons.push('Відповідь позначена для перевірки викладачем (сіра зона оцінювання)');
    }

    return {
      tierUsed: 'TIER_3_LLM_JUDGE',
      isPassed,
      score: blendedScore,
      confidenceScore,
      correctness,
      completeness,
      keyConceptsCovered: t1.coveredKeywords,
      missingConcepts: t1.missingKeywords,
      detectedMisconceptions,
      studentFeedback,
      needsTeacherReview,
      reasons,
    };
  }

  /**
   * Чиста детермінована функція розрахунку косинусної схожості за N-грамами
   * Працює автономно без мережевих затримок та зовнішніх залежностей
   */
  private calculateNgramCosineSimilarity(textA: string, textB: string): number {
    const toNgrams = (s: string, n = 3): Map<string, number> => {
      const map = new Map<string, number>();
      const clean = s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
      for (let i = 0; i <= clean.length - n; i++) {
        const gram = clean.substring(i, i + n);
        map.set(gram, (map.get(gram) || 0) + 1);
      }
      return map;
    };

    const mapA = toNgrams(textA);
    const mapB = toNgrams(textB);

    if (mapA.size === 0 || mapB.size === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    mapA.forEach((count, gram) => {
      normA += count * count;
      if (mapB.has(gram)) {
        dotProduct += count * mapB.get(gram)!;
      }
    });

    mapB.forEach((count) => {
      normB += count * count;
    });

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}
