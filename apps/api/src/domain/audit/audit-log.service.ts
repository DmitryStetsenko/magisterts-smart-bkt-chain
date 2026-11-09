import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../adapters/outbound/persistence/prisma.service';
import { TelemetryGateway } from '../../adapters/inbound/websocket/telemetry.gateway';
import {
  StudentActivityLogDto,
  CreateActivityLogDto,
  AnnulSubmissionPayloadDto,
} from '@sbc/types';
import { SubmissionStatus, TeacherReviewStatus } from '@sbc/database';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telemetryGateway: TelemetryGateway,
  ) {}

  /**
   * Запис нової події у незмінний потік StudentActivityLog (Append-Only)
   */
  async logEvent(dto: CreateActivityLogDto): Promise<StudentActivityLogDto> {
    let targetUserId = dto.userId;
    let user = await this.prisma.user.findFirst({
      where: { OR: [{ id: targetUserId }, { email: targetUserId }] },
    });

    if (!user) {
      user = await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (user) targetUserId = user.id;
    }

    if (!user) {
      throw new NotFoundException(`User ${dto.userId} not found for activity logging`);
    }

    const actorId = dto.actorId || user.id;
    const actorRole = (dto.actorRole as any) || (user.role as any);

    const log = await this.prisma.studentActivityLog.create({
      data: {
        userId: user.id,
        actorId,
        actorRole,
        courseId: dto.courseId || null,
        skillId: dto.skillId || null,
        taskId: dto.taskId || null,
        submissionId: dto.submissionId || null,
        eventType: dto.eventType,
        payload: dto.payload ? JSON.parse(JSON.stringify(dto.payload)) : {},
      },
    });

    const mappedDto: StudentActivityLogDto = {
      id: log.id,
      userId: log.userId,
      actorId: log.actorId,
      actorRole: log.actorRole as any,
      courseId: log.courseId,
      skillId: log.skillId,
      taskId: log.taskId,
      submissionId: log.submissionId,
      eventType: log.eventType,
      payload: (log.payload as Record<string, any>) || {},
      createdAt: log.createdAt.toISOString(),
    };

    // Live broadcast via WebSockets
    this.telemetryGateway.notifyActivityLog(mappedDto);

    return mappedDto;
  }

  /**
   * Отримання останніх логів студента у хронологічному порядку
   */
  async getStudentLogs(userId: string, limit = 50): Promise<StudentActivityLogDto[]> {
    let targetUserId = userId;
    const user = await this.prisma.user.findFirst({
      where: { OR: [{ id: targetUserId }, { email: targetUserId }] },
    });
    if (user) targetUserId = user.id;

    const logs = await this.prisma.studentActivityLog.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(200, Math.max(1, limit)),
    });

    return logs.map((l) => ({
      id: l.id,
      userId: l.userId,
      actorId: l.actorId,
      actorRole: l.actorRole as any,
      courseId: l.courseId,
      skillId: l.skillId,
      taskId: l.taskId,
      submissionId: l.submissionId,
      eventType: l.eventType,
      payload: (l.payload as Record<string, any>) || {},
      createdAt: l.createdAt.toISOString(),
    }));
  }

  /**
   * Отримання глобального живого потоку подій для кабінету викладача або адміністратора
   */
  async getRecentLogs(limit = 100): Promise<StudentActivityLogDto[]> {
    const logs = await this.prisma.studentActivityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(500, Math.max(1, limit)),
    });

    return logs.map((l) => ({
      id: l.id,
      userId: l.userId,
      actorId: l.actorId,
      actorRole: l.actorRole as any,
      courseId: l.courseId,
      skillId: l.skillId,
      taskId: l.taskId,
      submissionId: l.submissionId,
      eventType: l.eventType,
      payload: (l.payload as Record<string, any>) || {},
      createdAt: l.createdAt.toISOString(),
    }));
  }

  /**
   * Педагогічний протокол анулювання спроби викладачем (Teacher Annulment Protocol)
   */
  async annulSubmission(dto: AnnulSubmissionPayloadDto): Promise<{
    success: boolean;
    submissionId: string;
    pMasteryUpdated?: number;
    activityLog: StudentActivityLogDto;
  }> {
    const submission = await this.prisma.submission.findUnique({
      where: { id: dto.submissionId },
      include: {
        task: { include: { skill: true } },
      },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${dto.submissionId} not found`);
    }

    const skillId = submission.task.skillId;
    const userId = submission.userId;
    const penaltyMultiplier = typeof dto.penaltyMultiplier === 'number' && dto.penaltyMultiplier > 0
      ? dto.penaltyMultiplier
      : 1.25;

    // 1. Оновлюємо статус перевірки в таблиці submission
    await this.prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: SubmissionStatus.ANNULLED as any,
        teacherReviewStatus: TeacherReviewStatus.ANNULLED as any,
        teacherComment: dto.comment || 'Спробу анульовано викладачем',
      },
    });

    // 2. Розрахунок та відкат BKT
    let bktState = await this.prisma.bktState.findUnique({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
    });

    let pMasteryBefore = bktState ? bktState.pMastery : 0.5;
    let pMasteryAfter = pMasteryBefore;

    if (bktState) {
      // Знаходимо історію цієї здачі для визначення отриманого раніше приросту
      const history = await this.prisma.bktHistory.findFirst({
        where: {
          userId,
          taskId: submission.taskId,
        },
        orderBy: { createdAt: 'desc' },
      });

      const gainedDelta = history && history.isCorrect
        ? Math.max(0, history.pMasteryAfter - history.pMasteryBefore)
        : 0.15; // default fallback if history unavailable

      // Педагогічний штрафний відкат: - (gainedDelta * penaltyMultiplier)
      const penaltyDelta = Number((gainedDelta * penaltyMultiplier).toFixed(4));
      const LOWER_ASYMPTOTE = 0.05;
      pMasteryAfter = Math.max(LOWER_ASYMPTOTE, Number((bktState.pMastery - penaltyDelta).toFixed(4)));

      bktState = await this.prisma.bktState.update({
        where: { id: bktState.id },
        data: {
          pMastery: pMasteryAfter,
          isMastered: pMasteryAfter >= 0.90,
        },
      });

      // Записуємо корегувальний крок у BktHistory
      await this.prisma.bktHistory.create({
        data: {
          userId,
          skillId,
          taskId: submission.taskId,
          pMasteryBefore,
          pMasteryAfter,
          isCorrect: false,
          pSlipUsed: 0.1,
          pGuessUsed: 0.9,
          adjustReasons: [`teacher_annulled_${dto.reason.toLowerCase()}`, `penalty_multiplier_${penaltyMultiplier}`],
          feedbackText: `⚠️ Спробу анульовано викладачем: ${dto.comment}`,
          teacherReviewStatus: TeacherReviewStatus.ANNULLED as any,
          teacherComment: dto.comment,
        },
      });
    }

    // 3. Запис у незмінний Audit Log
    const activityLog = await this.logEvent({
      userId,
      actorId: dto.teacherId || 'TEACHER',
      actorRole: 'TEACHER',
      courseId: submission.task.skill.courseId || undefined,
      skillId,
      taskId: submission.taskId,
      submissionId: submission.id,
      eventType: 'TEACHER_SUBMISSION_ANNULLED',
      payload: {
        reason: dto.reason,
        comment: dto.comment,
        penaltyMultiplier,
        pMasteryBefore,
        pMasteryAfter,
        delta: Number((pMasteryAfter - pMasteryBefore).toFixed(4)),
      },
    });

    // 4. Миттєве push-сповіщення у браузер учня та викладача
    this.telemetryGateway.notifySubmissionAnnulled({
      submissionId: submission.id,
      userId,
      taskId: submission.taskId,
      skillId,
      reason: dto.reason,
      comment: dto.comment,
      pMasteryUpdated: pMasteryAfter,
    });

    return {
      success: true,
      submissionId: submission.id,
      pMasteryUpdated: pMasteryAfter,
      activityLog,
    };
  }

  /**
   * Експорт незмінного датасету для навчання ШІ (DKT / SAKT / Класифікація Доброчесності)
   */
  async exportDataset(options?: {
    courseSlug?: string;
    userId?: string;
    format?: 'jsonl' | 'csv';
  }): Promise<string> {
    const format = options?.format || 'jsonl';
    const where: any = {};

    if (options?.userId) {
      const user = await this.prisma.user.findFirst({
        where: { OR: [{ id: options.userId }, { email: options.userId }] },
      });
      if (user) where.userId = user.id;
    }

    if (options?.courseSlug) {
      const course = await this.prisma.course.findFirst({
        where: { OR: [{ slug: options.courseSlug }, { id: options.courseSlug }] },
      });
      if (course) where.courseId = course.id;
    }

    const logs = await this.prisma.studentActivityLog.findMany({
      where,
      orderBy: { createdAt: 'asc' },
    });

    if (format === 'csv') {
      const headers = [
        'id',
        'userId',
        'actorId',
        'actorRole',
        'courseId',
        'skillId',
        'taskId',
        'submissionId',
        'eventType',
        'createdAt',
        'payloadJson',
      ];
      const rows = logs.map((l) => [
        l.id,
        l.userId,
        l.actorId,
        l.actorRole,
        l.courseId || '',
        l.skillId || '',
        l.taskId || '',
        l.submissionId || '',
        l.eventType,
        l.createdAt.toISOString(),
        `"${JSON.stringify(l.payload).replace(/"/g, '""')}"`,
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    }

    // Default: JSONL
    return logs.map((l) => JSON.stringify({
      id: l.id,
      userId: l.userId,
      actorId: l.actorId,
      actorRole: l.actorRole,
      courseId: l.courseId,
      skillId: l.skillId,
      taskId: l.taskId,
      submissionId: l.submissionId,
      eventType: l.eventType,
      payload: l.payload,
      createdAt: l.createdAt.toISOString(),
    })).join('\n');
  }

  /**
   * 🗑️ Повне очищення незмінного аудит-логу дій студентів
   * (Доступно адміністраторам CMS для тестових перезапусків)
   */
  async clearAllLogs(actorId = 'admin', actorRole = 'ADMIN'): Promise<{ count: number; message: string }> {
    const count = await this.prisma.studentActivityLog.count();
    await this.prisma.studentActivityLog.deleteMany({});

    this.logger.warn(`⚠️ [AuditLogService] All activity logs purged by ${actorId} (${actorRole}). Total deleted: ${count}`);

    this.telemetryGateway.notifyActivityLog({
      eventType: 'SYSTEM_LOGS_PURGED',
      actorId,
      actorRole,
      payload: { deletedCount: count },
      createdAt: new Date().toISOString(),
    });

    return {
      count,
      message: `Успішно видалено ${count} записів незмінного аудит-логу.`,
    };
  }
}
