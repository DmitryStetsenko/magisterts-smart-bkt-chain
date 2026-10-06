import { Controller, Get, Post, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../outbound/persistence/prisma.service';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available academic courses' })
  async getCourses() {
    return this.prisma.course.findMany({
      include: {
        skills: {
          include: {
            parentDependencies: true,
            tasks: {
              select: { id: true, title: true, taskType: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get course by slug with full skill DAG structure' })
  async getCourseBySlug(@Param('slug') slug: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        skills: {
          include: {
            parentDependencies: true,
            tasks: {
              select: { id: true, title: true, taskType: true, difficulty: true },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException(`Course ${slug} not found`);
    }

    return course;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  async createCourse(
    @Body() body: { title: string; slug?: string; description?: string; icon?: string }
  ) {
    const slug = body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return this.prisma.course.create({
      data: {
        title: body.title,
        slug,
        description: body.description || '',
        icon: body.icon || 'BookOpen',
      },
    });
  }
}
