import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EVALUATION_QUEUE_NAME } from './evaluation-queue.module';

export interface EvaluationJobPayload {
  submissionId: string;
  userId: string;
  taskId: string;
  sourceCode: string;
  telemetrySessionId?: string;
  wpm?: number;
  keystrokeCount?: number;
}

@Processor(EVALUATION_QUEUE_NAME)
export class EvaluationProcessor extends WorkerHost {
  private readonly logger = new Logger(EvaluationProcessor.name);

  async process(job: Job<EvaluationJobPayload>): Promise<any> {
    this.logger.log(`Processing async code evaluation job #${job.id} for submission ${job.data.submissionId}`);
    
    // Placeholder for VM execution, Gemini LLM-Judge & BKT math calculation in upcoming micro-step
    const mockResult = {
      jobId: job.id,
      submissionId: job.data.submissionId,
      status: 'COMPLETED',
      passedTestsCount: 3,
      totalTestsCount: 3,
      trustCoefficient: 1.0,
      pMastery: 0.95,
      processedAt: new Date().toISOString(),
    };

    this.logger.log(`Successfully completed evaluation job #${job.id}`);
    return mockResult;
  }
}
