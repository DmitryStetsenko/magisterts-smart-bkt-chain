import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../outbound/persistence/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Check API server & database connectivity health' })
  @ApiResponse({
    status: 200,
    description: 'System health status and DB connection health',
    schema: {
      example: {
        status: 'ok',
        service: 'Smart-BKT-Chain API',
        timestamp: '2026-10-02T14:00:00.000Z',
        database: 'ok',
      },
    },
  })
  async checkHealth() {
    let dbStatus = 'ok';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch (e) {
      dbStatus = `error: ${(e as Error).message}`;
    }

    return {
      status: 'ok',
      service: 'Smart-BKT-Chain API',
      timestamp: new Date().toISOString(),
      database: dbStatus,
    };
  }
}
