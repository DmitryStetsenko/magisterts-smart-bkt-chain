import { Test, TestingModule } from '@nestjs/testing';
import { CourseController } from './course.controller';
import { PrismaService } from '../../outbound/persistence/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CourseController', () => {
  let controller: CourseController;
  let prisma: any;

  const mockPrisma = {
    course: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    courseModule: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    skillNode: {
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CourseController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    controller = module.get<CourseController>(CourseController);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('getCourses', () => {
    it('should return all courses with modules and skills', async () => {
      const mockCourses = [
        {
          id: 'course-1',
          slug: 'js-dev',
          title: 'JavaScript Dev',
          modules: [{ id: 'mod-1', title: 'Mod 1', orderIndex: 1, skills: [] }],
          skills: [{ id: 's-1', title: 'Basics' }],
          _count: { classrooms: 1, enrollments: 2 },
        },
      ];
      mockPrisma.course.findMany.mockResolvedValue(mockCourses);

      const result = await controller.getCourses();
      expect(result).toEqual(mockCourses);
      expect(mockPrisma.course.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('getCourseBySlug', () => {
    it('should return course by slug if found', async () => {
      const mockCourse = {
        id: 'course-1',
        slug: 'js-dev',
        title: 'JavaScript Dev',
        modules: [],
        skills: [],
      };
      mockPrisma.course.findUnique.mockResolvedValue(mockCourse);

      const result = await controller.getCourseBySlug('js-dev');
      expect(result).toEqual(mockCourse);
    });

    it('should throw NotFoundException if course not found', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);

      await expect(controller.getCourseBySlug('unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createCourse', () => {
    it('should create new course with valid data', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);
      mockPrisma.course.create.mockResolvedValue({
        id: 'course-new',
        slug: 'python-dev',
        title: 'Python Dev',
        defaultMasteryThreshold: 0.85,
        modules: [],
        skills: [],
      });

      const result = await controller.createCourse({
        title: 'Python Dev',
        description: 'Python course',
      });

      expect(result.id).toBe('course-new');
      expect(mockPrisma.course.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: 'Python Dev',
            slug: 'python-dev',
            defaultMasteryThreshold: 0.85,
          }),
        })
      );
    });

    it('should throw BadRequestException if title is empty', async () => {
      await expect(controller.createCourse({ title: '   ' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateCourse', () => {
    it('should update course metadata and threshold', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'course-1', title: 'Old Title' });
      mockPrisma.course.update.mockResolvedValue({
        id: 'course-1',
        title: 'New Title',
        defaultMasteryThreshold: 0.9,
      });

      const result = await controller.updateCourse('course-1', {
        title: 'New Title',
        defaultMasteryThreshold: 0.9,
      });

      expect(result.title).toBe('New Title');
      expect(mockPrisma.course.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'course-1' },
          data: expect.objectContaining({
            title: 'New Title',
            defaultMasteryThreshold: 0.9,
          }),
        })
      );
    });
  });

  describe('deleteCourse', () => {
    it('should delete existing course', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'course-1', title: 'JS Course' });
      mockPrisma.course.delete.mockResolvedValue({ id: 'course-1' });

      const result = await controller.deleteCourse('course-1');
      expect(result.success).toBe(true);
      expect(mockPrisma.course.delete).toHaveBeenCalledWith({ where: { id: 'course-1' } });
    });
  });

  // ==================== MODULE TESTS ====================

  describe('createModule', () => {
    it('should create module with calculated orderIndex', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({
        id: 'course-1',
        title: 'JS Course',
        defaultMasteryThreshold: 0.85,
      });
      mockPrisma.courseModule.findFirst.mockResolvedValue({ orderIndex: 2 });
      mockPrisma.courseModule.findUnique.mockResolvedValue(null);
      mockPrisma.courseModule.create.mockResolvedValue({
        id: 'mod-3',
        courseId: 'course-1',
        title: 'Module 3',
        slug: 'module-3',
        orderIndex: 3,
        minMasteryThreshold: 0.85,
        skills: [],
      });

      const result = await controller.createModule('course-1', {
        title: 'Module 3',
        theoryUrl: '/learn/js-dev/module-3',
      });

      expect(result.orderIndex).toBe(3);
      expect(mockPrisma.courseModule.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            courseId: 'course-1',
            title: 'Module 3',
            orderIndex: 3,
            theoryUrl: '/learn/js-dev/module-3',
          }),
        })
      );
    });
  });

  describe('updateModule', () => {
    it('should update module attributes', async () => {
      mockPrisma.courseModule.findFirst.mockResolvedValue({ id: 'mod-1', courseId: 'course-1' });
      mockPrisma.courseModule.update.mockResolvedValue({
        id: 'mod-1',
        title: 'Updated Module 1',
        minMasteryThreshold: 0.9,
        skills: [],
      });

      const result = await controller.updateModule('course-1', 'mod-1', {
        title: 'Updated Module 1',
        minMasteryThreshold: 0.9,
      });

      expect(result.title).toBe('Updated Module 1');
      expect(mockPrisma.courseModule.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'mod-1' },
          data: expect.objectContaining({
            title: 'Updated Module 1',
            minMasteryThreshold: 0.9,
          }),
        })
      );
    });
  });

  describe('deleteModule', () => {
    it('should unlink skills and delete module', async () => {
      mockPrisma.courseModule.findFirst.mockResolvedValue({
        id: 'mod-1',
        courseId: 'course-1',
        title: 'Module to Delete',
      });
      mockPrisma.skillNode.updateMany.mockResolvedValue({ count: 2 });
      mockPrisma.courseModule.delete.mockResolvedValue({ id: 'mod-1' });

      const result = await controller.deleteModule('course-1', 'mod-1');

      expect(result.success).toBe(true);
      expect(mockPrisma.skillNode.updateMany).toHaveBeenCalledWith({
        where: { moduleId: 'mod-1' },
        data: { moduleId: null },
      });
      expect(mockPrisma.courseModule.delete).toHaveBeenCalledWith({ where: { id: 'mod-1' } });
    });
  });

  describe('assignSkillsToModule', () => {
    it('should connect skills to module', async () => {
      mockPrisma.courseModule.findFirst.mockResolvedValue({ id: 'mod-1', courseId: 'course-1' });
      mockPrisma.skillNode.updateMany.mockResolvedValue({ count: 2 });
      mockPrisma.courseModule.findUnique.mockResolvedValue({
        id: 'mod-1',
        skills: [{ id: 's-1' }, { id: 's-2' }],
      });

      const result = await controller.assignSkillsToModule('course-1', 'mod-1', {
        skillIds: ['s-1', 's-2'],
      });

      expect(mockPrisma.skillNode.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['s-1', 's-2'] } },
        data: {
          courseId: 'course-1',
          moduleId: 'mod-1',
        },
      });
      expect(result?.skills?.length).toBe(2);
    });
  });
});
