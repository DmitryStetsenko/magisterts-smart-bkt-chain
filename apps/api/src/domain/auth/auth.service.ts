import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../adapters/outbound/persistence/prisma.service';
import { SystemConfigService } from '../config/system-config.service';
import { UserRole, AuthProvider, UserStatus } from '@prisma/client';
import { AuthUserDto } from '@sbc/types';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtSecret = process.env.JWT_SECRET || 'smart-bkt-chain-dev-jwt-secret-2026';
  private googleClient: OAuth2Client | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly systemConfig: SystemConfigService,
  ) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (clientId) {
      this.googleClient = new OAuth2Client(clientId);
    }
  }

  /**
   * Генерація сесійного JWT токена
   */
  generateJwt(user: { id: string; email: string; role: string }): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      this.jwtSecret,
      { expiresIn: '7d' },
    );
  }

  /**
   * Верифікація JWT токена
   */
  verifyJwt(token: string): JwtPayload {
    try {
      return jwt.verify(token, this.jwtSecret) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  /**
   * Авторизація / Реєстрація через Google ID Token
   */
  async validateGoogleToken(credential: string): Promise<{ user: AuthUserDto; token: string }> {
    let email: string;
    let googleId: string;
    let firstName: string | undefined;
    let lastName: string | undefined;
    let avatarUrl: string | undefined;

    // Підтримка симуляційних токенів для тестів або офлайн-розробки
    if (credential.startsWith('mock-google-token-')) {
      const isTestMode = await this.systemConfig.isTestAuthModeEnabled();
      if (!isTestMode && process.env.NODE_ENV === 'production') {
        throw new ForbiddenException('Mock Google authentication is disabled in production');
      }
      const suffix = credential.replace('mock-google-token-', '');
      email = `${suffix}@example.com`;
      googleId = `mock-google-sub-${suffix}`;
      firstName = 'Google';
      lastName = suffix.charAt(0).toUpperCase() + suffix.slice(1);
      avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${suffix}`;
    } else {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!this.googleClient && clientId) {
        this.googleClient = new OAuth2Client(clientId);
      }

      if (!this.googleClient) {
        throw new UnauthorizedException(
          'Google OAuth client is not configured on the server. Please set GOOGLE_CLIENT_ID.',
        );
      }

      try {
        const ticket = await this.googleClient.verifyIdToken({
          idToken: credential,
          audience: clientId,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          throw new UnauthorizedException('Invalid Google token payload');
        }

        email = payload.email.toLowerCase();
        googleId = payload.sub;
        firstName = payload.given_name || payload.name?.split(' ')[0] || 'Студент';
        lastName = payload.family_name || payload.name?.split(' ').slice(1).join(' ') || '';
        avatarUrl = payload.picture;
      } catch (err: any) {
        this.logger.error(`Google token verification failed: ${err.message}`);
        throw new UnauthorizedException(`Failed to verify Google credentials: ${err.message}`);
      }
    }

    // Пошук або створення користувача
    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ googleId }, { email }],
      },
      include: { profile: true },
    });

    if (user) {
      if (user.status === UserStatus.SUSPENDED) {
        throw new ForbiddenException('Ваш обліковий запис тимчасово заблоковано адміністратором');
      }

      // Якщо користувач зареєструвався локально або через інший канал, прив'язуємо googleId
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            googleId,
            authProvider: user.authProvider === AuthProvider.LOCAL ? AuthProvider.GOOGLE : user.authProvider,
          },
          include: { profile: true },
        });
      }

      // Оновлюємо аватар, якщо раніше був порожній
      if (avatarUrl && !user.profile?.avatarUrl) {
        await this.prisma.userProfile.update({
          where: { userId: user.id },
          data: { avatarUrl },
        });
      }
    } else {
      // Створення нового студента (нульова рутина реєстрації)
      user = await this.prisma.user.create({
        data: {
          email,
          googleId,
          role: UserRole.STUDENT,
          authProvider: AuthProvider.GOOGLE,
          status: UserStatus.ACTIVE,
          profile: {
            create: {
              firstName,
              lastName,
              avatarUrl,
            },
          },
        },
        include: { profile: true },
      });
      this.logger.log(`Created new student via Google OAuth: ${email} (${user.id})`);
    }

    const token = this.generateJwt(user);
    return {
      user: this.formatUser(user),
      token,
    };
  }

  /**
   * Швидкий тестовий вхід (Test Mode Bypass) для демо, офлайн або тестувальників
   */
  async mockLogin(userIdOrEmail: string, forcedRole?: UserRole): Promise<{ user: AuthUserDto; token: string }> {
    const isTestMode = await this.systemConfig.isTestAuthModeEnabled();
    if (!isTestMode) {
      throw new ForbiddenException(
        'Тестовий режим авторизації вимкнено адміністратором. Використовуйте Google OAuth 2.0.',
      );
    }

    let targetEmail = userIdOrEmail.toLowerCase();
    if (userIdOrEmail === 'demo-student') targetEmail = 'student@example.com';
    if (userIdOrEmail === 'teacher-olena' || userIdOrEmail === 'teacher-dmytro') targetEmail = 'teacher@example.com';
    if (userIdOrEmail === 'admin-cms') targetEmail = 'admin@example.com';

    let user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: targetEmail }, { id: userIdOrEmail }],
      },
      include: { profile: true },
    });

    if (!user) {
      // Автостворення тестового користувача
      const role = forcedRole || (targetEmail.includes('teacher') ? UserRole.TEACHER : targetEmail.includes('admin') ? UserRole.ADMIN : UserRole.STUDENT);
      const name = targetEmail.split('@')[0];
      user = await this.prisma.user.create({
        data: {
          email: targetEmail,
          role,
          authProvider: AuthProvider.LOCAL,
          status: UserStatus.ACTIVE,
          profile: {
            create: {
              firstName: name.charAt(0).toUpperCase() + name.slice(1),
              lastName: '(Тестовий)',
              avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
            },
          },
        },
        include: { profile: true },
      });
      this.logger.log(`Mock user created: ${targetEmail} (${role})`);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException('Обліковий запис заблоковано');
    }

    const token = this.generateJwt(user);
    return {
      user: this.formatUser(user),
      token,
    };
  }

  /**
   * Отримати поточний профіль користувача
   */
  async getMe(userId: string): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        courseEnrollments: {
          include: {
            course: true,
            classroom: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`Користувача з ID ${userId} не знайдено`);
    }

    return this.formatUser(user);
  }

  /**
   * Форматування об'єкта користувача без паролів
   */
  formatUser(user: any): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      authProvider: user.authProvider,
      status: user.status,
      createdAt: user.createdAt?.toISOString?.() || new Date().toISOString(),
      profile: user.profile
        ? {
            firstName: user.profile.firstName,
            lastName: user.profile.lastName,
            avatarUrl: user.profile.avatarUrl,
            bio: user.profile.bio,
          }
        : null,
    };
  }
}
