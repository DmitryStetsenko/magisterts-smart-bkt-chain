import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../adapters/outbound/persistence/prisma.service';
import {
  ClassroomDto,
  CourseEnrollmentDto,
  CreateClassroomDto,
  EnrollStudentDto,
  EnrollmentMode,
  IntegrityPolicy,
  UpdateClassroomPolicyDto,
  UpdateEnrollmentPolicyDto,
} from '@sbc/types';

@Injectable()
export class ClassroomService {
  private readonly logger = new Logger(ClassroomService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Створення нового навчального класу / групи викладачем
   */
  async createClassroom(teacherId: string, dto: CreateClassroomDto): Promise<ClassroomDto> {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
    });
    if (!course) {
      throw new NotFoundException(`Курс із ID ${dto.courseId} не знайдено`);
    }

    // Генерація інвайт-коду якщо не задано
    let code = (dto.code || this.generateCode(dto.name)).toUpperCase().trim();

    // Перевірка унікальності коду
    const existing = await this.prisma.classroom.findUnique({ where: { code } });
    if (existing) {
      if (dto.code) {
        throw new ConflictException(`Інвайт-код "${code}" вже зайнятий іншим класом`);
      }
      code = `${code}-${Math.floor(100 + Math.random() * 900)}`;
    }

    const classroom = await this.prisma.classroom.create({
      data: {
        name: dto.name,
        code,
        teacherId,
        courseId: dto.courseId,
        defaultMode: (dto.defaultMode as any) || 'FULL_CYCLE',
        allowedModules: dto.allowedModules || [],
        integrityPolicy: (dto.integrityPolicy as any) || 'STUDENT_CHOICE',
        strictModeUntil: dto.strictModeUntil ? new Date(dto.strictModeUntil) : null,
      },
      include: {
        course: true,
        teacher: { include: { profile: true } },
        _count: { select: { students: true } },
      },
    });

