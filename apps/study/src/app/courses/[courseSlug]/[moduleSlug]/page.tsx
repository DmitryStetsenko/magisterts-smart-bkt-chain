import { redirect } from 'next/navigation';
import { SCHOOL_WEB_CURRICULUM } from '@/data/school-web-curriculum';
import { ROUTES } from '@sbc/routes';

interface ModuleRedirectPageProps {
  params: Promise<{
    courseSlug: string;
    moduleSlug: string;
  }>;
}

export default async function ModuleRedirectPage({ params }: ModuleRedirectPageProps) {
  const { courseSlug, moduleSlug } = await params;
  const module = SCHOOL_WEB_CURRICULUM.modules.find((m) => m.moduleSlug === moduleSlug);
  const firstUnitSlug = module?.units[0]?.slug || 'variables-and-types';

  redirect(ROUTES.study.unit(courseSlug, moduleSlug, firstUnitSlug));
}
