import React from 'react';
import StudentPortalContent from '@/components/StudentPortalApp';

interface PracticeCoursePageProps {
  params: Promise<{
    courseSlug: string;
  }>;
  searchParams?: Promise<{
    source?: string;
    unit?: string;
    module?: string;
  }>;
}

export default async function PracticeCoursePage({ params, searchParams }: PracticeCoursePageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  return (
    <StudentPortalContent
      initialCourseSlug={resolvedParams.courseSlug}
      source={resolvedSearchParams.source}
      unitSlug={resolvedSearchParams.unit}
    />
  );
}
