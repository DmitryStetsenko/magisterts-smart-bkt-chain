import { Test, TestingModule } from '@nestjs/testing';
import { BktController } from './bkt.controller';
import { PrismaService } from '../../outbound/persistence/prisma.service';

describe('BktController (Analytics & Telemetry reset integration)', () => {
  let controller: BktController;
  let prisma: PrismaService;

  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    bktState: {
      deleteMany: jest.fn(),
    },
    submission: {
      deleteMany: jest.fn(),
    },
    bktHistory: {
      deleteMany: jest.fn(),
    },
    telemetrySession: {
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BktController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    controller = module.get<BktController>(BktController);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should return aggregated student analytics with exact copyPasteRatio 1.0 when pasteEvents exist', async () => {
    const mockStudent = {
      id: 'student-1',
      email: 'student@example.com',
      profile: { firstName: 'Дмитро', lastName: 'Стеценко' },
      bktStates: [
        { pMastery: 0.971, skill: { slug: 'js-basics' } },
        { pMastery: 0.971, skill: { slug: 'js-arrays' } },
      ],
      telemetrySessions: [
        {
          logs: [
            {
              eventData: {
                wpm: 180,
                pasteEvents: 1,
                keystrokePauseMs: 0,
              },
            },
          ],
        },
      ],
      behavioralProfiles: [],
    };

    mockPrisma.user.findMany.mockResolvedValue([mockStudent]);

    const result = await controller.getStudentsAnalytics();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Дмитро Стеценко');
    expect(result[0].copyPasteRatio).toBe(1.0);
    expect(result[0].avgWpm).toBe(0);
    expect(result[0].skillMastery['js-basics']).toBe(0.971);
  });

  it('should return exact 0 values for analytics when student has no telemetry logs (reset state)', async () => {
    const mockResetStudent = {
      id: 'student-1',
      email: 'student@example.com',
      profile: { firstName: 'Дмитро', lastName: 'Стеценко' },
      bktStates: [],
      telemetrySessions: [],
      behavioralProfiles: [],
    };

    mockPrisma.user.findMany.mockResolvedValue([mockResetStudent]);

    const result = await controller.getStudentsAnalytics();

    expect(result).toHaveLength(1);
    expect(result[0].copyPasteRatio).toBe(0.0);
    expect(result[0].avgWpm).toBe(0);
    expect(result[0].fatigueIndex).toBe(0.0);
    expect(result[0].lastActive).toBe('Нерозпочато');
  });

  it('should flag duplicate code submission and skip BKT calculation for identical code', async () => {
    const mockTask = {
      id: 'task-1',
      skillId: 'skill-1',
      skill: { slug: 'js-basics', title: 'Основи JS' },
      testCases: [{ input: '1, 2', expectedOutput: '3' }],
    };

    const mockUser = { id: 'student-1', role: 'STUDENT' };
    const mockPrevSubmission = { id: 'sub-1', code: 'function sum(a, b) { return a + b; }' };
    const mockBktState = { id: 'bkt-1', pMastery: 0.85, pTransit: 0.2, pSlip: 0.1, pGuess: 0.2 };
    const mockNewSubmission = { id: 'sub-2', status: 'ACCEPTED' };

    (prisma as any).task = { findUnique: jest.fn().mockResolvedValue(mockTask) };
    (prisma as any).user = { findUnique: jest.fn().mockResolvedValue(mockUser), findFirst: jest.fn().mockResolvedValue(mockUser) };
    (prisma as any).submission = {
      findFirst: jest.fn().mockResolvedValue(mockPrevSubmission),
      create: jest.fn().mockResolvedValue(mockNewSubmission),
    };
    (prisma as any).bktState = {
      findUnique: jest.fn().mockResolvedValue(mockBktState),
      update: jest.fn(),
    };
    (prisma as any).bktHistory = { create: jest.fn() };

    const res = await controller.evaluateSubmission({
      taskId: 'task-1',
      code: 'function sum(a, b) { return a + b; }',
      userId: 'student-1',
    });

    expect(res.isDuplicate).toBe(true);
    expect(res.bktUpdate.pMasteryPosterior).toBe(0.85); // P(L_t) remains unchanged
    expect((prisma as any).bktState.update).not.toHaveBeenCalled();
    expect((prisma as any).bktHistory.create).not.toHaveBeenCalled();
  });
});
