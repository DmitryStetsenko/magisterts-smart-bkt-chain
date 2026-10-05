import { EvaluationProcessor, EvaluationJobPayload } from './evaluation.processor';

describe('EvaluationProcessor', () => {
  let processor: EvaluationProcessor;

  beforeEach(() => {
    processor = new EvaluationProcessor();
  });

  it('should be defined', () => {
    expect(processor).toBeDefined();
  });

  it('should process job and return result payload', async () => {
    const mockJob = {
      id: 'job-123',
      data: {
        submissionId: 'sub-456',
        userId: 'user-789',
        taskId: 'task-1',
        sourceCode: 'function sum(a, b) { return a + b; }',
      } as EvaluationJobPayload,
    } as any;

    const result = await processor.process(mockJob);

    expect(result).toBeDefined();
    expect(result.jobId).toBe('job-123');
    expect(result.submissionId).toBe('sub-456');
    expect(result.status).toBe('COMPLETED');
    expect(result.pMastery).toBe(0.95);
  });
});
