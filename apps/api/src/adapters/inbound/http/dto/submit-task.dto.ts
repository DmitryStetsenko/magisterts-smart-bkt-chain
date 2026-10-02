import { ApiProperty } from '@nestjs/swagger';

export class SubmitTaskDto {
  @ApiProperty({ description: 'ID of the student submitting the code (optional)', example: 'clx123student', required: false })
  userId?: string;

  @ApiProperty({ description: 'ID of the task being solved', example: 'clx123task' })
  taskId: string;

  @ApiProperty({ description: 'Student Javascript source code', example: 'function sum(a, b) {\n  return a + b;\n}' })
  code: string;
}
