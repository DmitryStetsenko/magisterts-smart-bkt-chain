import React from 'react';
import { StudentPracticeView as StudentPortalContent } from '@/views/student-practice';

interface PracticePageProps {
  params: Promise<{
    courseSlug: string;
    skillSlug: string;
  }>;
  searchParams: Promise<{
    source?: string;
    unit?: string;
    module?: string;
  }>;
}

export default async function PracticePage({ params, searchParams }: PracticePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <StudentPortalContent
      initialCourseSlug={resolvedParams.courseSlug}
      initialSkillSlug={resolvedParams.skillSlug}
      source={resolvedSearchParams.source}
      unitSlug={resolvedSearchParams.unit}
    />
  );
}
