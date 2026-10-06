import { Controller, Post, Get, Body, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import * as vm from 'vm';
import { PrismaService } from '../../outbound/persistence/prisma.service';
import { BktEngine } from '../../../domain/bkt/bkt-engine';
import { SubmitTaskDto } from './dto/submit-task.dto';
import { SubmissionStatus, TaskType } from '@sbc/database';

@ApiTags('BKT')
@Controller('bkt')
export class BktController {
  constructor(private readonly prisma: PrismaService) {}

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
    let customPGuess: number | undefined = undefined;

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

        // Telemetry Reaction Latency: < 2000ms triggers Guessing Warning
        if (dto.reactionLatencyMs && dto.reactionLatencyMs < 2000) {
          customPGuess = 0.85;
          feedback += ' ⚡ (Високий показник латентності: можливе вгадування)';
        }
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
        const options = (task.options as { keywords?: string[]; minWords?: number }) || {};
        const keywords = options.keywords || [];
        const minWords = options.minWords || 10;

        const words = essayText.split(/\s+/).filter(Boolean);
        const lowerText = essayText.toLowerCase();

        const matchedKeywords = keywords.filter((kw) => lowerText.includes(kw.toLowerCase()));
        const isWordLengthOk = words.length >= minWords;
        const isKeywordMatchOk = keywords.length === 0 || matchedKeywords.length >= Math.min(2, keywords.length);

        isPassed = isWordLengthOk && isKeywordMatchOk;
        feedback = isPassed
          ? `Чудова розгорнута відповідь! Обсяг: ${words.length} слів, ключові категорії висвітлено: (${matchedKeywords.join(', ')})`
          : `Відповідь потребує доопрацювання. Перевірте обсяг (мін. ${minWords} слів) та використання ключових понять (${keywords.join(', ')})`;
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
            const scriptCode = `
              ${dto.code || ''}
              const rawInput = ${testCase.input};
              const fnName = Object.keys(this).find(k => typeof this[k] === 'function' && k !== 'eval' && k !== 'setTimeout' && k !== 'clearTimeout');
              const fn = eval(fnName);
              const args = Array.isArray(rawInput) ? rawInput : [rawInput];
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
          pGuess: customPGuess || 0.2,
        },
      });
    }

    const effectivePGuess = customPGuess || bktState.pGuess;

    const bktResult = BktEngine.calculateNextState(
      {
        pMastery: bktState.pMastery,
        pTransit: bktState.pTransit,
        pSlip: bktState.pSlip,
        pGuess: effectivePGuess,
      },
      isPassed,
    );

    const isMastered = BktEngine.isMastered(bktResult.pMasteryPosterior);

    const updatedState = await this.prisma.bktState.update({
      where: { id: bktState.id },
      data: {
        pMastery: bktResult.pMasteryPosterior,
        attemptsCount: bktState.attemptsCount + 1,
        isMastered,
        masteredAt: isMastered ? new Date() : null,
      },
    });

    // Save BKT History entry
    await this.prisma.bktHistory.create({
      data: {
        userId: user.id,
        skillId: task.skillId,
        pMasteryBefore: bktState.pMastery,
        pMasteryAfter: bktResult.pMasteryPosterior,
        isCorrect: isPassed,
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
      },
    };
  }

  @Get('state/:userId')
  @ApiOperation({ summary: 'Get current student BKT mastery state across all skills' })
  async getStudentBktState(@Param('userId') userId: string) {
    const states = await this.prisma.bktState.findMany({
      where: { userId },
      include: { skill: true },
    });
    return states;
  }

  @Get('analytics/students')
  @ApiOperation({ summary: 'Get real-time analytics for all students' })
  @ApiQuery({ name: 'courseSlug', required: false })
  async getStudentsAnalytics(@Query('courseSlug') courseSlug?: string) {
    const students = await this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      include: {
        profile: true,
        bktStates: { include: { skill: true } },
        behavioralProfiles: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    return students.map((s) => {
      const activeStates = courseSlug
        ? s.bktStates.filter((st) => st.skill.courseId === courseSlug)
        : s.bktStates;

      const avgMastery =
        activeStates.length > 0
          ? activeStates.reduce((acc, curr) => acc + curr.pMastery, 0) / activeStates.length
          : 0;

      const bktBySkill: Record<string, number> = {};
      s.bktStates.forEach((st) => {
        bktBySkill[st.skill.slug] = st.pMastery;
      });

      const profile = s.behavioralProfiles[0];

      return {
        id: s.id,
        name: `${s.profile?.firstName || 'Студент'} ${s.profile?.lastName || ''}`.trim(),
        email: s.email,
        averageMastery: avgMastery,
        bktBySkill,
        wpm: profile ? profile.typingSpeedWpm : 0,
        copyPasteRatio: profile ? profile.pasteRatio : 0,
        fatigueIndex: profile ? Math.min(100, Math.round((profile.pauseDurationMs / 1000) * 2)) : 0,
        unstarted: s.bktStates.length === 0,
      };
    });
  }

  @Post('reset/:studentId?')
  @ApiOperation({ summary: 'Reset student BKT state' })
  async resetStudentState(@Param('studentId') studentId?: string) {
    let targetUserId = studentId;
    if (!targetUserId) {
      const student = await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (!student) throw new NotFoundException('Student user not found');
      targetUserId = student.id;
    }

    await this.prisma.submission.deleteMany({ where: { userId: targetUserId } });
    await this.prisma.bktHistory.deleteMany({ where: { userId: targetUserId } });
    await this.prisma.bktState.deleteMany({ where: { userId: targetUserId } });
    await this.prisma.telemetrySession.deleteMany({ where: { userId: targetUserId } });

    return { message: `Student state for ${targetUserId} has been reset` };
  }
}
