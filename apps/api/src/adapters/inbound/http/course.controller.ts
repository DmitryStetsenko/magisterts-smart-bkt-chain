import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../outbound/persistence/prisma.service';
import { AiCourseScaffolderService } from '../../../domain/course/ai-course-scaffolder.service';
import type {
  CreateCourseDto,
  UpdateCourseDto,
  CreateCourseModuleDto,
  UpdateCourseModuleDto,
  ImportCourseWorkbookDto,
  AiCourseScaffoldRequestDto,
  ParsedCourseImportDto,
} from '@sbc/types';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
  private readonly logger = new Logger(CourseController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiScaffolder: AiCourseScaffolderService
  ) {}

  /**
   * Отримати перелік усіх доступних курсів із модулями, категоріями та навичками
   */
  @Get()
  @ApiOperation({ summary: 'Get all available academic courses' })
  async getCourses(
    @Query('category') categorySlug?: string,
    @Query('status') status?: string,
  ) {
    const where: any = {};
    if (categorySlug && categorySlug !== 'ALL') {
      where.category = { slug: categorySlug };
    }

    if (status === 'PUBLISHED') {
      where.isPublished = true;
    } else if (status === 'DRAFT') {
      where.isPublished = false;
    }

    return this.prisma.course.findMany({
      where,
      include: {
        category: true,
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
        category: true,
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            skills: {
              include: {
                parentDependencies: {
                  include: {
                    parentSkill: {
                      select: { id: true, slug: true, title: true },
                    },
                  },
                },
                tasks: {
                  include: {
                    testCases: true,
                  },
                  orderBy: { createdAt: 'asc' },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        skills: {
          include: {
            parentDependencies: {
              include: {
                parentSkill: {
                  select: { id: true, slug: true, title: true },
                },
              },
            },
            module: true,
            tasks: {
              include: {
                testCases: true,
              },
              orderBy: { createdAt: 'asc' },
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
        isPublished: body.isPublished ?? false,
        categoryId: body.categoryId || null,
      },
      include: {
        category: true,
        modules: true,
        skills: true,
      },
    });

    this.logger.log(`Created new course: "${course.title}" (${course.slug})`);
    return course;
  }

  /**
   * One-Shot генерація повного каркасу курсу за допомогою ШІ (Gemini 2.5 API + евристичний фолбек)
   */
  @Post('ai-scaffold')
  @ApiOperation({ summary: 'One-shot AI scaffold course structure (Gemini 2.5 API with heuristic fallback)' })
  async aiScaffoldCourse(@Body() dto: AiCourseScaffoldRequestDto): Promise<ParsedCourseImportDto> {
    if (!dto || !dto.prompt || !dto.prompt.trim()) {
      throw new BadRequestException('Промпт або тема курсу є обовʼязковим полем для генерації ШІ');
    }
    return this.aiScaffolder.scaffoldCourse(dto);
  }

  /**
   * Атомарний імпорт повної структури курсу з таблиці Excel / Google Sheets
   * Забезпечує транзакційне створення курсу, модулів, DAG-навичок та банку завдань
   */
  @Post('import-workbook')
  @ApiOperation({ summary: 'Atomically import complete course structure from tabular workbook' })
  async importCourseWorkbook(@Body() dto: ImportCourseWorkbookDto) {
    if (!dto || !dto.course || !dto.course.title || !dto.course.slug) {
      throw new BadRequestException('Некоректний формат даних курсу для імпорту');
    }

    const courseSlug = dto.course.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const courseTitle = dto.course.title.trim();

    // Перевірка наявності курсу
    const existing = await this.prisma.course.findUnique({
      where: { slug: courseSlug },
      include: { _count: { select: { enrollments: true } } },
    });

    if (existing) {
      if (!dto.overwriteExisting) {
        throw new BadRequestException(
          `Курс із слагом "${courseSlug}" вже існує в системі. Будь ласка, вкажіть інший слаг або підтвердіть оновлення (overwriteExisting: true).`
        );
      }
      if (existing._count.enrollments > 0) {
        throw new BadRequestException(
          `Неможливо перезаписати курс "${courseTitle}": на нього вже зараховано ${existing._count.enrollments} учнів.`
        );
      }
    }

    // Запуск атомарної транзакції бази даних з розширеним таймаутом для великих курсів
    return this.prisma.$transaction(async (tx) => {
      // Якщо обрано перезапис існуючого курсу
      if (existing) {
        await tx.course.delete({ where: { id: existing.id } });
      }

      // 1. Пошук категорії курсу
      let categoryId: string | null = null;
      if (dto.course.category) {
        const cat = await tx.courseCategory.findFirst({
          where: {
            OR: [
              { title: { equals: dto.course.category.trim(), mode: 'insensitive' } },
              { slug: { equals: dto.course.category.trim().toLowerCase(), mode: 'insensitive' } },
            ],
          },
        });
        if (cat) {
          categoryId = cat.id;
        }
      }

      // 2. Створення паспорта курсу
      const course = await tx.course.create({
        data: {
          title: courseTitle,
          slug: courseSlug,
          description: dto.course.description?.trim() || courseTitle,
          targetAudience: dto.course.targetAudience?.trim() || null,
          icon: dto.course.icon?.trim() || 'BookOpen',
          defaultMasteryThreshold: dto.course.bktMasteryThreshold ?? 0.85,
          isPublished: dto.course.isPublished ?? false,
          categoryId,
        },
      });

      // Карта ID створених модулів: moduleSlug -> moduleId
      const moduleMap = new Map<string, string>();

      // 3. Створення модулів курсу з 5-блочною теорією Zen Focus
      for (const m of dto.modules || []) {
        const modSlug = m.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        let moduleDescription = m.description?.trim() || null;
        const theoryRow = dto.theories?.find((t) => t.moduleSlug.trim() === modSlug);
        if (theoryRow && (theoryRow.conceptsMarkdown || theoryRow.hookIntro)) {
          const parts: string[] = [];
          if (theoryRow.hookIntro?.trim()) {
            parts.push(`> 📌 **Короткий огляд теми:**\n> ${theoryRow.hookIntro.trim().replace(/\n/g, '\n> ')}`);
          }
          if (theoryRow.conceptsMarkdown?.trim()) {
            parts.push(`### 📖 Теоретичні поняття\n\n${theoryRow.conceptsMarkdown.trim()}`);
          }
          if (theoryRow.codeSnippet?.trim()) {
            const lang = theoryRow.codeLang || 'html';
            let codeBlock = `### 💻 Приклад коду (${lang.toUpperCase()})\n\n\`\`\`${lang}\n${theoryRow.codeSnippet.trim()}\n\`\`\``;
            if (theoryRow.codeExplanation?.trim()) {
              codeBlock += `\n\n*${theoryRow.codeExplanation.trim()}*`;
            }
            parts.push(codeBlock);
          }
          if (theoryRow.misconceptionTitle?.trim() || theoryRow.misconceptionExplanation?.trim()) {
            let misc = `### ⚠️ Типова омана учнів (Misconception Alert)\n`;
            if (theoryRow.misconceptionTitle?.trim()) {
              misc += `> ❌ **Хибне уявлення:** ${theoryRow.misconceptionTitle.trim()}\n>\n`;
            }
            if (theoryRow.misconceptionExplanation?.trim()) {
              misc += `> ✅ **Реальність:** ${theoryRow.misconceptionExplanation.trim()}\n`;
            }
            parts.push(misc);
          }
          if (theoryRow.takeawaysList?.trim()) {
            const items = theoryRow.takeawaysList.split(/[\n|•\-]/).map((t) => t.trim()).filter(Boolean);
            if (items.length > 0) {
              parts.push(`### 🎯 Ключові висновки (Takeaways)\n\n${items.map((t) => `- ${t}`).join('\n')}`);
            }
          }
          moduleDescription = parts.join('\n\n');
        }

        const createdModule = await tx.courseModule.create({
          data: {
            courseId: course.id,
            slug: modSlug,
            title: m.title.trim(),
            description: moduleDescription,
            orderIndex: m.orderIndex,
            theoryUrl: m.theoryUrl?.trim() || `/learn/${courseSlug}/${modSlug}`,
            minMasteryThreshold: m.bktThreshold ?? course.defaultMasteryThreshold,
          },
        });
        moduleMap.set(modSlug, createdModule.id);
      }

      // Карта ID створених навичок: skillSlug -> skillId
      const skillMap = new Map<string, string>();

      // 4. Створення навичок BKT
      for (const s of dto.skills || []) {
        const skillSlug = s.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const targetModuleId = moduleMap.get(s.moduleSlug.trim().toLowerCase());

        const existingSkill = await tx.skillNode.findUnique({ where: { slug: skillSlug } });
        let createdSkill;
        if (existingSkill) {
          await tx.task.deleteMany({ where: { skillId: existingSkill.id } });
          await tx.skillDependency.deleteMany({
            where: {
              OR: [
                { parentSkillId: existingSkill.id },
                { childSkillId: existingSkill.id },
              ],
            },
          });
          createdSkill = await tx.skillNode.update({
            where: { id: existingSkill.id },
            data: {
              courseId: course.id,
              moduleId: targetModuleId || null,
              title: s.title.trim(),
              description: s.title.trim(),
              category: dto.course.category?.trim() || 'Основна',
              difficulty: (['EASY', 'MEDIUM', 'HARD'].includes(s.difficulty || '') ? s.difficulty : 'EASY') as any,
              orderIndex: s.orderIndex,
            },
          });
        } else {
          createdSkill = await tx.skillNode.create({
            data: {
              courseId: course.id,
              moduleId: targetModuleId || null,
              slug: skillSlug,
              title: s.title.trim(),
              description: s.title.trim(),
              category: dto.course.category?.trim() || 'Основна',
              difficulty: (['EASY', 'MEDIUM', 'HARD'].includes(s.difficulty || '') ? s.difficulty : 'EASY') as any,
              orderIndex: s.orderIndex,
            },
          });
        }
        skillMap.set(skillSlug, createdSkill.id);
      }

      // 5. Створення зв'язків графу компетенцій (DAG Prerequisites)
      for (const s of dto.skills || []) {
        if (!s.prerequisites) continue;
        const currentSkillId = skillMap.get(s.slug.trim().toLowerCase());
        if (!currentSkillId) continue;

        const prereqSlugs = s.prerequisites.split(/[,;|]/).map((p) => p.trim().toLowerCase()).filter(Boolean);
        for (const prereqSlug of prereqSlugs) {
          const parentSkillId = skillMap.get(prereqSlug);
          if (parentSkillId && parentSkillId !== currentSkillId) {
            await tx.skillDependency.upsert({
              where: {
                parentSkillId_childSkillId: {
                  parentSkillId,
                  childSkillId: currentSkillId,
                },
              },
              update: {
                requiredMastery: course.defaultMasteryThreshold,
              },
              create: {
                parentSkillId,
                childSkillId: currentSkillId,
                requiredMastery: course.defaultMasteryThreshold,
              },
            });
          }
        }
      }

      // 6. Створення банку адаптивних завдань (Tasks & TestCases)
      for (const t of dto.tasks || []) {
        const targetSkillId = skillMap.get(t.skillSlug.trim().toLowerCase());
        if (!targetSkillId) continue;

        const taskType = (['CODE', 'MULTIPLE_CHOICE'].includes(t.taskType || '') ? t.taskType : 'CODE') as any;
        const difficulty = (['EASY', 'MEDIUM', 'HARD'].includes(t.difficulty || '') ? t.difficulty : 'EASY') as any;

        let testCases: Array<{ input: string; expectedOutput: string; isSecret: boolean }> = [];
        if (t.testCasesJson && t.testCasesJson.trim()) {
          try {
            const rawTests = JSON.parse(t.testCasesJson);
            if (Array.isArray(rawTests)) {
              testCases = rawTests.map((tc: any) => ({
                input: String(tc.input ?? ''),
                expectedOutput: String(tc.expectedOutput ?? ''),
                isSecret: Boolean(tc.isSecret),
              }));
            }
          } catch {
            // ігноруємо помилки парсингу
          }
        }

        let socraticHints: any = null;
        if (t.hintsList && t.hintsList.trim()) {
          const hints = t.hintsList.split(/[\n|•]/).map((h) => h.trim()).filter(Boolean);
          if (hints.length > 0) {
            socraticHints = hints.map((h, i) => ({
              level: i + 1,
              hint: h,
              penaltyPct: (i + 1) * 10,
            }));
          }
        }

        await tx.task.create({
          data: {
            skillId: targetSkillId,
            title: t.title.trim(),
            description: t.prompt?.trim() || t.title.trim(),
            taskType,
            difficulty,
            starterCode: t.starterCode || (taskType === 'CODE' ? '// Напишіть ваш розвʼязок тут\n' : null),
            socraticHints,
            topic: t.title.trim(),
            testCases: testCases.length > 0
              ? {
                  create: testCases.map((tc) => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    isSecret: tc.isSecret,
                  })),
                }
              : undefined,
          },
        });
      }

      this.logger.log(`Workbook atomically imported: Course "${course.title}" (${course.slug}) with ${moduleMap.size} modules, ${skillMap.size} skills`);

      return tx.course.findUnique({
        where: { id: course.id },
        include: {
          category: true,
          modules: {
            orderBy: { orderIndex: 'asc' },
            include: {
              skills: {
                orderBy: { orderIndex: 'asc' },
              },
            },
          },
          skills: {
            include: {
              parentDependencies: true,
              tasks: {
                include: { testCases: true },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
        },
      });
    }, {
      maxWait: 15000,
      timeout: 35000,
    });
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
    if (body.categoryId !== undefined) {
      updateData.categoryId = body.categoryId || null;
    }

    const updated = await this.prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
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

    // Clean up attached skills, dependencies and tasks
    const attachedSkills = await this.prisma.skillNode.findMany({
      where: { courseId: id },
      select: { id: true },
    });
    const attachedSkillIds = attachedSkills.map((s) => s.id);
    if (attachedSkillIds.length > 0) {
      await this.prisma.skillDependency.deleteMany({
        where: {
          OR: [
            { parentSkillId: { in: attachedSkillIds } },
            { childSkillId: { in: attachedSkillIds } },
          ],
        },
      });
      await this.prisma.task.deleteMany({
        where: { skillId: { in: attachedSkillIds } },
      });
      await this.prisma.skillNode.deleteMany({
        where: { id: { in: attachedSkillIds } },
      });
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

  /**
   * Створити нову BKT-компетенцію (SkillNode) безпосередньо у модулі курсу
   */
  @Post(':courseId/modules/:moduleId/skills/create')
  @ApiOperation({ summary: 'Create a new skill node directly in a course module' })
  async createSkillInModule(
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body() body: any
  ) {
    const module = await this.prisma.courseModule.findFirst({
      where: { id: moduleId, courseId },
    });
    if (!module) {
      throw new NotFoundException(`Модуль із ID ${moduleId} не знайдено у курсі ${courseId}`);
    }

    if (!body.title || !body.title.trim()) {
      throw new BadRequestException('Назва компетенції обовʼязкова');
    }

    const baseSlug = body.slug
      ? body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await this.prisma.skillNode.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    const highest = await this.prisma.skillNode.findFirst({
      where: { moduleId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });
    const orderIndex = body.orderIndex ?? (highest ? highest.orderIndex + 1 : 1);

    const skill = await this.prisma.skillNode.create({
      data: {
        courseId,
        moduleId,
        slug,
        title: body.title.trim(),
        description: body.description?.trim() || body.title.trim(),
        category: body.category || 'General',
        difficulty: body.difficulty || 'EASY',
        orderIndex,
      },
      include: {
        tasks: true,
      },
    });

    this.logger.log(`Created skill "${skill.title}" (${skill.slug}) in module ${moduleId}`);
    return skill;
  }

  /**
   * Створити нове навчальне завдання у компетенції (Банк завдань курсу)
   */
  @Post(':courseId/skills/:skillId/tasks/create')
  @ApiOperation({ summary: 'Create a new assessment task in a skill node' })
  async createTaskInSkill(
    @Param('courseId') courseId: string,
    @Param('skillId') skillId: string,
    @Body() body: any
  ) {
    const skill = await this.prisma.skillNode.findUnique({
      where: { id: skillId },
      include: { module: true },
    });
    if (!skill) {
      throw new NotFoundException(`Компетенцію з ID ${skillId} не знайдено`);
    }

    if (!body.title || !body.title.trim()) {
      throw new BadRequestException('Назва завдання обовʼязкова');
    }

    const taskType = body.taskType || 'CODE';
    const difficulty = body.difficulty || 'EASY';

    const task = await this.prisma.task.create({
      data: {
        skillId,
        title: body.title.trim(),
        description: body.description?.trim() || body.title.trim(),
        taskType,
        difficulty,
        starterCode: body.starterCode || (taskType === 'CODE' ? '// Напишіть ваш розвʼязок тут\n' : null),
        options: body.options ? body.options : null,
        referenceAnswer: body.referenceAnswer || null,
        socraticHints: body.socraticHints ? body.socraticHints : null,
        studyUnitUrl: body.studyUnitUrl || null,
        topic: body.topic || skill.title,
        subConcept: body.subConcept || null,
        testCases: body.testCases && body.testCases.length > 0
          ? {
              create: body.testCases.map((tc: any, idx: number) => ({
                input: String(tc.input ?? ''),
                expectedOutput: String(tc.expectedOutput ?? ''),
                isSecret: Boolean(tc.isSecret),
                orderIndex: idx,
              })),
            }
          : undefined,
      },
      include: {
        skill: true,
        testCases: true,
      },
    });

    this.logger.log(`Created task "${task.title}" (${task.taskType}) for skill ${skill.title}`);
    return task;
  }
}
