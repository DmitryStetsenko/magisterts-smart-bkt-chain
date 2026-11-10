import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './adapters/outbound/persistence/database.module';
import { EvaluationQueueModule } from './adapters/outbound/queue/evaluation-queue.module';
import { EvaluationProcessor } from './adapters/outbound/queue/evaluation.processor';
import { HealthController } from './adapters/inbound/http/health.controller';
import { TaskController } from './adapters/inbound/http/task.controller';
import { BktController } from './adapters/inbound/http/bkt.controller';
import { CourseController } from './adapters/inbound/http/course.controller';
import { AuthController } from './adapters/inbound/http/auth.controller';
import { TelemetryGateway } from './adapters/inbound/websocket/telemetry.gateway';

import { OpenAnswerEvaluatorService } from './domain/evaluation/open-answer-evaluator.service';
import { AuditLogService } from './domain/audit/audit-log.service';
import { AuthService } from './domain/auth/auth.service';
import { SystemConfigService } from './domain/config/system-config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    DatabaseModule,
    EvaluationQueueModule,
  ],
  controllers: [HealthController, TaskController, BktController, CourseController, AuthController],
  providers: [
    TelemetryGateway,
    EvaluationProcessor,
    OpenAnswerEvaluatorService,
    AuditLogService,
    AuthService,
    SystemConfigService,
  ],
})
export class AppModule {}
