import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './adapters/outbound/persistence/database.module';
import { HealthController } from './adapters/inbound/http/health.controller';
import { TaskController } from './adapters/inbound/http/task.controller';
import { BktController } from './adapters/inbound/http/bkt.controller';
import { TelemetryGateway } from './adapters/inbound/websocket/telemetry.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    DatabaseModule,
  ],
  controllers: [HealthController, TaskController, BktController],
  providers: [TelemetryGateway],
})
export class AppModule {}
