'use client';

import React from 'react';
import { UserProfileDrawer, UserProfileDrawerCourse } from '@sbc/ui';
import { Flame, ShieldCheck } from 'lucide-react';
import { CourseItem } from '@/entities/course';

export interface StudentProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  courses: CourseItem[];
  activeCourseSlug: string;
  onSelectCourse: (slug: string) => void;
  courseCompletionPct: number;
  masteredSkillsCount: number;
  totalSkillsCount: number;
  onResetBktState?: () => void;
  currentUser?: {
    id: string;
    email: string;
    role: string;
    authProvider?: string;
    profile?: {
      firstName?: string | null;
      lastName?: string | null;
      avatarUrl?: string | null;
    } | null;
  } | null;
  onOpenAuthModal?: () => void;
  onLogout?: () => void;
}

export const StudentProfileDrawer: React.FC<StudentProfileDrawerProps> = ({
  isOpen,
  onClose,
  courses,
  activeCourseSlug,
  onSelectCourse,
  courseCompletionPct,
  masteredSkillsCount,
  totalSkillsCount,
  onResetBktState,
  currentUser,
  onOpenAuthModal,
  onLogout,
}) => {
  const drawerCourses: UserProfileDrawerCourse[] = courses.map((c) => ({
    slug: c.slug,
    title: c.title,
    category:
      typeof c.category === 'object' && c.category !== null
        ? (c.category as any).title
        : c.category || 'Навчальний напрям',
    skillsCount: c.slug === activeCourseSlug ? masteredSkillsCount : undefined,
    totalSkillsCount: c.slug === activeCourseSlug ? totalSkillsCount : undefined,
    completionPct: c.slug === activeCourseSlug ? courseCompletionPct : undefined,
  }));

  const displayName = currentUser?.profile?.firstName
    ? `${currentUser.profile.firstName} ${currentUser.profile.lastName || ''}`.trim()
    : currentUser?.email || 'Дмитро Стеценко';

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ДС';

  return (
    <UserProfileDrawer
      isOpen={isOpen}
      onClose={onClose}
      user={{
        name: displayName,
        roleName: currentUser?.role === 'TEACHER' ? 'Викладач' : currentUser?.role === 'ADMIN' ? 'Адміністратор' : 'Учень',
        roleBadge: currentUser?.role || 'УЧЕНЬ',
        subtitle: currentUser ? `${currentUser.email} · ${currentUser.authProvider || 'LOCAL'}` : '11-А клас · ID: demo-student',
        initials,
        avatarGradient: 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500',
      }}
      courses={drawerCourses}
      activeCourseSlug={activeCourseSlug}
      onSelectCourse={onSelectCourse}
      stats={[
        {
          label: 'Ударний стрік',
          value: '3 дні',
          icon: Flame,
          iconColor: 'text-amber-400',
          valueColor: 'text-white',
        },
        {
          label: 'Доброчесність',
          value: '0.96 (A+)',
          icon: ShieldCheck,
          iconColor: 'text-emerald-400',
          valueColor: 'text-emerald-400',
        },
      ]}
      onResetDemoState={onResetBktState}
      resetDemoLabel="Скинути BKT стан для демо"
      onOpenAuthModal={onOpenAuthModal}
      onLogout={onLogout}
      quickLinks={[
        {
          label: 'Відкрити Підручник Теорії',
          href: 'http://localhost:3006',
        },
      ]}
    />
  );
};
