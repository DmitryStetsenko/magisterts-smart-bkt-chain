import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  Query,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../../../domain/auth/auth.service';
import { SystemConfigService } from '../../../domain/config/system-config.service';
import { GoogleAuthPayloadDto, MockAuthPayloadDto, AuthUserDto } from '@sbc/types';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly systemConfig: SystemConfigService,
  ) {}

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Авторизація або реєстрація через Google ID Token (Google OAuth 2.0)' })
  @ApiResponse({ status: 200, description: 'Успішна авторизація, повертає об\'єкт користувача та JWT токен' })
  async googleAuth(@Body() body: GoogleAuthPayloadDto): Promise<{ success: boolean; user: AuthUserDto; token: string }> {
    if (!body?.credential) {
      throw new UnauthorizedException('Відсутній Google credential токен');
    }
    const result = await this.authService.validateGoogleToken(body.credential);
    return {
      success: true,
      ...result,
    };
  }

  @Post('mock-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Швидкий тестовий вхід (Test Mode Bypass) для демо, тестувальників або офлайн-роботи' })
  @ApiResponse({ status: 200, description: 'Успішний тестовий вхід' })
  async mockLogin(@Body() body: MockAuthPayloadDto): Promise<{ success: boolean; user: AuthUserDto; token: string }> {
    const target = body?.userIdOrEmail || 'demo-student';
    const result = await this.authService.mockLogin(target, body?.role as any);
    return {
      success: true,
      ...result,
    };
  }

  @Get('me')
  @ApiOperation({ summary: 'Отримання профілю поточного авторизованого користувача' })
  async getMe(
    @Headers('authorization') authHeader?: string,
    @Query('userId') queryUserId?: string,
  ): Promise<{ success: boolean; user: AuthUserDto }> {
    let userId = queryUserId;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = this.authService.verifyJwt(token);
      userId = payload.sub;
    }

    if (!userId) {
      // Якщо в режимі тестування і немає токена, повертаємо demo-student
      const isTest = await this.systemConfig.isTestAuthModeEnabled();
      if (isTest) {
        userId = 'student@example.com';
      } else {
        throw new UnauthorizedException('Необхідна авторизація');
      }
    }

    const user = await this.authService.getMe(userId);
    return {
      success: true,
      user,
    };
  }

  @Get('config')
  @ApiOperation({ summary: 'Публічна конфігурація методів авторизації' })
  async getAuthConfig(): Promise<{
    testModeEnabled: boolean;
    googleClientId: string;
  }> {
    const testModeEnabled = await this.systemConfig.isTestAuthModeEnabled();
    const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
    return {
      testModeEnabled,
      googleClientId,
    };
  }

  @Post('test-mode')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Перемикання тестового режиму авторизації (Адміністратор)' })
  async setTestMode(
    @Body() body: { enabled: boolean },
  ): Promise<{ success: boolean; testModeEnabled: boolean }> {
    const enabled = Boolean(body?.enabled);
    await this.systemConfig.set(
      'SYSTEM_AUTH_TEST_MODE',
      enabled ? 'true' : 'false',
      'Дозволяє швидкий тестовий вхід без обов\'язкового Google OAuth 2.0',
    );
    return {
      success: true,
      testModeEnabled: enabled,
    };
  }
}
