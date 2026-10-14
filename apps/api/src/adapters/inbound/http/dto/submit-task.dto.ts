import { ApiProperty } from '@nestjs/swagger';

export class SubmitTaskDto {
  @ApiProperty({ description: 'ID of the student submitting the response (optional)', example: 'clx123student', required: false })
  userId?: string;

  @ApiProperty({ description: 'ID of the task being solved', example: 'clx123task' })
  taskId: string;

  @ApiProperty({ description: 'Student Javascript source code (for CODE tasks)', required: false })
  code?: string;

  @ApiProperty({ description: 'Selected option ID (for SINGLE_CHOICE tasks)', required: false })
  selectedOptionId?: string;

  @ApiProperty({ description: 'Selected option IDs array (for MULTIPLE_CHOICE tasks)', required: false })
  selectedOptionIds?: string[];

  @ApiProperty({ description: 'Student open text essay answer (for TEXT_ESSAY tasks)', required: false })
  essayAnswer?: string;

  @ApiProperty({ description: 'Reaction latency in milliseconds for quiz tasks', required: false })
  reactionLatencyMs?: number;

  @ApiProperty({ description: 'Share of deletion keystrokes among all keystrokes (0..1), from editor telemetry', required: false })
  deletionRatio?: number;

  @ApiProperty({ description: 'Number of long pauses during solving, from editor telemetry', required: false })
  pauseCount?: number;

  @ApiProperty({ description: 'Number of paste events during solving, from editor telemetry', required: false })
  pasteEvents?: number;

  @ApiProperty({ description: 'Typing speed in words per minute (WPM), from editor telemetry', required: false })
  typingWpm?: number;
}
