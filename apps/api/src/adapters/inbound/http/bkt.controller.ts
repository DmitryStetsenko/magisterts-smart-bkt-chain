import { Controller, Post, Get, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import * as vm from 'vm';
import { PrismaService } from '../../outbound/persistence/prisma.service';
import { TelemetryGateway } from '../websocket/telemetry.gateway';
import { BktEngine } from '../../../domain/bkt/bkt-engine';
import { BehavioralAdjuster } from '../../../domain/bkt/behavioral-adjuster';
import { OpenTextHeuristicEvaluator } from '../../../domain/evaluation/open-text-heuristic-evaluator';
import { SubmitTaskDto } from './dto/submit-task.dto';
import { SubmissionStatus, TaskType } from '@sbc/database';

@ApiTags('BKT')
@Controller('bkt')
export class BktController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly telemetryGateway: TelemetryGateway,
  ) {}

  @Post('evaluate')
  @ApiOperation({ summary: 'Evaluate student submission across task types (CODE, SINGLE_CHOICE, MULTIPLE_CHOICE, TEXT_ESSAY) and update BKT P(L_t)' })
  @ApiResponse({ status: 200, description: 'Evaluation result and updated BKT mastery probability' })
  async evaluateSubmission(@Body() dto: SubmitTaskDto) {
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
    let testDetails: any[] = [];
    let passedTestsRatio: number | undefined = undefined;
    let conceptCoverageRatio: number | undefined = undefined;

    // Polyglot Evaluation Strategies based on TaskType
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

      case TaskType.TEXT_ESSAY: {
        const essayText = (dto.essayAnswer || '').trim();
        const options = (task.options as { keywords?: string[]; minWords?: number; maxWords?: number }) || {};

        // Виклик чистого доменного модуля OpenTextHeuristicEvaluator (Tier 1)
        const evalRes = OpenTextHeuristicEvaluator.evaluate(essayText, {
          keywords: options.keywords,
          minWords: options.minWords ?? 5,
          maxWords: options.maxWords,
          taskQuestion: task.description || task.title,
        });

        isPassed = evalRes.isPassed;
        feedback = evalRes.feedback;
        conceptCoverageRatio = evalRes.conceptCoverageRatio;
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
              if (!fnName) {
                throw new Error("Функція не знайдена. Визначте функцію у рішення.");
              }
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
            `;

            const context = vm.createContext(sandbox);
            const script = new vm.Script(scriptCode);
            script.runInContext(context, { timeout: 2000 });

            let rawResult = sandbox.result;
            if (rawResult && typeof (rawResult as any).then === 'function') {
              rawResult = await rawResult;
            }

            actualOutput = typeof rawResult === 'object' ? JSON.stringify(rawResult) : String(rawResult);
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

    // Save Submission Log
    const submission = await this.prisma.submission.create({
      data: {
        userId: user.id,
        taskId: task.id,
        code: dto.code || dto.essayAnswer || dto.selectedOptionId || (dto.selectedOptionIds ? dto.selectedOptionIds.join(',') : ''),
        status: isPassed ? SubmissionStatus.ACCEPTED : SubmissionStatus.REJECTED,
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

    if (adjusted.pGuess > bktState.pGuess) {
      feedback += ' ⚡ (Високий показник латентності: можливе вгадування)';
    } else if (adjusted.pSlip > bktState.pSlip) {
      feedback += ' 🛡️ (Схоже на випадкову помилку: засвоєння знижено помірно)';
    }

    const calcResult = BktEngine.calculateNextState(
      {
        pMastery: bktState.pMastery,
        pTransit: bktState.pTransit,
        pSlip: adjusted.pSlip,
        pGuess: adjusted.pGuess,
      },
      isPassed,
    );

    const isMastered = BktEngine.isMastered(calcResult.pMasteryPosterior);

    updatedState = await this.prisma.bktState.update({
      where: { id: bktState.id },
      data: {
        pMastery: calcResult.pMasteryPosterior,
        attemptsCount: bktState.attemptsCount + 1,
        isMastered,
        masteredAt: isMastered ? new Date() : null,
      },
    });

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
      },
    });

    return {
      submissionId: submission.id,
      isPassed,
      feedback,
      testDetails,
      taskType: task.taskType,
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
  async getStudentsAnalytics(@Query('courseSlug') courseSlug?: string) {
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
        isCorrect: h.isCorrect,
        createdAt: h.createdAt,
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

    return { message: `Progress for skill ${dto.skillId} has been reset` };
  }

  @Post('reset/:studentId?')
  @ApiOperation({ summary: 'Reset student BKT state' })
  async resetStudentState(@Param('studentId') studentId?: string) {
    let targetUserId = studentId;
    let user = targetUserId ? await this.prisma.user.findUnique({ where: { id: targetUserId } }) : null;
    if (!user) {
      user = await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (!user) throw new NotFoundException('Student user not found');
      targetUserId = user.id;
    }

    await this.prisma.submission.deleteMany({ where: { userId: targetUserId } });
    await this.prisma.bktHistory.deleteMany({ where: { userId: targetUserId } });
    await this.prisma.bktState.deleteMany({ where: { userId: targetUserId } });
    await this.prisma.telemetrySession.deleteMany({ where: { userId: targetUserId } });

    this.telemetryGateway.notifyBktReset(targetUserId);

    return { message: `Student state for ${targetUserId} has been reset` };
  }
}
