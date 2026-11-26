import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ClassroomService } from '../../../domain/classroom/classroom.service';
import { AuthService } from '../../../domain/auth/auth.service';
import { TelemetryGateway } from '../websocket/telemetry.gateway';
import {
  ClassroomDto,
  CourseEnrollmentDto,
  CreateClassroomDto,
  EnrollStudentDto,
  UpdateClassroomPolicyDto,
  UpdateEnrollmentPolicyDto,
} from '@sbc/types';

@ApiTags('Classrooms & Course Enrollments')
@Controller('classrooms')
export class ClassroomController {
  constructor(
    private readonly classroomService: ClassroomService,
    private readonly authService: AuthService,
    private readonly telemetryGateway: TelemetryGateway,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Отримання списку навчальних класів (фільтр за викладачем або всі для адміна)' })
  async getClassrooms(
    @Query('teacherId') teacherId?: string,
  ): Promise<{ success: boolean; classrooms: ClassroomDto[] }> {
    if (teacherId) {
      const classrooms = await this.classroomService.getClassroomsByTeacher(teacherId);
      return { success: true, classrooms };
    }
    const classrooms = await this.classroomService.getAllClassrooms();
    return { success: true, classrooms };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Створення нового класу з інвайт-кодом викладачем' })
  async createClassroom(
    @Body() body: CreateClassroomDto & { teacherId?: string },
    @Headers('authorization') authHeader?: string,
  ): Promise<{ success: boolean; classroom: ClassroomDto }> {
    let teacherId = body.teacherId;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const payload = this.authService.verifyJwt(authHeader.substring(7));
        teacherId = payload.sub;
      } catch {}
    }

    if (!teacherId) {
      // Fallback до викладача за замовчуванням
      teacherId = 'teacher@example.com';
    }

    const classroom = await this.classroomService.createClassroom(teacherId, body);
    return { success: true, classroom };
  }

  @Get('join/:code')
  @ApiOperation({ summary: 'Попередній перегляд класу за інвайт-кодом (без зарахування)' })
  async previewClassroomByCode(
    @Param('code') code: string,
  ): Promise<{ success: boolean; classroom: ClassroomDto }> {
    const classroom = await this.classroomService.getClassroomByCode(code);
    return { success: true, classroom };
  }

  @Post('join/:code')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Зарахування студента у клас за інвайт-кодом' })
  async joinClassroomByCode(
    @Param('code') code: string,
    @Body() body?: { userId?: string },
    @Headers('authorization') authHeader?: string,
  ): Promise<{ success: boolean; classroom: ClassroomDto; enrollment: CourseEnrollmentDto }> {
    let userId = body?.userId;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const payload = this.authService.verifyJwt(authHeader.substring(7));
        userId = payload.sub;
      } catch {}
    }

    if (!userId) {
      throw new UnauthorizedException('Необхідно вказати userId або передати Bearer токен для зарахування');
    }

    const result = await this.classroomService.joinClassroom(userId, code);
    return {
      success: true,
      ...result,
    };
  }

  @Post('enroll')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Пряме зарахування студента на курс викладачем або адміністратором' })
  async enrollStudent(
    @Body() body: EnrollStudentDto,
  ): Promise<{ success: boolean; enrollment: CourseEnrollmentDto }> {
    if (!body?.userId || !body?.courseId) {
      throw new BadRequestException('userId та courseId є обов\'язковими');
    }

    const enrollment = await this.classroomService.enrollStudent(body);
    return { success: true, enrollment };
  }

  @Get('student/:userId')
  @ApiOperation({ summary: 'Отримання всіх активних курсів та зарахувань студента' })
  async getStudentEnrollments(
    @Param('userId') userId: string,
  ): Promise<{ success: boolean; enrollments: CourseEnrollmentDto[] }> {
    const enrollments = await this.classroomService.getStudentEnrollments(userId);
    return { success: true, enrollments };
  }

  @Patch(':id/policy')
  @ApiOperation({ summary: 'Оновлення політики режимів проходження (STUDENT_CHOICE / FORCED_GRADED / FORCED_TRAINING) для класу' })
  async updateClassroomPolicy(
    @Param('id') id: string,
    @Body() body: UpdateClassroomPolicyDto,
  ): Promise<{ success: boolean; classroom: ClassroomDto }> {
    const classroom = await this.classroomService.updateClassroomPolicy(id, body);
    this.telemetryGateway.notifyPolicyChanged({
      classroomId: classroom.id,
      courseId: classroom.courseId,
      integrityPolicy: classroom.integrityPolicy || 'STUDENT_CHOICE',
      strictModeUntil: classroom.strictModeUntil ?? null,
    });
    return { success: true, classroom };
  }

  @Patch('enrollments/:enrollmentId/policy')
  @ApiOperation({ summary: 'Точкове перевизначення політики доброчесності для окремого студента' })
  async updateEnrollmentPolicy(
    @Param('enrollmentId') enrollmentId: string,
    @Body() body: UpdateEnrollmentPolicyDto,
  ): Promise<{ success: boolean; enrollment: CourseEnrollmentDto }> {
    const enrollment = await this.classroomService.updateEnrollmentPolicy(enrollmentId, body);
    this.telemetryGateway.notifyPolicyChanged({
      classroomId: enrollment.classroomId ?? undefined,
      userId: enrollment.userId,
      courseId: enrollment.courseId,
      integrityPolicy: enrollment.effectiveIntegrityPolicy || 'STUDENT_CHOICE',
      strictModeUntil: enrollment.strictModeUntil ?? null,
    });
    return { success: true, enrollment };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Видалення навчального класу' })
  async deleteClassroom(
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.classroomService.deleteClassroom(id);
  }
}
