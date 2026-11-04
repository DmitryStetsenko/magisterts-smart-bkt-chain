'use client';

import React from 'react';
import { UserProfileDrawer, UserProfileDrawerCourse } from '@sbc/ui';
import { Flame, ShieldCheck } from 'lucide-react';
import { CourseItem } from './StudentPortalApp';

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
}) => {
  const drawerCourses: UserProfileDrawerCourse[] = courses.map((c) => ({
    slug: c.slug,
    title: c.title,
    category: c.category || 'Навчальний напрям',
    skillsCount: c.slug === activeCourseSlug ? masteredSkillsCount : undefined,
    totalSkillsCount: c.slug === activeCourseSlug ? totalSkillsCount : undefined,
    completionPct: c.slug === activeCourseSlug ? courseCompletionPct : undefined,
  }));

  return (
    <UserProfileDrawer
      isOpen={isOpen}
      onClose={onClose}
      user={{
        name: 'Дмитро Стеценко',
        roleName: 'Учень',
        roleBadge: 'УЧЕНЬ',
        subtitle: '11-А клас · ID: demo-student',
        initials: 'ДС',
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
      quickLinks={[
        {
          label: 'Відкрити Підручник Теорії',
          href: 'http://localhost:3006',
        },
      ]}
    />
  );
};
