import { AuthUserDto } from './auth.types';

export type EnrollmentMode = 'FULL_CYCLE' | 'TESTING_ONLY' | 'MODULAR';

export interface ClassroomDto {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  courseId: string;
  defaultMode: EnrollmentMode;
  allowedModules: string[];
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
