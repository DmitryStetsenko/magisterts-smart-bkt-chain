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

export interface TelemetryPayload {
  sessionId?: string;
  userId: string;
  taskId: string;
  keystrokePauseMs: number;
  wpm: number;
  deleteCount: number;
  pasteEvents: number;
}

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/telemetry',
})
export class TelemetryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TelemetryGateway.name);

  constructor(private readonly prisma: PrismaService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to Telemetry WebSocket: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from Telemetry WebSocket: ${client.id}`);
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

  notifyStudentSubmission(payload: {
    userId: string;
    taskId: string;
    skillId: string;
    isPassed: boolean;
    teacherReviewStatus: string;
    submissionId: string;
  }) {
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
}
