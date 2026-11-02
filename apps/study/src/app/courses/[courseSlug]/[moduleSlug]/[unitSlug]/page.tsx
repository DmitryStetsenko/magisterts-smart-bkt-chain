import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SCHOOL_WEB_CURRICULUM } from '@/data/school-web-curriculum';
import { StudyAppClient } from '@/components/StudyAppClient';

interface LessonUnitPageProps {
  params: Promise<{
    courseSlug: string;
    moduleSlug: string;
    unitSlug: string;
  }>;
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

  if (courseSlug !== SCHOOL_WEB_CURRICULUM.courseSlug) {
    return {
      title: 'Урок не знайдено | Smart-BKT-Chain',
    };
  }

  const module = SCHOOL_WEB_CURRICULUM.modules.find((m) => m.moduleSlug === moduleSlug);
  const unit = module?.units.find((u) => u.slug === unitSlug);

  if (!unit || !module) {
    return {
      title: 'Урок не знайдено | Smart-BKT-Chain',
    };
  }

  const canonicalUrl = `http://localhost:3006/courses/${courseSlug}/${moduleSlug}/${unitSlug}`;

  return {
    title: `${unit.title} | ${SCHOOL_WEB_CURRICULUM.courseTitle} — Smart-BKT-Chain`,
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

  if (courseSlug !== SCHOOL_WEB_CURRICULUM.courseSlug) {
    notFound();
  }

  const module = SCHOOL_WEB_CURRICULUM.modules.find((m) => m.moduleSlug === moduleSlug);
  const unit = module?.units.find((u) => u.slug === unitSlug);

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
          name: SCHOOL_WEB_CURRICULUM.courseTitle,
          description: SCHOOL_WEB_CURRICULUM.description,
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
            item: `http://localhost:3006/courses/${courseSlug}/${moduleSlug}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: unit.title,
            item: `http://localhost:3006/courses/${courseSlug}/${moduleSlug}/${unitSlug}`,
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
        initialModuleSlug={moduleSlug}
        initialUnitSlug={unitSlug}
      />
    </>
  );
}
