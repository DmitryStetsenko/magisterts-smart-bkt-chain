import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

export const EVALUATION_QUEUE_NAME = 'code-evaluation';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST || '127.0.0.1',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          family: 4,
          maxRetriesPerRequest: null,
        },
      }),
    }),
    BullModule.registerQueue({
      name: EVALUATION_QUEUE_NAME,
    }),
  ],
  exports: [BullModule],
})
export class EvaluationQueueModule {}
