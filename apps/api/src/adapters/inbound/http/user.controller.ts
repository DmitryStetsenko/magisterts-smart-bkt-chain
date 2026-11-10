import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserService } from '../../../domain/user/user.service';
import { UserRole, UserStatus } from '@prisma/client';
import { AuthUserDto, CreateUserDto, UpdateUserDto } from '@sbc/types';

@ApiTags('Users Management')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Отримання списку користувачів із фільтрами (роль, статус, пошук)' })
  async getUsers(
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
    @Query('search') search?: string,
  ): Promise<{ success: boolean; users: AuthUserDto[]; total: number }> {
    const res = await this.userService.getUsers({ role, status, search });
    return { success: true, ...res };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримання інформації про конкретного користувача за ID' })
  async getUserById(
    @Param('id') id: string,
  ): Promise<{ success: boolean; user: AuthUserDto }> {
    const user = await this.userService.getUserById(id);
    return { success: true, user };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Створення нового користувача вручну адміністратором' })
  async createUser(
    @Body() body: CreateUserDto,
  ): Promise<{ success: boolean; user: AuthUserDto }> {
    if (!body?.email) {
      throw new BadRequestException('Email є обов\'язковим полем');
    }
    const user = await this.userService.createUser(body);
    return { success: true, user };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Оновлення ролі, статусу або профілю користувача' })
  async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<{ success: boolean; user: AuthUserDto }> {
    const user = await this.userService.updateUser(id, body);
    return { success: true, user };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Видалення користувача' })
  async deleteUser(
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.userService.deleteUser(id);
  }
}
