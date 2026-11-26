import { AuthUserDto } from './auth.types';

export type EnrollmentMode = 'FULL_CYCLE' | 'TESTING_ONLY' | 'MODULAR';
export type PracticeIntegrityMode = 'TRAINING' | 'GRADED';
export type IntegrityPolicy = 'STUDENT_CHOICE' | 'FORCED_TRAINING' | 'FORCED_GRADED';

export interface ActiveStrictSessionDto {
  active: boolean;
  userId: string;
  courseSlug?: string;
  skillId?: string;
  skillTitle?: string;
  taskId?: string;
  mode: PracticeIntegrityMode;
  startedAt?: string;
}

export interface UpdateClassroomPolicyDto {
  integrityPolicy: IntegrityPolicy;
  strictModeMinutes?: number | null;
  strictModeUntil?: string | null;
}

export interface UpdateEnrollmentPolicyDto {
  integrityPolicyOverride: IntegrityPolicy | null;
}

export interface ClassroomDto {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  courseId: string;
  defaultMode: EnrollmentMode;
  allowedModules: string[];
  integrityPolicy?: IntegrityPolicy;
  strictModeUntil?: string | null;
  createdAt: string;
  updatedAt: string;
  teacher?: AuthUserDto;
  course?: {
    id: string;
    slug: string;
    title: string;
    description: string;
    icon?: string | null;
  };
  studentsCount?: number;
  students?: AuthUserDto[];
}

export interface CourseEnrollmentDto {
  id: string;
  userId: string;
  courseId: string;
  classroomId?: string | null;
  mode: EnrollmentMode;
  allowedModules: string[];
  integrityPolicyOverride?: IntegrityPolicy | null;
  effectiveIntegrityPolicy?: IntegrityPolicy;
  strictModeUntil?: string | null;
  isActive: boolean;
  enrolledAt: string;
  updatedAt: string;
  classroom?: ClassroomDto | null;
  course?: {
    id: string;
    slug: string;
    title: string;
    description: string;
  };
}

export interface CreateClassroomDto {
  name: string;
  courseId: string;
  code?: string;
  defaultMode?: EnrollmentMode;
  allowedModules?: string[];
  integrityPolicy?: IntegrityPolicy;
  strictModeUntil?: string | null;
}

export interface JoinClassroomDto {
  code: string;
}

export interface EnrollStudentDto {
  userId: string;
  courseId: string;
  classroomId?: string;
  mode?: EnrollmentMode;
  allowedModules?: string[];
}
