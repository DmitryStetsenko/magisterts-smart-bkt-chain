import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../adapters/outbound/persistence/prisma.service';
import { UserRole, AuthProvider, UserStatus } from '@prisma/client';
import { AuthUserDto, CreateUserDto, UpdateUserDto } from '@sbc/types';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Отримання списку користувачів з фільтрами
   */
  async getUsers(params: {
    role?: UserRole;
    status?: UserStatus;
    search?: string;
  }): Promise<{ users: AuthUserDto[]; total: number }> {
    const where: any = {};

    if (params.role) {
      where.role = params.role;
    }
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { profile: { firstName: { contains: q, mode: 'insensitive' } } },
        { profile: { lastName: { contains: q, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) => this.formatUser(u)),
      total,
    };
  }

  /**
   * Отримання користувача за ID
   */
  async getUserById(id: string): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user) {
      throw new NotFoundException(`Користувача з ID ${id} не знайдено`);
    }
    return this.formatUser(user);
  }

  /**
   * Створення нового користувача вручну адміністратором
   */
  async createUser(dto: CreateUserDto): Promise<AuthUserDto> {
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException(`Користувач із email "${email}" вже існує`);
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        role: dto.role || UserRole.STUDENT,
        authProvider: AuthProvider.LOCAL,
        status: UserStatus.ACTIVE,
        profile: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${email}`,
          },
        },
      },
      include: { profile: true },
    });

    this.logger.log(`User created by admin: ${user.email} (${user.role})`);
    return this.formatUser(user);
  }

  /**
   * Оновлення профілю та статусу користувача
   */
  async updateUser(id: string, dto: UpdateUserDto): Promise<AuthUserDto> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Користувача з ID ${id} не знайдено`);
    }

    const updateData: any = {};
    if (dto.email) updateData.email = dto.email.toLowerCase().trim();
    if (dto.role) updateData.role = dto.role;
    if (dto.status) updateData.status = dto.status;

    if (dto.firstName !== undefined || dto.lastName !== undefined) {
      updateData.profile = {
        upsert: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
          },
          update: {
            ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
            ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
          },
        },
      };
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      include: { profile: true },
    });

    this.logger.log(`User ${id} updated: ${updated.email}`);
    return this.formatUser(updated);
  }

  /**
   * Видалення користувача
   */
  async deleteUser(id: string): Promise<{ success: boolean }> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Користувача з ID ${id} не знайдено`);
    }

    await this.prisma.user.delete({ where: { id } });
    this.logger.log(`User ${id} deleted`);
    return { success: true };
  }

  private formatUser(user: any): AuthUserDto {
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