    this.logger.log(`Classroom created: "${classroom.name}" with code ${classroom.code} by teacher ${teacherId}`);
    return this.formatClassroom(classroom);
  }

  /**
   * Отримати всі класи конкретного викладача
   */
  async getClassroomsByTeacher(teacherId: string): Promise<ClassroomDto[]> {
    const classrooms = await this.prisma.classroom.findMany({
      where: { teacherId },
      include: {
        course: true,
        students: { include: { profile: true } },
        _count: { select: { students: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return classrooms.map((c) => this.formatClassroom(c));
  }

  /**
   * Отримати інфо про клас за промокодом (публічний попередній перегляд)
   */
  async getClassroomByCode(code: string): Promise<ClassroomDto> {
    const normalizedCode = code.toUpperCase().trim();
    const classroom = await this.prisma.classroom.findUnique({
      where: { code: normalizedCode },
      include: {
        course: true,
        teacher: { include: { profile: true } },
        _count: { select: { students: true } },
      },
    });

    if (!classroom) {
      throw new NotFoundException(`Клас із інвайт-кодом "${normalizedCode}" не знайдено`);
    }

    return this.formatClassroom(classroom);
  }

  /**
   * Зарахування студента у клас за інвайт-кодом
   */
  async joinClassroom(userId: string, code: string): Promise<{ classroom: ClassroomDto; enrollment: CourseEnrollmentDto }> {
    const normalizedCode = code.toUpperCase().trim();
    const classroom = await this.prisma.classroom.findUnique({
      where: { code: normalizedCode },
      include: {
        course: true,
        teacher: { include: { profile: true } },
        _count: { select: { students: true } },
      },
    });

    if (!classroom) {
      throw new NotFoundException(`Клас із інвайт-кодом "${normalizedCode}" не знайдено`);
    }

    // Підключаємо студента до класу (many-to-many relation)
    await this.prisma.classroom.update({
      where: { id: classroom.id },
      data: {
        students: {
          connect: [{ id: userId }],
        },
      },
    });

    // Створюємо або оновлюємо зарахування на курс
    const enrollment = await this.prisma.courseEnrollment.upsert({
      where: {
        userId_courseId: {
          userId,
          courseId: classroom.courseId,
        },
      },
      update: {
        classroomId: classroom.id,
        mode: classroom.defaultMode,
        allowedModules: classroom.allowedModules,
        isActive: true,
      },
      create: {
        userId,
        courseId: classroom.courseId,
        classroomId: classroom.id,
        mode: classroom.defaultMode,
        allowedModules: classroom.allowedModules,
        isActive: true,
      },
      include: {
        course: true,
        classroom: true,
      },
    });

    // Логування активності приєднання до класу
    try {
      await this.prisma.studentActivityLog.create({
        data: {
          userId,
          actorId: userId,
          actorRole: 'STUDENT',
          courseId: classroom.courseId,
          eventType: 'CLASSROOM_JOINED',
          payload: {
            classroomId: classroom.id,
            classroomName: classroom.name,
            code: classroom.code,
            mode: classroom.defaultMode,
          },
        },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to log activity for joinClassroom: ${err.message}`);
    }

    this.logger.log(`Student ${userId} joined classroom ${classroom.name} (${classroom.code})`);

    return {
      classroom: this.formatClassroom(classroom),
      enrollment: this.formatEnrollment(enrollment),
    };
  }

  /**
   * Пряме індивідуальне призначення курсу студенту викладачем або адміністратором
   */
  async enrollStudent(dto: EnrollStudentDto): Promise<CourseEnrollmentDto> {
    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException(`Користувача з ID ${dto.userId} не знайдено`);
    }

    const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
    if (!course) {
      throw new NotFoundException(`Курс із ID ${dto.courseId} не знайдено`);
    }

    const enrollment = await this.prisma.courseEnrollment.upsert({
      where: {
        userId_courseId: {
          userId: dto.userId,
          courseId: dto.courseId,
        },
      },
      update: {
        classroomId: dto.classroomId || null,
        mode: (dto.mode as any) || 'FULL_CYCLE',
        allowedModules: dto.allowedModules || [],
        isActive: true,
      },
      create: {
        userId: dto.userId,
        courseId: dto.courseId,
        classroomId: dto.classroomId || null,
        mode: (dto.mode as any) || 'FULL_CYCLE',
        allowedModules: dto.allowedModules || [],
        isActive: true,
      },
      include: {
        course: true,
        classroom: true,
      },
    });

    this.logger.log(`Student ${dto.userId} enrolled into course ${dto.courseId} (mode: ${dto.mode || 'FULL_CYCLE'})`);
    return this.formatEnrollment(enrollment);
  }

  /**
   * Отримати всі курси / зарахування конкретного учня
   */
  async getStudentEnrollments(userId: string): Promise<CourseEnrollmentDto[]> {
    const enrollments = await this.prisma.courseEnrollment.findMany({
      where: { userId, isActive: true },
      include: {
        course: true,
        classroom: true,
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return enrollments.map((e) => this.formatEnrollment(e));
  }

  /**
   * Отримати всі класи платформи (для адміністратора)
   */
  async getAllClassrooms(): Promise<ClassroomDto[]> {
    const classrooms = await this.prisma.classroom.findMany({
      include: {
        course: true,
        teacher: { include: { profile: true } },
        _count: { select: { students: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return classrooms.map((c) => this.formatClassroom(c));
  }

  /**
   * Обчислення ефективної політики доброчесності з урахуванням таймера strictModeUntil та override студента
   */
  resolveEffectiveIntegrityPolicy(
    classroomPolicy?: string | null,
    strictModeUntil?: Date | string | null,
    enrollmentOverride?: string | null,
  ): { effectivePolicy: IntegrityPolicy; strictModeUntil: string | null } {
    if (enrollmentOverride) {
      return {
        effectivePolicy: enrollmentOverride as IntegrityPolicy,
        strictModeUntil: null,
      };
    }

    const basePolicy = (classroomPolicy as IntegrityPolicy) || 'STUDENT_CHOICE';
    if (basePolicy === 'FORCED_GRADED' && strictModeUntil) {
      const untilDate = strictModeUntil instanceof Date ? strictModeUntil : new Date(strictModeUntil);
      if (untilDate.getTime() <= Date.now()) {
        return { effectivePolicy: 'STUDENT_CHOICE', strictModeUntil: null };
      }
      return { effectivePolicy: 'FORCED_GRADED', strictModeUntil: untilDate.toISOString() };
    }

    return {
      effectivePolicy: basePolicy,
      strictModeUntil: strictModeUntil
        ? (strictModeUntil instanceof Date ? strictModeUntil.toISOString() : String(strictModeUntil))
        : null,
    };
  }

  /**
   * Отримання ефективної політики доброчесності для студента на конкретному курсі
   */
  async getEffectiveIntegrityPolicyForStudent(
    userId: string,
    courseIdOrSlug?: string,
  ): Promise<{
    effectivePolicy: IntegrityPolicy;
    strictModeUntil: string | null;
    classroomId?: string;
    classroomName?: string;
  }> {
    let targetUserId = userId;
    let user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      user = await this.prisma.user.findFirst({ where: { role: 'STUDENT' } });
      if (user) targetUserId = user.id;
    }

    if (!user) {
      return { effectivePolicy: 'STUDENT_CHOICE', strictModeUntil: null };
    }

    let courseId: string | undefined;
    if (courseIdOrSlug) {
      const course = await this.prisma.course.findFirst({
        where: { OR: [{ id: courseIdOrSlug }, { slug: courseIdOrSlug }] },
        select: { id: true },
      });
      courseId = course?.id;
    }

    const enrollment = await this.prisma.courseEnrollment.findFirst({
      where: {
        userId: targetUserId,
        isActive: true,
        ...(courseId ? { courseId } : {}),
      },
      include: { classroom: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!enrollment) {
      // Fallback: check if any classroom for this course has FORCED_GRADED if demo student has no explicit enrollment
      if (courseId) {
        const directClassroom = await this.prisma.classroom.findFirst({
          where: {
            courseId,
            students: { some: { id: targetUserId } },
          },
          orderBy: { updatedAt: 'desc' },
        });
        if (directClassroom) {
          const resolved = this.resolveEffectiveIntegrityPolicy(
            directClassroom.integrityPolicy,
            directClassroom.strictModeUntil,
            null,
          );
          return {
            ...resolved,
            classroomId: directClassroom.id,
            classroomName: directClassroom.name,
          };
        }
      }
      return { effectivePolicy: 'STUDENT_CHOICE', strictModeUntil: null };
    }

    const resolved = this.resolveEffectiveIntegrityPolicy(
      enrollment.classroom?.integrityPolicy,
      enrollment.classroom?.strictModeUntil,
      enrollment.integrityPolicyOverride,
    );

    return {
      ...resolved,
      classroomId: enrollment.classroom?.id,
      classroomName: enrollment.classroom?.name,
    };
  }

  /**
   * Оновлення політики доброчесності на рівні класу викладачем
   */
  async updateClassroomPolicy(classroomId: string, dto: UpdateClassroomPolicyDto): Promise<ClassroomDto> {
    const existing = await this.prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!existing) {
      throw new NotFoundException(`Клас із ID ${classroomId} не знайдено`);
    }

    let strictModeUntil: Date | null = null;
    if (dto.integrityPolicy === 'FORCED_GRADED') {
      if (dto.strictModeMinutes && dto.strictModeMinutes > 0) {
        strictModeUntil = new Date(Date.now() + dto.strictModeMinutes * 60 * 1000);
      } else if (dto.strictModeUntil) {
        strictModeUntil = new Date(dto.strictModeUntil);
      }
    }

    const updated = await this.prisma.classroom.update({
      where: { id: classroomId },
      data: {
        integrityPolicy: dto.integrityPolicy as any,
        strictModeUntil,
      },
      include: {
        course: true,
        teacher: { include: { profile: true } },
        students: { include: { profile: true } },
        _count: { select: { students: true } },
      },
    });

    this.logger.log(
      `Classroom ${classroomId} policy updated to ${dto.integrityPolicy} (until: ${strictModeUntil?.toISOString() || 'indefinite'})`,
    );
    return this.formatClassroom(updated);
  }

  /**
   * Точкове перевизначення політики доброчесності для окремого студента
   */
  async updateEnrollmentPolicy(enrollmentId: string, dto: UpdateEnrollmentPolicyDto): Promise<CourseEnrollmentDto> {
    const existing = await this.prisma.courseEnrollment.findUnique({ where: { id: enrollmentId } });
    if (!existing) {
      throw new NotFoundException(`Зарахування з ID ${enrollmentId} не знайдено`);
    }

    const updated = await this.prisma.courseEnrollment.update({
      where: { id: enrollmentId },
      data: {
        integrityPolicyOverride: (dto.integrityPolicyOverride as any) ?? null,
      },
      include: {
        course: true,
        classroom: true,
      },
    });

    this.logger.log(
      `Enrollment ${enrollmentId} policy override updated to ${dto.integrityPolicyOverride ?? 'INHERIT_CLASSROOM'}`,
    );
    return this.formatEnrollment(updated);
  }

  /**
   * Видалити навчальний клас
   */
  async deleteClassroom(classroomId: string): Promise<{ success: boolean }> {
    const existing = await this.prisma.classroom.findUnique({ where: { id: classroomId } });
    if (!existing) {
      throw new NotFoundException(`Клас із ID ${classroomId} не знайдено`);
    }

    await this.prisma.classroom.delete({ where: { id: classroomId } });
    this.logger.log(`Classroom ${classroomId} deleted`);
    return { success: true };
  }

  /**
   * Генерація інвайт-коду (наприклад: KOD-KN21 або CLS-7842)
   */
  private generateCode(name: string): string {
    const cleaned = name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const prefix = cleaned.length >= 3 ? cleaned.slice(0, 3) : 'KOD';
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${rand}`;
  }

  private formatClassroom(c: any): ClassroomDto {
    const resolved = this.resolveEffectiveIntegrityPolicy(c.integrityPolicy, c.strictModeUntil, null);
    return {
      id: c.id,
      name: c.name,
      code: c.code,
      teacherId: c.teacherId,
      courseId: c.courseId,
      defaultMode: c.defaultMode,
      allowedModules: c.allowedModules || [],
      integrityPolicy: resolved.effectivePolicy,
      strictModeUntil: resolved.strictModeUntil,
      createdAt: c.createdAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: c.updatedAt?.toISOString?.() || new Date().toISOString(),
      studentsCount: c._count?.students ?? c.students?.length ?? 0,
      course: c.course
        ? {
            id: c.course.id,
            slug: c.course.slug,
            title: c.course.title,
            description: c.course.description,
            icon: c.course.icon,
          }
        : undefined,
      teacher: c.teacher
        ? {
            id: c.teacher.id,
            email: c.teacher.email,
            role: c.teacher.role,
            authProvider: c.teacher.authProvider,
            status: c.teacher.status,
            createdAt: c.teacher.createdAt?.toISOString?.() || new Date().toISOString(),
            profile: c.teacher.profile
              ? {
                  firstName: c.teacher.profile.firstName,
                  lastName: c.teacher.profile.lastName,
                  avatarUrl: c.teacher.profile.avatarUrl,
                  bio: c.teacher.profile.bio,
                }
              : null,
          }
        : undefined,
      students: c.students
        ? c.students.map((s: any) => ({
            id: s.id,
            email: s.email,
            role: s.role,
            authProvider: s.authProvider,
            status: s.status,
            createdAt: s.createdAt?.toISOString?.() || new Date().toISOString(),
            profile: s.profile
              ? {
                  firstName: s.profile.firstName,
                  lastName: s.profile.lastName,
                  avatarUrl: s.profile.avatarUrl,
                }
              : null,
          }))
        : undefined,
    };
  }

  private formatEnrollment(e: any): CourseEnrollmentDto {
    const resolved = this.resolveEffectiveIntegrityPolicy(
      e.classroom?.integrityPolicy,
      e.classroom?.strictModeUntil,
      e.integrityPolicyOverride,
    );
    return {
      id: e.id,
      userId: e.userId,
      courseId: e.courseId,
      classroomId: e.classroomId,
      mode: e.mode,
      allowedModules: e.allowedModules || [],
      integrityPolicyOverride: e.integrityPolicyOverride ?? null,
      effectiveIntegrityPolicy: resolved.effectivePolicy,
      strictModeUntil: resolved.strictModeUntil,
      isActive: e.isActive,
      enrolledAt: e.enrolledAt?.toISOString?.() || new Date().toISOString(),
      updatedAt: e.updatedAt?.toISOString?.() || new Date().toISOString(),
      course: e.course
        ? {
            id: e.course.id,
            slug: e.course.slug,
            title: e.course.title,
            description: e.course.description,
          }
        : undefined,
      classroom: e.classroom
        ? {
            id: e.classroom.id,
            name: e.classroom.name,
            code: e.classroom.code,
            teacherId: e.classroom.teacherId,
            courseId: e.classroom.courseId,
            defaultMode: e.classroom.defaultMode,
            allowedModules: e.classroom.allowedModules || [],
            createdAt: e.classroom.createdAt?.toISOString?.() || new Date().toISOString(),
            updatedAt: e.classroom.updatedAt?.toISOString?.() || new Date().toISOString(),
          }
        : null,
    };
  }
}
