export type UserRole = 'STUDENT' | 'TEACHER' | 'RECRUITER' | 'ADMIN';
export type AuthProvider = 'LOCAL' | 'GOOGLE';
export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface AuthUserProfileDto {
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
}

export interface AuthUserDto {
  id: string;
  email: string;
  role: UserRole;
  authProvider: AuthProvider;
  status: UserStatus;
  createdAt: string;
  profile?: AuthUserProfileDto | null;
  token?: string;
}

export interface GoogleAuthPayloadDto {
  credential: string; // Google ID Token
}

export interface MockAuthPayloadDto {
  userIdOrEmail: string;
  role?: UserRole;
}

export interface SystemConfigDto {
  key: string;
  value: string;
  description?: string | null;
}

export interface CreateUserDto {
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  password?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
}
