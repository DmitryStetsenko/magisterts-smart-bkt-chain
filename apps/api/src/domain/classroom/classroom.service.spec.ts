import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomService } from './classroom.service';
import { PrismaService } from '../../adapters/outbound/persistence/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ClassroomService', () => {
  let service: ClassroomService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      course: {
        findUnique: jest.fn(),
      },
      classroom: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      courseEnrollment: {
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      studentActivityLog: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClassroomService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ClassroomService>(ClassroomService);
  });

  describe('createClassroom', () => {
    it('should create classroom with unique code when course exists', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'crs-1', title: 'JS Dev' });
      mockPrisma.classroom.findUnique.mockResolvedValue(null);
      mockPrisma.classroom.create.mockResolvedValue({
        id: 'cls-1',
        name: 'Група КН-21',
        code: 'KOD-KN21',
        teacherId: 'tch-1',
        courseId: 'crs-1',
        defaultMode: 'FULL_CYCLE',
        allowedModules: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        course: { id: 'crs-1', slug: 'js-dev', title: 'JS Dev' },
        teacher: { id: 'tch-1', email: 'teacher@example.com' },
        _count: { students: 0 },
      });

      const res = await service.createClassroom('tch-1', {
        name: 'Група КН-21',
        courseId: 'crs-1',
        code: 'KOD-KN21',
      });

      expect(res.code).toBe('KOD-KN21');
      expect(res.name).toBe('Група КН-21');
      expect(mockPrisma.classroom.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if course does not exist', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);

      await expect(
        service.createClassroom('tch-1', { name: 'Test', courseId: 'non-existent' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('joinClassroom', () => {
    it('should connect student and upsert enrollment', async () => {
      mockPrisma.classroom.findUnique.mockResolvedValue({
        id: 'cls-100',
        name: 'Класна кімната',
        code: 'KOD-999',
        courseId: 'crs-1',
        defaultMode: 'FULL_CYCLE',
        allowedModules: [],
        course: { id: 'crs-1', slug: 'js-dev', title: 'JS' },
        teacher: { id: 'tch-1', email: 'teacher@example.com' },
        _count: { students: 1 },
      });
      mockPrisma.classroom.update.mockResolvedValue({});
      mockPrisma.courseEnrollment.upsert.mockResolvedValue({
        id: 'enr-1',
        userId: 'std-1',
        courseId: 'crs-1',
        classroomId: 'cls-100',
        mode: 'FULL_CYCLE',
        allowedModules: [],
        isActive: true,
        enrolledAt: new Date(),
        updatedAt: new Date(),
        course: { id: 'crs-1', slug: 'js-dev', title: 'JS' },
        classroom: { id: 'cls-100', code: 'KOD-999', name: 'Класна кімната' },
      });

      const res = await service.joinClassroom('std-1', 'kod-999');
      expect(res.classroom.code).toBe('KOD-999');
      expect(res.enrollment.classroomId).toBe('cls-100');
      expect(mockPrisma.classroom.update).toHaveBeenCalledWith({
        where: { id: 'cls-100' },
        data: { students: { connect: [{ id: 'std-1' }] } },
      });
    });
  });
});
