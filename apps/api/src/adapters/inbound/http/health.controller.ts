import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../outbound/persistence/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
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
