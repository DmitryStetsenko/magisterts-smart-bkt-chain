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
  @ApiQuery({ name: 'courseSlug', required: false })
  async getAllTasks(@Query('courseSlug') courseSlug?: string) {
    let whereCondition = {};
    if (courseSlug) {
      const course = await this.prisma.course.findUnique({ where: { slug: courseSlug } });
      if (course) {
        whereCondition = { skill: { courseId: course.id } };
      }
    }

    return this.prisma.task.findMany({
      where: whereCondition,
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
  @ApiQuery({ name: 'courseSlug', required: false, description: 'Course slug filter (js-dev, english-b2, ukraine-law)' })
  async getRecommendedTask(
    @Query('userId') userId?: string,
    @Query('courseSlug') courseSlug?: string,
  ) {
    let targetUserId = userId;
    let user = targetUserId ? await this.prisma.user.findUnique({ where: { id: targetUserId } }) : null;
    if (!user) {
      user = await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (!user) throw new NotFoundException('No student found');
      targetUserId = user.id;
    }

    let courseIdCondition: string | undefined = undefined;
    if (courseSlug) {
      const course = await this.prisma.course.findUnique({ where: { slug: courseSlug } });
      if (course) {
        courseIdCondition = course.id;
      }
    }

    const skills = await this.prisma.skillNode.findMany({
      where: courseIdCondition ? { courseId: courseIdCondition } : {},
      include: {
        parentDependencies: true,
      },
    });

    const tasks = await this.prisma.task.findMany({
      where: courseIdCondition ? { skill: { courseId: courseIdCondition } } : {},
    });

    if (tasks.length === 0) {
      throw new NotFoundException(`No tasks found for course ${courseSlug || 'all'}`);
    }

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
      topic: t.topic,
      subConcept: t.subConcept,
    }));

    const recommendation = TaskSequencer.recommendNextTask({
      skills: skillDomains,
      studentStates: masteryMap,
      tasks: taskDomains,
      completedTaskIds: submissions.map((s) => s.taskId),
    });

    let fullTask = null;
    if (recommendation && recommendation.recommendedTask) {
      fullTask = await this.prisma.task.findUnique({
        where: { id: recommendation.recommendedTask.id },
        include: {
          skill: true,
          testCases: { where: { isSecret: false } },
        },
      });
    }

    // Fallback if all recommended tasks completed or no sequencing match
    if (!fullTask && tasks.length > 0) {
      fullTask = await this.prisma.task.findFirst({
        where: courseIdCondition ? { skill: { courseId: courseIdCondition } } : {},
        include: {
          skill: true,
          testCases: { where: { isSecret: false } },
        },
      });
    }

    if (!fullTask) {
      throw new NotFoundException('No recommended tasks available');
    }

    return {
      recommendation: recommendation || { targetSkillSlug: fullTask.skill.slug, reason: 'First task in course' },
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

  @Get(':id/submissions')
  @ApiOperation({ summary: 'Get student attempt history and teacher feedback for a specific task' })
  @ApiQuery({ name: 'userId', required: false, description: 'Student User ID' })
  async getTaskSubmissions(
    @Param('id') taskId: string,
    @Query('userId') userId?: string,
  ) {
    let targetUserId = userId;
    let user = targetUserId ? await this.prisma.user.findUnique({ where: { id: targetUserId } }) : null;
    if (!user) {
      user = await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (!user) throw new NotFoundException('Student user not found');
      targetUserId = user.id;
    }

    const submissions = await this.prisma.submission.findMany({
      where: {
        taskId,
        userId: targetUserId,
      },
      orderBy: { createdAt: 'desc' },
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

    return submissions;
  }
}
