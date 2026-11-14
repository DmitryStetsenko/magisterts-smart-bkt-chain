import { redirect } from 'next/navigation';

interface LearnRedirectPageProps {
  params: Promise<{
    courseSlug: string;
    moduleSlug: string;
  }>;
}

/**
 * 🔀 Модульний шлюз: автоматична переадресація з canonical theoryUrl `/learn/:courseSlug/:moduleSlug`
 * на структурований App Router підручника `/courses/:courseSlug/:moduleSlug`
 */
export default async function LearnRedirectPage({ params }: LearnRedirectPageProps) {
  const { courseSlug, moduleSlug } = await params;
  redirect(`/courses/${courseSlug}/${moduleSlug}`);
}
