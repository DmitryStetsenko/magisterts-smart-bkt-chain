import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
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
}
