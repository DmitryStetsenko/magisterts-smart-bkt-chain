import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../adapters/outbound/persistence/prisma.service';
import { SystemConfigService } from '../config/system-config.service';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UserRole, AuthProvider, UserStatus } from '@prisma/client';

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockSystemConfig: any;

  beforeEach(async () => {
    mockPrisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      userProfile: {
        update: jest.fn(),
      },
    };

    mockSystemConfig = {
      isTestAuthModeEnabled: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SystemConfigService, useValue: mockSystemConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('JWT Operations', () => {
    it('should generate and verify a valid JWT token', () => {
      const user = { id: 'usr-123', email: 'test@example.com', role: 'STUDENT' };
      const token = service.generateJwt(user);
      expect(typeof token).toBe('string');

      const payload = service.verifyJwt(token);
      expect(payload.sub).toBe('usr-123');
      expect(payload.email).toBe('test@example.com');
      expect(payload.role).toBe('STUDENT');
    });

    it('should throw UnauthorizedException on invalid token', () => {
      expect(() => service.verifyJwt('invalid-token')).toThrow(UnauthorizedException);
    });
  });

  describe('Mock Login', () => {
    it('should login demo-student successfully when test mode is enabled', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'std-1',
        email: 'student@example.com',
        role: UserRole.STUDENT,
        authProvider: AuthProvider.LOCAL,
        status: UserStatus.ACTIVE,
        profile: { firstName: 'Дмитро', lastName: 'Стеценко' },
      });

      const res = await service.mockLogin('demo-student');
      expect(res.user.email).toBe('student@example.com');
      expect(res.token).toBeDefined();
    });

    it('should throw ForbiddenException if test mode is disabled', async () => {
      mockSystemConfig.isTestAuthModeEnabled.mockResolvedValue(false);

      await expect(service.mockLogin('demo-student')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('Google Auth with Mock Token', () => {
    it('should authenticate user with mock-google-token prefix', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'new-google-usr',
        email: 'alex@example.com',
        googleId: 'mock-google-sub-alex',
        role: UserRole.STUDENT,
        authProvider: AuthProvider.GOOGLE,
        status: UserStatus.ACTIVE,
        profile: { firstName: 'Google', lastName: 'Alex' },
      });

      const res = await service.validateGoogleToken('mock-google-token-alex');
      expect(res.user.email).toBe('alex@example.com');
      expect(res.token).toBeDefined();
    });
  });
});
