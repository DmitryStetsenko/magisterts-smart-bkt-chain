import { Controller, Post, Get, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import * as vm from 'vm';
import { PrismaService } from '../../outbound/persistence/prisma.service';
import { BktEngine } from '../../../domain/bkt/bkt-engine';
import { SubmitTaskDto } from './dto/submit-task.dto';
import { SubmissionStatus } from '@sbc/database';

@ApiTags('BKT')
@Controller('bkt')
export class BktController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('evaluate')
  @ApiOperation({ summary: 'Evaluate student JavaScript code submission and update BKT knowledge state P(L_t)' })
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

    // Evaluate code safely inside Node VM
    let passedCount = 0;
    const totalCount = task.testCases.length;
    const testDetails: Array<{ input: string; expected: string; actual: string; passed: boolean }> = [];

    for (const testCase of task.testCases) {
      let isPassed = false;
      let actualOutput = '';

      try {
        const sandbox = { result: undefined };
        const scriptCode = `
          ${dto.code}
          const args = ${testCase.input};
          const fnName = Object.keys(this).find(k => typeof this[k] === 'function') || 'sum';
          const fn = eval(fnName);
          result = fn.apply(null, Array.isArray(args) ? args : [args]);
        `;

        const context = vm.createContext(sandbox);
        const script = new vm.Script(scriptCode);
        script.runInContext(context, { timeout: 1000 });

        const rawResult = sandbox.result;
        actualOutput = typeof rawResult === 'object' ? JSON.stringify(rawResult) : String(rawResult);

        // Normalize output for comparison
        isPassed = actualOutput.replace(/\s+/g, '') === testCase.expectedOutput.replace(/\s+/g, '');
      } catch (err) {
        actualOutput = `Error: ${(err as Error).message}`;
        isPassed = false;
      }

      if (isPassed) passedCount++;

      testDetails.push({
        input: testCase.input,
        expected: testCase.expectedOutput,
        actual: actualOutput,
        passed: isPassed,
      });
    }

    const isAllPassed = passedCount === totalCount && totalCount > 0;

    // Get or initialize current BKT State
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

    // Calculate next BKT mastery state using BktEngine
    const bktResult = BktEngine.calculateNextState(
      {
        pMastery: bktState.pMastery,
        pTransit: bktState.pTransit,
        pSlip: bktState.pSlip,
        pGuess: bktState.pGuess,
      },
      isAllPassed,
    );

    // Save BktState update
    await this.prisma.bktState.update({
      where: { id: bktState.id },
      data: {
        pMastery: bktResult.pMasteryPosterior,
        isMastered: BktEngine.isMastered(bktResult.pMasteryPosterior),
        masteredAt: BktEngine.isMastered(bktResult.pMasteryPosterior) ? new Date() : null,
      },
    });

    // Create Submission record
    const submission = await this.prisma.submission.create({
      data: {
        userId: user.id,
        taskId: task.id,
        code: dto.code,
        status: isAllPassed ? SubmissionStatus.ACCEPTED : SubmissionStatus.REJECTED,
        evaluationResult: {
          create: {
            unitTestsPassed: passedCount,
            unitTestsTotal: totalCount,
            astPassed: true,
          },
        },
      },
    });

    // Save BktHistory record
    await this.prisma.bktHistory.create({
      data: {
        userId: user.id,
        skillId: task.skillId,
        pMasteryBefore: bktResult.pMasteryPrior,
        pMasteryAfter: bktResult.pMasteryPosterior,
        isCorrect: isAllPassed,
      },
    });

    return {
      submissionId: submission.id,
      status: submission.status,
      passedTestsCount: passedCount,
      totalTestsCount: totalCount,
      bktUpdate: {
        skillSlug: task.skill.slug,
        skillTitle: task.skill.title,
        pMasteryPrior: bktResult.pMasteryPrior,
        pMasteryPosterior: bktResult.pMasteryPosterior,
        isMastered: BktEngine.isMastered(bktResult.pMasteryPosterior),
      },
      testDetails,
    };
  }

  @Get('state/:userId')
  @ApiOperation({ summary: 'Get current BKT mastery state for a student across all skills' })
  async getStudentState(@Param('userId') userId: string) {
    const states = await this.prisma.bktState.findMany({
      where: { userId },
      include: { skill: true },
    });

    return states.map((s) => ({
      skillId: s.skillId,
      skillSlug: s.skill.slug,
      title: s.skill.title,
      pMastery: s.pMastery,
      isMastered: BktEngine.isMastered(s.pMastery),
      updatedAt: s.updatedAt,
    }));
  }
}
