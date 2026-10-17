import { Test, TestingModule } from '@nestjs/testing';
import { BktController } from './bkt.controller';
import { PrismaService } from '../../outbound/persistence/prisma.service';
import { TelemetryGateway } from '../websocket/telemetry.gateway';
import { OpenAnswerEvaluatorService } from '../../../domain/evaluation/open-answer-evaluator.service';

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
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    submission: {
      deleteMany: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    bktHistory: {
      deleteMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    telemetrySession: {
      deleteMany: jest.fn(),
    },
  };

  const mockTelemetryGateway = {
    notifyBktReset: jest.fn(),
    notifyStudentSubmission: jest.fn(),
    notifyTeacherReviewDecision: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BktController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: TelemetryGateway,
          useValue: mockTelemetryGateway,
        },
        {
          provide: OpenAnswerEvaluatorService,
          useValue: {
            evaluate: jest.fn().mockResolvedValue({
              tierUsed: 'TIER_1_HEURISTICS',
              isPassed: true,
              score: 0.85,
              confidenceScore: 0.9,
              studentFeedback: 'Тест успішно пройдено',
              needsTeacherReview: false,
            }),
          },
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
      behavioralProfiles: [
        {
          typingSpeedWpm: 45,
          pasteRatio: 1.0,
          pauseDurationMs: 500,
        },
      ],
    };

    mockPrisma.user.findMany.mockResolvedValue([mockStudent]);

    const result = await controller.getStudentsAnalytics();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Дмитро Стеценко');
    expect(result[0].copyPasteRatio).toBe(1.0);
    expect(result[0].wpm).toBe(45);
    expect(result[0].bktBySkill['js-basics']).toBe(0.971);
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
    expect(result[0].wpm).toBe(0);
    expect(result[0].fatigueIndex).toBe(0);
    expect(result[0].unstarted).toBe(true);
  });

  it('should retrieve pending teacher review submissions from queue', async () => {
    mockPrisma.submission.findMany.mockResolvedValue([
      {
        id: 'sub-1',
        userId: 'student-1',
        user: { email: 'student@example.com', profile: { firstName: 'Олена', lastName: 'Коваль' } },
        taskId: 'task-10',
        task: {
          title: 'Event Loop',
          description: 'Explain microtasks',
          referenceAnswer: 'Microtasks run before macrotasks',
          skill: { slug: 'js-async', title: 'Асинхронність' },
        },
        code: 'Проміси мають вищий пріоритет',
        teacherReviewStatus: 'PENDING_REVIEW',
        createdAt: new Date(),
      },
    ]);

    const queue = await controller.getTeacherReviewQueue('js-dev');

    expect(queue).toHaveLength(1);
    expect(queue[0].studentName).toBe('Олена Коваль');
    expect(queue[0].taskTitle).toBe('Event Loop');
    expect(queue[0].teacherReviewStatus).toBe('PENDING_REVIEW');
  });

  it('should process teacher review decision and update BKT mastery when APPROVED', async () => {
    mockPrisma.submission.findUnique.mockResolvedValue({
      id: 'sub-1',
      userId: 'student-1',
      taskId: 'task-10',
      task: { skillId: 'skill-1', skill: { title: 'Async JS' } },
    });
    mockPrisma.submission.update.mockResolvedValue({
      id: 'sub-1',
      teacherReviewStatus: 'APPROVED',
    });
    mockPrisma.bktHistory.findFirst.mockResolvedValue({
      id: 'hist-1',
      semanticScore: 0.65,
    });
    mockPrisma.bktHistory.update.mockResolvedValue({});
    mockPrisma.bktState.findUnique.mockResolvedValue({
      id: 'state-1',
      pMastery: 0.5,
      pTransit: 0.1,
      isMastered: false,
    });
    mockPrisma.bktState.update.mockResolvedValue({
      id: 'state-1',
      pMastery: 0.85,
    });

    const res = await controller.reviewSubmission('sub-1', {
      decision: 'APPROVE',
      comment: 'Чудове розкриття теми',
      scoreOverride: 0.9,
    });

    expect(res.success).toBe(true);
    expect(res.teacherReviewStatus).toBe('APPROVED');
    expect(mockPrisma.submission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'sub-1' },
        data: expect.objectContaining({ teacherReviewStatus: 'APPROVED' }),
      }),
    );
  });
});
