import { Body, Controller, Get, Put, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SystemConfigService } from '../../../domain/config/system-config.service';

const ALLOWED_THEMES = ['dark', 'light', 'system'] as const;
type ThemeMode = (typeof ALLOWED_THEMES)[number];

const DEFAULT_THEME_KEY = 'SYSTEM_DEFAULT_THEME';
const CUSTOM_TOKENS_KEY = 'SYSTEM_CUSTOM_THEME_TOKENS';

@ApiTags('SystemConfig')
@Controller('system-config')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) {}

  @Get('theme')
  @ApiOperation({ summary: 'Get global default theme mode and optional custom palette tokens for all portals' })
  async getThemeConfig() {
    const rawMode = await this.systemConfigService.get(DEFAULT_THEME_KEY, 'dark');
    const defaultTheme: ThemeMode = (ALLOWED_THEMES as readonly string[]).includes(rawMode)
      ? (rawMode as ThemeMode)
      : 'dark';

    const rawTokens = await this.systemConfigService.get(CUSTOM_TOKENS_KEY, '');
    let customTokens: Record<string, unknown> | null = null;
    if (rawTokens) {
      try {
        customTokens = JSON.parse(rawTokens);
      } catch {
        customTokens = null;
      }
    }

    return {
      defaultTheme,
      customTokens,
    };
  }

  @Put('theme')
  @ApiOperation({ summary: 'Update global default theme mode and/or custom palette tokens for all portals' })
  async updateThemeConfig(
    @Body()
    body: {
      defaultTheme?: string;
      customTokens?: Record<string, unknown> | null;
    },
  ) {
    if (body.defaultTheme !== undefined) {
      if (!(ALLOWED_THEMES as readonly string[]).includes(body.defaultTheme)) {
        throw new BadRequestException(
          `Invalid defaultTheme "${body.defaultTheme}". Expected one of: ${ALLOWED_THEMES.join(', ')}`,
        );
      }

      await this.systemConfigService.set(
        DEFAULT_THEME_KEY,
        body.defaultTheme,
        'Global default UI theme mode for all Smart-BKT-Chain web portals (dark | light | system)',
      );
    }

    if (body.customTokens !== undefined) {
      await this.systemConfigService.set(
        CUSTOM_TOKENS_KEY,
        body.customTokens ? JSON.stringify(body.customTokens) : '',
        'Global custom CSS color palette tokens for Smart-BKT-Chain web portals',
      );
    }

    return this.getThemeConfig();
  }
}
