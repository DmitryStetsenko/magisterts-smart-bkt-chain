import { Test, TestingModule } from '@nestjs/testing';
import { BktController } from './bkt.controller';
import { PrismaService } from '../../outbound/persistence/prisma.service';
import { TelemetryGateway } from '../websocket/telemetry.gateway';

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

  const mockTelemetryGateway = {
    notifyBktReset: jest.fn(),
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
});
