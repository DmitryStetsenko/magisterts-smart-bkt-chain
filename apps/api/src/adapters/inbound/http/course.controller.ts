import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../outbound/persistence/prisma.service';
import type {
  CreateCourseDto,
  UpdateCourseDto,
  CreateCourseModuleDto,
  UpdateCourseModuleDto,
} from '@sbc/types';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
  private readonly logger = new Logger(CourseController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Отримати перелік усіх доступних курсів із модулями та навичками
   */
  @Get()
  @ApiOperation({ summary: 'Get all available academic courses' })
  async getCourses() {
    return this.prisma.course.findMany({
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            skills: {
              select: { id: true, slug: true, title: true, difficulty: true, orderIndex: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        skills: {
          include: {
            parentDependencies: true,
            tasks: {
              select: { id: true, title: true, taskType: true },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        _count: {
          select: {
            classrooms: true,
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Отримати курс за унікальним слагом із повною структурою модулів та DAG
   */
  @Get(':slug')
  @ApiOperation({ summary: 'Get course by slug with full modules and skill DAG structure' })
  async getCourseBySlug(@Param('slug') slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            skills: {
              include: {
                parentDependencies: true,
                tasks: {
                  select: { id: true, title: true, taskType: true, difficulty: true },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        skills: {
          include: {
            parentDependencies: true,
            module: true,
            tasks: {
              select: { id: true, title: true, taskType: true, difficulty: true },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Курс із слагом "${slug}" не знайдено`);
    }

    return course;
  }

  /**
   * Створити новий навчальний курс
   */
  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  async createCourse(@Body() body: CreateCourseDto) {
    if (!body.title || !body.title.trim()) {
      throw new BadRequestException('Назва курсу обовʼязкова');
    }

    const slug = body.slug
      ? body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await this.prisma.course.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException(`Курс із слагом "${slug}" уже існує`);
    }

    const course = await this.prisma.course.create({
      data: {
        title: body.title.trim(),
        slug,
        description: body.description?.trim() || '',
        icon: body.icon || 'BookOpen',
        targetAudience: body.targetAudience?.trim() || null,
        defaultMasteryThreshold: body.defaultMasteryThreshold ?? 0.85,
        isPublished: true,
      },
      include: {
        modules: true,
        skills: true,
      },
    });

    this.logger.log(`Created new course: "${course.title}" (${course.slug})`);
    return course;
  }

  /**
   * Оновити налаштування курсу (назва, опис, поріг майстерності, статус публікації)
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update course metadata and thresholds' })
  async updateCourse(@Param('id') id: string, @Body() body: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) {
      throw new NotFoundException(`Курс із ID ${id} не знайдено`);
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.slug !== undefined) {
      updateData.slug = body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (body.description !== undefined) updateData.description = body.description.trim();
    if (body.icon !== undefined) updateData.icon = body.icon;
    if (body.targetAudience !== undefined) updateData.targetAudience = body.targetAudience?.trim() || null;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;
    if (body.defaultMasteryThreshold !== undefined) {
      updateData.defaultMasteryThreshold = Number(body.defaultMasteryThreshold);
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        modules: { orderBy: { orderIndex: 'asc' } },
        skills: true,
      },
    });

    this.logger.log(`Updated course ${id} (${updated.title})`);
    return updated;
  }

  /**
   * Видалити курс
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete course' })
  async deleteCourse(@Param('id') id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        _count: { select: { enrollments: true, classrooms: true } },
      },
    });

    if (!course) {
      throw new NotFoundException(`Курс із ID ${id} не знайдено`);
    }

    // Cascade delete in Prisma is configured for enrollments and classrooms, but let's log
    await this.prisma.course.delete({ where: { id } });
    this.logger.log(`Deleted course ${id} (${course.title})`);
    return { success: true, message: `Курс "${course.title}" успішно видалено` };
  }

  // ==================== MODULE MANAGEMENT ENDPOINTS ====================

  /**
   * Отримати всі модулі конкретного курсу
   */
  @Get(':courseId/modules')
  @ApiOperation({ summary: 'Get all modules of a specific course' })
  async getCourseModules(@Param('courseId') courseId: string) {
    return this.prisma.courseModule.findMany({
      where: { courseId },
      include: {
        skills: {
          select: { id: true, slug: true, title: true, difficulty: true, orderIndex: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  /**
   * Створити новий модуль у курсі
   */
  @Post(':courseId/modules')
  @ApiOperation({ summary: 'Create a module in a course' })
  async createModule(
    @Param('courseId') courseId: string,
    @Body() body: CreateCourseModuleDto
  ) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      throw new NotFoundException(`Курс із ID ${courseId} не знайдено`);
    }

    if (!body.title || !body.title.trim()) {
      throw new BadRequestException('Назва модуля обовʼязкова');
    }

    // Determine orderIndex if not provided
    let orderIndex = body.orderIndex;
    if (orderIndex === undefined) {
      const highest = await this.prisma.courseModule.findFirst({
        where: { courseId },
        orderBy: { orderIndex: 'desc' },
        select: { orderIndex: true },
      });
      orderIndex = highest ? highest.orderIndex + 1 : 1;
    }

    const slug = body.slug
      ? body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : `module-${orderIndex}`;

    const existingSlug = await this.prisma.courseModule.findUnique({
      where: {
        courseId_slug: { courseId, slug },
      },
    });

    const finalSlug = existingSlug ? `${slug}-${Date.now().toString().slice(-4)}` : slug;

    const module = await this.prisma.courseModule.create({
      data: {
        courseId,
        title: body.title.trim(),
        slug: finalSlug,
        description: body.description?.trim() || null,
        orderIndex,
        theoryUrl: body.theoryUrl?.trim() || null,
        minMasteryThreshold: body.minMasteryThreshold ?? course.defaultMasteryThreshold ?? 0.85,
      },
      include: {
        skills: true,
      },
    });

    this.logger.log(`Created module "${module.title}" in course ${course.title} (order: ${module.orderIndex})`);
    return module;
  }

  /**
   * Оновити модуль курсу
   */
  @Patch(':courseId/modules/:moduleId')
  @ApiOperation({ summary: 'Update module metadata, order, or theory URL' })
  async updateModule(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() body: UpdateCourseModuleDto
  ) {
    const module = await this.prisma.courseModule.findFirst({
      where: { id: moduleId, courseId },
    });

    if (!module) {
      throw new NotFoundException(`Модуль із ID ${moduleId} не знайдено у курсі ${courseId}`);
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.slug !== undefined) {
      updateData.slug = body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.orderIndex !== undefined) updateData.orderIndex = Number(body.orderIndex);
    if (body.theoryUrl !== undefined) updateData.theoryUrl = body.theoryUrl?.trim() || null;
    if (body.minMasteryThreshold !== undefined) {
      updateData.minMasteryThreshold = Number(body.minMasteryThreshold);
    }

    const updated = await this.prisma.courseModule.update({
      where: { id: moduleId },
      data: updateData,
      include: {
        skills: {
          select: { id: true, slug: true, title: true, difficulty: true, orderIndex: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    this.logger.log(`Updated module ${moduleId} ("${updated.title}")`);
    return updated;
  }

  /**
   * Видалити модуль курсу
   */
  @Delete(':courseId/modules/:moduleId')
  @ApiOperation({ summary: 'Delete a module from a course' })
  async deleteModule(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string
  ) {
    const module = await this.prisma.courseModule.findFirst({
      where: { id: moduleId, courseId },
    });

    if (!module) {
      throw new NotFoundException(`Модуль із ID ${moduleId} не знайдено у курсі ${courseId}`);
    }

    // Unlink skills
    await this.prisma.skillNode.updateMany({
      where: { moduleId },
      data: { moduleId: null },
    });

    await this.prisma.courseModule.delete({ where: { id: moduleId } });
    this.logger.log(`Deleted module ${moduleId} ("${module.title}")`);

    return { success: true, message: `Модуль "${module.title}" успішно видалено` };
  }

  /**
   * Прив'язати навички (SkillNodes) до модуля
   */
  @Post(':courseId/modules/:moduleId/skills')
  @ApiOperation({ summary: 'Assign skills to a module' })
  async assignSkillsToModule(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() body: { skillIds: string[] }
  ) {
    const module = await this.prisma.courseModule.findFirst({
      where: { id: moduleId, courseId },
    });

    if (!module) {
      throw new NotFoundException(`Модуль із ID ${moduleId} не знайдено у курсі ${courseId}`);
    }

    const skillIds = body.skillIds || [];

    // Assign skills and update courseId if needed
    if (skillIds.length > 0) {
      await this.prisma.skillNode.updateMany({
        where: { id: { in: skillIds } },
        data: {
          courseId,
          moduleId,
        },
      });
    }

    const updatedModule = await this.prisma.courseModule.findUnique({
      where: { id: moduleId },
      include: {
        skills: {
          select: { id: true, slug: true, title: true, difficulty: true, orderIndex: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return updatedModule;
  }
}
