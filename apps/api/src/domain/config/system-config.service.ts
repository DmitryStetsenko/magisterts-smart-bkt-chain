import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../adapters/outbound/persistence/prisma.service';

@Injectable()
export class SystemConfigService {
  private readonly logger = new Logger(SystemConfigService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Отримати значення параметра за ключем
   */
  async get(key: string, defaultValue = ''): Promise<string> {
    try {
      const config = await this.prisma.systemConfig.findUnique({
        where: { key },
      });
      return config?.value ?? defaultValue;
    } catch (err) {
      this.logger.warn(`Failed to read config key "${key}", using default: ${defaultValue}`);
      return defaultValue;
    }
  }

  /**
   * Чи увімкнено режим тестової авторизації без обов'язкового Google OAuth 2.0
   */
  async isTestAuthModeEnabled(): Promise<boolean> {
    const val = await this.get('SYSTEM_AUTH_TEST_MODE', 'true');
    return val.toLowerCase() === 'true';
  }

  /**
   * Встановити значення параметра
   */
  async set(key: string, value: string, description?: string): Promise<void> {
    await this.prisma.systemConfig.upsert({
      where: { key },
      update: { value, ...(description ? { description } : {}) },
      create: { key, value, description },
    });
    this.logger.log(`SystemConfig updated: ${key} = ${value}`);
  }

  /**
   * Отримати всі налаштування
   */
  async getAll(): Promise<Array<{ key: string; value: string; description: string | null }>> {
    return this.prisma.systemConfig.findMany({
      orderBy: { key: 'asc' },
    });
  }
}
