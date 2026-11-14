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

  if (courseSlug === SCHOOL_WEB_CURRICULUM.courseSlug) {
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

  // Динамічний курс: отримуємо структуру курсу з бекенду
  try {
    const res = await fetch(`http://localhost:3000/api/v1/courses/${courseSlug}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const course = await res.json();
      const firstMod = course.modules?.[0];
      if (firstMod) {
        redirect(`/courses/${courseSlug}/${firstMod.slug}/${firstMod.slug}`);
      }
    }
  } catch (e) {
    // Якщо бекенд недоступний, використовуємо стандартний перший модуль
  }

  redirect(`/courses/${courseSlug}/module-1/module-1`);
}
