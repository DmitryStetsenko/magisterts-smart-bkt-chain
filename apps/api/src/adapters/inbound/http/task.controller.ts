import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PrismaService } from '../../outbound/persistence/prisma.service';
import { TaskSequencer } from '../../../domain/sequencing/task-sequencer';
import { SubmissionStatus } from '@sbc/database';

@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available tasks grouped by skill' })
  async getAllTasks() {
    return this.prisma.task.findMany({
      include: {
        skill: true,
        testCases: {
          where: { isSecret: false },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  @Get('recommended')
  @ApiOperation({ summary: 'Get adaptive next recommended task for a student based on BKT mastery' })
  @ApiQuery({ name: 'userId', required: false, description: 'Student User ID' })
  async getRecommendedTask(@Query('userId') userId?: string) {
    let targetUserId = userId;
    if (!targetUserId) {
      const student = await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (!student) throw new NotFoundException('No student found');
      targetUserId = student.id;
    }

    const skills = await this.prisma.skillNode.findMany({
      include: {
        parentDependencies: true,
      },
    });

    const tasks = await this.prisma.task.findMany();

    const studentStates = await this.prisma.bktState.findMany({
      where: { userId: targetUserId },
    });

    const submissions = await this.prisma.submission.findMany({
      where: { userId: targetUserId, status: SubmissionStatus.ACCEPTED },
      select: { taskId: true },
    });

    const masteryMap: Record<string, number> = {};
    studentStates.forEach((state) => {
      masteryMap[state.skillId] = state.pMastery;
    });

    const skillDomains = skills.map((s) => ({
      id: s.id,
      slug: s.slug,
      title: s.title,
      parentSkillIds: s.parentDependencies.map((dep) => dep.parentSkillId),
    }));

    const taskDomains = tasks.map((t) => ({
      id: t.id,
      skillId: t.skillId,
      title: t.title,
      difficulty: t.difficulty,
    }));

    const recommendation = TaskSequencer.recommendNextTask({
      skills: skillDomains,
      studentStates: masteryMap,
      tasks: taskDomains,
      completedTaskIds: submissions.map((s) => s.taskId),
    });

    if (!recommendation) {
      throw new NotFoundException('No tasks available');
    }

    const fullTask = await this.prisma.task.findUnique({
      where: { id: recommendation.recommendedTask.id },
      include: {
        skill: true,
        testCases: { where: { isSecret: false } },
      },
    });

    return {
      recommendation,
      task: fullTask,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID with starter code and public test cases' })
  async getTaskById(@Param('id') id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        skill: true,
        testCases: { where: { isSecret: false } },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }
}
