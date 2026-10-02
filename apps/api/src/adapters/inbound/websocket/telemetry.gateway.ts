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
    this.logger.log(`Client ${client.id} joined room ${room}`);

    let session = await this.prisma.telemetrySession.findFirst({
      where: {
        userId: payload.userId,
        taskId: payload.taskId,
        endedAt: null,
      },
    });

    if (!session) {
      session = await this.prisma.telemetrySession.create({
        data: {
          userId: payload.userId,
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

    if (payload.sessionId) {
      await this.prisma.telemetryLog.create({
        data: {
          sessionId: payload.sessionId,
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
    }

    const room = `session_${payload.userId}_${payload.taskId}`;
    this.server.to(room).emit('telemetry_updated', payload);
  }
}
