import { redirect } from 'next/navigation';
import { SCHOOL_WEB_CURRICULUM } from '@/data/school-web-curriculum';
import { ROUTES } from '@sbc/routes';

interface CourseRedirectPageProps {
  params: Promise<{
    courseSlug: string;
  }>;
}

export default async function CourseRedirectPage({ params }: CourseRedirectPageProps) {
  const { courseSlug } = await params;
  const firstModule = SCHOOL_WEB_CURRICULUM.modules[0];
  const firstUnit = firstModule?.units[0];

  redirect(
    ROUTES.study.unit(
      courseSlug,
      firstModule?.moduleSlug || 'school-alg-basics',
      firstUnit?.slug || 'variables-and-types'
    )
  );
}
