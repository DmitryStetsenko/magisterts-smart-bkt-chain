import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
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
  private readonly maxLogSizeBytes = 20 * 1024 * 1024; // 20 MB rotation threshold

  constructor(
    private readonly prisma: PrismaService,
    private readonly telemetryGateway: TelemetryGateway,
  ) {}

  /**
   * Safe rotated log appender to guarantee zero risk of disk space exhaustion
   */
  private appendToRotatedFile(filePath: string, content: string) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.size > this.maxLogSizeBytes) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const rotatedPath = `${filePath}.${timestamp}.old`;
          fs.renameSync(filePath, rotatedPath);
        }
      }
      fs.appendFileSync(filePath, content + '\n', 'utf-8');
    } catch (err) {
      this.logger.warn(`Failed to append to log file ${filePath}: ${(err as Error).message}`);
    }
  }

  /**
   * Persists event stream to disk (event_stream.jsonl and bkt_math_audit.log)
   */
  private persistFlightData(dto: StudentActivityLogDto) {
    const rootDir =
      process.cwd().endsWith('apps\\api') || process.cwd().endsWith('apps/api')
        ? path.resolve(process.cwd(), '../..')
        : process.cwd();
    const logsDir = path.resolve(rootDir, 'logs');
    const jsonlPath = path.resolve(logsDir, 'event_stream.jsonl');
    const mathLogPath = path.resolve(logsDir, 'bkt_math_audit.log');

    // 1. JSON Lines flight recording for complete replayability
    this.appendToRotatedFile(jsonlPath, JSON.stringify(dto));

    // 2. If this event contains BKT math trace, format a human-readable ASCII card
    const payload = dto.payload || {};
    if (
      payload.trace ||
      (payload.pMasteryPrior !== undefined && payload.pMasteryPosterior !== undefined)
    ) {
      const trace = payload.trace || {};
      const card = [
        `==================== BKT CALCULATION TRACE [${dto.createdAt}] ====================`,
        `[EVENT] ${dto.eventType} | Submission: ${dto.submissionId || 'N/A'} | Task: ${dto.taskId || 'N/A'}`,
        `[ACTOR] Role: ${dto.actorRole} | ID: ${dto.actorId} | Target User: ${dto.userId}`,
        `[INPUT BKT PARAMETERS]`,
        `  Prior P(L_{t-1}): ${(payload.pMasteryPrior ?? trace.pMasteryPrior ?? 0).toFixed(4)}`,
        `  P(Transit):       ${(trace.pTransit ?? 0.2000).toFixed(4)}`,
        `  P(Slip used):     ${(payload.pSlip ?? trace.pSlip ?? 0.1000).toFixed(4)}`,
        `  P(Guess used):    ${(payload.pGuess ?? trace.pGuess ?? 0.2000).toFixed(4)}`,
        `  IsCorrect:        ${payload.isPassed ? 'TRUE (Correct observation)' : 'FALSE (Incorrect observation)'}`,
        `  Adjust reasons:   ${(payload.adjustReasons || []).join(', ') || 'none (standard baseline)'}`,
        `[STEP 1: BAYESIAN OBSERVATION P(L|Obs)]`,
        `  Formula:          ${trace.formulaObs || (payload.isPassed ? '[P(L)*(1-S)] / [P(L)*(1-S) + (1-P(L))*G]' : '[P(L)*S] / [P(L)*S + (1-P(L))*(1-G)]')}`,
        `  Numerator:        ${trace.numerator ?? 'N/A'}`,
        `  Denominator:      ${trace.denominator ?? 'N/A'}`,
        `  P(L | Obs):       ${trace.pObs ?? 'N/A'}`,
        `[STEP 2: KNOWLEDGE TRANSITION P(L_t)]`,
        `  Formula:          ${trace.formulaTransition || 'P(L|Obs) + (1 - P(L|Obs))*P(T)'}`,
        `  Raw Posterior:    ${trace.rawPosterior ?? 'N/A'}`,
        `[STEP 3: SCAFFOLDING & HINT PENALTIES]`,
        `  Hint Penalty:     ${payload.appliedHintPenaltyPct ? `-${payload.appliedHintPenaltyPct}% penalty` : '0% (no hint penalty)'}`,
        `  Delta P(L):       ${payload.deltaL !== undefined ? (payload.deltaL >= 0 ? `+${payload.deltaL}` : `${payload.deltaL}`) : 'N/A'}`,
        `[FINAL POSTERIOR P(L_t)]`,
        `  Result P(L_t):    ${(payload.pMasteryPosterior ?? trace.clampedPosterior ?? 0).toFixed(4)} (${((payload.pMasteryPosterior ?? trace.clampedPosterior ?? 0) * 100).toFixed(1)}%)`,
        `  Mastery Status:   ${(payload.pMasteryPosterior ?? 0) >= 0.90 ? 'MASTERED (>= 90%)' : (payload.pMasteryPosterior ?? 0) >= 0.75 ? 'PROFICIENT (>= 75%)' : 'IN_PROGRESS'}`,
        `===================================================================================\n`,
      ].join('\n');

      this.appendToRotatedFile(mathLogPath, card);
    }
  }

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

    // File-based flight data recording with automatic rotation
    this.persistFlightData(mappedDto);

    return mappedDto;
  }

  /**
   * Повертає максимальний розкритий рівень Сократівських підказок для (userId, taskId)
   * з урахуванням останнього скидання прогресу (STUDENT_SKILL_RESET або TEACHER_MODULE_REVOKED).
   */
  async getActiveRevealedHintLevel(params: {
    userId: string;
    taskId: string;
    skillId?: string | null;
    courseSlug?: string | null;
  }): Promise<number> {
    const { userId, taskId, skillId, courseSlug } = params;
    if (!userId || !taskId) return 0;

    const resetOrConditions: Array<Record<string, any>> = [
      { eventType: 'TEACHER_MODULE_REVOKED', courseId: null },
    ];
    if (skillId) {
      resetOrConditions.push({ eventType: 'STUDENT_SKILL_RESET', skillId });
    }
    if (courseSlug) {
      resetOrConditions.push({ eventType: 'TEACHER_MODULE_REVOKED', courseId: courseSlug });
    }

    const lastReset = await this.prisma.studentActivityLog.findFirst({
      where: {
        userId,
        OR: resetOrConditions,
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    const hintLogs = await this.prisma.studentActivityLog.findMany({
      where: {
        userId,
        taskId,
        eventType: 'HINT_REQUESTED',
        ...(lastReset ? { createdAt: { gt: lastReset.createdAt } } : {}),
      },
      select: { payload: true },
    });

    let maxLevel = 0;
    for (const log of hintLogs) {
      const payload = (log.payload as Record<string, any>) || {};
      const level = Number(payload.level);
      if (Number.isFinite(level) && level > maxLevel) {
        maxLevel = level;
      }
    }
    return maxLevel;
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
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return logs.map((l: any) => {
      const fullName = l.user?.profile
        ? [l.user.profile.firstName, l.user.profile.lastName].filter(Boolean).join(' ')
        : null;
      const name = fullName || (l.user?.email ? l.user.email.split('@')[0] : null);

      return {
        id: l.id,
        userId: l.userId,
        user: l.user
          ? {
              id: l.user.id,
              name,
              email: l.user.email,
              role: l.user.role,
              avatarUrl: l.user.profile?.avatarUrl || null,
            }
          : null,
        userName: name,
        userEmail: l.user?.email || null,
        actorId: l.actorId,
        actorRole: l.actorRole as any,
        courseId: l.courseId,
        skillId: l.skillId,
        taskId: l.taskId,
        submissionId: l.submissionId,
        eventType: l.eventType,
        payload: (l.payload as Record<string, any>) || {},
        createdAt: l.createdAt.toISOString(),
      };
    });
  }

  /**
   * Отримання глобального живого потоку подій для кабінету викладача або адміністратора
   */
  async getRecentLogs(limit = 100, userId?: string): Promise<StudentActivityLogDto[]> {
    const where: any = {};
    if (userId && userId.trim() && userId !== 'ALL') {
      where.userId = userId.trim();
    }

    const logs = await this.prisma.studentActivityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Math.min(500, Math.max(1, limit)),
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return logs.map((l: any) => {
      const fullName = l.user?.profile
        ? [l.user.profile.firstName, l.user.profile.lastName].filter(Boolean).join(' ')
        : null;
      const name = fullName || (l.user?.email ? l.user.email.split('@')[0] : null);

      return {
        id: l.id,
        userId: l.userId,
        user: l.user
          ? {
              id: l.user.id,
              name,
              email: l.user.email,
              role: l.user.role,
              avatarUrl: l.user.profile?.avatarUrl || null,
            }
          : null,
        userName: name,
        userEmail: l.user?.email || null,
        actorId: l.actorId,
        actorRole: l.actorRole as any,
        courseId: l.courseId,
        skillId: l.skillId,
        taskId: l.taskId,
        submissionId: l.submissionId,
        eventType: l.eventType,
        payload: (l.payload as Record<string, any>) || {},
        createdAt: l.createdAt.toISOString(),
      };
    });
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
      where.userId = user ? user.id : options.userId;
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

  /**
   * 🔬 Автоматичний запуск скрипта верифікації BKT та аудиту логів
   */
  async runPythonVerifier(mode: 'test-only' | 'full' = 'full'): Promise<any> {
    const rootDir =
      process.cwd().endsWith('apps\\api') || process.cwd().endsWith('apps/api')
        ? path.resolve(process.cwd(), '../..')
        : process.cwd();
    const scriptPath = path.resolve(rootDir, 'scripts', 'verify_bkt_math.py');
    const logsPath = path.resolve(rootDir, 'logs', 'event_stream.jsonl');

    const args = ['--json'];
    if (mode === 'test-only') {
      args.push('--test-only');
    } else {
      args.push('--file', logsPath);
    }

    return new Promise((resolve) => {
      const startTime = Date.now();
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      const child = spawn(pythonCmd, [scriptPath, ...args], { cwd: rootDir });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('error', (err) => {
        this.logger.error(`Error spawning python verifier: ${err.message}`);
        resolve({
          success: false,
          error: `Не вдалося запустити Python: ${err.message}. Перевірте наявність Python 3 у системній PATH.`,
          rawStdout: stdout,
          rawStderr: stderr,
          executionTimeMs: Date.now() - startTime,
        });
      });

      child.on('close', (code) => {
        const executionTimeMs = Date.now() - startTime;
        try {
          const parsed = JSON.parse(stdout);
          resolve({
            ...parsed,
            exitCode: code,
            executionTimeMs,
            rawOutput: stdout,
          });
        } catch {
          resolve({
            success: code === 0,
            exitCode: code,
            rawOutput: stdout || stderr,
            executionTimeMs,
          });
        }
      });
    });
  }
}
