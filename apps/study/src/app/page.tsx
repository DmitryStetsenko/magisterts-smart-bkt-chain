import { redirect } from 'next/navigation';
import { SCHOOL_WEB_CURRICULUM } from '@/data/school-web-curriculum';
import { ROUTES } from '@sbc/routes';

export default function StudyPortalRootPage() {
  const firstCourseSlug = SCHOOL_WEB_CURRICULUM.courseSlug;
  const firstModule = SCHOOL_WEB_CURRICULUM.modules[0];
  const firstUnit = firstModule?.units[0];

  redirect(
    ROUTES.study.unit(
      firstCourseSlug,
      firstModule?.moduleSlug || 'school-alg-basics',
      firstUnit?.slug || 'variables-and-types'
    )
  );
}
