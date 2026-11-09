import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogService } from './audit-log.service';
import { PrismaService } from '../../adapters/outbound/persistence/prisma.service';
import { TelemetryGateway } from '../../adapters/inbound/websocket/telemetry.gateway';
import { SubmissionStatus, TeacherReviewStatus } from '@sbc/database';

describe('AuditLogService', () => {
  let service: AuditLogService;
  let prisma: any;
  let telemetryGateway: any;

  const mockUser = {
    id: 'user-123',
    email: 'student@example.com',
    role: 'STUDENT',
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn().mockResolvedValue(mockUser),
        findUnique: jest.fn().mockResolvedValue(mockUser),
      },
      studentActivityLog: {
        count: jest.fn().mockResolvedValue(5),
        deleteMany: jest.fn().mockResolvedValue({ count: 5 }),
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: 'log-1',
            ...data,
            createdAt: new Date('2026-11-09T10:00:00.000Z'),
          }),
        ),
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'log-1',
            userId: 'user-123',
            actorId: 'user-123',
            actorRole: 'STUDENT',
            courseId: 'js-dev',
            skillId: 'var-types',
            taskId: 'task-1',
            submissionId: null,
            eventType: 'HINT_REQUESTED',
            payload: { level: 1, penaltyPct: 15 },
            createdAt: new Date('2026-11-09T10:00:00.000Z'),
          },
        ]),
      },
      submission: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'sub-1',
          userId: 'user-123',
          taskId: 'task-1',
          code: 'const a = 1;',
          status: SubmissionStatus.ACCEPTED,
          teacherReviewStatus: TeacherReviewStatus.NONE,
          task: {
            id: 'task-1',
            skillId: 'var-types',
            skill: { id: 'var-types', courseId: 'js-dev' },
          },
        }),
        update: jest.fn().mockResolvedValue({
          id: 'sub-1',
          status: 'ANNULLED',
          teacherReviewStatus: 'ANNULLED',
        }),
      },
      bktState: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'state-1',
          userId: 'user-123',
          skillId: 'var-types',
          pMastery: 0.60,
          isMastered: false,
        }),
        update: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: 'state-1',
            userId: 'user-123',
            skillId: 'var-types',
            ...data,
          }),
        ),
      },
      bktHistory: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'hist-1',
          pMasteryBefore: 0.40,
          pMasteryAfter: 0.60,
          isCorrect: true,
        }),
        create: jest.fn().mockResolvedValue({ id: 'hist-new' }),
      },
      course: {
        findFirst: jest.fn().mockResolvedValue({ id: 'js-dev', slug: 'js-dev' }),
      },
    };

    telemetryGateway = {
      notifyActivityLog: jest.fn(),
      notifySubmissionAnnulled: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogService,
        { provide: PrismaService, useValue: prisma },
        { provide: TelemetryGateway, useValue: telemetryGateway },
      ],
    }).compile();

    service = module.get<AuditLogService>(AuditLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logEvent', () => {
    it('should create an activity log and broadcast via telemetry gateway', async () => {
      const res = await service.logEvent({
        userId: 'user-123',
        eventType: 'HINT_REQUESTED',
        payload: { level: 1, penaltyPct: 15 },
        skillId: 'var-types',
      });

      expect(prisma.studentActivityLog.create).toHaveBeenCalled();
      expect(telemetryGateway.notifyActivityLog).toHaveBeenCalledWith(res);
      expect(res.eventType).toBe('HINT_REQUESTED');
      expect(res.userId).toBe('user-123');
    });
  });

  describe('getStudentLogs', () => {
    it('should return recent logs in descending order', async () => {
      const logs = await service.getStudentLogs('user-123', 10);
      expect(logs).toHaveLength(1);
      expect(logs[0].eventType).toBe('HINT_REQUESTED');
    });
  });

  describe('annulSubmission', () => {
    it('should update submission, rollback BKT with penalty multiplier, log event and emit WS push', async () => {
      const res = await service.annulSubmission({
        submissionId: 'sub-1',
        teacherId: 'teacher-456',
        reason: 'PLAGIARISM',
        comment: 'Розв\'язок списано з зовнішнього джерела',
        penaltyMultiplier: 1.25,
      });

      expect(res.success).toBe(true);
      expect(prisma.submission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'sub-1' },
          data: expect.objectContaining({
            status: 'ANNULLED',
            teacherReviewStatus: 'ANNULLED',
          }),
        }),
      );

      // Previous gain was 0.60 - 0.40 = 0.20. Penalty delta = 0.20 * 1.25 = 0.25.
      // Posterior = 0.60 - 0.25 = 0.35.
      expect(prisma.bktState.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            pMastery: 0.35,
          }),
        }),
      );

      expect(telemetryGateway.notifySubmissionAnnulled).toHaveBeenCalledWith(
        expect.objectContaining({
          submissionId: 'sub-1',
          reason: 'PLAGIARISM',
          pMasteryUpdated: 0.35,
        }),
      );

      expect(res.activityLog.eventType).toBe('TEACHER_SUBMISSION_ANNULLED');
    });
  });

  describe('exportDataset', () => {
    it('should export valid JSONL string', async () => {
      const jsonl = await service.exportDataset({ format: 'jsonl' });
      expect(typeof jsonl).toBe('string');
      const parsed = JSON.parse(jsonl.split('\n')[0]);
      expect(parsed.eventType).toBe('HINT_REQUESTED');
    });

    it('should export valid CSV string with headers', async () => {
      const csv = await service.exportDataset({ format: 'csv' });
      expect(csv).toContain('id,userId,actorId,actorRole');
      expect(csv).toContain('HINT_REQUESTED');
    });
  });

  describe('clearAllLogs', () => {
    it('should delete all activity logs and broadcast SYSTEM_LOGS_PURGED', async () => {
      const result = await service.clearAllLogs('admin-user', 'ADMIN');
      expect(result.count).toBe(5);
      expect(prisma.studentActivityLog.deleteMany).toHaveBeenCalled();
      expect(telemetryGateway.notifyActivityLog).toHaveBeenCalledWith(
        expect.objectContaining({
          eventType: 'SYSTEM_LOGS_PURGED',
          actorId: 'admin-user',
          actorRole: 'ADMIN',
        }),
      );
    });
  });
});
