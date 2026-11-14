import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SCHOOL_WEB_CURRICULUM } from '@/data/school-web-curriculum';
import { StudyAppClient } from '@/components/StudyAppClient';
import { adaptCourseToCurriculum } from '@/lib/curriculum-adapter';
import { CourseCurriculumDto } from '@sbc/types';

interface LessonUnitPageProps {
  params: Promise<{
    courseSlug: string;
    moduleSlug: string;
    unitSlug: string;
  }>;
}

export const dynamicParams = true;

/**
 * Отримує структуру курсу (статичну шкільну або динамічну з бекенду)
 */
async function getCurriculum(courseSlug: string): Promise<CourseCurriculumDto | null> {
  if (courseSlug === SCHOOL_WEB_CURRICULUM.courseSlug) {
    return SCHOOL_WEB_CURRICULUM;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/v1/courses/${courseSlug}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      return adaptCourseToCurriculum(data);
    }
  } catch (err) {
    console.warn('Error fetching dynamic course curriculum:', err);
  }

  return null;
}

/**
 * ⚡ SSG: Попередня компіляція 100% уроків навчальної програми на етапі білду
 */
export async function generateStaticParams() {
  const params: { courseSlug: string; moduleSlug: string; unitSlug: string }[] = [];

  const courseSlug = SCHOOL_WEB_CURRICULUM.courseSlug;
  for (const module of SCHOOL_WEB_CURRICULUM.modules) {
    for (const unit of module.units) {
      params.push({
        courseSlug,
        moduleSlug: module.moduleSlug,
        unitSlug: unit.slug,
      });
    }
  }

  return params;
}

/**
 * 🔍 SEO: Динамічні метадані сторінки згідно з Правилом 10 та документом brainstorm 12
 */
export async function generateMetadata({ params }: LessonUnitPageProps): Promise<Metadata> {
  const { courseSlug, moduleSlug, unitSlug } = await params;
  const curriculum = await getCurriculum(courseSlug);

  if (!curriculum) {
    return {
      title: 'Урок не знайдено | Smart-BKT-Chain',
    };
  }

  const module =
    curriculum.modules.find((m) => m.moduleSlug === moduleSlug) || curriculum.modules[0];
  const unit = module?.units.find((u) => u.slug === unitSlug) || module?.units[0];

  if (!unit || !module) {
    return {
      title: 'Урок не знайдено | Smart-BKT-Chain',
    };
  }

  const canonicalUrl = `http://localhost:3006/courses/${courseSlug}/${module.moduleSlug}/${unit.slug}`;

  return {
    title: `${unit.title} | ${curriculum.courseTitle} — Smart-BKT-Chain`,
    description: unit.summary,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${unit.title} — ${module.title}`,
      description: unit.summary,
      url: canonicalUrl,
      siteName: 'Smart-BKT-Chain Study Portal',
      type: 'article',
      locale: 'uk_UA',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${unit.title} | Smart-BKT-Chain`,
      description: unit.summary,
    },
  };
}

/**
 * 📖 Серверна сторінка вкладеного маршруту уроку з мікророзміткою Schema.org (JSON-LD)
 */
export default async function LessonUnitPage({ params }: LessonUnitPageProps) {
  const { courseSlug, moduleSlug, unitSlug } = await params;
  const curriculum = await getCurriculum(courseSlug);

  if (!curriculum) {
    notFound();
  }

  const module =
    curriculum.modules.find((m) => m.moduleSlug === moduleSlug) || curriculum.modules[0];
  const unit = module?.units.find((u) => u.slug === unitSlug) || module?.units[0];

  if (!unit || !module) {
    notFound();
  }

  // Мікророзмітка Schema.org для Google Освіта (LearningResource + BreadcrumbList)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LearningResource',
        name: unit.title,
        description: unit.summary,
        educationalLevel: unit.gradeLevel,
        learningResourceType: 'Lesson',
        timeRequired: `PT${unit.estimatedMinutes}M`,
        inLanguage: 'uk-UA',
        isPartOf: {
          '@type': 'Course',
          name: curriculum.courseTitle,
          description: curriculum.description,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Підручник',
            item: 'http://localhost:3006/',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: module.title,
            item: `http://localhost:3006/courses/${courseSlug}/${module.moduleSlug}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: unit.title,
            item: `http://localhost:3006/courses/${courseSlug}/${module.moduleSlug}/${unit.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <StudyAppClient
        initialCourseSlug={courseSlug}
        initialModuleSlug={module.moduleSlug}
        initialUnitSlug={unit.slug}
        curriculum={curriculum}
      />
    </>
  );
}
