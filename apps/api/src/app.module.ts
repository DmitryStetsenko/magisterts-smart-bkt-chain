import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './adapters/outbound/persistence/database.module';
import { HealthController } from './adapters/inbound/http/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    DatabaseModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
