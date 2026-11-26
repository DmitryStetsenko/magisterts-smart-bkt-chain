import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../../outbound/persistence/prisma.service';
import type {
  TelemetrySocketPayloadDto,
  StudentSubmissionWsNotificationDto,
  ActiveStrictSessionDto,
  IntegrityPolicy,
  PracticeIntegrityMode,
} from '@sbc/types';

export type TelemetryPayload = TelemetrySocketPayloadDto;

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/telemetry',
})
export class TelemetryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TelemetryGateway.name);
  private readonly activeSessions = new Map<string, ActiveStrictSessionDto>();
  private readonly clientSessions = new Map<string, { userId: string; role: 'student' | 'study' }>();

  constructor(private readonly prisma: PrismaService) {}

  private async resolveCanonicalUserId(rawUserId?: string): Promise<string> {
    if (!rawUserId || rawUserId === 'demo-student') {
      const demoUser = await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      return demoUser?.id || 'demo-student';
    }
    const user = await this.prisma.user.findUnique({ where: { id: rawUserId } });
    if (user) return user.id;
    const fallback = await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
    return fallback?.id || rawUserId;
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to Telemetry WebSocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from Telemetry WebSocket: ${client.id}`);
    const meta = this.clientSessions.get(client.id);
    this.clientSessions.delete(client.id);
    if (meta && meta.role === 'student') {
      // Clear strict session only if no other student socket for this user remains connected
      const hasOtherStudentSocket = Array.from(this.clientSessions.values()).some(
        (m) => m.userId === meta.userId && m.role === 'student',
      );
      if (!hasOtherStudentSocket) {
        this.clearActiveStrictSession(meta.userId);
      }
    }
  }

  @SubscribeMessage('join_study')
  async handleJoinStudy(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId?: string },
  ) {
    const resolvedUserId = await this.resolveCanonicalUserId(payload?.userId);
    client.join(`user_${resolvedUserId}`);
    if (!payload?.userId || payload.userId === 'demo-student') {
      client.join('user_demo-student');
    }
    this.clientSessions.set(client.id, { userId: resolvedUserId, role: 'study' });
    const current = this.getActiveStrictSession(resolvedUserId);
    client.emit('strict_session_changed', current);
  }

  @SubscribeMessage('set_practice_session')
  async handleSetPracticeSession(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      userId?: string;
      courseSlug?: string;
      skillId?: string;
      skillTitle?: string;
      taskId?: string;
      mode: PracticeIntegrityMode;
      active: boolean;
    },
  ) {
    const resolvedUserId = await this.resolveCanonicalUserId(payload?.userId);
    this.clientSessions.set(client.id, { userId: resolvedUserId, role: 'student' });
    client.join(`user_${resolvedUserId}`);
    if (!payload?.userId || payload.userId === 'demo-student') {
      client.join('user_demo-student');
    }
    this.setActiveStrictSession({
      active: Boolean(payload?.active && payload?.mode === 'GRADED'),
      userId: resolvedUserId,
      courseSlug: payload?.courseSlug,
      skillId: payload?.skillId,
      skillTitle: payload?.skillTitle,
      taskId: payload?.taskId,
      mode: payload?.mode || 'TRAINING',
      startedAt: new Date().toISOString(),
    });
  }

  @SubscribeMessage('tab_visibility_event')
  async handleTabVisibilityEvent(
    @ConnectedSocket() _client: Socket,
    @MessageBody()
    payload: {
      userId?: string;
      taskId?: string;
      skillId?: string;
      event: 'TAB_BLUR' | 'TAB_RETURN';
      awayMs?: number;
      mode?: PracticeIntegrityMode;
    },
  ) {
    const resolvedUserId = await this.resolveCanonicalUserId(payload?.userId);
    if (payload?.taskId) {
      const session = await this.prisma.telemetrySession.findFirst({
        where: { userId: resolvedUserId, taskId: payload.taskId, endedAt: null },
        orderBy: { startedAt: 'desc' },
      });
      if (session) {
        await this.prisma.telemetryLog.create({
          data: {
            sessionId: session.id,
            eventType: payload.event,
            eventData: {
              awayMs: payload.awayMs ?? 0,
              mode: payload.mode || 'TRAINING',
              skillId: payload.skillId || null,
            },
          },
        });
      }
    }
    this.server.emit('student_tab_visibility', {
      ...payload,
      userId: resolvedUserId,
      timestamp: new Date().toISOString(),
    });
  }

  setActiveStrictSession(session: ActiveStrictSessionDto) {
    if (session.active && session.mode === 'GRADED') {
      this.activeSessions.set(session.userId, session);
    } else {
      this.activeSessions.delete(session.userId);
    }
    const snapshot = this.getActiveStrictSession(session.userId);
    this.server?.to(`user_${session.userId}`).emit('strict_session_changed', snapshot);
    this.server?.to('user_demo-student').emit('strict_session_changed', snapshot);
  }

  clearActiveStrictSession(userId: string) {
    const hadActive = this.activeSessions.has(userId);
    this.activeSessions.delete(userId);
    if (hadActive) {
      const snapshot: ActiveStrictSessionDto = {
        active: false,
        userId,
        mode: 'TRAINING',
      };
      this.server?.to(`user_${userId}`).emit('strict_session_changed', snapshot);
      this.server?.to('user_demo-student').emit('strict_session_changed', snapshot);
    }
  }

  getActiveStrictSession(userId: string): ActiveStrictSessionDto {
    const existing = this.activeSessions.get(userId);
    if (existing && existing.active && existing.mode === 'GRADED') {
      return existing;
    }
    return {
      active: false,
      userId,
      mode: 'TRAINING',
    };
  }

  notifyPolicyChanged(payload: {
    classroomId?: string;
    userId?: string;
    courseId?: string;
    integrityPolicy: IntegrityPolicy;
    strictModeUntil?: string | null;
  }) {
    this.logger.log(
      `Emitting integrity_policy_changed: policy=${payload.integrityPolicy}, classroom=${payload.classroomId || 'N/A'}, user=${payload.userId || 'ALL'}`,
    );
    this.server?.emit('integrity_policy_changed', payload);
  }

  @SubscribeMessage('join_session')
  async handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { userId: string; taskId: string },
  ) {
    const room = `session_${payload.userId}_${payload.taskId}`;
    client.join(room);

    let targetUserId = payload.userId;
    let user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      user = await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (user) targetUserId = user.id;
    }

    if (user) {
      const userRoom = `user_${user.id}`;
      client.join(userRoom);
      client.join('user_demo-student');
      this.logger.log(`Client ${client.id} joined user room ${userRoom}`);
    }

    this.logger.log(`Client ${client.id} joined room ${room}`);

    let session = await this.prisma.telemetrySession.findFirst({
      where: {
        userId: targetUserId,
        taskId: payload.taskId,
        endedAt: null,
      },
    });

    if (!session) {
      session = await this.prisma.telemetrySession.create({
        data: {
          userId: targetUserId,
          taskId: payload.taskId,
        },
      });
    }

    client.emit('session_joined', { sessionId: session.id, room });
  }

  @SubscribeMessage('telemetry_data')
  async handleTelemetryData(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TelemetryPayload,
  ) {
    this.logger.debug(
      `Received telemetry data from ${payload.userId} for task ${payload.taskId}: WPM=${payload.wpm}, Pause=${payload.keystrokePauseMs}ms`,
    );

    let sessionId = payload.sessionId;
    if (!sessionId) {
      let user = await this.prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) user = await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (user) {
        let activeSession = await this.prisma.telemetrySession.findFirst({
          where: { userId: user.id, taskId: payload.taskId, endedAt: null },
          orderBy: { startedAt: 'desc' },
        });
        if (!activeSession) {
          activeSession = await this.prisma.telemetrySession.create({
            data: { userId: user.id, taskId: payload.taskId },
          });
        }
        sessionId = activeSession.id;
      }
    }

    if (sessionId) {
      await this.prisma.telemetryLog.create({
        data: {
          sessionId,
          eventType: 'KEYSTROKE_METRICS',
          eventData: JSON.parse(
            JSON.stringify({
              keystrokePauseMs: payload.keystrokePauseMs,
              wpm: payload.wpm,
              deleteCount: payload.deleteCount,
              pasteEvents: payload.pasteEvents,
            }),
          ),
        },
      });

      let targetUserId = payload.userId;
      let user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
      if (!user) user = await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (user) targetUserId = user.id;

      const pasteRatio = payload.pasteEvents > 0 ? 1.0 : 0.0;
      await this.prisma.behavioralProfile.upsert({
        where: { sessionId },
        create: {
          userId: targetUserId,
          sessionId,
          typingSpeedWpm: payload.wpm || 0,
          pasteRatio,
          pauseDurationMs: payload.keystrokePauseMs || 0,
        },
        update: {
          typingSpeedWpm: payload.wpm || 0,
          pasteRatio: pasteRatio > 0 ? pasteRatio : undefined,
          pauseDurationMs: payload.keystrokePauseMs || 0,
        },
      });
    }

    const room = `session_${payload.userId}_${payload.taskId}`;
    this.server.to(room).emit('telemetry_updated', payload);
    this.server.emit('student_telemetry_updated', payload);
  }

  notifyBktReset(userId: string, skillId?: string) {
    this.logger.log(`Emitting bkt_state_reset event for user ${userId}, skill: ${skillId || 'ALL'}`);
    this.server.emit('bkt_state_reset', { userId, skillId });
  }

  notifyStudentSubmission(payload: StudentSubmissionWsNotificationDto) {
    this.logger.log(
      `Emitting student_submitted event for user ${payload.userId}, task ${payload.taskId}, reviewStatus: ${payload.teacherReviewStatus}`,
    );
    this.server.emit('student_submitted', payload);
  }

  notifyTeacherReviewDecision(payload: {
    submissionId: string;
    decision: 'APPROVE' | 'REJECT';
    userId: string;
    taskId?: string;
    comment?: string | null;
    scoreOverride?: number | null;
  }) {
    this.logger.log(
      `Emitting teacher_review_decision event for submission ${payload.submissionId} (${payload.decision}), task ${payload.taskId || 'unknown'}`,
    );
    this.server.emit('teacher_review_decision', payload);
  }

  notifyActivityLog(log: any) {
    this.logger.log(`Emitting activity_log event: ${log.eventType} for user ${log.userId}`);
    this.server.emit('activity_log', log);
    this.server.emit(`user_activity_${log.userId}`, log);
  }

  notifySubmissionAnnulled(payload: {
    submissionId: string;
    userId: string;
    taskId?: string;
    skillId?: string;
    reason: string;
    comment?: string | null;
    pMasteryUpdated?: number;
  }) {
    this.logger.log(
      `Emitting submission_annulled event for submission ${payload.submissionId}, user ${payload.userId}`,
    );
    this.server.emit('submission_annulled', payload);
    this.server.emit(`user_annulled_${payload.userId}`, payload);
  }
}
