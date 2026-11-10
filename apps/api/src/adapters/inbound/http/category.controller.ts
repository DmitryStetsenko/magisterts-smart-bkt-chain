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
import type { CreateCourseCategoryDto, UpdateCourseCategoryDto } from '@sbc/types';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Отримати перелік усіх предметних категорій курсів із підрахунком кількості курсів
   */
  @Get()
  @ApiOperation({ summary: 'Get all course categories with courses count' })
  async getCategories() {
    const categories = await this.prisma.courseCategory.findMany({
      include: {
        _count: {
          select: { courses: true },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    return categories.map((cat) => ({
      ...cat,
      coursesCount: cat._count.courses,
    }));
  }

  /**
   * Створити нову категорію курсів
   */
  @Post()
  @ApiOperation({ summary: 'Create a new course category' })
  async createCategory(@Body() body: CreateCourseCategoryDto) {
    if (!body.title || !body.title.trim()) {
      throw new BadRequestException('Назва категорії обовʼязкова');
    }

    const slug = body.slug
      ? body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await this.prisma.courseCategory.findUnique({ where: { slug } });
    if (existing) {
      throw new BadRequestException(`Категорія із слагом "${slug}" уже існує`);
    }

    // Find highest orderIndex
    const lastCategory = await this.prisma.courseCategory.findFirst({
      orderBy: { orderIndex: 'desc' },
    });
    const orderIndex = body.orderIndex ?? (lastCategory ? lastCategory.orderIndex + 1 : 1);

    const category = await this.prisma.courseCategory.create({
      data: {
        title: body.title.trim(),
        slug,
        description: body.description?.trim() || null,
        icon: body.icon?.trim() || 'Folder',
        orderIndex,
      },
      include: {
        _count: {
          select: { courses: true },
        },
      },
    });

    this.logger.log(`Created course category: "${category.title}" (${category.slug})`);
    return {
      ...category,
      coursesCount: category._count.courses,
    };
  }

  /**
   * Оновити категорію курсів
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update course category' })
  async updateCategory(@Param('id') id: string, @Body() body: UpdateCourseCategoryDto) {
    const category = await this.prisma.courseCategory.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Категорію з ID ${id} не знайдено`);
    }

    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.slug !== undefined) {
      updateData.slug = body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.icon !== undefined) updateData.icon = body.icon?.trim() || 'Folder';
    if (body.orderIndex !== undefined) updateData.orderIndex = Number(body.orderIndex);

    const updated = await this.prisma.courseCategory.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { courses: true } },
      },
    });

    return {
      ...updated,
      coursesCount: updated._count.courses,
    };
  }

  /**
   * Видалити категорію курсів (курси збережуться з categoryId = null)
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Delete course category' })
  async deleteCategory(@Param('id') id: string) {
    const category = await this.prisma.courseCategory.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Категорію з ID ${id} не знайдено`);
    }

    await this.prisma.courseCategory.delete({ where: { id } });
    this.logger.log(`Deleted course category: "${category.title}" (${category.id})`);
    return { success: true, message: `Категорію "${category.title}" видалено` };
  }
}
