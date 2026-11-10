import { Controller, Post, Get, Delete, Body, Param, Query, NotFoundException, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import type { Response } from 'express';
import * as vm from 'vm';
import { PrismaService } from '../../outbound/persistence/prisma.service';
import { TelemetryGateway } from '../websocket/telemetry.gateway';
import { BktEngine } from '../../../domain/bkt/bkt-engine';
import { BehavioralAdjuster } from '../../../domain/bkt/behavioral-adjuster';
import { OpenTextHeuristicEvaluator } from '../../../domain/evaluation/open-text-heuristic-evaluator';
import { OpenAnswerEvaluatorService } from '../../../domain/evaluation/open-answer-evaluator.service';
import { MisconceptionMatcher } from '../../../domain/evaluation/misconception-matcher';
import { AuditLogService } from '../../../domain/audit/audit-log.service';
import { SubmitTaskDto } from './dto/submit-task.dto';
import { SubmissionStatus, TaskType, TeacherReviewStatus } from '@sbc/database';
import type {
  CodeTestDetailDto,
  ReviewQueueItemDto,
  StudentAnalyticsItemDto,
  TaskEvaluationResponseDto,
  CreateActivityLogDto,
} from '@sbc/types';

@ApiTags('BKT')
@Controller('bkt')
export class BktController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telemetryGateway: TelemetryGateway,
    private readonly openAnswerEvaluator: OpenAnswerEvaluatorService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post('evaluate')
  @ApiOperation({ summary: 'Evaluate student submission across task types (CODE, SINGLE_CHOICE, MULTIPLE_CHOICE, TEXT_ESSAY) and update BKT P(L_t)' })
  @ApiResponse({ status: 200, description: 'Evaluation result and updated BKT mastery probability' })
  async evaluateSubmission(@Body() dto: SubmitTaskDto): Promise<TaskEvaluationResponseDto> {
    const task = await this.prisma.task.findUnique({
      where: { id: dto.taskId },
      include: {
        testCases: true,
        skill: true,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task ${dto.taskId} not found`);
    }

    let user = dto.userId
      ? await this.prisma.user.findUnique({ where: { id: dto.userId } })
      : await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });

    if (!user) {
      user = await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (!user) throw new NotFoundException('Student user not found');
    }

    let isPassed = false;
    let feedback = '';
    let testDetails: CodeTestDetailDto[] = [];
    let passedTestsRatio: number | undefined = undefined;
    let conceptCoverageRatio: number | undefined = undefined;
    let semanticScore: number | undefined = undefined;
    let semanticDetails: any = null;
    let teacherReviewStatus: TeacherReviewStatus = TeacherReviewStatus.NONE;

    // Polyglot Evaluation Strategies based on TaskType
    if (dto.isAbandoned) {
      isPassed = false;
      feedback = 'Спроба перервана учнем: зафіксовано відмову та перехід до повного підручника для ремедіації.';
    } else {
      switch (task.taskType) {
        case TaskType.SINGLE_CHOICE: {
        const options = (task.options as Array<{ id: string; text: string; isCorrect: boolean }>) || [];
        const correctOption = options.find((o) => o.isCorrect);
        const selectedOption = options.find((o) => o.id === dto.selectedOptionId);

        isPassed = Boolean(correctOption && dto.selectedOptionId === correctOption.id);
        feedback = isPassed
          ? `Правильно! Обрано вірний варіант: "${selectedOption?.text || dto.selectedOptionId}"`
          : `Невірно. Правильна відповідь: "${correctOption?.text || 'Н/А'}"`;

        break;
      }

      case TaskType.MULTIPLE_CHOICE: {
        const options = (task.options as Array<{ id: string; text: string; isCorrect: boolean }>) || [];
        const correctIds = options.filter((o) => o.isCorrect).map((o) => o.id);
        const selectedIds = dto.selectedOptionIds || [];

        const hasAllCorrect = correctIds.every((id) => selectedIds.includes(id));
        const hasNoExtra = selectedIds.every((id) => correctIds.includes(id));

        isPassed = hasAllCorrect && hasNoExtra && correctIds.length > 0;
        feedback = isPassed
          ? 'Чудово! Усі правильні варіанти обрано вірно.'
          : `Частково або невірно. Правильні варіанти: ${options.filter(o => o.isCorrect).map(o => o.text).join(', ')}`;
        break;
      }

      case TaskType.TEXT_ESSAY:
      case (TaskType as any).OPEN_TEXT: {
        const essayText = (dto.essayAnswer || '').trim();
        const options = (task.options as { keywords?: string[]; minWords?: number; maxWords?: number }) || {};

        // Багаторівневе оцінювання через OpenAnswerEvaluatorService (Tier 1 -> Tier 2 -> Tier 3)
        const normalizedMisconceptions = MisconceptionMatcher.normalizeForOpenText(task.misconceptions);
        const evalRes = await this.openAnswerEvaluator.evaluate({
          answerText: essayText,
          taskTitle: task.title,
          taskDescription: task.description,
          referenceAnswer: task.referenceAnswer || undefined,
          rubrics: {
            keywords: (task.rubrics as any)?.keywords || options.keywords,
            minWords: options.minWords ?? 5,
            maxWords: options.maxWords,
          },
          misconceptions: normalizedMisconceptions.length > 0 ? normalizedMisconceptions : undefined,
        });

        isPassed = evalRes.isPassed;
        feedback = evalRes.studentFeedback;
        semanticScore = evalRes.score;
        conceptCoverageRatio = evalRes.completeness;
        teacherReviewStatus = evalRes.needsTeacherReview
          ? TeacherReviewStatus.PENDING_REVIEW
          : TeacherReviewStatus.NONE;
        semanticDetails = evalRes;
        break;
      }

      case TaskType.CODE:
      default: {
        let passedCount = 0;
        const totalCount = task.testCases.length;

        for (const testCase of task.testCases) {
          let testPassed = false;
          let actualOutput = '';

          try {
            const sandbox = {
              result: undefined,
              setTimeout,
              clearTimeout,
              Promise,
              console,
            };
            const normalizedCode = (dto.code || '')
              .replace(/^const\s+/gm, 'var ')
              .replace(/^let\s+/gm, 'var ');

            const scriptCode = `
              ${normalizedCode}
              const rawInput = ${testCase.input};
              const fnName = Object.keys(this).find(k => typeof this[k] === 'function' && !['eval', 'setTimeout', 'clearTimeout', 'Promise', 'console'].includes(k));
              if (fnName) {
                const fn = this[fnName];
                let args;
                if (Array.isArray(rawInput)) {
                  if (fn.length === 1 && rawInput.length > 0 && Array.isArray(rawInput[0])) {
                    args = rawInput;
                  } else if (fn.length === 1 && rawInput.length > 1) {
                    args = [rawInput];
                  } else {
                    args = rawInput;
                  }
                } else {
                  args = [rawInput];
                }
                result = fn.apply(null, args);
              } else {
                if (typeof rawInput === 'string' && rawInput.startsWith('eval:')) {
                  const expr = rawInput.slice(5);
                  result = eval(expr);
                } else if (typeof rawInput === 'string' && this[rawInput] !== undefined) {
                  result = this[rawInput];
                } else if (typeof rawInput === 'string' && typeof eval !== 'undefined') {
                  try {
                    result = eval(rawInput);
                  } catch (e) {
                    result = typeof sandbox.result !== 'undefined' ? sandbox.result : undefined;
                  }
                } else {
                  result = typeof sandbox.result !== 'undefined' ? sandbox.result : undefined;
                }
              }
            `;

            const context = vm.createContext(sandbox);
            const script = new vm.Script(scriptCode);
            script.runInContext(context, { timeout: 2000 });

            let rawResult = sandbox.result;
            if (rawResult && typeof (rawResult as any).then === 'function') {
              rawResult = await rawResult;
            }

            actualOutput = typeof rawResult === 'string'
              ? JSON.stringify(rawResult)
              : typeof rawResult === 'object'
              ? JSON.stringify(rawResult)
              : String(rawResult);
            testPassed = actualOutput.replace(/\s+/g, '') === testCase.expectedOutput.replace(/\s+/g, '');
          } catch (err) {
            actualOutput = `Error: ${(err as Error).message}`;
            testPassed = false;
          }

          if (testPassed) passedCount++;

          testDetails.push({
            input: testCase.input,
            expected: testCase.expectedOutput,
            actual: actualOutput,
            passed: testPassed,
          });
        }

        isPassed = passedCount === totalCount && totalCount > 0;
        passedTestsRatio = totalCount > 0 ? passedCount / totalCount : undefined;
        feedback = isPassed
          ? `Усі ${passedCount}/${totalCount} тест-кейси пройдено успішно!`
          : `Пройдено ${passedCount}/${totalCount} тест-кейсів.`;
        break;
      }
    }
  }

    // Deduplication & Superseding for Teacher Review Queue:
    // When a student submits an open text/essay task, any previous submissions for the same
    // (userId, taskId) that are currently in PENDING_REVIEW must be superseded so that
    // only the latest draft remains active in the teacher review queue.
    const isTextTask = task.taskType === TaskType.TEXT_ESSAY || task.taskType === TaskType.OPEN_TEXT;
    const latestPending = await this.prisma.submission.findFirst({
      where: {
        userId: user.id,
        taskId: task.id,
        teacherReviewStatus: TeacherReviewStatus.PENDING_REVIEW,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (latestPending && isTextTask) {
      await this.prisma.submission.updateMany({
        where: {
          userId: user.id,
          taskId: task.id,
          teacherReviewStatus: TeacherReviewStatus.PENDING_REVIEW,
        },
        data: {
          teacherReviewStatus: TeacherReviewStatus.SUPERSEDED,
        },
      });
    }

    const previousSubmissionsCount = await this.prisma.submission.count({
      where: {
        userId: user.id,
        taskId: task.id,
      },
    });

    const attemptNumber = previousSubmissionsCount + 1;
    const previousSubmissionId = latestPending ? latestPending.id : null;

    // Save Submission Log with Versioning
    const submission = await this.prisma.submission.create({
      data: {
        userId: user.id,
        taskId: task.id,
        code: dto.code || dto.essayAnswer || dto.selectedOptionId || (dto.selectedOptionIds ? dto.selectedOptionIds.join(',') : '') || (dto.isAbandoned ? '[ABANDONED_TO_THEORY]' : ''),
        status: isPassed ? SubmissionStatus.ACCEPTED : SubmissionStatus.REJECTED,
        teacherReviewStatus,
        attemptNumber,
        previousSubmissionId,
      },
    });

    // Check if task was already accepted before this submission
    const previousAcceptedCount = await this.prisma.submission.count({
      where: {
        userId: user.id,
        taskId: task.id,
        status: SubmissionStatus.ACCEPTED,
        id: { not: submission.id },
      },
    });

    const isAlreadyPassedBefore = previousAcceptedCount > 0;

    // Update BKT Knowledge State
    let bktState = await this.prisma.bktState.findUnique({
      where: {
        userId_skillId: {
          userId: user.id,
          skillId: task.skillId,
        },
      },
    });

    if (!bktState) {
      bktState = await this.prisma.bktState.create({
        data: {
          userId: user.id,
          skillId: task.skillId,
          pMastery: 0.5,
          pTransit: 0.2,
          pSlip: 0.1,
          pGuess: 0.2,
        },
      });
    }

    let updatedState = bktState;
    let bktResult: any = {
      pMasteryPosterior: bktState.pMastery,
      isMastered: BktEngine.isMastered(bktState.pMastery),
    };

    // Per-answer behavioral adjustment of Slip/Guess (base params in bkt_states stay untouched)
    const adjusted = BehavioralAdjuster.adjust(
      { pSlip: bktState.pSlip, pGuess: bktState.pGuess },
      {
        taskType: task.taskType,
        isCorrect: isPassed,
        currentMastery: bktState.pMastery,
        reactionLatencyMs: dto.reactionLatencyMs,
        deletionRatio: dto.deletionRatio,
        pauseCount: dto.pauseCount,
        passedTestsRatio,
        pasteEvents: dto.pasteEvents,
        typingWpm: dto.typingWpm,
        conceptCoverageRatio,
      },
    );

    if (dto.isAbandoned) {
      adjusted.reasons.push('task_abandoned_to_full_theory');
    }

    // Безкомпромісна перевірка на аномалії поведінки для есе / відкритого тексту:
    // Якщо зафіксовано 3+ операцій вставки (paste) або висока ймовірність вгадування/спаму (pGuess >= 0.85),
    // робота БЕЗУМОВНО відправляється на чергу перевірки викладача (Teacher Review Queue)
    const isOpenTextTask = task.taskType === TaskType.TEXT_ESSAY || task.taskType === TaskType.OPEN_TEXT;
    const hasHighPasteAnomaly = (dto.pasteEvents ?? 0) >= 3;
    const hasHighGuessAnomaly = adjusted.pGuess >= 0.85;

    if (isOpenTextTask && (hasHighPasteAnomaly || hasHighGuessAnomaly)) {
      teacherReviewStatus = TeacherReviewStatus.PENDING_REVIEW;
      // Sync submission table status so teacher review queue query finds it immediately
      await this.prisma.submission.update({
        where: { id: submission.id },
        data: { teacherReviewStatus: TeacherReviewStatus.PENDING_REVIEW },
      });

      if (hasHighPasteAnomaly) {
        feedback += ` 📋 [Черга викладача: зафіксовано ${dto.pasteEvents} подій вставки з буфера обміну]`;
      } else {
        feedback += ` 🕵️ [Черга викладача: виявлено аномалію введення тексту (P(G)=${adjusted.pGuess.toFixed(2)})]`;
      }
    }

    if (adjusted.pGuess > bktState.pGuess) {
      feedback += ' ⚡ (Високий показник латентності: можливе вгадування)';
    } else if (adjusted.pSlip > bktState.pSlip) {
      feedback += ' 🛡️ (Схоже на випадкову помилку: засвоєння знижено помірно)';
    }

    // 🛡️ Anti-Spam / Idempotency Guard for Repeated Correct Answers:
    // If the student already successfully passed this task previously (isAlreadyPassedBefore && isPassed),
    // we do NOT re-apply BKT knowledge gain for the same task over and over again to prevent spamming mastery up to 100%.
    let calcResult: any;
    let mathTrace: any = null;
    // Match structured cognitive misconceptions on failed submissions
    const detectedMisconception = MisconceptionMatcher.matchSubmission(task.misconceptions, {
      taskType: task.taskType,
      isPassed,
      selectedOptionId: dto.selectedOptionId,
      selectedOptionIds: dto.selectedOptionIds,
      code: dto.code,
      essayAnswer: dto.essayAnswer,
      failedOutputs: testDetails.filter((td) => !td.passed).map((td) => td.actual),
      semanticDetectedMisconceptions: semanticDetails?.detectedMisconceptions,
    });

    // Resolve Socratic hint penalty percentage (explicit or derived from revealedHintLevel)
    let appliedHintPenaltyPct = 0;
    if (typeof dto.appliedPenaltyPct === 'number' && dto.appliedPenaltyPct > 0) {
      appliedHintPenaltyPct = Math.min(80, Math.max(0, dto.appliedPenaltyPct));
    } else if (typeof dto.revealedHintLevel === 'number' && dto.revealedHintLevel > 0 && Array.isArray(task.socraticHints)) {
      const hintEntry = (task.socraticHints as Array<{ level?: number; penaltyPct?: number }>).find(
        (h) => h && h.level === dto.revealedHintLevel,
      );
      if (hintEntry && typeof hintEntry.penaltyPct === 'number') {
        appliedHintPenaltyPct = Math.min(80, Math.max(0, hintEntry.penaltyPct));
      }
    }

    if (isAlreadyPassedBefore && isPassed) {
      feedback += ' ℹ️ (Завдання вже було зараховано раніше: показник P(L) збережено без повторного нарахування)';
      calcResult = {
        pMasteryPrior: bktState.pMastery,
        pMasteryPosterior: bktState.pMastery,
        isCorrect: true,
        timestamp: new Date(),
      };
      updatedState = bktState;
    } else {
      const traceResult = BktEngine.calculateNextStateWithTrace(
        {
          pMastery: bktState.pMastery,
          pTransit: bktState.pTransit,
          pSlip: adjusted.pSlip,
          pGuess: adjusted.pGuess,
        },
        isPassed,
      );
      calcResult = traceResult;
      mathTrace = traceResult.trace;

      // Apply Socratic hint penalty to positive mastery gain on first-time passed tasks
      if (isPassed && appliedHintPenaltyPct > 0 && calcResult.pMasteryPosterior > bktState.pMastery) {
        const rawGain = calcResult.pMasteryPosterior - bktState.pMastery;
        const penalizedGain = rawGain * (1 - appliedHintPenaltyPct / 100);
        calcResult = {
          ...calcResult,
          pMasteryPosterior: Number((bktState.pMastery + penalizedGain).toFixed(4)),
        };
        adjusted.reasons.push(`socratic_hint_penalty_${appliedHintPenaltyPct}pct`);
        feedback += ` 💡 (Враховано підказку Сократа: -${appliedHintPenaltyPct}% приросту P(L))`;
      }

      const isMastered = BktEngine.isMastered(calcResult.pMasteryPosterior);

      updatedState = await this.prisma.bktState.update({
        where: { id: bktState.id },
        data: {
          pMastery: calcResult.pMasteryPosterior,
          attemptsCount: bktState.attemptsCount + 1,
          isMastered,
          masteredAt: isMastered ? (bktState.masteredAt || new Date()) : null,
        },
      });
    }

    bktResult = calcResult;

    // Save BKT History entry
    await this.prisma.bktHistory.create({
      data: {
        userId: user.id,
        skillId: task.skillId,
        taskId: task.id,
        pMasteryBefore: bktState.pMastery,
        pMasteryAfter: calcResult.pMasteryPosterior,
        isCorrect: isPassed,
        pSlipUsed: adjusted.pSlip,
        pGuessUsed: adjusted.pGuess,
        adjustReasons: adjusted.reasons,
        semanticScore: semanticScore ?? null,
        feedbackText: feedback,
        teacherReviewStatus,
      },
    });

    this.telemetryGateway.notifyStudentSubmission({
      userId: user.id,
      taskId: task.id,
      skillId: task.skillId,
      isPassed,
      teacherReviewStatus,
      submissionId: submission.id,
    });

    // Наскрізне логування у незмінний StudentActivityLog (Brainstorm #16)
    try {
      await this.auditLogService.logEvent({
        userId: user.id,
        actorId: user.id,
        actorRole: 'STUDENT',
        courseId: task.skill.courseId || undefined,
        skillId: task.skillId,
        taskId: task.id,
        submissionId: submission.id,
        eventType: dto.isAbandoned ? 'TASK_ABANDON_CONFIRMED' : 'TASK_SUBMITTED',
        payload: {
          isPassed,
          pMasteryPrior: bktState.pMastery,
          pMasteryPosterior: calcResult.pMasteryPosterior,
          deltaL: Number((calcResult.pMasteryPosterior - bktState.pMastery).toFixed(4)),
          adjustReasons: adjusted.reasons,
          pSlip: adjusted.pSlip,
          pGuess: adjusted.pGuess,
          feedbackText: feedback,
          attemptNumber,
          isAbandoned: dto.isAbandoned || false,
          revealedHintLevel: dto.revealedHintLevel,
          appliedHintPenaltyPct,
          detectedMisconception: detectedMisconception?.title || null,
          trace: mathTrace,
        },
      });
    } catch (auditErr) {
      // Non-blocking catch to ensure submission completes even if logging fails
    }

    const recommendedTheoryUrl =
      detectedMisconception?.recommendedReviewUrl || task.studyUnitUrl || null;
    const offerJustInTimeTheory =
      !isPassed &&
      (updatedState.pMastery < 0.35 ||
        Boolean(detectedMisconception) ||
        Boolean(recommendedTheoryUrl));

    return {
      submissionId: submission.id,
      isPassed,
      feedback,
      semanticScore,
      teacherReviewStatus,
      semanticDetails,
      testDetails,
      taskType: task.taskType,
      detectedMisconception,
      recommendedTheoryUrl,
      offerJustInTimeTheory,
      appliedHintPenaltyPct: appliedHintPenaltyPct > 0 ? appliedHintPenaltyPct : undefined,
      bktUpdate: {
        skillId: task.skillId,
        skillTitle: task.skill.title,
        pMasteryBefore: bktState.pMastery,
        pMasteryAfter: updatedState.pMastery,
        pMasteryPosterior: updatedState.pMastery,
        pMasteryChange: bktResult.pMasteryPosterior - bktState.pMastery,
        isMastered: updatedState.isMastered,
        pSlipUsed: adjusted.pSlip,
        pGuessUsed: adjusted.pGuess,
        adjustReasons: adjusted.reasons,
      },
    };
  }

  @Get('state/:userId')
  @ApiOperation({ summary: 'Get current student BKT mastery state across all skills' })
  async getStudentBktState(@Param('userId') userId: string) {
    let targetUserId = userId;
    let user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      user = await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (user) targetUserId = user.id;
    }

    const states = await this.prisma.bktState.findMany({
      where: { userId: targetUserId },
      include: { skill: true },
    });
    return states;
  }

  @Get('analytics/students')
  @ApiOperation({ summary: 'Get real-time analytics for all students' })
  @ApiQuery({ name: 'courseSlug', required: false })
  async getStudentsAnalytics(@Query('courseSlug') courseSlug?: string): Promise<StudentAnalyticsItemDto[]> {
    let courseSkillIds: string[] = [];
    let courseSkillSlugs: string[] = [];
    if (courseSlug) {
      const course = await this.prisma.course.findFirst({
        where: { OR: [{ slug: courseSlug }, { id: courseSlug }] },
        include: { skills: true },
      });
      if (course) {
        courseSkillIds = course.skills.map((sk) => sk.id);
        courseSkillSlugs = course.skills.map((sk) => sk.slug);
      }
    }

    const students = await this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        profile: true,
        bktStates: { include: { skill: true } },
        bktHistories: {
          include: { skill: true, task: true },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        behavioralProfiles: {
          include: {
            session: {
              include: {
                task: {
                  include: { skill: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    const calcMedian = (arr: number[]): number => {
      if (arr.length === 0) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    return students.map((s) => {
      const activeStates = courseSlug && (courseSkillIds.length > 0 || courseSkillSlugs.length > 0)
        ? s.bktStates.filter(
            (st) =>
              courseSkillIds.includes(st.skillId) ||
              courseSkillSlugs.includes(st.skill.slug) ||
              st.skill.courseId === courseSlug
          )
        : s.bktStates;

      const avgMastery =
        activeStates.length > 0
          ? activeStates.reduce((acc, curr) => acc + curr.pMastery, 0) / activeStates.length
          : 0;

      const bktBySkill: Record<string, number> = {};
      s.bktStates.forEach((st) => {
        bktBySkill[st.skill.slug] = st.pMastery;
      });

      // Per-Module Telemetry aggregation
      const telemetryBySkill: Record<string, { wpm: number; copyPasteRatio: number; fatigueIndex: number }> = {};

      s.behavioralProfiles.forEach((bp) => {
        const skillSlug = bp.session?.task?.skill?.slug;
        if (skillSlug) {
          if (!telemetryBySkill[skillSlug]) {
            const fatigue = Math.min(100, Math.round((bp.pauseDurationMs / 1000) * 2));
            telemetryBySkill[skillSlug] = {
              wpm: bp.typingSpeedWpm,
              copyPasteRatio: bp.pasteRatio,
              fatigueIndex: fatigue,
            };
          }
        } else if (bp.pasteRatio > 0 || bp.typingSpeedWpm > 0) {
          const fatigue = Math.min(100, Math.round((bp.pauseDurationMs / 1000) * 2));
          activeStates.forEach((st) => {
            const slug = st.skill.slug;
            if (!telemetryBySkill[slug] || telemetryBySkill[slug].copyPasteRatio === 0) {
              telemetryBySkill[slug] = {
                wpm: bp.typingSpeedWpm,
                copyPasteRatio: bp.pasteRatio,
                fatigueIndex: fatigue,
              };
            }
          });
        }
      });

      // Collect telemetry arrays across active course skills for median calculation
      const wpms: number[] = [];
      const copyPastes: number[] = [];
      const fatigues: number[] = [];

      let peakAnomaly = {
        hasAnomaly: false,
        peakSkillSlug: '',
        peakSkillTitle: '',
        copyPasteRatio: 0,
      };

      activeStates.forEach((st) => {
        const slug = st.skill.slug;
        if (!telemetryBySkill[slug]) {
          telemetryBySkill[slug] = { wpm: 0, copyPasteRatio: 0, fatigueIndex: 0 };
        }
      });

      const targetSkills = courseSlug && courseSkillSlugs.length > 0
        ? courseSkillSlugs
        : Object.keys(telemetryBySkill);

      targetSkills.forEach((slug) => {
        const item = telemetryBySkill[slug] || { wpm: 0, copyPasteRatio: 0, fatigueIndex: 0 };
        if (item.wpm > 0 || item.copyPasteRatio > 0 || item.fatigueIndex > 0) {
          wpms.push(item.wpm);
          copyPastes.push(item.copyPasteRatio);
          fatigues.push(item.fatigueIndex);
        }

        if (item.copyPasteRatio >= 0.60 && item.copyPasteRatio >= peakAnomaly.copyPasteRatio) {
          const skillObj = s.bktStates.find((st) => st.skill.slug === slug)?.skill;
          peakAnomaly = {
            hasAnomaly: true,
            peakSkillSlug: slug,
            peakSkillTitle: skillObj?.title || slug,
            copyPasteRatio: item.copyPasteRatio,
          };
        }
      });

      // Fallback if behavioral profile exists without skill reference
      if (wpms.length === 0 && s.behavioralProfiles.length > 0) {
        const bp = s.behavioralProfiles[0];
        const fatigue = Math.min(100, Math.round((bp.pauseDurationMs / 1000) * 2));
        wpms.push(bp.typingSpeedWpm);
        copyPastes.push(bp.pasteRatio);
        fatigues.push(fatigue);
      }

      const medianWpm = Math.round(calcMedian(wpms));
      const medianCopyPasteRatio = calcMedian(copyPastes);
      const medianFatigueIndex = Math.round(calcMedian(fatigues));

      const recentAdjustments = (s.bktHistories || []).map((h) => ({
        id: h.id,
        skillSlug: h.skill.slug,
        skillTitle: h.skill.title,
        taskId: h.taskId || undefined,
        taskTitle: h.task?.title || undefined,
        taskType: h.task?.taskType || undefined,
        taskDescription: h.task?.description || undefined,
        taskOptions: h.task?.options || undefined,
        pSlipUsed: h.pSlipUsed,
        pGuessUsed: h.pGuessUsed,
        adjustReasons: h.adjustReasons,
        semanticScore: h.semanticScore ?? undefined,
        feedbackText: h.feedbackText ?? undefined,
        teacherReviewStatus: h.teacherReviewStatus,
        teacherComment: h.teacherComment ?? undefined,
        isCorrect: h.isCorrect,
        createdAt: h.createdAt instanceof Date ? h.createdAt.toISOString() : String(h.createdAt),
      }));

      const hasGuessAlert = (s.bktHistories || []).some(
        (h) => h.pGuessUsed && h.pGuessUsed > 0.3
      );

      return {
        id: s.id,
        name: `${s.profile?.firstName || 'Студент'} ${s.profile?.lastName || ''}`.trim(),
        email: s.email,
        averageMastery: avgMastery,
        bktBySkill,
        telemetryBySkill,
        wpm: medianWpm,
        copyPasteRatio: medianCopyPasteRatio,
        fatigueIndex: medianFatigueIndex,
        peakAnomaly,
        hasGuessAlert,
        recentAdjustments,
        unstarted: s.bktStates.length === 0,
      };
    });
  }

  @Post('reset-skill')
  @ApiOperation({ summary: 'Reset student BKT state and submissions for a specific skill node' })
  async resetStudentSkillState(@Body() dto: { userId?: string; skillId: string }) {
    let targetUserId = dto.userId;
    let user = targetUserId ? await this.prisma.user.findUnique({ where: { id: targetUserId } }) : null;
    if (!user) {
      user = await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (!user) throw new NotFoundException('Student user not found');
      targetUserId = user.id;
    }

    const tasksInSkill = await this.prisma.task.findMany({
      where: { skillId: dto.skillId },
      select: { id: true },
    });
    const taskIds = tasksInSkill.map((t) => t.id);

    await this.prisma.submission.deleteMany({
      where: {
        userId: targetUserId,
        taskId: { in: taskIds },
      },
    });

    await this.prisma.bktHistory.deleteMany({
      where: {
        userId: targetUserId,
        skillId: dto.skillId,
      },
    });

    await this.prisma.bktState.deleteMany({
      where: {
        userId: targetUserId,
        skillId: dto.skillId,
      },
    });

    this.telemetryGateway.notifyBktReset(targetUserId, dto.skillId);

    try {
      await this.auditLogService.logEvent({
        userId: targetUserId,
        actorId: targetUserId,
        actorRole: 'STUDENT',
        skillId: dto.skillId,
        eventType: 'STUDENT_SKILL_RESET',
        payload: {
          reason: 'SELF_REMEDIATION_TO_THEORY',
        },
      });
    } catch (e) {}

    return { message: `Progress for skill ${dto.skillId} has been reset` };
  }

  @Post('reset/:studentId?')
  @ApiOperation({ summary: 'Reset student BKT state (optionally scoped to courseSlug)' })
  @ApiQuery({ name: 'courseSlug', required: false, description: 'Optional course slug to scope the reset to a specific course' })
  async resetStudentState(
    @Param('studentId') studentId?: string,
    @Query('courseSlug') courseSlug?: string,
  ) {
    let targetUserId = studentId;
    let user = targetUserId
      ? await this.prisma.user.findFirst({
          where: {
            OR: [
              { id: targetUserId },
              { email: targetUserId },
            ],
          },
        })
      : null;

    if (!user) {
      user = await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (!user) throw new NotFoundException('Student user not found');
    }
    targetUserId = user.id;

    if (courseSlug) {
      // Find all skills belonging to this course
      const courseSkills = await this.prisma.skillNode.findMany({
        where: {
          course: { slug: courseSlug },
        },
        select: {
          id: true,
          tasks: { select: { id: true } },
        },
      });

      const skillIds = courseSkills.map((s) => s.id);
      const taskIds = courseSkills.flatMap((s) => s.tasks.map((t) => t.id));

      await this.prisma.submission.deleteMany({
        where: {
          userId: targetUserId,
          taskId: { in: taskIds },
        },
      });

      await this.prisma.bktHistory.deleteMany({
        where: {
          userId: targetUserId,
          skillId: { in: skillIds },
        },
      });

      await this.prisma.bktState.deleteMany({
        where: {
          userId: targetUserId,
          skillId: { in: skillIds },
        },
      });

      await this.prisma.telemetrySession.deleteMany({
        where: {
          userId: targetUserId,
          taskId: { in: taskIds },
        },
      });

      this.telemetryGateway.notifyBktReset(targetUserId);

      try {
        await this.auditLogService.logEvent({
          userId: targetUserId,
          actorId: 'TEACHER',
          actorRole: 'TEACHER',
          courseId: courseSlug,
          eventType: 'TEACHER_MODULE_REVOKED',
          payload: {
            scope: 'COURSE_SCOPED',
            courseSlug,
            skillsCount: skillIds.length,
          },
        });
      } catch (e) {}

      return {
        message: `Student state for ${targetUserId} scoped to course ${courseSlug} has been reset`,
        courseSlug,
        skillsCount: skillIds.length,
      };
    }

    await this.prisma.submission.deleteMany({ where: { userId: targetUserId } });
    await this.prisma.bktHistory.deleteMany({ where: { userId: targetUserId } });
    await this.prisma.bktState.deleteMany({ where: { userId: targetUserId } });
    await this.prisma.telemetrySession.deleteMany({ where: { userId: targetUserId } });

    this.telemetryGateway.notifyBktReset(targetUserId);

    try {
      await this.auditLogService.logEvent({
        userId: targetUserId,
        actorId: 'TEACHER',
        actorRole: 'TEACHER',
        eventType: 'TEACHER_MODULE_REVOKED',
        payload: {
          scope: 'GLOBAL',
        },
      });
    } catch (e) {}

    return { message: `Student state for ${targetUserId} has been reset globally` };
  }

  @Get('reviews/queue')
  @ApiOperation({ summary: 'Get queue of student open-ended submissions awaiting teacher review or reviewed archive' })
  @ApiQuery({ name: 'courseSlug', required: false, description: 'Course slug filter' })
  @ApiQuery({ name: 'status', required: false, description: 'Status filter: PENDING | REVIEWED | ALL' })
  async getTeacherReviewQueue(
    @Query('courseSlug') courseSlug?: string,
    @Query('status') statusFilter?: string,
  ): Promise<ReviewQueueItemDto[]> {
    let reviewStatusCondition: any = TeacherReviewStatus.PENDING_REVIEW;
    if (statusFilter === 'REVIEWED') {
      reviewStatusCondition = { in: [TeacherReviewStatus.APPROVED, TeacherReviewStatus.REJECTED] };
    } else if (statusFilter === 'ALL') {
      reviewStatusCondition = { not: TeacherReviewStatus.NONE };
    }

    const submissions = await this.prisma.submission.findMany({
      where: {
        teacherReviewStatus: reviewStatusCondition,
        ...(courseSlug
          ? {
              task: {
                skill: {
                  course: {
                    slug: courseSlug,
                  },
                },
              },
            }
          : {}),
      },
      include: {
        user: {
          include: { profile: true },
        },
        task: {
          include: {
            skill: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Ensure strict deduplication: at most 1 active review item per (userId, taskId)
    // Any older drafts that remained PENDING_REVIEW are automatically marked SUPERSEDED
    const uniqueMap = new Map<string, typeof submissions[0]>();
    const staleIdsToSupersede: string[] = [];

    for (const sub of submissions) {
      const key = `${sub.userId}_${sub.taskId}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, sub);
      } else {
        staleIdsToSupersede.push(sub.id);
      }
    }

    if (staleIdsToSupersede.length > 0) {
      await this.prisma.submission.updateMany({
        where: { id: { in: staleIdsToSupersede } },
        data: { teacherReviewStatus: TeacherReviewStatus.SUPERSEDED },
      });
    }

    const uniqueSubmissions = Array.from(uniqueMap.values());

    // Fetch full submission history for each student and task in the queue
    const results = await Promise.all(
      uniqueSubmissions.map(async (sub) => {
        const history = await this.prisma.submission.findMany({
          where: {
            userId: sub.userId,
            taskId: sub.taskId,
          },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            attemptNumber: true,
            code: true,
            status: true,
            teacherReviewStatus: true,
            teacherComment: true,
            createdAt: true,
          },
        });

        return {
          submissionId: sub.id,
          studentId: sub.userId,
          studentName: `${sub.user.profile?.firstName || 'Студент'} ${sub.user.profile?.lastName || ''}`.trim(),
          studentEmail: sub.user.email,
          taskId: sub.taskId,
          taskTitle: sub.task.title,
          taskDescription: sub.task.description,
          skillSlug: sub.task.skill.slug,
          skillTitle: sub.task.skill.title,
          answerText: sub.code,
          attemptNumber: sub.attemptNumber || history.length || 1,
          totalAttempts: history.length,
          referenceAnswer: sub.task.referenceAnswer,
          rubrics: sub.task.rubrics,
          misconceptions: sub.task.misconceptions,
          submittedAt: sub.createdAt,
          teacherReviewStatus: sub.teacherReviewStatus,
          teacherComment: sub.teacherComment,
          attemptsHistory: history.map((h) => ({
            id: h.id,
            attemptNumber: h.attemptNumber,
            answerText: h.code,
            status: h.status,
            teacherReviewStatus: h.teacherReviewStatus,
            teacherComment: h.teacherComment,
            submittedAt: h.createdAt,
          })),
        };
      }),
    );

    return results;
  }

  @Post('reviews/:submissionId/decision')
  @ApiOperation({ summary: 'Submit teacher review decision (APPROVE / REJECT) with comment and optional score override' })
  async reviewSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: { decision: 'APPROVE' | 'REJECT'; comment?: string; scoreOverride?: number },
  ) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        task: { include: { skill: true } },
      },
    });

    if (!submission) {
      throw new NotFoundException(`Submission ${submissionId} not found`);
    }

    const newStatus =
      dto.decision === 'APPROVE'
        ? TeacherReviewStatus.APPROVED
        : TeacherReviewStatus.REJECTED;

    const isCorrect = dto.decision === 'APPROVE';

    // 1. Оновлюємо статус перевірки в submission
    const updatedSub = await this.prisma.submission.update({
      where: { id: submissionId },
      data: {
        teacherReviewStatus: newStatus,
        teacherComment: dto.comment || null,
        status: isCorrect ? SubmissionStatus.ACCEPTED : SubmissionStatus.REJECTED,
      },
    });

    // 2. Оновлюємо або створюємо запис у bkt_histories
    const latestHistory = await this.prisma.bktHistory.findFirst({
      where: {
        userId: submission.userId,
        taskId: submission.taskId,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (latestHistory) {
      await this.prisma.bktHistory.update({
        where: { id: latestHistory.id },
        data: {
          teacherReviewStatus: newStatus,
          teacherComment: dto.comment || null,
          semanticScore: dto.scoreOverride !== undefined ? dto.scoreOverride : latestHistory.semanticScore,
        },
      });
    }

    // 3. Якщо викладач затвердив відповідь, оновлюємо стан знання у bkt_states
    let bktState = await this.prisma.bktState.findUnique({
      where: {
        userId_skillId: {
          userId: submission.userId,
          skillId: submission.task.skillId,
        },
      },
    });

    if (bktState) {
      const calcResult = BktEngine.calculateNextState(
        {
          pMastery: bktState.pMastery,
          pTransit: bktState.pTransit,
          pSlip: 0.05,
          pGuess: 0.1,
        },
        isCorrect,
      );

      const isMasteredNow = BktEngine.isMastered(calcResult.pMasteryPosterior);
      bktState = await this.prisma.bktState.update({
        where: { id: bktState.id },
        data: {
          pMastery: calcResult.pMasteryPosterior,
          isMastered: isMasteredNow,
          masteredAt: isMasteredNow && !bktState.isMastered ? new Date() : bktState.masteredAt,
          attemptsCount: { increment: 1 },
        },
      });
    }

    this.telemetryGateway.notifyTeacherReviewDecision({
      submissionId: updatedSub.id,
      decision: dto.decision,
      userId: submission.userId,
      taskId: submission.taskId,
      comment: dto.comment || null,
      scoreOverride: dto.scoreOverride !== undefined ? dto.scoreOverride : null,
    });

    try {
      await this.auditLogService.logEvent({
        userId: submission.userId,
        actorId: 'TEACHER',
        actorRole: 'TEACHER',
        courseId: submission.task.skill.courseId || undefined,
        skillId: submission.task.skillId,
        taskId: submission.taskId,
        submissionId: updatedSub.id,
        eventType: dto.decision === 'APPROVE' ? 'TEACHER_REVIEW_APPROVED' : 'TEACHER_REVIEW_REJECTED',
        payload: {
          decision: dto.decision,
          comment: dto.comment,
          scoreOverride: dto.scoreOverride,
          pMasteryUpdated: bktState?.pMastery,
        },
      });
    } catch (e) {}

    return {
      success: true,
      submissionId: updatedSub.id,
      teacherReviewStatus: updatedSub.teacherReviewStatus,
      pMasteryUpdated: bktState?.pMastery,
    };
  }

  @Post('activity-logs')
  @ApiOperation({ summary: 'Log student/teacher learning activity event' })
  async logActivityEvent(@Body() dto: CreateActivityLogDto) {
    return this.auditLogService.logEvent(dto);
  }

  @Get('activity-logs/student/:userId')
  @ApiOperation({ summary: 'Get recent activity logs for a student' })
  async getStudentActivityLogs(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditLogService.getStudentLogs(userId, limit ? Number(limit) : 50);
  }

  @Get('activity-logs/recent')
  @ApiOperation({ summary: 'Get recent live activity logs feed across all students' })
  async getRecentActivityLogs(@Query('limit') limit?: number) {
    return this.auditLogService.getRecentLogs(limit ? Number(limit) : 100);
  }

  @Post('submissions/:submissionId/annul')
  @ApiOperation({ summary: 'Annul submission by teacher with penalty rollback in BKT' })
  async annulSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: { teacherId?: string; reason: any; comment: string; penaltyMultiplier?: number },
  ) {
    return this.auditLogService.annulSubmission({
      submissionId,
      teacherId: dto.teacherId,
      reason: dto.reason,
      comment: dto.comment,
      penaltyMultiplier: dto.penaltyMultiplier,
    });
  }

  @Get('activity-logs/export')
  @ApiOperation({ summary: 'Export activity logs dataset as JSONL or CSV for AI/ML training' })
  async exportActivityLogs(
    @Res() res: Response,
    @Query('courseSlug') courseSlug?: string,
    @Query('userId') userId?: string,
    @Query('format') format?: 'jsonl' | 'csv',
  ) {
    const result = await this.auditLogService.exportDataset({ courseSlug, userId, format });
    const contentType = format === 'csv' ? 'text/csv' : 'application/x-ndjson';
    const filename = `activity_logs_${Date.now()}.${format === 'csv' ? 'csv' : 'jsonl'}`;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(result);
  }

  @Delete('activity-logs')
  @ApiOperation({ summary: 'Clear all student activity audit logs (Admin only)' })
  async clearActivityLogs(
    @Query('actorId') actorId?: string,
    @Query('actorRole') actorRole?: string,
  ) {
    return this.auditLogService.clearAllLogs(actorId || 'admin', actorRole || 'ADMIN');
  }

  @Post('audit/verify')
  @ApiOperation({ summary: 'Run BKT mathematical verification suite and event stream auditor via Python script' })
  async runAuditVerifier(@Query('mode') mode?: 'test-only' | 'full') {
    return this.auditLogService.runPythonVerifier(mode || 'full');
  }

  @Get('audit/verify')
  @ApiOperation({ summary: 'Get current BKT mathematical verification status via Python script' })
  async getAuditVerifierStatus(@Query('mode') mode?: 'test-only' | 'full') {
    return this.auditLogService.runPythonVerifier(mode || 'full');
  }
}
